"""Document domain model representing metadata for an uploaded financial document."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class Document:
    """Domain model representing a financial document in an estate."""

    document_id: str
    estate_id: str
    original_filename: str
    content_type: str
    size_bytes: int
    checksum: str
    status: str = "uploaded"
    processing_status: str = "pending"
    source_type: str = "user_upload"
    uploaded_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert domain model to a dictionary representation."""
        return {
            "document_id": self.document_id,
            "estate_id": self.estate_id,
            "original_filename": self.original_filename,
            "content_type": self.content_type,
            "size_bytes": self.size_bytes,
            "status": self.status,
            "processing_status": self.processing_status,
            "source_type": self.source_type,
            "checksum": self.checksum,
            "uploaded_at": self.uploaded_at.isoformat(),
            "created_by": self.created_by,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Document":
        """Reconstruct domain model from a dictionary."""
        uploaded_at_val = data.get("uploaded_at")
        if isinstance(uploaded_at_val, str):
            uploaded_at = datetime.fromisoformat(uploaded_at_val)
        elif isinstance(uploaded_at_val, datetime):
            uploaded_at = uploaded_at_val
        else:
            uploaded_at = datetime.now(timezone.utc)

        return cls(
            document_id=data["document_id"],
            estate_id=data["estate_id"],
            original_filename=data["original_filename"],
            content_type=data["content_type"],
            size_bytes=data["size_bytes"],
            checksum=data["checksum"],
            status=data.get("status", "uploaded"),
            processing_status=data.get("processing_status", "pending"),
            source_type=data.get("source_type", "user_upload"),
            uploaded_at=uploaded_at,
            created_by=data.get("created_by"),
        )
