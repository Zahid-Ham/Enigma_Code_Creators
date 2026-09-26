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



class NomineeDetailSchema(BaseModel):
    """Structured nominee beneficiary details with extraction provenance."""

    name: str | None = Field(None, description="Nominee legal full name")
    relationship: str | None = Field(None, description="Relationship to primary holder (e.g. Spouse, Child)")
    status: str = Field(default="unverified", description="Nominee detection status (known, unknown, unverified)")
    share_percentage: float | None = Field(None, ge=0.0, le=100.0, description="Nominee share percentage (e.g. 100.0)")
    source_page: int | None = Field(None, ge=1, description="Page number where nominee was identified")
    confidence: float | None = Field(None, ge=0.0, le=1.0, description="Confidence score")


class PolicyDetailsSchema(BaseModel):
    """Structured insurance policy terms and coverage details."""

    policy_number: str | None = Field(None, description="Policy number / identifier")
    policy_holder: str | None = Field(None, description="Primary life assured or policyholder name")
    policy_type: str | None = Field(None, description="Policy category (e.g. Term Life Insurance, Health)")
    sum_assured: float | None = Field(None, ge=0.0, description="Total life cover / sum assured amount")
    death_benefit: float | None = Field(None, ge=0.0, description="Guaranteed death benefit amount")
    accidental_rider: float | None = Field(None, ge=0.0, description="Accidental death or disability rider coverage")
    premium: float | None = Field(None, ge=0.0, description="Regular premium payment amount")
    frequency: str | None = Field(None, description="Premium payment frequency (e.g. Monthly, Annual)")
    policy_start_date: str | None = Field(None, description="Policy commencement / start date")
    policy_term: str | None = Field(None, description="Policy term duration (e.g. 20 years)")
    payment_term: str | None = Field(None, description="Premium payment term (e.g. 10 years)")
    nominee: NomineeDetailSchema | None = Field(None, description="Designated policy nominee")
    status: str | None = Field(None, description="Current policy status (e.g. Active, In Force)")
    benefits: list[str] = Field(default_factory=list, description="List of policy benefits or riders")


class LoanDetailsSchema(BaseModel):
    """Structured loan liability and repayment details."""

    loan_account: str | None = Field(None, description="Loan account number")
    borrower: str | None = Field(None, description="Primary borrower name")
    co_borrower: str | None = Field(None, description="Co-borrower name if applicable")
    loan_type: str | None = Field(None, description="Type of loan (e.g. Home Loan, Personal Loan)")
    sanctioned_principal: float | None = Field(None, ge=0.0, description="Original sanctioned loan amount")
    outstanding_principal: float | None = Field(None, ge=0.0, description="Current outstanding principal balance")
    emi_amount: float | None = Field(None, ge=0.0, description="Monthly equated monthly installment amount")
    interest_rate: str | float | None = Field(None, description="Annual interest rate percentage (e.g. 8.45%)")
    next_due_date: str | None = Field(None, description="Next EMI payment due date")
    tenure_remaining: str | None = Field(None, description="Remaining loan tenure")
    repayment_history: list[dict[str, Any]] = Field(default_factory=list, description="Historical repayment schedule rows")


class InvestmentDetailsSchema(BaseModel):
    """Structured investment and mutual fund portfolio details."""

    folio_number: str | None = Field(None, description="Folio number identifier")
    fund_name: str | None = Field(None, description="Mutual fund scheme or asset name")
    investor_name: str | None = Field(None, description="Primary investor name")
    investment_type: str | None = Field(None, description="Type of investment (e.g. Mutual Fund / SIP, Equity)")
    sip_amount: float | None = Field(None, ge=0.0, description="Systematic Investment Plan recurring amount")
    frequency: str | None = Field(None, description="SIP frequency (e.g. Monthly)")
    current_value: float | None = Field(None, ge=0.0, description="Current valuation / market corpus")
    total_invested: float | None = Field(None, ge=0.0, description="Total amount invested")
    units_held: float | None = Field(None, ge=0.0, description="Total units accumulated")
    nav: float | None = Field(None, ge=0.0, description="Net Asset Value per unit")
    nominee: NomineeDetailSchema | None = Field(None, description="Nominee for investment folio")
    transactions: list[dict[str, Any]] = Field(default_factory=list, description="Investment / SIP transaction records")


class AccountDetailsSchema(BaseModel):
    """Structured bank or financial account summary details."""

    account_holder: str | None = Field(None, description="Primary account holder name")
    account_number: str | None = Field(None, description="Bank account number / reference")
    bank_name: str | None = Field(None, description="Name of the banking institution")
    account_type: str | None = Field(None, description="Type of account (e.g. Savings, Current)")
    statement_period: str | None = Field(None, description="Statement duration period")
    opening_balance: float | None = Field(None, description="Opening balance amount")
    closing_balance: float | None = Field(None, description="Closing balance amount")


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
    policy_details: PolicyDetailsSchema | None = Field(None, description="Structured insurance policy details")
    loan_details: LoanDetailsSchema | None = Field(None, description="Structured loan liability details")
    investment_details: InvestmentDetailsSchema | None = Field(None, description="Structured mutual fund / investment details")
    account_details: AccountDetailsSchema | None = Field(None, description="Structured bank account summary details")
    nominee_details: NomineeDetailSchema | None = Field(None, description="Structured primary nominee details")
    overall_confidence: float = Field(..., ge=0.0, le=1.0, description="Aggregated extraction confidence")
    error: str | None = Field(None, description="Error message if processing failed")
    processing_duration_ms: int = Field(..., ge=0, description="Processing execution time in milliseconds")

    model_config = ConfigDict(from_attributes=True)
