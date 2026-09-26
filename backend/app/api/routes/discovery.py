"""Estate Radar and missing asset discovery API routes."""

from fastapi import APIRouter

router = APIRouter(prefix="/discovery", tags=["Discovery"])
