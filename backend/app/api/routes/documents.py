"""Document processing and upload API routes."""

from fastapi import APIRouter

router = APIRouter(prefix="/documents", tags=["Documents"])
