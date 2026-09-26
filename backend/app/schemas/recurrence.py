"""Pydantic schemas for Recurring Transaction & Financial Relationship Detection."""

from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field

from app.models.recurrence import AmountType, Cadence, RecurrenceStrength, TransactionDirection


class NormalizedTransactionInput(BaseModel):
    """Input payload for a transaction record to be normalized and analyzed."""

    model_config = ConfigDict(extra="ignore")

    date: str = Field(description="Transaction date in YYYY-MM-DD format (or DD-Mon-YYYY)")
    description: str = Field(description="Raw transaction narrative or memo")
    amount: float = Field(ge=0.0, description="Absolute transaction value")
    direction: str = Field(default="debit", description="debit | credit")
    institution: str | None = Field(default=None, description="Extracted institution name if available")
    category: str | None = Field(default=None, description="Semantic financial category (e.g. insurance, loan, utility)")
    source_document_id: str | None = Field(default=None, description="Document ID where transaction originated")
    page_number: int | None = Field(default=None, description="1-indexed source document page")


class RecurrenceGapResponse(BaseModel):
    """Missing cycle detected in an ongoing cadence."""

    expected_period: str = Field(description="Period name (e.g. 'June 2026')")
    expected_date: str | None = Field(default=None, description="Estimated cycle date")
    gap_type: str = Field(default="missing_cycle", description="Nature of the detected gap")


class RecurringRelationshipResponse(BaseModel):
    """Structured response for a single recurring financial relationship."""

    relationship_id: str
    estate_id: str
    normalized_name: str
    display_name: str
    category: str
    direction: str
    original_names: list[str] = Field(default_factory=list)

    occurrence_count: int
    unique_month_count: int
    first_observed_date: str | None = None
    last_observed_date: str | None = None
    observation_days: int = 0
    observation_months: float = 0.0

    intervals_days: list[int] = Field(default_factory=list)
    average_interval_days: float = 0.0
    median_interval_days: float = 0.0
    interval_stddev: float = 0.0
    interval_consistency: float = 0.0

    average_amount: float = 0.0
    median_amount: float = 0.0
    min_amount: float = 0.0
    max_amount: float = 0.0
    amount_stddev: float = 0.0
    amount_variance: float = 0.0
    amount_type: AmountType = AmountType.FIXED
    amount_consistency: float = 1.0

    cadence: Cadence = Cadence.MONTHLY
    recurrence_strength: RecurrenceStrength = RecurrenceStrength.STRONG
    recurrence_gaps: list[RecurrenceGapResponse] = Field(default_factory=list)
    relationship_type: str

    evidence_transaction_ids: list[str] = Field(default_factory=list)
    source_document_ids: list[str] = Field(default_factory=list)
    status: str = "inferred"
    confidence: float = 1.0
    created_at: datetime
    updated_at: datetime


class ObservationWindowResponse(BaseModel):
    """Observation window date bounds."""

    start: str | None = None
    end: str | None = None
    total_days: int = 0
    total_months: float = 0.0


class EstateRecurrenceResponse(BaseModel):
    """Estate-level recurring relationship discovery result."""

    estate_id: str
    observation_window: ObservationWindowResponse
    total_transactions_analyzed: int
    relationships: list[RecurringRelationshipResponse]
