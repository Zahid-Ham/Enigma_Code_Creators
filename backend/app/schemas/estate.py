"""Estate request, response, and lifecycle schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.estate import EstateStatus, EstateSubjectType


class EstateBase(BaseModel):
    """Base schema for Estate representation."""

    subject_name: str = Field(..., min_length=1, max_length=200, description="Full name of the estate subject")
    subject_type: EstateSubjectType = Field(
        default=EstateSubjectType.INDIVIDUAL,
        description="Type of subject (individual)",
    )
    status: EstateStatus = Field(
        default=EstateStatus.ACTIVE,
        description="Lifecycle status of the estate",
    )


class EstateCreate(EstateBase):
    """Schema for creating a new Financial Estate."""

    estate_id: str | None = Field(
        default=None,
        max_length=100,
        description="Optional custom estate ID (e.g. demo-estate-001). Generated if omitted.",
    )


class EstateUpdate(BaseModel):
    """Schema for updating an existing Financial Estate."""

    subject_name: str | None = Field(None, min_length=1, max_length=200)
    subject_type: EstateSubjectType | None = None
    status: EstateStatus | None = None


class EstateResponse(EstateBase):
    """Public schema for Financial Estate details."""

    estate_id: str = Field(..., description="Unique estate identifier")
    created_at: datetime = Field(..., description="Timestamp when estate was created")
    updated_at: datetime = Field(..., description="Timestamp when estate was last updated")

    model_config = ConfigDict(from_attributes=True)


class EstateListResponse(BaseModel):
    """Paginated or listed response for financial estates."""

    estates: list[EstateResponse]
    total: int = Field(..., description="Total count of estates")
