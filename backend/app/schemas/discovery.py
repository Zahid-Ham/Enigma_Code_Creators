"""Pydantic schemas for Estate Radar cross-document financial discovery."""

from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class MonthlyPatternItem(BaseModel):
    """Monthly transaction activity breakdown for charting."""

    month: str = Field(..., description="Short month label, e.g. 'Apr', 'May'")
    amount: float = Field(..., description="Total or representative amount for that month")
    occurrences: int = Field(default=1, description="Number of observed transactions in month")
    status: str = Field(default="active", description="Status e.g. active, gap, projected")

    model_config = ConfigDict(from_attributes=True)


class EvidenceSourceDocument(BaseModel):
    """Source document backing a discovery relationship."""

    document_id: str = Field(..., description="UUID of source document")
    filename: str = Field(..., description="Filename of source document")
    doc_type: str = Field(..., description="Canonical document type")
    pages: str = Field(default="1", description="Observed page range, e.g. 'Pages 1–3'")

    model_config = ConfigDict(from_attributes=True)


class DiscoveryTransactionItem(BaseModel):
    """Individual transaction linked as evidence to a discovery relationship."""

    transaction_id: str = Field(..., description="Unique transaction ID")
    date: str = Field(..., description="ISO or formatted transaction date")
    description: str = Field(..., description="Raw or normalized narrative")
    amount: float = Field(..., description="Transaction amount")
    direction: str = Field(default="debit", description="debit | credit")
    institution: str | None = Field(default=None, description="Institution identifier")
    category: str = Field(default="other", description="Inferred category")
    source_document_id: str | None = Field(default=None, description="Source document UUID")
    page_number: int | None = Field(default=None, description="Page number where found")

    model_config = ConfigDict(from_attributes=True)


class DiscoveryRelationshipSchema(BaseModel):
    """Synthesized cross-document financial relationship."""

    discovery_id: str = Field(..., description="Unique discovery relationship ID")
    estate_id: str = Field(..., description="Parent estate ID")
    relationship_type: str = Field(..., description="e.g. 'Recurring Insurance Premium', 'Recurring Home Loan EMI'")
    institution_name: str = Field(..., description="Canonical provider/institution name")
    financial_entity_type: str = Field(..., description="insurance | loan | investment | subscription | utility | bank | tax | other")
    relationship_label: str = Field(..., description="e.g. 'Insurance • Recurring'")
    occurrence_count: int = Field(default=0, description="Total observed occurrences")
    observation_period: str = Field(default="", description="e.g. 'Apr–Sep 2026'")
    cadence: str = Field(default="Monthly", description="Monthly | Weekly | Quarterly | Annual | Irregular | One-time")
    average_amount: float = Field(default=0.0, description="Average transaction amount in INR")
    amount_pattern: str = Field(default="Fixed", description="Fixed | Variable")
    confidence: float = Field(default=0.95, description="Confidence score 0.0-1.0")
    confidence_pct: int = Field(default=95, description="Confidence percentage e.g. 98")
    strength: str = Field(default="Strong", description="Strong | Moderate | Weak | Needs Review")
    status: str = Field(default="Strong Match", description="Strong Match | Inferred | Verified | Needs Review")
    source_document_ids: list[str] = Field(default_factory=list, description="IDs of backing documents")
    source_documents: list[EvidenceSourceDocument] = Field(default_factory=list, description="Backing document items")
    source_transaction_ids: list[str] = Field(default_factory=list, description="IDs of linked transactions")
    evidence_items: list[dict[str, Any]] = Field(default_factory=list, description="Evidence references")
    transactions: list[DiscoveryTransactionItem] = Field(default_factory=list, description="Evidence transactions")
    monthly_pattern: list[MonthlyPatternItem] = Field(default_factory=list, description="Month-by-month amounts")
    nominee_status: str = Field(default="Not detected in available evidence", description="Nominee state")
    nominee_name: str | None = Field(default=None, description="Nominee name if detected")
    policy_or_account_reference: str | None = Field(default=None, description="Policy/Account number if detected")
    first_observed: str | None = Field(default=None, description="e.g. 'Apr 2026'")
    last_observed: str | None = Field(default=None, description="e.g. 'Sep 2026'")
    explanation: str = Field(default="", description="Human-readable synthesis explanation")
    verification_state: str = Field(default="inferred", description="verified | inferred | unverified")

    model_config = ConfigDict(from_attributes=True)


class MissingAssetSchema(BaseModel):
    """Potential missing asset or liability identified from transaction evidence without a master document."""

    missing_asset_id: str = Field(..., description="Unique missing asset identifier")
    estate_id: str = Field(..., description="Parent estate ID")
    title: str = Field(..., description="e.g. 'Health Insurance', 'Investment Portfolio'")
    category: str = Field(..., description="insurance | investment | loan | bank | utility")
    institution_name: str = Field(..., description="Institution name if identified")
    reason: str = Field(..., description="e.g. 'Inferred from recurring patterns. No policy document found.'")
    evidence: str = Field(..., description="e.g. 'Inferred from 6 recurring transactions totaling ₹25,500'")
    occurrence_count: int = Field(default=0, description="Number of observed transactions")
    average_amount: float = Field(default=0.0, description="Average transaction amount in INR")
    source_document_ids: list[str] = Field(default_factory=list, description="Supporting document IDs")
    source_documents: list[EvidenceSourceDocument] = Field(default_factory=list, description="Supporting document metadata")
    confidence: float = Field(default=0.90, description="Confidence score 0.0-1.0")
    severity: str = Field(default="medium", description="high | medium | low")
    status: str = Field(default="inferred", description="inferred | needs_review | unverified")
    recommended_action: str = Field(default="", description="Guidance to resolve missing asset")

    model_config = ConfigDict(from_attributes=True)


class RiskAlertSchema(BaseModel):
    """Risk alert requiring executor or family review."""

    alert_id: str = Field(..., description="Unique alert identifier")
    estate_id: str = Field(..., description="Parent estate ID")
    title: str = Field(..., description="e.g. 'Missing Nominee Registration', 'Unlinked Recurring Debt'")
    severity: str = Field(default="medium", description="high | medium | low")
    category: str = Field(default="nominee", description="nominee | liability | compliance | missing_doc")
    description: str = Field(..., description="Detailed risk description")
    institution_name: str = Field(default="", description="Relevant institution name")
    recommended_action: str = Field(default="", description="Next steps to mitigate risk")

    model_config = ConfigDict(from_attributes=True)


class EstateRadarSummarySchema(BaseModel):
    """Top-level aggregate metrics for the Estate Radar summary cards."""

    recurring_relationships: int = Field(default=0, description="Number of recurring financial relationships")
    potential_missing_assets: int = Field(default=0, description="Number of detected potential missing assets")
    risk_alerts: int = Field(default=0, description="Number of active risk alerts")
    documents_analyzed: int = Field(default=0, description="Number of processed source documents")

    model_config = ConfigDict(from_attributes=True)


class EstateRadarResponse(BaseModel):
    """Top-level response payload for the Estate Radar cross-document discovery dashboard."""

    estate_id: str = Field(..., description="Parent estate identifier")
    summary: EstateRadarSummarySchema = Field(..., description="Aggregate summary metrics")
    discoveries: list[DiscoveryRelationshipSchema] = Field(default_factory=list, description="Discovered relationships")
    missing_assets: list[MissingAssetSchema] = Field(default_factory=list, description="Detected missing assets")
    risk_alerts: list[RiskAlertSchema] = Field(default_factory=list, description="Generated risk alerts")
    insights: list[str] = Field(default_factory=list, description="Key deterministic insights")

    model_config = ConfigDict(from_attributes=True)
