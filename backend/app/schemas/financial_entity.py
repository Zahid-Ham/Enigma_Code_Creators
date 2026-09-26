"""Financial entity request, response, and validation schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.financial_entity import EntityStatus, EntityType, NomineeStatus


class FinancialEntityBase(BaseModel):
    """Base fields for a Financial Entity."""

    entity_type: EntityType = Field(..., description="Category of financial entity")
    display_name: str = Field(..., min_length=1, max_length=250, description="Display name / title of asset or relationship")
    institution_name: str | None = Field(None, max_length=250, description="Bank, insurer, or institution name")
    account_reference: str | None = Field(None, max_length=150, description="Account, policy, or folio number")
    amount: float | None = Field(None, ge=0.0, description="Monetary value or regular amount (must not be negative)")
    premium_amount: float | None = Field(None, ge=0.0, description="Recurring premium payment amount")
    sum_assured: float | None = Field(None, ge=0.0, description="Total insurance life cover or sum assured")
    emi_amount: float | None = Field(None, ge=0.0, description="Monthly loan instalment amount")
    outstanding_amount: float | None = Field(None, ge=0.0, description="Total loan/credit outstanding balance")
    investment_value: float | None = Field(None, ge=0.0, description="Current market or portfolio valuation")
    subscription_amount: float | None = Field(None, ge=0.0, description="Recurring subscription charge")
    transaction_amount: float | None = Field(None, ge=0.0, description="Observed transaction payment amount")
    account_balance: float | None = Field(None, ge=0.0, description="Bank account cleared balance")
    maturity_amount: float | None = Field(None, ge=0.0, description="Deposit maturity amount")
    tax_amount: float | None = Field(None, ge=0.0, description="Tax liability or refund amount")
    currency: str = Field(default="INR", min_length=1, max_length=10, description="Currency ISO code (defaults to INR)")
    frequency: str | None = Field(None, max_length=50, description="Frequency (e.g. monthly, annual, one_time)")
    status: EntityStatus = Field(default=EntityStatus.UNVERIFIED, description="Verification / discovery status")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    evidence_document_ids: list[str] = Field(default_factory=list, description="IDs of linked uploaded evidence documents")
    nominee_status: NomineeStatus = Field(default=NomineeStatus.UNVERIFIED, description="Nominee state")
    notes: str | None = Field(None, max_length=2000, description="Contextual notes or extraction commentary")


class FinancialEntityCreate(FinancialEntityBase):
    """Schema for creating a new financial entity in an estate."""

    entity_id: str | None = Field(None, max_length=100, description="Optional custom ID. Generated if omitted.")


class FinancialEntityUpdate(BaseModel):
    """Schema for updating an existing financial entity (all fields optional)."""

    entity_type: EntityType | None = None
    display_name: str | None = Field(None, min_length=1, max_length=250)
    institution_name: str | None = Field(None, max_length=250)
    account_reference: str | None = Field(None, max_length=150)
    amount: float | None = Field(None, ge=0.0)
    premium_amount: float | None = Field(None, ge=0.0)
    sum_assured: float | None = Field(None, ge=0.0)
    emi_amount: float | None = Field(None, ge=0.0)
    outstanding_amount: float | None = Field(None, ge=0.0)
    investment_value: float | None = Field(None, ge=0.0)
    subscription_amount: float | None = Field(None, ge=0.0)
    transaction_amount: float | None = Field(None, ge=0.0)
    account_balance: float | None = Field(None, ge=0.0)
    maturity_amount: float | None = Field(None, ge=0.0)
    tax_amount: float | None = Field(None, ge=0.0)
    currency: str | None = Field(None, min_length=1, max_length=10)
    frequency: str | None = Field(None, max_length=50)
    status: EntityStatus | None = None
    confidence: float | None = Field(None, ge=0.0, le=1.0)
    evidence_document_ids: list[str] | None = None
    nominee_status: NomineeStatus | None = None
    notes: str | None = Field(None, max_length=2000)


class FinancialEntityResponse(FinancialEntityBase):
    """Schema for financial entity public response."""

    entity_id: str = Field(..., description="Unique entity identifier")
    estate_id: str = Field(..., description="Parent estate identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)


class FinancialEntityListResponse(BaseModel):
    """Schema for list of financial entities belonging to an estate."""

    entities: list[FinancialEntityResponse]
    total: int = Field(..., description="Total count of entities")
