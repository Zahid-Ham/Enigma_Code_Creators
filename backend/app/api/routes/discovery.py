"""Estate Radar and recurring financial relationship discovery API routes."""

from fastapi import APIRouter, Body, Path, status

from app.schemas.discovery import EstateRadarResponse
from app.schemas.recurrence import (
    EstateRecurrenceResponse,
    NormalizedTransactionInput,
    RecurringRelationshipResponse,
)
from app.services.discovery.radar_engine import radar_engine
from app.services.discovery.recurrence_service import recurrence_service

router = APIRouter(tags=["Discovery"])


@router.get(
    "/estate-radar/{estate_id}",
    response_model=EstateRadarResponse,
    summary="Get cross-document Estate Radar discovery analysis for an estate",
    description="Transforms extracted financial relationships into a cross-document discovery layer with recurring pattern breakdowns, missing assets, and risk alerts.",
)
@router.get(
    "/discovery/estate-radar/{estate_id}",
    response_model=EstateRadarResponse,
    include_in_schema=False,
)
async def get_estate_radar(
    estate_id: str = Path(..., description="ID of the financial estate (e.g. demo-estate-001)"),
) -> EstateRadarResponse:
    """Retrieve full synthesized Estate Radar discovery analysis."""
    return await radar_engine.generate_estate_radar(estate_id)


@router.get(
    "/discovery/recurring/{estate_id}",
    response_model=EstateRecurrenceResponse,
    summary="Get discovered recurring financial relationships for an estate",
)
async def get_recurring_relationships(
    estate_id: str = Path(..., description="ID of the financial estate"),
) -> EstateRecurrenceResponse:
    """Retrieve all synthesized recurring financial relationships."""
    return await recurrence_service.get_estate_relationships(estate_id)


@router.get(
    "/discovery/recurring/{estate_id}/{relationship_id}",
    response_model=RecurringRelationshipResponse,
    summary="Get details of a specific recurring relationship",
)
async def get_recurring_relationship_detail(
    estate_id: str = Path(..., description="ID of the financial estate"),
    relationship_id: str = Path(..., description="ID of the recurring relationship"),
) -> RecurringRelationshipResponse:
    """Retrieve fine-grained cadence, amount consistency, gap detection, and evidence facts."""
    return await recurrence_service.get_relationship(estate_id, relationship_id)


@router.post(
    "/discovery/recurring/{estate_id}/analyze",
    response_model=EstateRecurrenceResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze transactions and discover recurring financial relationships",
)
async def analyze_transactions_for_recurrence(
    estate_id: str = Path(..., description="ID of the financial estate"),
    transactions: list[NormalizedTransactionInput] = Body(
        ..., description="List of transaction records extracted from statements"
    ),
) -> EstateRecurrenceResponse:
    """Ingest a batch of normalized transactions, execute deterministic recurrence analysis."""
    tx_dicts = [t.model_dump() for t in transactions]
    return await recurrence_service.analyze_and_store_transactions(estate_id, tx_dicts)
