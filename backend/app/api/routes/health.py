"""Health check API routes."""

from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("/")
async def health_check():
    """Health check endpoint placeholder."""
    return {"status": "healthy"}
