"""Financial Entity management service supporting assets, liabilities, and recurring relationships."""

import uuid
from datetime import datetime, timezone

from app.core.exceptions import ResourceNotFoundError
from app.core.logging import logger
from app.models.financial_entity import FinancialEntity
from app.schemas.financial_entity import (
    FinancialEntityCreate,
    FinancialEntityListResponse,
    FinancialEntityResponse,
    FinancialEntityUpdate,
)
from app.services.estate.estate_repository import (
    EstateRepositoryProtocol,
    get_estate_repository,
)


class FinancialEntityService:
    """Service handling CRUD and status transitions for financial entities within an estate."""

    def __init__(self, repository: EstateRepositoryProtocol | None = None) -> None:
        self.repository = repository or get_estate_repository()

    async def _ensure_estate_exists(self, estate_id: str) -> None:
        """Verify parent estate exists before performing entity operations."""
        estate = await self.repository.get_estate(estate_id)
        if not estate:
            logger.warning("Referenced estate not found: '%s'", estate_id)
            raise ResourceNotFoundError(
                f"Financial Estate with ID '{estate_id}' was not found.",
                details={"estate_id": estate_id},
            )

    async def create_entity(
        self,
        estate_id: str,
        payload: FinancialEntityCreate,
    ) -> FinancialEntityResponse:
        """Create and attach a new financial entity to an existing estate."""
        await self._ensure_estate_exists(estate_id)

        entity_id = (
            payload.entity_id.strip()
            if payload.entity_id and payload.entity_id.strip()
            else f"ent-{uuid.uuid4().hex[:10]}"
        )

        now = datetime.now(timezone.utc)
        entity = FinancialEntity(
            entity_id=entity_id,
            estate_id=estate_id,
            entity_type=payload.entity_type,
            display_name=payload.display_name.strip(),
            institution_name=payload.institution_name.strip() if payload.institution_name else None,
            account_reference=payload.account_reference.strip() if payload.account_reference else None,
            amount=payload.amount,
            premium_amount=payload.premium_amount,
            sum_assured=payload.sum_assured,
            emi_amount=payload.emi_amount,
            outstanding_amount=payload.outstanding_amount,
            investment_value=payload.investment_value,
            subscription_amount=payload.subscription_amount,
            transaction_amount=payload.transaction_amount,
            account_balance=payload.account_balance,
            maturity_amount=payload.maturity_amount,
            tax_amount=payload.tax_amount,
            currency=payload.currency.upper() if payload.currency else "INR",
            frequency=payload.frequency,
            status=payload.status,
            confidence=payload.confidence,
            evidence_document_ids=payload.evidence_document_ids,
            nominee_status=payload.nominee_status,
            notes=payload.notes,
            created_at=now,
            updated_at=now,
        )

        saved = await self.repository.save_entity(estate_id, entity)
        logger.info(
            "Created financial entity '%s' (%s) in estate '%s'",
            saved.entity_id,
            saved.display_name,
            estate_id,
        )
        return FinancialEntityResponse.model_validate(saved.to_dict())

    async def get_entity(
        self,
        estate_id: str,
        entity_id: str,
    ) -> FinancialEntityResponse:
        """Retrieve a single financial entity by ID within an estate."""
        await self._ensure_estate_exists(estate_id)

        entity = await self.repository.get_entity(estate_id, entity_id)
        if not entity:
            logger.warning("Financial entity not found: '%s' in estate '%s'", entity_id, estate_id)
            raise ResourceNotFoundError(
                f"Financial entity with ID '{entity_id}' was not found in estate '{estate_id}'.",
                details={"estate_id": estate_id, "entity_id": entity_id},
            )
        return FinancialEntityResponse.model_validate(entity.to_dict())

    async def list_entities(
        self,
        estate_id: str,
    ) -> FinancialEntityListResponse:
        """List all financial entities associated with an estate."""
        await self._ensure_estate_exists(estate_id)

        entities = await self.repository.list_entities(estate_id)
        responses = [FinancialEntityResponse.model_validate(e.to_dict()) for e in entities]
        return FinancialEntityListResponse(entities=responses, total=len(responses))

    async def update_entity(
        self,
        estate_id: str,
        entity_id: str,
        payload: FinancialEntityUpdate,
    ) -> FinancialEntityResponse:
        """Update properties, status, or evidence links of an existing entity."""
        await self._ensure_estate_exists(estate_id)

        entity = await self.repository.get_entity(estate_id, entity_id)
        if not entity:
            logger.warning("Cannot update missing entity: '%s' in estate '%s'", entity_id, estate_id)
            raise ResourceNotFoundError(
                f"Financial entity with ID '{entity_id}' was not found in estate '{estate_id}'.",
                details={"estate_id": estate_id, "entity_id": entity_id},
            )

        if payload.entity_type is not None:
            entity.entity_type = payload.entity_type
        if payload.display_name is not None and payload.display_name.strip():
            entity.display_name = payload.display_name.strip()
        if payload.institution_name is not None:
            entity.institution_name = payload.institution_name.strip() if payload.institution_name else None
        if payload.account_reference is not None:
            entity.account_reference = payload.account_reference.strip() if payload.account_reference else None
        if payload.amount is not None:
            entity.amount = payload.amount
        if payload.premium_amount is not None:
            entity.premium_amount = payload.premium_amount
        if payload.sum_assured is not None:
            entity.sum_assured = payload.sum_assured
        if payload.emi_amount is not None:
            entity.emi_amount = payload.emi_amount
        if payload.outstanding_amount is not None:
            entity.outstanding_amount = payload.outstanding_amount
        if payload.investment_value is not None:
            entity.investment_value = payload.investment_value
        if payload.subscription_amount is not None:
            entity.subscription_amount = payload.subscription_amount
        if payload.transaction_amount is not None:
            entity.transaction_amount = payload.transaction_amount
        if payload.account_balance is not None:
            entity.account_balance = payload.account_balance
        if payload.maturity_amount is not None:
            entity.maturity_amount = payload.maturity_amount
        if payload.tax_amount is not None:
            entity.tax_amount = payload.tax_amount
        if payload.currency is not None:
            entity.currency = payload.currency.upper()
        if payload.frequency is not None:
            entity.frequency = payload.frequency
        if payload.status is not None:
            entity.status = payload.status
        if payload.confidence is not None:
            entity.confidence = payload.confidence
        if payload.evidence_document_ids is not None:
            entity.evidence_document_ids = list(payload.evidence_document_ids)
        if payload.nominee_status is not None:
            entity.nominee_status = payload.nominee_status
        if payload.notes is not None:
            entity.notes = payload.notes

        entity.updated_at = datetime.now(timezone.utc)
        saved = await self.repository.save_entity(estate_id, entity)
        logger.info("Updated financial entity '%s' in estate '%s'", saved.entity_id, estate_id)
        return FinancialEntityResponse.model_validate(saved.to_dict())


financial_entity_service = FinancialEntityService()
