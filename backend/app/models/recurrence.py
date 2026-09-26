"""Domain models for Recurring Transaction & Financial Relationship Detection."""

from datetime import date, datetime, timezone
from enum import Enum
from typing import Any
import uuid


class Cadence(str, Enum):
    """Classified recurring cadence frequency."""

    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    BIMONTHLY = "bi-monthly"
    QUARTERLY = "quarterly"
    SEMIANNUAL = "semi-annual"
    ANNUAL = "annual"
    IRREGULAR = "irregular"


class AmountType(str, Enum):
    """Classification of amount stability across recurring observations."""

    FIXED = "fixed"
    VARIABLE = "variable"
    IRREGULAR = "irregular"


class RecurrenceStrength(str, Enum):
    """Confidence strength of the inferred recurring financial relationship."""

    STRONG = "strong"
    MODERATE = "moderate"
    WEAK = "weak"
    INSUFFICIENT = "insufficient"


class TransactionDirection(str, Enum):
    """Direction of transaction funds."""

    DEBIT = "debit"
    CREDIT = "credit"
    UNKNOWN = "unknown"


class NormalizedTransaction:
    """Standardized representation of a financial transaction extracted from documents."""

    def __init__(
        self,
        date_val: str | date,
        description: str,
        amount: float,
        direction: TransactionDirection | str = TransactionDirection.DEBIT,
        institution: str | None = None,
        category: str | None = None,
        normalized_description: str | None = None,
        source_document_id: str | None = None,
        page_number: int | None = None,
        transaction_id: str | None = None,
        raw_text: str | None = None,
    ) -> None:
        if isinstance(date_val, date) and not isinstance(date_val, datetime):
            self.date = date_val.isoformat()
        else:
            from app.services.discovery.recurrence_engine import recurrence_engine
            parsed_d = recurrence_engine.parse_date(date_val)
            self.date = parsed_d.isoformat()

        self.description = description.strip()
        self.amount = float(amount)
        self.direction = (
            direction if isinstance(direction, TransactionDirection) else TransactionDirection(str(direction).lower())
        )
        self.institution = institution.strip() if institution else None
        self.category = category.strip().lower() if category else "other"
        self.normalized_description = normalized_description.strip() if normalized_description else None
        self.source_document_id = source_document_id
        self.page_number = page_number
        self.transaction_id = transaction_id or str(uuid.uuid4())
        self.raw_text = raw_text

    @property
    def deduplication_key(self) -> str:
        """Deterministic key to identify identical transactions across overlapping statements."""
        norm = (self.normalized_description or self.description).upper().strip()
        return f"{self.date}|{norm}|{round(self.amount, 2)}|{self.direction.value}"

    def to_dict(self) -> dict[str, Any]:
        return {
            "transaction_id": self.transaction_id,
            "date": self.date,
            "description": self.description,
            "normalized_description": self.normalized_description,
            "amount": self.amount,
            "direction": self.direction.value,
            "institution": self.institution,
            "category": self.category,
            "source_document_id": self.source_document_id,
            "page_number": self.page_number,
            "raw_text": self.raw_text,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "NormalizedTransaction":
        return cls(
            transaction_id=data.get("transaction_id"),
            date_val=data["date"],
            description=data["description"],
            amount=data["amount"],
            direction=data.get("direction", "debit"),
            institution=data.get("institution"),
            category=data.get("category"),
            normalized_description=data.get("normalized_description"),
            source_document_id=data.get("source_document_id"),
            page_number=data.get("page_number"),
            raw_text=data.get("raw_text"),
        )


class RecurrenceGap:
    """Identified missing period in an otherwise regular recurring cadence."""

    def __init__(
        self,
        expected_period: str,
        expected_date: str | None = None,
        gap_type: str = "missing_cycle",
    ) -> None:
        self.expected_period = expected_period
        self.expected_date = expected_date
        self.gap_type = gap_type

    def to_dict(self) -> dict[str, Any]:
        return {
            "expected_period": self.expected_period,
            "expected_date": self.expected_date,
            "gap_type": self.gap_type,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "RecurrenceGap":
        return cls(
            expected_period=data["expected_period"],
            expected_date=data.get("expected_date"),
            gap_type=data.get("gap_type", "missing_cycle"),
        )


class RecurringRelationship:
    """Discovered recurring financial relationship synthesized across transaction observations."""

    def __init__(
        self,
        relationship_id: str,
        estate_id: str,
        normalized_name: str,
        display_name: str,
        category: str,
        direction: str = "debit",
        original_names: list[str] | None = None,
        occurrence_count: int = 0,
        unique_month_count: int = 0,
        first_observed_date: str | None = None,
        last_observed_date: str | None = None,
        observation_days: int = 0,
        observation_months: float = 0.0,
        intervals_days: list[int] | None = None,
        average_interval_days: float = 0.0,
        median_interval_days: float = 0.0,
        interval_stddev: float = 0.0,
        interval_consistency: float = 0.0,
        average_amount: float = 0.0,
        median_amount: float = 0.0,
        min_amount: float = 0.0,
        max_amount: float = 0.0,
        amount_stddev: float = 0.0,
        amount_variance: float = 0.0,
        amount_type: AmountType | str = AmountType.FIXED,
        amount_consistency: float = 1.0,
        cadence: Cadence | str = Cadence.MONTHLY,
        recurrence_strength: RecurrenceStrength | str = RecurrenceStrength.STRONG,
        recurrence_gaps: list[RecurrenceGap] | None = None,
        relationship_type: str | None = None,
        evidence_transaction_ids: list[str] | None = None,
        source_document_ids: list[str] | None = None,
        status: str = "inferred",
        confidence: float = 1.0,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> None:
        self.relationship_id = relationship_id
        self.estate_id = estate_id
        self.normalized_name = normalized_name
        self.display_name = display_name
        self.category = category
        self.direction = direction
        self.original_names = original_names or []
        self.occurrence_count = occurrence_count
        self.unique_month_count = unique_month_count
        self.first_observed_date = first_observed_date
        self.last_observed_date = last_observed_date
        self.observation_days = observation_days
        self.observation_months = observation_months
        self.intervals_days = intervals_days or []
        self.average_interval_days = round(average_interval_days, 1)
        self.median_interval_days = round(median_interval_days, 1)
        self.interval_stddev = round(interval_stddev, 2)
        self.interval_consistency = round(interval_consistency, 2)
        self.average_amount = round(average_amount, 2)
        self.median_amount = round(median_amount, 2)
        self.min_amount = round(min_amount, 2)
        self.max_amount = round(max_amount, 2)
        self.amount_stddev = round(amount_stddev, 2)
        self.amount_variance = round(amount_variance, 2)
        self.amount_type = amount_type if isinstance(amount_type, AmountType) else AmountType(str(amount_type).lower())
        self.amount_consistency = round(amount_consistency, 2)
        self.cadence = cadence if isinstance(cadence, Cadence) else Cadence(str(cadence).lower())
        self.recurrence_strength = (
            recurrence_strength
            if isinstance(recurrence_strength, RecurrenceStrength)
            else RecurrenceStrength(str(recurrence_strength).lower())
        )
        self.recurrence_gaps = recurrence_gaps or []
        self.relationship_type = relationship_type or f"recurring {category} payment"
        self.evidence_transaction_ids = evidence_transaction_ids or []
        self.source_document_ids = source_document_ids or []
        self.status = status
        self.confidence = round(confidence, 2)
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)

    def to_dict(self) -> dict[str, Any]:
        return {
            "relationship_id": self.relationship_id,
            "estate_id": self.estate_id,
            "normalized_name": self.normalized_name,
            "display_name": self.display_name,
            "category": self.category,
            "direction": self.direction,
            "original_names": self.original_names,
            "occurrence_count": self.occurrence_count,
            "unique_month_count": self.unique_month_count,
            "first_observed_date": self.first_observed_date,
            "last_observed_date": self.last_observed_date,
            "observation_days": self.observation_days,
            "observation_months": self.observation_months,
            "intervals_days": self.intervals_days,
            "average_interval_days": self.average_interval_days,
            "median_interval_days": self.median_interval_days,
            "interval_stddev": self.interval_stddev,
            "interval_consistency": self.interval_consistency,
            "average_amount": self.average_amount,
            "median_amount": self.median_amount,
            "min_amount": self.min_amount,
            "max_amount": self.max_amount,
            "amount_stddev": self.amount_stddev,
            "amount_variance": self.amount_variance,
            "amount_type": self.amount_type.value,
            "amount_consistency": self.amount_consistency,
            "cadence": self.cadence.value,
            "recurrence_strength": self.recurrence_strength.value,
            "recurrence_gaps": [g.to_dict() for g in self.recurrence_gaps],
            "relationship_type": self.relationship_type,
            "evidence_transaction_ids": self.evidence_transaction_ids,
            "source_document_ids": self.source_document_ids,
            "status": self.status,
            "confidence": self.confidence,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "RecurringRelationship":
        created = datetime.fromisoformat(data["created_at"]) if isinstance(data.get("created_at"), str) else data.get("created_at")
        updated = datetime.fromisoformat(data["updated_at"]) if isinstance(data.get("updated_at"), str) else data.get("updated_at")
        gaps = [RecurrenceGap.from_dict(g) for g in data.get("recurrence_gaps", [])]

        return cls(
            relationship_id=data["relationship_id"],
            estate_id=data["estate_id"],
            normalized_name=data["normalized_name"],
            display_name=data["display_name"],
            category=data["category"],
            direction=data.get("direction", "debit"),
            original_names=data.get("original_names", []),
            occurrence_count=data.get("occurrence_count", 0),
            unique_month_count=data.get("unique_month_count", 0),
            first_observed_date=data.get("first_observed_date"),
            last_observed_date=data.get("last_observed_date"),
            observation_days=data.get("observation_days", 0),
            observation_months=data.get("observation_months", 0.0),
            intervals_days=data.get("intervals_days", []),
            average_interval_days=data.get("average_interval_days", 0.0),
            median_interval_days=data.get("median_interval_days", 0.0),
            interval_stddev=data.get("interval_stddev", 0.0),
            interval_consistency=data.get("interval_consistency", 0.0),
            average_amount=data.get("average_amount", 0.0),
            median_amount=data.get("median_amount", 0.0),
            min_amount=data.get("min_amount", 0.0),
            max_amount=data.get("max_amount", 0.0),
            amount_stddev=data.get("amount_stddev", 0.0),
            amount_variance=data.get("amount_variance", 0.0),
            amount_type=data.get("amount_type", AmountType.FIXED),
            amount_consistency=data.get("amount_consistency", 1.0),
            cadence=data.get("cadence", Cadence.MONTHLY),
            recurrence_strength=data.get("recurrence_strength", RecurrenceStrength.STRONG),
            recurrence_gaps=gaps,
            relationship_type=data.get("relationship_type"),
            evidence_transaction_ids=data.get("evidence_transaction_ids", []),
            source_document_ids=data.get("source_document_ids", []),
            status=data.get("status", "inferred"),
            confidence=data.get("confidence", 1.0),
            created_at=created,
            updated_at=updated,
        )
