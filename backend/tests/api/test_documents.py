"""Tests for Document Intake API and in-memory storage."""

import hashlib
import io
import uuid

import pytest
from app.core.config import settings
from app.main import app
from app.services.documents.memory_storage import memory_storage
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def clean_memory_storage():
    """Ensure in-memory storage is cleaned before and after every test."""
    memory_storage.clear()
    yield
    memory_storage.clear()


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


def create_synthetic_pdf() -> bytes:
    """Create a minimal synthetic valid PDF header bytes."""
    return b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\nxref\n0 2\ntrailer\n<< /Root 1 0 R >>\n%%EOF"


def create_synthetic_png() -> bytes:
    """Create a minimal synthetic valid PNG header bytes."""
    return b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"


def create_synthetic_jpeg() -> bytes:
    """Create a minimal synthetic valid JPEG header bytes."""
    return b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\xff\xd9"


class TestDocumentUpload:
    """Suite of tests for POST /api/v1/documents/upload."""

    def test_upload_valid_pdf_success(self, client: TestClient):
        """Test 1: Uploading a valid PDF returns 201 with correct metadata and SHA-256."""
        pdf_bytes = create_synthetic_pdf()
        expected_checksum = hashlib.sha256(pdf_bytes).hexdigest()

        response = client.post(
            f"{settings.API_PREFIX}/documents/upload",
            data={"estate_id": "demo-estate-001"},
            files={"file": ("bank_statement.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        )

        assert response.status_code == 201
        data = response.json()

        assert "document_id" in data
        assert uuid.UUID(data["document_id"])  # Valid UUID check
        assert data["estate_id"] == "demo-estate-001"
        assert data["original_filename"] == "bank_statement.pdf"
        assert data["content_type"] == "application/pdf"
        assert data["size_bytes"] == len(pdf_bytes)
        assert data["checksum"] == expected_checksum
        assert data["status"] == "uploaded"
        assert data["processing_status"] == "pending"
        assert data["source_type"] == "user_upload"
        assert "uploaded_at" in data
        assert data["created_by"] is None

    def test_upload_valid_png_and_jpeg_success(self, client: TestClient):
        """Test 2: Uploading valid PNG and JPEG images succeeds."""
        # Test PNG
        png_bytes = create_synthetic_png()
        res_png = client.post(
            f"{settings.API_PREFIX}/documents/upload",
            data={"estate_id": "demo-estate-001"},
            files={"file": ("receipt.png", io.BytesIO(png_bytes), "image/png")},
        )
        assert res_png.status_code == 201
        data_png = res_png.json()
        assert data_png["content_type"] == "image/png"
        assert data_png["original_filename"] == "receipt.png"

        # Test JPEG
        jpg_bytes = create_synthetic_jpeg()
        res_jpg = client.post(
            f"{settings.API_PREFIX}/documents/upload",
            data={"estate_id": "demo-estate-001"},
            files={"file": ("policy_scan.jpg", io.BytesIO(jpg_bytes), "image/jpeg")},
        )
        assert res_jpg.status_code == 201
        data_jpg = res_jpg.json()
        assert data_jpg["content_type"] == "image/jpeg"
        assert data_jpg["original_filename"] == "policy_scan.jpg"

    def test_upload_unsupported_file_extension(self, client: TestClient):
        """Test 3: Reject files with unsupported extensions (e.g., .exe, .sh)."""
        malware_bytes = b"MZ\x90\x00\x03\x00\x00\x00"
        response = client.post(
            f"{settings.API_PREFIX}/documents/upload",
            data={"estate_id": "demo-estate-001"},
            files={"file": ("malware.exe", io.BytesIO(malware_bytes), "application/x-msdownload")},
        )

        assert response.status_code == 415
        data = response.json()
        assert data["success"] is False
        assert "not supported" in data["message"].lower()

    def test_upload_unsupported_mime_type(self, client: TestClient):
        """Test 4: Reject files with unsupported MIME types."""
        text_bytes = b"Hello, world"
        response = client.post(
            f"{settings.API_PREFIX}/documents/upload",
            data={"estate_id": "demo-estate-001"},
            files={"file": ("notes.txt", io.BytesIO(text_bytes), "text/plain")},
        )

        assert response.status_code == 415
        data = response.json()
        assert data["success"] is False

    def test_upload_empty_file_rejected(self, client: TestClient):
        """Test 5: Reject empty files (0 bytes)."""
        empty_bytes = b""
        response = client.post(
            f"{settings.API_PREFIX}/documents/upload",
            data={"estate_id": "demo-estate-001"},
            files={"file": ("empty.pdf", io.BytesIO(empty_bytes), "application/pdf")},
        )

        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
        assert "empty" in data["message"].lower()

    def test_upload_oversized_file_rejected(self, client: TestClient, monkeypatch: pytest.MonkeyPatch):
        """Test 6: Reject files exceeding configured MAX_DOCUMENT_SIZE_MB."""
        # Temporarily set max size to 1 MB for testing
        monkeypatch.setattr(settings, "MAX_DOCUMENT_SIZE_MB", 1)

        # Create payload of 1.2 MB
        oversized_bytes = b"0" * (int(1.2 * 1024 * 1024))

        response = client.post(
            f"{settings.API_PREFIX}/documents/upload",
            data={"estate_id": "demo-estate-001"},
            files={"file": ("large_statement.pdf", io.BytesIO(oversized_bytes), "application/pdf")},
        )

        assert response.status_code == 413
        data = response.json()
        assert data["success"] is False
        assert "exceeds" in data["message"].lower()

    def test_filename_sanitization(self, client: TestClient):
        """Test 7: Filename with path traversal and unsafe characters is sanitized."""
        pdf_bytes = create_synthetic_pdf()
        unsafe_name = "../../bank_statement<>&|?.pdf"

        response = client.post(
            f"{settings.API_PREFIX}/documents/upload",
            data={"estate_id": "demo-estate-001"},
            files={"file": (unsafe_name, io.BytesIO(pdf_bytes), "application/pdf")},
        )

        assert response.status_code == 201
        data = response.json()
        sanitized = data["original_filename"]

        assert ".." not in sanitized
        assert "/" not in sanitized
        assert "\\" not in sanitized
        assert "<" not in sanitized
        assert ">" not in sanitized
        assert "?" not in sanitized
        assert sanitized.endswith(".pdf")

    def test_missing_estate_id_rejected(self, client: TestClient):
        """Test: Missing estate_id yields validation error."""
        pdf_bytes = create_synthetic_pdf()
        response = client.post(
            f"{settings.API_PREFIX}/documents/upload",
            files={"file": ("statement.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        )

        assert response.status_code == 422


class TestGetDocumentMetadata:
    """Suite of tests for GET /api/v1/documents/{document_id}."""

    def test_get_existing_document_metadata_success(self, client: TestClient):
        """Test 8: Successfully retrieve metadata for an uploaded document."""
        pdf_bytes = create_synthetic_pdf()
        upload_res = client.post(
            f"{settings.API_PREFIX}/documents/upload",
            data={"estate_id": "demo-estate-001"},
            files={"file": ("insurance_policy.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        )
        assert upload_res.status_code == 201
        uploaded_doc = upload_res.json()
        doc_id = uploaded_doc["document_id"]

        # Call GET endpoint
        get_res = client.get(f"{settings.API_PREFIX}/documents/{doc_id}")
        assert get_res.status_code == 200
        retrieved_data = get_res.json()

        assert retrieved_data["document_id"] == doc_id
        assert retrieved_data["estate_id"] == "demo-estate-001"
        assert retrieved_data["original_filename"] == "insurance_policy.pdf"
        assert retrieved_data["checksum"] == uploaded_doc["checksum"]

    def test_get_unknown_document_returns_404(self, client: TestClient):
        """Test 9: Querying a non-existent document ID returns HTTP 404."""
        unknown_id = str(uuid.uuid4())
        response = client.get(f"{settings.API_PREFIX}/documents/{unknown_id}")

        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert "not found" in data["message"].lower()

    def test_memory_storage_isolation_and_no_bytes_leaked(self, client: TestClient):
        """Test 10: Verify bytes exist in in-memory storage, but are never exposed in API metadata."""
        pdf_bytes = create_synthetic_pdf()
        upload_res = client.post(
            f"{settings.API_PREFIX}/documents/upload",
            data={"estate_id": "demo-estate-001"},
            files={"file": ("fd_receipt.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        )
        assert upload_res.status_code == 201
        doc_id = upload_res.json()["document_id"]

        # 1. Verify API response does NOT have 'file_bytes' or binary data
        assert "file_bytes" not in upload_res.json()
        get_res = client.get(f"{settings.API_PREFIX}/documents/{doc_id}")
        assert "file_bytes" not in get_res.json()

        # 2. Verify in-memory storage internally holds the exact bytes
        stored_bytes = memory_storage._storage[doc_id]["file_bytes"]
        assert stored_bytes == pdf_bytes
