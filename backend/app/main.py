"""FINCLOSURE FastAPI Application Entry Point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import api_router
from app.core.config import settings
from app.core.exceptions import FinclosureException
from app.core.logging import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle events."""
    logger.info("Starting %s API server in %s mode", settings.PROJECT_NAME, settings.APP_ENV)
    logger.info("Configured API prefix: %s", settings.API_PREFIX)
    yield
    logger.info("Shutting down %s API server", settings.PROJECT_NAME)


app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description="AI-Powered Financial Estate Discovery & Closure Platform API",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handlers
@app.exception_handler(FinclosureException)
async def finclosure_exception_handler(request: Request, exc: FinclosureException):
    """Handle custom application exceptions without exposing internal details."""
    logger.warning("Application exception on %s: %s", request.url.path, exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "error_type": exc.__class__.__name__,
            "details": exc.details if settings.DEBUG else {},
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors cleanly."""
    logger.warning("Request validation failed on %s: %s", request.url.path, str(exc.errors()))
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Request validation failed",
            "error_type": "ValidationError",
            "errors": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch-all unhandled exception handler to avoid leaking internal tracebacks."""
    logger.error("Unhandled server error on %s: %s", request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An unexpected internal server error occurred.",
            "error_type": "InternalServerError",
        },
    )


# Register API router with configurable prefix
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/", tags=["Root"], summary="API Root")
async def root():
    """Root endpoint for basic sanity verification."""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.APP_ENV,
        "status": "online",
        "docs_url": "/docs",
        "health_check": f"{settings.API_PREFIX}/health",
    }
