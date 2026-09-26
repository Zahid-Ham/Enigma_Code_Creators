"""API Routes aggregation."""

from fastapi import APIRouter

from app.api.routes import (
    claims,
    discovery,
    documents,
    estate,
    health,
    preparation,
    tasks,
    tracking,
)

api_router = APIRouter()

# Register routes
api_router.include_router(health.router)
api_router.include_router(documents.router)
api_router.include_router(estate.router)
api_router.include_router(discovery.router)
api_router.include_router(claims.router)
api_router.include_router(tracking.router)
api_router.include_router(tasks.router)
api_router.include_router(preparation.router)
