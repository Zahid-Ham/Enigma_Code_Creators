"""Financial entity domain model representing assets, liabilities, and recurring relationships."""

from datetime import datetime, timezone
from enum import Enum


class EntityType(str, Enum):
    """Categorization of financial entity in the Estate Twin."""

    BANK_ACCOUNT = "bank_account"
    INSURANCE = "insurance"
    INVESTMENT = "investment"
    FIXED_DEPOSIT = "fixed_deposit"
    EPF = "epf"
    PPF = "ppf"
    LOAN = "loan"
    CREDIT_CARD = "credit_card"
    SUBSCRIPTION = "subscription"
    UTILITY = "utility"
    TAX = "tax"
    OTHER = "other"


class EntityStatus(str, Enum):
    """Discovery and verification status of a financial entity."""

    VERIFIED = "verified"
    INFERRED = "inferred"
    UNVERIFIED = "unverified"
    MISSING = "missing"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"


class NomineeStatus(str, Enum):
    """Nominee registration state for health checks and claim readiness."""

    KNOWN = "known"
    UNKNOWN = "unknown"
    UNVERIFIED = "unverified"


class FinancialEntity:
    """Domain entity representing a specific financial asset, liability, or obligation."""

    def __init__(
        self,
        entity_id: str,
        estate_id: str,
        entity_type: EntityType | str,
        display_name: str,
        institution_name: str | None = None,
        account_reference: str | None = None,
        amount: float | None = None,
        premium_amount: float | None = None,
        sum_assured: float | None = None,
        emi_amount: float | None = None,
        outstanding_amount: float | None = None,
        investment_value: float | None = None,
        subscription_amount: float | None = None,
        transaction_amount: float | None = None,
        account_balance: float | None = None,
        maturity_amount: float | None = None,
        tax_amount: float | None = None,
        currency: str = "INR",
        frequency: str | None = None,
        status: EntityStatus | str = EntityStatus.UNVERIFIED,
        confidence: float = 1.0,
        evidence_document_ids: list[str] | None = None,
        nominee_status: NomineeStatus | str = NomineeStatus.UNVERIFIED,
        notes: str | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> None:
        self.entity_id = entity_id
        self.estate_id = estate_id
        self.entity_type = entity_type if isinstance(entity_type, EntityType) else EntityType(entity_type)
        self.display_name = display_name
        self.institution_name = institution_name
        self.account_reference = account_reference
        self.amount = float(amount) if amount is not None else None
        self.premium_amount = float(premium_amount) if premium_amount is not None else None
        self.sum_assured = float(sum_assured) if sum_assured is not None else None
        self.emi_amount = float(emi_amount) if emi_amount is not None else None
        self.outstanding_amount = float(outstanding_amount) if outstanding_amount is not None else None
        self.investment_value = float(investment_value) if investment_value is not None else None
        self.subscription_amount = float(subscription_amount) if subscription_amount is not None else None
        self.transaction_amount = float(transaction_amount) if transaction_amount is not None else None
        self.account_balance = float(account_balance) if account_balance is not None else None
        self.maturity_amount = float(maturity_amount) if maturity_amount is not None else None
        self.tax_amount = float(tax_amount) if tax_amount is not None else None
        self.currency = currency or "INR"
        self.frequency = frequency
        self.status = status if isinstance(status, EntityStatus) else EntityStatus(status)
        self.confidence = float(confidence)
        self.evidence_document_ids = list(evidence_document_ids or [])
        self.nominee_status = (
            nominee_status if isinstance(nominee_status, NomineeStatus) else NomineeStatus(nominee_status)
        )
        self.notes = notes
        now = datetime.now(timezone.utc)
        self.created_at = created_at or now
        self.updated_at = updated_at or now

    def to_dict(self) -> dict:
        """Serialize domain model to Firestore-compatible dictionary."""
        return {
            "entity_id": self.entity_id,
            "estate_id": self.estate_id,
            "entity_type": self.entity_type.value,
            "display_name": self.display_name,
            "institution_name": self.institution_name,
            "account_reference": self.account_reference,
            "amount": self.amount,
            "premium_amount": self.premium_amount,
            "sum_assured": self.sum_assured,
            "emi_amount": self.emi_amount,
            "outstanding_amount": self.outstanding_amount,
            "investment_value": self.investment_value,
            "subscription_amount": self.subscription_amount,
            "transaction_amount": self.transaction_amount,
            "account_balance": self.account_balance,
            "maturity_amount": self.maturity_amount,
            "tax_amount": self.tax_amount,
            "currency": self.currency,
            "frequency": self.frequency,
            "status": self.status.value,
            "confidence": self.confidence,
            "evidence_document_ids": self.evidence_document_ids,
            "nominee_status": self.nominee_status.value,
            "notes": self.notes,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict) -> "FinancialEntity":
        """Deserialize dictionary into FinancialEntity domain model."""
        created_at = data.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        elif created_at is not None and not isinstance(created_at, datetime):
            created_at = None

        updated_at = data.get("updated_at")
        if isinstance(updated_at, str):
            updated_at = datetime.fromisoformat(updated_at)
        elif updated_at is not None and not isinstance(updated_at, datetime):
            updated_at = None

        return cls(
            entity_id=data["entity_id"],
            estate_id=data["estate_id"],
            entity_type=data["entity_type"],
            display_name=data["display_name"],
            institution_name=data.get("institution_name"),
            account_reference=data.get("account_reference"),
            amount=data.get("amount"),
            premium_amount=data.get("premium_amount"),
            sum_assured=data.get("sum_assured"),
            emi_amount=data.get("emi_amount"),
            outstanding_amount=data.get("outstanding_amount"),
            investment_value=data.get("investment_value"),
            subscription_amount=data.get("subscription_amount"),
            transaction_amount=data.get("transaction_amount"),
            account_balance=data.get("account_balance"),
            maturity_amount=data.get("maturity_amount"),
            tax_amount=data.get("tax_amount"),
            currency=data.get("currency", "INR"),
            frequency=data.get("frequency"),
            status=data.get("status", EntityStatus.UNVERIFIED),
            confidence=data.get("confidence", 1.0),
            evidence_document_ids=data.get("evidence_document_ids", []),
            nominee_status=data.get("nominee_status", NomineeStatus.UNVERIFIED),
            notes=data.get("notes"),
            created_at=created_at,
            updated_at=updated_at,
        )
