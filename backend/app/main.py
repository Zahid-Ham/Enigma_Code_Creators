"""FINCLOSURE FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FINCLOSURE API",
    description="AI-Powered Financial Estate Discovery & Closure Platform API",
    version="0.1.0",
)

# CORS configuration placeholder
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint for sanity check."""
    return {"message": "FINCLOSURE API is running"}
