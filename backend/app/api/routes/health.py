"""Health check API route."""

from fastapi import APIRouter

from app.core.config import settings
from app.schemas.common import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse, summary="Service Health Check")
@router.get("/", response_model=HealthResponse, include_in_schema=False)
async def health_check() -> HealthResponse:
    """Return backend service health status without exposing sensitive credentials."""
    return HealthResponse(
        status="ok",
        service="finclosure-backend",
        version=settings.VERSION,
        environment=settings.APP_ENV,
    )
