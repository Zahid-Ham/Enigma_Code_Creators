"""Document request and response Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DocumentBase(BaseModel):
    """Base schema containing core document fields."""

    estate_id: str = Field(..., description="Unique identifier of the financial estate")
    original_filename: str = Field(..., description="Sanitized original filename of the document")
    content_type: str = Field(..., description="MIME content type of the document")
    size_bytes: int = Field(..., description="Size of the document in bytes", ge=0)


class DocumentResponse(DocumentBase):
    """Document metadata response model."""

    document_id: str = Field(..., description="Unique UUID of the document")
    status: str = Field("uploaded", description="Lifecycle status of document")
    processing_status: str = Field("pending", description="Processing status of document")
    source_type: str = Field("user_upload", description="Source classification of document")
    checksum: str = Field(..., description="SHA-256 hex digest of the document bytes")
    uploaded_at: datetime = Field(..., description="Timestamp when document was uploaded in UTC")
    created_by: str | None = Field(None, description="User identifier who uploaded the document")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "document_id": "550e8400-e29b-41d4-a716-446655440000",
                "estate_id": "demo-estate-001",
                "original_filename": "bank_statement.pdf",
                "content_type": "application/pdf",
                "size_bytes": 245678,
                "status": "uploaded",
                "processing_status": "pending",
                "source_type": "user_upload",
                "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "uploaded_at": "2026-09-26T06:30:00Z",
                "created_by": None,
            }
        },
    )


class DocumentUploadResponse(BaseModel):
    """Wrapper response for successful document upload."""

    success: bool = True
    message: str = "Document uploaded and validated successfully"
    document: DocumentResponse
