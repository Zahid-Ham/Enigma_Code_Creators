"""Financial Estate Twin and Financial Entity API routes."""

from fastapi import APIRouter, status

from app.schemas.estate import (
    EstateCreate,
    EstateListResponse,
    EstateResponse,
)
from app.schemas.financial_entity import (
    FinancialEntityCreate,
    FinancialEntityListResponse,
    FinancialEntityResponse,
    FinancialEntityUpdate,
)
from app.services.estate.entity_service import financial_entity_service
from app.services.estate.estate_service import estate_service

router = APIRouter(prefix="/estates", tags=["Estates"])


# ---------------------------------------------------------------------------
# Estate Endpoints
# ---------------------------------------------------------------------------


@router.post(
    "",
    response_model=EstateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create financial estate",
    description="Create a new Financial Estate representation for a person.",
)
async def create_estate(
    payload: EstateCreate,
) -> EstateResponse:
    """Create a new Financial Estate."""
    return await estate_service.create_estate(payload)


@router.get(
    "/{estate_id}",
    response_model=EstateResponse,
    status_code=status.HTTP_200_OK,
    summary="Get financial estate",
    description="Retrieve details of a specific Financial Estate by ID.",
)
async def get_estate(
    estate_id: str,
) -> EstateResponse:
    """Retrieve details of a single Financial Estate."""
    return await estate_service.get_estate(estate_id)


@router.get(
    "",
    response_model=EstateListResponse,
    status_code=status.HTTP_200_OK,
    summary="List financial estates",
    description="List all available Financial Estates in the current environment.",
)
async def list_estates() -> EstateListResponse:
    """List all Financial Estates."""
    return await estate_service.list_estates()


# ---------------------------------------------------------------------------
# Financial Entity Endpoints (Nested under /estates/{estate_id}/entities)
# ---------------------------------------------------------------------------


@router.post(
    "/{estate_id}/entities",
    response_model=FinancialEntityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create financial entity",
    description="Create an asset, liability, policy, or recurring relationship within an estate.",
)
async def create_entity(
    estate_id: str,
    payload: FinancialEntityCreate,
) -> FinancialEntityResponse:
    """Create and attach a financial entity to an estate."""
    return await financial_entity_service.create_entity(estate_id, payload)


@router.get(
    "/{estate_id}/entities",
    response_model=FinancialEntityListResponse,
    status_code=status.HTTP_200_OK,
    summary="List financial entities",
    description="Retrieve all financial entities (assets, liabilities, policies) for an estate.",
)
async def list_entities(
    estate_id: str,
) -> FinancialEntityListResponse:
    """List all financial entities in an estate."""
    return await financial_entity_service.list_entities(estate_id)


@router.get(
    "/{estate_id}/entities/{entity_id}",
    response_model=FinancialEntityResponse,
    status_code=status.HTTP_200_OK,
    summary="Get financial entity",
    description="Retrieve details of a single financial entity by ID within an estate.",
)
async def get_entity(
    estate_id: str,
    entity_id: str,
) -> FinancialEntityResponse:
    """Retrieve a single financial entity."""
    return await financial_entity_service.get_entity(estate_id, entity_id)


@router.patch(
    "/{estate_id}/entities/{entity_id}",
    response_model=FinancialEntityResponse,
    status_code=status.HTTP_200_OK,
    summary="Update financial entity",
    description="Update verification status, confidence, evidence links, or metadata of an entity.",
)
async def update_entity(
    estate_id: str,
    entity_id: str,
    payload: FinancialEntityUpdate,
) -> FinancialEntityResponse:
    """Update details or status of an existing financial entity."""
    return await financial_entity_service.update_entity(estate_id, entity_id, payload)
