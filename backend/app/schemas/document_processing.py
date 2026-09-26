"""Pydantic schemas for Document Intelligence API requests and responses."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.document_processing import (
    DocumentType,
    EvidenceSource,
    ProcessingStatus,
)
from app.models.financial_entity import EntityStatus, EntityType, NomineeStatus


class EvidenceItemSchema(BaseModel):
    """Schema for individual traceable evidence facts."""

    field: str = Field(..., description="Field or concept identified (e.g. premium_amount, policy_number)")
    value: str = Field(..., description="Extracted value snippet")
    page: int = Field(..., ge=1, description="1-indexed source document page number")
    source: EvidenceSource = Field(default=EvidenceSource.PDF_TEXT, description="Extraction source method")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Extraction confidence score (0.0 to 1.0)")


class ExtractedEntitySchema(BaseModel):
    """Schema for AI-extracted financial entities and relationships."""

    entity_type: EntityType = Field(..., description="Financial entity category")
    display_name: str = Field(..., min_length=1, max_length=250, description="Title of the asset, policy, or account")
    institution_name: str | None = Field(None, max_length=250, description="Financial institution or provider")
    account_reference: str | None = Field(None, max_length=150, description="Account or policy identifier")
    amount: float | None = Field(None, ge=0.0, description="Generic financial amount for backward compatibility")
    premium_amount: float | None = Field(None, ge=0.0, description="Recurring insurance premium payment amount")
    sum_assured: float | None = Field(None, ge=0.0, description="Life or health insurance coverage / sum assured")
    emi_amount: float | None = Field(None, ge=0.0, description="Loan equated monthly installment amount")
    outstanding_amount: float | None = Field(None, ge=0.0, description="Loan or liability principal outstanding balance")
    investment_value: float | None = Field(None, ge=0.0, description="Total portfolio or asset market valuation")
    subscription_amount: float | None = Field(None, ge=0.0, description="Recurring digital/service subscription fee")
    transaction_amount: float | None = Field(None, ge=0.0, description="Individual debit/credit or SIP transaction amount")
    account_balance: float | None = Field(None, ge=0.0, description="Available or closing bank/account balance")
    maturity_amount: float | None = Field(None, ge=0.0, description="Maturity or fixed deposit payout valuation")
    tax_amount: float | None = Field(None, ge=0.0, description="Tax assessment or TDS deduction amount")
    currency: str = Field(default="INR", max_length=10, description="Currency code (e.g. INR)")
    frequency: str | None = Field(None, max_length=50, description="Frequency (monthly, annual, one_time)")
    status: EntityStatus = Field(default=EntityStatus.INFERRED, description="Initial discovery status")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0.0 to 1.0)")
    nominee_status: NomineeStatus = Field(default=NomineeStatus.UNVERIFIED, description="Nominee state")
    notes: str | None = Field(None, max_length=2000, description="Contextual notes or commentary")



class ProcessDocumentRequest(BaseModel):
    """Request schema to trigger or retry document AI processing."""

    force: bool = Field(default=False, description="Force re-processing even if already completed")


class ProcessingStatusResponse(BaseModel):
    """Status polling response for document processing."""

    document_id: str = Field(..., description="Document identifier UUID")
    status: ProcessingStatus = Field(..., description="Current processing phase")
    progress: int = Field(..., ge=0, le=100, description="Progress indicator percentage (0 to 100)")
    document_type: DocumentType | None = Field(None, description="Classified document type if determined")
    message: str = Field(..., description="Human-readable stage description")
    error: str | None = Field(None, description="Error message if failed")

    model_config = ConfigDict(from_attributes=True)


class DocumentProcessingResultResponse(BaseModel):
    """Comprehensive structured outcome of document AI extraction."""

    document_id: str = Field(..., description="Document identifier UUID")
    status: ProcessingStatus = Field(..., description="Final processing status")
    document_type: DocumentType = Field(..., description="Classified financial document type")
    processed_at: datetime = Field(..., description="Timestamp of completion")
    extracted_text_page_count: int = Field(..., ge=0, description="Total pages extracted from document")
    relevant_page_count: int = Field(..., ge=0, description="Count of pages determined financially relevant")
    entities: list[ExtractedEntitySchema] = Field(default_factory=list, description="Detected financial entities")
    evidence: list[EvidenceItemSchema] = Field(default_factory=list, description="Traceable evidence items")
    warnings: list[str] = Field(default_factory=list, description="Quality or missing-evidence warnings")
    transactions: list[dict[str, Any]] = Field(default_factory=list, description="Extracted transactions from document")
    overall_confidence: float = Field(..., ge=0.0, le=1.0, description="Aggregated extraction confidence")
    error: str | None = Field(None, description="Error message if processing failed")
    processing_duration_ms: int = Field(..., ge=0, description="Processing execution time in milliseconds")

    model_config = ConfigDict(from_attributes=True)
