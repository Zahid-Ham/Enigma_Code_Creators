"""Estate Radar and recurring financial relationship discovery API routes."""

from fastapi import APIRouter, Body, Path, status

from app.schemas.recurrence import (
    EstateRecurrenceResponse,
    NormalizedTransactionInput,
    RecurringRelationshipResponse,
)
from app.services.discovery.recurrence_service import (
    RecurrenceService,
    recurrence_service,
)

router = APIRouter(prefix="/discovery", tags=["Discovery"])


@router.get(
    "/recurring/{estate_id}",
    response_model=EstateRecurrenceResponse,
    summary="Get discovered recurring financial relationships for an estate",
)
async def get_recurring_relationships(
    estate_id: str = Path(..., description="ID of the financial estate"),
) -> EstateRecurrenceResponse:
    """Retrieve all synthesized recurring financial relationships (insurance premiums, loan EMIs,

    recurring SIPs, subscriptions, utilities) discovered across observation windows.
    """
    return await recurrence_service.get_estate_relationships(estate_id)


@router.get(
    "/recurring/{estate_id}/{relationship_id}",
    response_model=RecurringRelationshipResponse,
    summary="Get details of a specific recurring relationship",
)
async def get_recurring_relationship_detail(
    estate_id: str = Path(..., description="ID of the financial estate"),
    relationship_id: str = Path(..., description="ID of the recurring relationship"),
) -> RecurringRelationshipResponse:
    """Retrieve fine-grained cadence, amount consistency, gap detection, and evidence facts

    for an inferred recurring financial relationship.
    """
    return await recurrence_service.get_relationship(estate_id, relationship_id)


@router.post(
    "/recurring/{estate_id}/analyze",
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
    """Ingest a batch of normalized transactions, execute deterministic recurrence analysis,

    persist the synthesized relationships, and return the discovery result.
    """
    tx_dicts = [t.model_dump() for t in transactions]
    return await recurrence_service.analyze_and_store_transactions(estate_id, tx_dicts)
