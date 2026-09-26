"""Document intake service coordinating validation, hashing, sanitization, and storage."""

import hashlib
import inspect
import os
import re
import uuid
from datetime import datetime, timezone
from typing import BinaryIO

from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import (
    EmptyFileError,
    FileTooLargeError,
    InvalidFileError,
    ResourceNotFoundError,
    UnsupportedFileTypeError,
)
from app.core.logging import logger
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.services.documents.document_repository import (
    DocumentRepositoryProtocol,
    get_document_repository,
)
from app.services.documents.memory_storage import (
    DocumentStorageProtocol,
    memory_storage,
)


class DocumentService:
    """Service handling document validation, processing, and intake orchestration."""

    def __init__(
        self,
        storage: DocumentStorageProtocol | None = None,
        repository: DocumentRepositoryProtocol | None = None,
    ) -> None:
        self.storage: DocumentStorageProtocol = storage or memory_storage
        self.repository: DocumentRepositoryProtocol = repository or get_document_repository()

    @staticmethod
    def sanitize_filename(filename: str | None) -> str:
        """Sanitize an uploaded filename to prevent path traversal and unsafe character injection.

        Removes path components, control characters, and reserved symbols.
        """
        if not filename or not filename.strip():
            return "document.pdf"

        # Extract only the base name (strip any leading directory paths)
        base = os.path.basename(filename.strip())
        base = base.replace("\\", "/").split("/")[-1]

        # Remove any path traversal tokens
        base = base.replace("..", "")

        # Strip unsafe characters
        sanitized = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "", base).strip()

        # If nothing left, provide a safe fallback
        if not sanitized or sanitized.startswith("."):
            return f"document{sanitized if sanitized.startswith('.') else ''}"

        return sanitized

    @staticmethod
    def validate_file_metadata(filename: str, content_type: str | None) -> tuple[str, str]:
        """Validate filename extension and MIME type against allowed configurations."""
        sanitized_name = DocumentService.sanitize_filename(filename)
        ext = os.path.splitext(sanitized_name)[1].lower()

        allowed_exts = [e.lower() for e in settings.ALLOWED_DOCUMENT_EXTENSIONS]
        if not ext or ext not in allowed_exts:
            logger.warning("Rejected upload with unsupported extension: '%s'", ext)
            raise UnsupportedFileTypeError(
                f"File extension '{ext}' is not supported. Allowed extensions: {', '.join(allowed_exts)}",
                details={"extension": ext, "allowed": allowed_exts},
            )

        # Normalize and validate MIME type
        normalized_mime = (content_type or "").lower().split(";")[0].strip()
        allowed_mimes = [m.lower() for m in settings.ALLOWED_DOCUMENT_MIME_TYPES]

        # Map common extensions to expected MIME types
        extension_mime_map = {
            ".pdf": "application/pdf",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
        }

        expected_mime = extension_mime_map.get(ext)

        # If client sent generic octet-stream or missing mime, resolve to expected
        if normalized_mime in ("", "application/octet-stream") and expected_mime:
            normalized_mime = expected_mime

        if normalized_mime not in allowed_mimes:
            logger.warning("Rejected upload with unsupported MIME type: '%s'", normalized_mime)
            raise UnsupportedFileTypeError(
                f"MIME type '{normalized_mime}' is not supported. Allowed MIME types: {', '.join(allowed_mimes)}",
                details={"content_type": normalized_mime, "allowed": allowed_mimes},
            )

        return sanitized_name, normalized_mime

    @staticmethod
    async def read_and_validate_bytes(file_obj: BinaryIO | UploadFile) -> bytes:
        """Read bytes from uploaded file while strictly enforcing memory and size limits.

        Reads in chunks to prevent memory exhaustion from oversized payloads.
        Supports both async (UploadFile) and synchronous (BytesIO/BinaryIO) file objects.
        """
        max_bytes = settings.MAX_DOCUMENT_SIZE_MB * 1024 * 1024
        chunk_size = 64 * 1024  # 64 KB chunk
        total_read = 0
        byte_chunks: list[bytes] = []

        if hasattr(file_obj, "seek") and callable(file_obj.seek):
            seek_res = file_obj.seek(0)
            if inspect.isawaitable(seek_res):
                await seek_res

        while True:
            if hasattr(file_obj, "read") and callable(file_obj.read):
                read_res = file_obj.read(chunk_size)
                if inspect.isawaitable(read_res):
                    chunk: bytes = await read_res
                else:
                    chunk = read_res
            else:
                break

            if not chunk:
                break

            total_read += len(chunk)
            if total_read > max_bytes:
                logger.warning(
                    "Upload rejected: file size exceeded max limit of %d MB",
                    settings.MAX_DOCUMENT_SIZE_MB,
                )
                raise FileTooLargeError(
                    f"Document size exceeds maximum allowable limit of {settings.MAX_DOCUMENT_SIZE_MB} MB",
                    details={"max_size_mb": settings.MAX_DOCUMENT_SIZE_MB, "bytes_read": total_read},
                )

            byte_chunks.append(chunk)

        file_bytes = b"".join(byte_chunks)

        if len(file_bytes) == 0:
            logger.warning("Upload rejected: empty file (0 bytes)")
            raise EmptyFileError("Uploaded document is empty (0 bytes).")

        return file_bytes

    async def ingest_document(
        self,
        estate_id: str,
        upload_file: UploadFile,
        created_by: str | None = None,
    ) -> DocumentResponse:
        """Orchestrate validation, checksumming, metadata creation, and in-memory storage."""
        if not estate_id or not estate_id.strip():
            raise InvalidFileError("A valid estate_id is required for document intake.")

        original_filename = upload_file.filename or "document.pdf"
        sanitized_filename, validated_content_type = self.validate_file_metadata(
            original_filename,
            upload_file.content_type,
        )

        # Read and validate bytes within memory safety bounds
        file_bytes = await self.read_and_validate_bytes(upload_file)

        # Calculate SHA-256 checksum
        checksum = hashlib.sha256(file_bytes).hexdigest()

        # Generate unique document ID
        document_id = str(uuid.uuid4())

        # Construct domain model and metadata
        doc = Document(
            document_id=document_id,
            estate_id=estate_id.strip(),
            original_filename=sanitized_filename,
            content_type=validated_content_type,
            size_bytes=len(file_bytes),
            checksum=checksum,
            status="uploaded",
            processing_status="pending",
            source_type="user_upload",
            uploaded_at=datetime.now(timezone.utc),
            created_by=created_by,
        )

        metadata_dict = doc.to_dict()

        # Store in in-memory storage (bytes + metadata)
        await self.storage.store(
            document_id=document_id,
            file_bytes=file_bytes,
            metadata=metadata_dict,
        )

        # Persist metadata to repository (Firestore / in-memory)
        await self.repository.save_document_metadata(
            document_id=document_id,
            metadata=metadata_dict,
        )

        logger.info(
            "Document intake successful: id=%s estate_id=%s file=%s size=%d bytes checksum=%s",
            document_id,
            estate_id,
            sanitized_filename,
            len(file_bytes),
            checksum[:12],
        )

        return DocumentResponse.model_validate(metadata_dict)

    async def get_document_metadata(self, document_id: str) -> DocumentResponse:
        """Retrieve metadata for a document by ID."""
        if not document_id or not document_id.strip():
            raise ResourceNotFoundError(f"Document with ID '{document_id}' not found.")

        # Check in-memory storage first
        metadata = await self.storage.get_metadata(document_id.strip())
        if not metadata:
            # Fall back to persistent repository (Firestore)
            metadata = await self.repository.get_document_metadata(document_id.strip())

        if not metadata:
            raise ResourceNotFoundError(f"Document with ID '{document_id}' not found.")

        return DocumentResponse.model_validate(metadata)


def asyncio_iscoroutinefunction(func: object) -> bool:
    """Helper to detect if a callable is an async coroutine function."""
    import inspect

    return inspect.iscoroutinefunction(func)


# Global document service singleton
document_service = DocumentService()
