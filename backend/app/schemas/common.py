"""Common Pydantic request and response schemas."""

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class HealthResponse(BaseModel):
    """Health check endpoint response schema."""

    status: str = "ok"
    service: str = "finclosure-backend"
    version: str | None = None
    environment: str | None = None


class ErrorResponse(BaseModel):
    """Standard error response schema."""

    success: bool = False
    message: str
    error_type: str | None = None


class APIResponse(BaseModel, Generic[T]):
    """Standard generic API response wrapper."""

    success: bool = True
    data: T | None = None
    message: str | None = None
