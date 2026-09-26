"""Repository layer for Document metadata and Processing Result persistence in Firestore and in-memory fallback."""

import threading
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any

from app.core.logging import logger
from app.integrations.firebase.firestore import get_firestore_client


class DocumentRepositoryProtocol(ABC):
    """Abstract protocol for Document metadata and Processing Result storage."""

    @abstractmethod
    async def save_document_metadata(self, document_id: str, metadata: dict[str, Any]) -> dict[str, Any]:
        """Persist or update document metadata record."""

    @abstractmethod
    async def get_document_metadata(self, document_id: str) -> dict[str, Any] | None:
        """Retrieve document metadata by document ID."""

    @abstractmethod
    async def update_processing_status(
        self,
        document_id: str,
        status: str,
        message: str | None = None,
        progress: int = 0,
        document_type: str | None = None,
        error: str | None = None,
    ) -> dict[str, Any]:
        """Update the processing status for a document."""

    @abstractmethod
    async def get_processing_status(self, document_id: str) -> dict[str, Any] | None:
        """Retrieve the current processing status for a document."""

    @abstractmethod
    async def save_processing_result(self, document_id: str, result_data: dict[str, Any]) -> dict[str, Any]:
        """Persist the complete structured AI processing result."""

    @abstractmethod
    async def get_processing_result(self, document_id: str) -> dict[str, Any] | None:
        """Retrieve the structured AI processing result for a document."""


class InMemoryDocumentRepository(DocumentRepositoryProtocol):
    """Thread-safe in-memory document repository for isolated tests and offline fallback."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._metadata: dict[str, dict[str, Any]] = {}
        self._statuses: dict[str, dict[str, Any]] = {}
        self._results: dict[str, dict[str, Any]] = {}

    async def save_document_metadata(self, document_id: str, metadata: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = dict(metadata)
            data["document_id"] = document_id
            now = datetime.now(timezone.utc).isoformat()
            if "created_at" not in data:
                data["created_at"] = now
            data["updated_at"] = now
            self._metadata[document_id] = data
            return data

    async def get_document_metadata(self, document_id: str) -> dict[str, Any] | None:
        with self._lock:
            return self._metadata.get(document_id)

    async def update_processing_status(
        self,
        document_id: str,
        status: str,
        message: str | None = None,
        progress: int = 0,
        document_type: str | None = None,
        error: str | None = None,
    ) -> dict[str, Any]:
        with self._lock:
            status_data = {
                "document_id": document_id,
                "status": status,
                "progress": progress,
                "document_type": document_type,
                "message": message,
                "error": error,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            self._statuses[document_id] = status_data
            if document_id in self._metadata:
                self._metadata[document_id]["processing_status"] = status
                self._metadata[document_id]["updated_at"] = status_data["updated_at"]
            return status_data

    async def get_processing_status(self, document_id: str) -> dict[str, Any] | None:
        with self._lock:
            return self._statuses.get(document_id)

    async def save_processing_result(self, document_id: str, result_data: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = dict(result_data)
            data["document_id"] = document_id
            self._results[document_id] = data
            return data

    async def get_processing_result(self, document_id: str) -> dict[str, Any] | None:
        with self._lock:
            return self._results.get(document_id)


class FirestoreDocumentRepository(DocumentRepositoryProtocol):
    """Google Cloud Firestore implementation persisting document records.

    Collections structure:
    - documents/{document_id}
    - documents/{document_id}/processing/result
    """

    def __init__(self, client: Any) -> None:
        self.db = client

    async def save_document_metadata(self, document_id: str, metadata: dict[str, Any]) -> dict[str, Any]:
        try:
            doc_ref = self.db.collection("documents").document(document_id)
            data = dict(metadata)
            data["document_id"] = document_id
            now_iso = datetime.now(timezone.utc).isoformat()
            if "created_at" not in data:
                data["created_at"] = now_iso
            data["updated_at"] = now_iso
            doc_ref.set(data, merge=True)
            logger.info("Persisted document metadata to Firestore: 'documents/%s'", document_id)
            return data
        except Exception as e:
            logger.error("Failed to persist document metadata to Firestore for '%s': %s", document_id, e)
            return metadata

    async def get_document_metadata(self, document_id: str) -> dict[str, Any] | None:
        try:
            doc_ref = self.db.collection("documents").document(document_id)
            snapshot = doc_ref.get()
            if not snapshot.exists:
                return None
            return snapshot.to_dict()
        except Exception as e:
            logger.error("Failed to retrieve document metadata from Firestore for '%s': %s", document_id, e)
            return None

    async def update_processing_status(
        self,
        document_id: str,
        status: str,
        message: str | None = None,
        progress: int = 0,
        document_type: str | None = None,
        error: str | None = None,
    ) -> dict[str, Any]:
        status_data = {
            "document_id": document_id,
            "status": status,
            "progress": progress,
            "document_type": document_type,
            "message": message,
            "error": error,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        try:
            doc_ref = self.db.collection("documents").document(document_id)
            doc_ref.set(
                {
                    "processing_status": status,
                    "processing_progress": progress,
                    "processing_message": message,
                    "document_type": document_type,
                    "processing_error": error,
                    "updated_at": status_data["updated_at"],
                },
                merge=True,
            )
            logger.info("Updated document processing status in Firestore for '%s': %s", document_id, status)
        except Exception as e:
            logger.error("Failed to update processing status in Firestore for '%s': %s", document_id, e)
        return status_data

    async def get_processing_status(self, document_id: str) -> dict[str, Any] | None:
        try:
            doc_ref = self.db.collection("documents").document(document_id)
            snapshot = doc_ref.get()
            if not snapshot.exists:
                return None
            data = snapshot.to_dict() or {}
            if "processing_status" in data or "status" in data:
                return {
                    "document_id": document_id,
                    "status": data.get("processing_status", data.get("status", "pending")),
                    "progress": data.get("processing_progress", 0),
                    "document_type": data.get("document_type"),
                    "message": data.get("processing_message"),
                    "error": data.get("processing_error"),
                    "updated_at": data.get("updated_at"),
                }
            return None
        except Exception as e:
            logger.error("Failed to retrieve processing status from Firestore for '%s': %s", document_id, e)
            return None

    async def save_processing_result(self, document_id: str, result_data: dict[str, Any]) -> dict[str, Any]:
        try:
            # 1. Save complete structured result under documents/{document_id}/processing/result
            res_ref = (
                self.db.collection("documents")
                .document(document_id)
                .collection("processing")
                .document("result")
            )
            res_ref.set(result_data)

            # 2. Update parent document status
            doc_ref = self.db.collection("documents").document(document_id)
            now_iso = datetime.now(timezone.utc).isoformat()
            doc_ref.set(
                {
                    "processing_status": result_data.get("status", "completed"),
                    "processing_progress": 100 if result_data.get("status") == "completed" else 0,
                    "document_type": result_data.get("document_type"),
                    "overall_confidence": result_data.get("overall_confidence"),
                    "processed_at": result_data.get("processed_at", now_iso),
                    "updated_at": now_iso,
                },
                merge=True,
            )
            logger.info("Persisted structured processing result to Firestore: 'documents/%s/processing/result'", document_id)
            return result_data
        except Exception as e:
            logger.error("Failed to save processing result in Firestore for '%s': %s", document_id, e)
            return result_data

    async def get_processing_result(self, document_id: str) -> dict[str, Any] | None:
        try:
            res_ref = (
                self.db.collection("documents")
                .document(document_id)
                .collection("processing")
                .document("result")
            )
            snapshot = res_ref.get()
            if snapshot.exists:
                return snapshot.to_dict()
            return None
        except Exception as e:
            logger.error("Failed to retrieve processing result from Firestore for '%s': %s", document_id, e)
            return None


_default_doc_repo: DocumentRepositoryProtocol | None = None


def get_document_repository() -> DocumentRepositoryProtocol:
    """Factory creating or returning the configured Document Repository singleton."""
    global _default_doc_repo
    if _default_repo_is_active():
        return _default_doc_repo  # type: ignore[return-value]

    try:
        firestore_client = get_firestore_client()
        if firestore_client:
            _default_doc_repo = FirestoreDocumentRepository(firestore_client)
            logger.info("Initialized FirestoreDocumentRepository")
            return _default_doc_repo
    except Exception as e:  # noqa: BLE001
        logger.info("Firestore client unavailable for documents (%s); using InMemoryDocumentRepository", e)

    _default_doc_repo = InMemoryDocumentRepository()
    return _default_doc_repo


def _default_repo_is_active() -> bool:
    return _default_doc_repo is not None


def set_document_repository(repo: DocumentRepositoryProtocol | None) -> None:
    """Helper to inject or reset document repository in tests."""
    global _default_doc_repo
    _default_doc_repo = repo
