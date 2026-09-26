"""Common and shared Pydantic response schemas."""

from typing import Generic, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standard generic API response wrapper."""
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None
