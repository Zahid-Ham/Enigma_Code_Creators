"""Document processing and upload API routes."""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.core.exceptions import FinclosureException
from app.core.logging import logger
from app.schemas.document import DocumentResponse
from app.schemas.document_processing import (
    DocumentProcessingResultResponse,
    ProcessDocumentRequest,
    ProcessingStatusResponse,
)
from app.services.documents.document_service import document_service
from app.services.documents.processing_service import document_processing_service

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Financial Document",
    description=(
        "Upload a financial document (PDF, JPEG, JPG, PNG) into the financial estate. "
        "Validates file type and size, calculates a SHA-256 checksum, generates a UUID, "
        "stores bytes in temporary in-memory storage, and automatically schedules background AI processing."
    ),
    responses={
        201: {
            "description": "Document uploaded and metadata generated successfully.",
            "model": DocumentResponse,
        },
        400: {"description": "Document is empty (0 bytes)."},
        413: {"description": "Document exceeds maximum allowed size (MAX_DOCUMENT_SIZE_MB)."},
        415: {"description": "Unsupported document file extension or MIME type."},
        422: {"description": "Validation error (missing estate_id or invalid payload)."},
    },
)
async def upload_document(
    estate_id: str = Form(..., description="Estate identifier associated with the document (e.g. demo-estate-001)"),
    file: UploadFile = File(..., description="Financial document file to upload (PDF, JPEG, JPG, PNG)"),  # noqa: B008
) -> DocumentResponse:
    """Handle multipart document upload, validation, and automated intake pipeline."""
    try:
        document = await document_service.ingest_document(
            estate_id=estate_id,
            upload_file=file,
        )

        # Automatically schedule AI processing in background
        await document_processing_service.trigger_processing(document.document_id)

        return document
    except FinclosureException:
        raise
    except Exception as exc:
        logger.error("Unexpected error during document intake: %s", str(exc), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process and store document.",
        ) from exc


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Document Metadata",
    description="Retrieve metadata for a previously uploaded document by its UUID.",
    responses={
        200: {
            "description": "Document metadata retrieved successfully.",
            "model": DocumentResponse,
        },
        404: {"description": "Document not found."},
    },
)
async def get_document(
    document_id: str,
) -> DocumentResponse:
    """Retrieve document metadata by document ID."""
    try:
        document = await document_service.get_document_metadata(document_id=document_id)
        return document
    except FinclosureException:
        raise
    except Exception as exc:
        logger.error("Unexpected error retrieving document '%s': %s", document_id, str(exc), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve document metadata.",
        ) from exc


@router.post(
    "/{document_id}/process",
    response_model=ProcessingStatusResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger or retry document AI processing",
    description="Manually trigger or retry AI document processing pipeline for an uploaded document.",
    responses={
        202: {
            "description": "Document processing initiated or status returned.",
            "model": ProcessingStatusResponse,
        },
        404: {"description": "Document not found in storage."},
    },
)
async def process_document(
    document_id: str,
    payload: ProcessDocumentRequest | None = None,
) -> ProcessingStatusResponse:
    """Trigger or retry document intelligence processing."""
    force = payload.force if payload is not None else False
    return await document_processing_service.trigger_processing(
        document_id=document_id,
        force=force,
    )


@router.get(
    "/{document_id}/processing",
    response_model=ProcessingStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get document processing status",
    description="Poll the current progress and status of AI document extraction and analysis.",
    responses={
        200: {
            "description": "Processing status retrieved successfully.",
            "model": ProcessingStatusResponse,
        },
        404: {"description": "Document not found."},
    },
)
async def get_processing_status(
    document_id: str,
) -> ProcessingStatusResponse:
    """Get the current processing status for an uploaded document."""
    return await document_processing_service.get_processing_status(document_id=document_id)


@router.get(
    "/{document_id}/result",
    response_model=DocumentProcessingResultResponse,
    status_code=status.HTTP_200_OK,
    summary="Get document AI processing result",
    description="Retrieve structured financial entities, evidence facts, and document classification.",
    responses={
        200: {
            "description": "Structured processing result retrieved successfully.",
            "model": DocumentProcessingResultResponse,
        },
        404: {"description": "Document or processing result not found."},
    },
)
async def get_processing_result(
    document_id: str,
) -> DocumentProcessingResultResponse:
    """Retrieve structured AI analysis result for a document."""
    return await document_processing_service.get_processing_result(document_id=document_id)
