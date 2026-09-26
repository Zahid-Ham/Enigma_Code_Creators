"""Domain models for Document Intelligence & AI Processing."""

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from app.models.financial_entity import EntityStatus, EntityType, NomineeStatus


class ProcessingStatus(str, Enum):
    """Lifecycle status of document AI processing pipeline."""

    PENDING = "pending"
    EXTRACTING = "extracting"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentType(str, Enum):
    """Classification category of uploaded financial document."""

    BANK_STATEMENT = "bank_statement"
    INSURANCE_POLICY = "insurance_policy"
    INSURANCE_CORRESPONDENCE = "insurance_correspondence"
    INVESTMENT_STATEMENT = "investment_statement"
    FIXED_DEPOSIT = "fixed_deposit"
    LOAN_STATEMENT = "loan_statement"
    CREDIT_CARD_STATEMENT = "credit_card_statement"
    TAX_DOCUMENT = "tax_document"
    SALARY_DOCUMENT = "salary_document"
    UTILITY_BILL = "utility_bill"
    EPF_DOCUMENT = "epf_document"
    PPF_DOCUMENT = "ppf_document"
    OTHER = "other"
    UNKNOWN = "unknown"


class EvidenceSource(str, Enum):
    """Source channel of extracted page content."""

    PDF_TEXT = "pdf_text"
    OCR = "ocr"


class PageContent:
    """Extracted text content and metadata for a single document page."""

    def __init__(
        self,
        page_number: int,
        text: str,
        char_count: int | None = None,
        source: EvidenceSource = EvidenceSource.PDF_TEXT,
    ) -> None:
        self.page_number = page_number
        self.text = text
        self.char_count = char_count if char_count is not None else len(text)
        self.source = source if isinstance(source, EvidenceSource) else EvidenceSource(source)

    def to_dict(self) -> dict[str, Any]:
        return {
            "page_number": self.page_number,
            "text": self.text,
            "char_count": self.char_count,
            "source": self.source.value,
        }


class EvidenceItem:
    """Traceable fact linkage referencing the exact source page and confidence."""

    def __init__(
        self,
        field: str,
        value: str,
        page: int,
        source: EvidenceSource | str = EvidenceSource.PDF_TEXT,
        confidence: float = 1.0,
    ) -> None:
        self.field = field
        self.value = value
        self.page = page
        self.source = source if isinstance(source, EvidenceSource) else EvidenceSource(source)
        self.confidence = float(confidence)

    def to_dict(self) -> dict[str, Any]:
        return {
            "field": self.field,
            "value": self.value,
            "page": self.page,
            "source": self.source.value,
            "confidence": self.confidence,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "EvidenceItem":
        return cls(
            field=data["field"],
            value=str(data["value"]),
            page=int(data["page"]),
            source=data.get("source", EvidenceSource.PDF_TEXT),
            confidence=float(data.get("confidence", 1.0)),
        )


class ExtractedEntity:
    """A financial relationship or asset detected by AI extraction."""

    def __init__(
        self,
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
        status: EntityStatus | str = EntityStatus.INFERRED,
        confidence: float = 0.85,
        nominee_status: NomineeStatus | str = NomineeStatus.UNVERIFIED,
        notes: str | None = None,
    ) -> None:
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
        self.nominee_status = (
            nominee_status if isinstance(nominee_status, NomineeStatus) else NomineeStatus(nominee_status)
        )
        self.notes = notes

    def to_dict(self) -> dict[str, Any]:
        return {
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
            "nominee_status": self.nominee_status.value,
            "notes": self.notes,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "ExtractedEntity":
        return cls(
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
            status=data.get("status", EntityStatus.INFERRED),
            confidence=data.get("confidence", 0.85),
            nominee_status=data.get("nominee_status", NomineeStatus.UNVERIFIED),
            notes=data.get("notes"),
        )



class DocumentProcessingResult:
    """Domain model holding the complete outcome of AI document processing."""

    def __init__(
        self,
        document_id: str,
        status: ProcessingStatus | str = ProcessingStatus.PENDING,
        document_type: DocumentType | str = DocumentType.UNKNOWN,
        processed_at: datetime | None = None,
        extracted_text_page_count: int = 0,
        relevant_page_count: int = 0,
        entities: list[ExtractedEntity] | None = None,
        evidence: list[EvidenceItem] | None = None,
        warnings: list[str] | None = None,
        transactions: list[dict[str, Any]] | None = None,
        policy_details: dict[str, Any] | None = None,
        loan_details: dict[str, Any] | None = None,
        investment_details: dict[str, Any] | None = None,
        account_details: dict[str, Any] | None = None,
        nominee_details: dict[str, Any] | None = None,
        overall_confidence: float = 0.0,
        error: str | None = None,
        processing_duration_ms: int = 0,
    ) -> None:
        self.document_id = document_id
        self.status = status if isinstance(status, ProcessingStatus) else ProcessingStatus(status)
        self.document_type = (
            document_type if isinstance(document_type, DocumentType) else DocumentType(document_type)
        )
        self.processed_at = processed_at or datetime.now(timezone.utc)
        self.extracted_text_page_count = extracted_text_page_count
        self.relevant_page_count = relevant_page_count
        self.entities = list(entities or [])
        self.evidence = list(evidence or [])
        self.warnings = list(warnings or [])
        self.transactions = list(transactions or [])
        self.policy_details = policy_details
        self.loan_details = loan_details
        self.investment_details = investment_details
        self.account_details = account_details
        self.nominee_details = nominee_details
        self.overall_confidence = float(overall_confidence)
        self.error = error
        self.processing_duration_ms = processing_duration_ms

    def to_dict(self) -> dict[str, Any]:
        return {
            "document_id": self.document_id,
            "status": self.status.value,
            "document_type": self.document_type.value,
            "processed_at": self.processed_at.isoformat(),
            "extracted_text_page_count": self.extracted_text_page_count,
            "relevant_page_count": self.relevant_page_count,
            "entities": [e.to_dict() for e in self.entities],
            "evidence": [ev.to_dict() for ev in self.evidence],
            "warnings": self.warnings,
            "transactions": self.transactions,
            "policy_details": self.policy_details,
            "loan_details": self.loan_details,
            "investment_details": self.investment_details,
            "account_details": self.account_details,
            "nominee_details": self.nominee_details,
            "overall_confidence": self.overall_confidence,
            "error": self.error,
            "processing_duration_ms": self.processing_duration_ms,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "DocumentProcessingResult":
        processed_at_val = data.get("processed_at")
        if isinstance(processed_at_val, str):
            processed_at = datetime.fromisoformat(processed_at_val)
        elif isinstance(processed_at_val, datetime):
            processed_at = processed_at_val
        else:
            processed_at = datetime.now(timezone.utc)

        raw_entities = data.get("entities", [])
        entities = [
            ExtractedEntity.from_dict(e) if isinstance(e, dict) else e
            for e in raw_entities
        ]

        raw_evidence = data.get("evidence", [])
        evidence = [
            EvidenceItem.from_dict(ev) if isinstance(ev, dict) else ev
            for ev in raw_evidence
        ]

        return cls(
            document_id=data["document_id"],
            status=data.get("status", ProcessingStatus.COMPLETED),
            document_type=data.get("document_type", DocumentType.UNKNOWN),
            processed_at=processed_at,
            extracted_text_page_count=data.get("extracted_text_page_count", 0),
            relevant_page_count=data.get("relevant_page_count", 0),
            entities=entities,
            evidence=evidence,
            warnings=data.get("warnings", []),
            transactions=data.get("transactions", []),
            policy_details=data.get("policy_details"),
            loan_details=data.get("loan_details"),
            investment_details=data.get("investment_details"),
            account_details=data.get("account_details"),
            nominee_details=data.get("nominee_details"),
            overall_confidence=float(data.get("overall_confidence", 0.0)),
            error=data.get("error"),
            processing_duration_ms=data.get("processing_duration_ms", 0),
        )
