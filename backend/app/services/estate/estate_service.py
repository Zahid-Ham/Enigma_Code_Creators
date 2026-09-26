"""Financial Estate Twin orchestration and lifecycle management service."""

import uuid
from datetime import datetime, timezone

from app.core.exceptions import ResourceNotFoundError
from app.core.logging import logger
from app.models.estate import Estate
from app.schemas.estate import (
    EstateCreate,
    EstateListResponse,
    EstateResponse,
    EstateUpdate,
)
from app.services.estate.estate_repository import (
    EstateRepositoryProtocol,
    get_estate_repository,
)


class EstateService:
    """Service handling lifecycle operations for Financial Estates."""

    def __init__(self, repository: EstateRepositoryProtocol | None = None) -> None:
        self.repository = repository or get_estate_repository()

    async def create_estate(self, payload: EstateCreate) -> EstateResponse:
        """Create and persist a new financial estate."""
        estate_id = payload.estate_id.strip() if payload.estate_id and payload.estate_id.strip() else f"estate-{uuid.uuid4().hex[:10]}"

        now = datetime.now(timezone.utc)
        estate = Estate(
            estate_id=estate_id,
            subject_name=payload.subject_name.strip(),
            subject_type=payload.subject_type,
            status=payload.status,
            created_at=now,
            updated_at=now,
        )

        saved = await self.repository.save_estate(estate)
        logger.info("Created financial estate '%s' for subject '%s'", saved.estate_id, saved.subject_name)
        return EstateResponse.model_validate(saved.to_dict())

    async def get_estate(self, estate_id: str) -> EstateResponse:
        """Retrieve an estate by its unique ID."""
        estate = await self.repository.get_estate(estate_id)
        if not estate:
            logger.warning("Estate not found: '%s'", estate_id)
            raise ResourceNotFoundError(
                f"Financial Estate with ID '{estate_id}' was not found.",
                details={"estate_id": estate_id},
            )
        return EstateResponse.model_validate(estate.to_dict())

    async def list_estates(self) -> EstateListResponse:
        """List all available financial estates."""
        estates = await self.repository.list_estates()
        responses = [EstateResponse.model_validate(e.to_dict()) for e in estates]
        return EstateListResponse(estates=responses, total=len(responses))

    async def update_estate(self, estate_id: str, payload: EstateUpdate) -> EstateResponse:
        """Update properties of an existing financial estate."""
        estate = await self.repository.get_estate(estate_id)
        if not estate:
            logger.warning("Cannot update missing estate: '%s'", estate_id)
            raise ResourceNotFoundError(
                f"Financial Estate with ID '{estate_id}' was not found.",
                details={"estate_id": estate_id},
            )

        if payload.subject_name is not None and payload.subject_name.strip():
            estate.subject_name = payload.subject_name.strip()
        if payload.subject_type is not None:
            estate.subject_type = payload.subject_type
        if payload.status is not None:
            estate.status = payload.status

        estate.updated_at = datetime.now(timezone.utc)
        saved = await self.repository.save_estate(estate)
        logger.info("Updated financial estate '%s'", saved.estate_id)
        return EstateResponse.model_validate(saved.to_dict())


estate_service = EstateService()
