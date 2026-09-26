"""Recurrence discovery orchestration service connecting extraction, analysis, and persistence."""

from datetime import date
from typing import Any
import uuid

from app.core.exceptions import ResourceNotFoundError
from app.core.logging import logger
from app.models.recurrence import (
    NormalizedTransaction,
    RecurringRelationship,
)
from app.schemas.recurrence import (
    EstateRecurrenceResponse,
    ObservationWindowResponse,
    RecurringRelationshipResponse,
)
from app.services.discovery.recurrence_engine import (
    RecurrenceEngine,
    recurrence_engine,
)
from app.services.discovery.recurrence_repository import (
    RecurrenceRepositoryProtocol,
    get_recurrence_repository,
)
from app.services.discovery.transaction_normalizer import (
    TransactionNormalizer,
    transaction_normalizer,
)


class RecurrenceService:
    """Orchestrates recurring relationship analysis and storage across estates and documents."""

    def __init__(
        self,
        engine: RecurrenceEngine | None = None,
        normalizer: TransactionNormalizer | None = None,
        repository: RecurrenceRepositoryProtocol | None = None,
    ) -> None:
        self.engine = engine or recurrence_engine
        self.normalizer = normalizer or transaction_normalizer
        self.repository = repository or get_recurrence_repository()

    async def analyze_and_store_transactions(
        self,
        estate_id: str,
        transactions: list[NormalizedTransaction | dict[str, Any]],
    ) -> EstateRecurrenceResponse:
        """Normalizes, analyzes, and persists recurring relationships discovered from transactions."""
        logger.info("Analyzing %d transactions for estate '%s'", len(transactions), estate_id)

        typed_txs: list[NormalizedTransaction] = []
        for item in transactions:
            if isinstance(item, NormalizedTransaction):
                typed_txs.append(item)
            elif isinstance(item, dict):
                norm_desc = self.normalizer.normalize_description(item.get("description", ""))
                cat = item.get("category") or self.normalizer.infer_category(
                    item.get("description", ""), norm_desc, item.get("institution")
                )
                tx = NormalizedTransaction(
                    transaction_id=item.get("transaction_id") or str(uuid.uuid4()),
                    date_val=item["date"],
                    description=item["description"],
                    amount=item["amount"],
                    direction=item.get("direction", "debit"),
                    institution=item.get("institution"),
                    category=cat,
                    normalized_description=norm_desc,
                    source_document_id=item.get("source_document_id"),
                    page_number=item.get("page_number"),
                    raw_text=item.get("raw_text"),
                )
                typed_txs.append(tx)

        # 1. Save new transactions to repository
        if typed_txs:
            await self.repository.save_transactions(estate_id, typed_txs)

        # 2. Retrieve all accumulated transactions for this estate
        raw_all = await self.repository.get_estate_transactions(estate_id)
        all_typed_txs: list[NormalizedTransaction] = []
        for item in raw_all:
            if isinstance(item, NormalizedTransaction):
                all_typed_txs.append(item)
            elif isinstance(item, dict):
                all_typed_txs.append(NormalizedTransaction.from_dict(item))

        if not all_typed_txs:
            all_typed_txs = typed_txs

        # 3. Run deterministic recurrence engine across all estate transactions
        relationships = self.engine.analyze_transactions(estate_id, all_typed_txs)

        # 4. Save to repository (clear old stale relationships first)
        await self.repository.delete_estate_relationships(estate_id)
        await self.repository.save_relationships(relationships)
        logger.info("Saved %d discovered recurring relationships for estate '%s'", len(relationships), estate_id)

        # Build response
        start_date = None
        end_date = None
        total_days = 0
        total_months = 0.0

        if all_typed_txs:
            parsed_dates = sorted([self.engine.parse_date(t.date) for t in all_typed_txs])
            start_d = parsed_dates[0]
            end_d = parsed_dates[-1]
            start_date = start_d.isoformat()
            end_date = end_d.isoformat()
            total_days = (end_d - start_d).days
            total_months = max(1.0, round(total_days / 30.4375, 1))

        obs_window = ObservationWindowResponse(
            start=start_date,
            end=end_date,
            total_days=total_days,
            total_months=total_months,
        )

        return EstateRecurrenceResponse(
            estate_id=estate_id,
            observation_window=obs_window,
            total_transactions_analyzed=len(all_typed_txs),
            relationships=[
                RecurringRelationshipResponse.model_validate(r.to_dict()) for r in relationships
            ],
        )

    async def get_estate_relationships(self, estate_id: str) -> EstateRecurrenceResponse:
        """Retrieves all persisted recurring relationships for an estate, ensuring deduplication."""
        raw_all = await self.repository.get_estate_transactions(estate_id)
        if raw_all:
            all_typed_txs = [
                t if isinstance(t, NormalizedTransaction) else NormalizedTransaction.from_dict(t)
                for t in raw_all
            ]
            relationships = self.engine.analyze_transactions(estate_id, all_typed_txs)
            await self.repository.delete_estate_relationships(estate_id)
            await self.repository.save_relationships(relationships)
        else:
            relationships = await self.repository.get_estate_relationships(estate_id)

        start_date = None
        end_date = None
        total_days = 0
        total_months = 0.0

        if relationships:
            all_first_dates = [self.engine.parse_date(r.first_observed_date) for r in relationships if r.first_observed_date]
            all_last_dates = [self.engine.parse_date(r.last_observed_date) for r in relationships if r.last_observed_date]
            if all_first_dates and all_last_dates:
                start_d = min(all_first_dates)
                end_d = max(all_last_dates)
                start_date = start_d.isoformat()
                end_date = end_d.isoformat()
                total_days = (end_d - start_d).days
                total_months = max(1.0, round(total_days / 30.4375, 1))

        obs_window = ObservationWindowResponse(
            start=start_date,
            end=end_date,
            total_days=total_days,
            total_months=total_months,
        )

        return EstateRecurrenceResponse(
            estate_id=estate_id,
            observation_window=obs_window,
            total_transactions_analyzed=sum(r.occurrence_count for r in relationships),
            relationships=[
                RecurringRelationshipResponse.model_validate(r.to_dict()) for r in relationships
            ],
        )

    async def get_relationship(self, estate_id: str, relationship_id: str) -> RecurringRelationshipResponse:
        """Retrieves a specific recurring relationship by ID."""
        rel = await self.repository.get_relationship(estate_id, relationship_id)
        if not rel:
            raise ResourceNotFoundError(
                f"Recurring relationship '{relationship_id}' not found for estate '{estate_id}'",
                details={"estate_id": estate_id, "relationship_id": relationship_id},
            )
        return RecurringRelationshipResponse.model_validate(rel.to_dict())

    async def get_estate_recurring_relationships(self, estate_id: str) -> list[RecurringRelationship]:
        """Retrieves raw RecurringRelationship models for an estate."""
        return await self.repository.get_estate_relationships(estate_id)

    async def process_document_for_recurrence(
        self,
        estate_id: str,
        document_id: str,
        statement_text: str,
        entities: list[Any] | None = None,
    ) -> list[RecurringRelationship]:
        """Parses raw text from a document, runs recurrence analysis, and saves relationships."""
        from app.services.discovery.statement_parser import statement_parser

        transactions = statement_parser.parse_statement_text(
            statement_text, source_document_id=document_id
        )
        if not transactions and entities:
            transactions = statement_parser.infer_transactions_from_entities(
                entities, source_document_id=document_id
            )
        await self.analyze_and_store_transactions(estate_id, transactions)
        return await self.repository.get_estate_relationships(estate_id)


recurrence_service = RecurrenceService()

