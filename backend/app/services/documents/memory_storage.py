"""In-memory storage service for temporary document file and metadata retention."""

import asyncio
from typing import Any, Protocol


class DocumentStorageProtocol(Protocol):
    """Storage interface protocol for future pluggable providers (e.g., Cloudinary)."""

    async def store(
        self,
        document_id: str,
        file_bytes: bytes,
        metadata: dict[str, Any],
    ) -> bool:
        """Store document bytes and associated metadata."""
        ...

    async def get(self, document_id: str) -> dict[str, Any] | None:
        """Retrieve stored document record including metadata and bytes."""
        ...

    async def get_bytes(self, document_id: str) -> bytes | None:
        """Retrieve only file bytes for a document."""
        ...

    async def get_metadata(self, document_id: str) -> dict[str, Any] | None:
        """Retrieve only metadata for a document."""
        ...

    async def delete(self, document_id: str) -> bool:
        """Delete document bytes and metadata from storage."""
        ...

    async def exists(self, document_id: str) -> bool:
        """Check if a document exists in storage."""
        ...


class MemoryStorage:
    """In-memory implementation of DocumentStorageProtocol.

    Retains uploaded document files and metadata purely in server memory for the duration
    of the runtime session. Designed to be replaced with Cloudinary in production.
    """

    def __init__(self) -> None:
        self._storage: dict[str, dict[str, Any]] = {}
        self._lock = asyncio.Lock()

    async def store(
        self,
        document_id: str,
        file_bytes: bytes,
        metadata: dict[str, Any],
    ) -> bool:
        """Store document bytes and metadata in memory dictionary."""
        async with self._lock:
            self._storage[document_id] = {
                "document_id": document_id,
                "file_bytes": file_bytes,
                "content_type": metadata.get("content_type", "application/octet-stream"),
                "filename": metadata.get("original_filename", "document"),
                "size_bytes": len(file_bytes),
                "checksum": metadata.get("checksum", ""),
                "metadata": metadata,
            }
            return True

    async def get(self, document_id: str) -> dict[str, Any] | None:
        """Retrieve full document entry from memory."""
        async with self._lock:
            record = self._storage.get(document_id)
            if not record:
                return None
            return record.copy()

    async def get_bytes(self, document_id: str) -> bytes | None:
        """Retrieve raw file bytes for a document."""
        async with self._lock:
            record = self._storage.get(document_id)
            if not record:
                return None
            return record["file_bytes"]

    async def get_metadata(self, document_id: str) -> dict[str, Any] | None:
        """Retrieve document metadata dictionary without exposing raw bytes."""
        async with self._lock:
            record = self._storage.get(document_id)
            if not record:
                return None
            return record["metadata"].copy()

    async def delete(self, document_id: str) -> bool:
        """Remove document and its bytes from memory."""
        async with self._lock:
            if document_id in self._storage:
                del self._storage[document_id]
                return True
            return False

    async def exists(self, document_id: str) -> bool:
        """Check if document exists in memory."""
        async with self._lock:
            return document_id in self._storage

    def clear(self) -> None:
        """Clear all stored documents (primarily for test teardown)."""
        self._storage.clear()


# Global in-memory storage singleton for application runtime
memory_storage = MemoryStorage()
