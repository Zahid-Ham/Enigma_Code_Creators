"""API tests for Document Intelligence and AI processing endpoints."""

import io
from unittest.mock import AsyncMock, patch

import fitz
import pytest
from app.core.config import settings
from app.main import app
from app.services.ai.groq_client import groq_ai_client
from fastapi.testclient import TestClient


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def create_mock_pdf_bytes() -> bytes:
    """Create a synthetic PDF with sample insurance data."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text(
        (50, 72),
        "HDFC Life Insurance Policy. Policy No: POL-998877. Insured: Arjun Mehta. Premium: Rs. 4,250 monthly. Nominee: Priya Mehta.",
        fontsize=12,
    )
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


MOCK_GROQ_RESPONSE = {
    "document_type": "insurance_policy",
    "overall_confidence": 0.94,
    "entities": [
        {
            "entity_type": "insurance",
            "institution_name": "HDFC Life Insurance",
            "display_name": "HDFC Life Policy",
            "account_reference": "POL-998877",
            "amount": 4250.0,
            "currency": "INR",
            "frequency": "monthly",
            "status": "inferred",
            "confidence": 0.92,
            "nominee_status": "known",
            "notes": "Extracted from header and transaction table",
        }
    ],
    "evidence": [
        {
            "field": "premium_amount",
            "value": "4250",
            "page": 1,
            "source": "pdf_text",
            "confidence": 0.95,
        },
        {
            "field": "policy_number",
            "value": "POL-998877",
            "page": 1,
            "source": "pdf_text",
            "confidence": 0.98,
        },
    ],
    "warnings": [],
}


class TestDocumentIntelligenceEndpoints:
    """Test suite for document processing, polling, and structured result endpoints."""

    def test_upload_schedules_processing_and_poll_status(self, client: TestClient):
        """Verify upload schedules processing and status endpoint returns progress."""
        with patch.object(groq_ai_client, "extract_financial_intelligence", new=AsyncMock(return_value=MOCK_GROQ_RESPONSE)):
            pdf_bytes = create_mock_pdf_bytes()
            upload_res = client.post(
                f"{settings.API_PREFIX}/documents/upload",
                data={"estate_id": "demo-estate-001"},
                files={"file": ("hdfc_policy.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
            )
            assert upload_res.status_code == 201
            doc_id = upload_res.json()["document_id"]

            # Query processing status
            status_res = client.get(f"{settings.API_PREFIX}/documents/{doc_id}/processing")
            assert status_res.status_code == 200
            status_data = status_res.json()
            assert status_data["document_id"] == doc_id
            assert "status" in status_data
            assert "progress" in status_data
            assert 0 <= status_data["progress"] <= 100

    @pytest.mark.asyncio
    async def test_manual_process_trigger_and_result_retrieval(self, client: TestClient):
        """Verify POST /process runs pipeline and GET /result returns structured entities."""
        with patch.object(groq_ai_client, "extract_financial_intelligence", new=AsyncMock(return_value=MOCK_GROQ_RESPONSE)):
            pdf_bytes = create_mock_pdf_bytes()
            upload_res = client.post(
                f"{settings.API_PREFIX}/documents/upload",
                data={"estate_id": "demo-estate-001"},
                files={"file": ("hdfc_policy_manual.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
            )
            assert upload_res.status_code == 201
            doc_id = upload_res.json()["document_id"]

            # Trigger processing explicitly
            proc_res = client.post(
                f"{settings.API_PREFIX}/documents/{doc_id}/process",
                json={"force": True},
            )
            assert proc_res.status_code == 202

            # Fetch result
            result_res = client.get(f"{settings.API_PREFIX}/documents/{doc_id}/result")
            assert result_res.status_code == 200
            result_data = result_res.json()
            assert result_data["document_id"] == doc_id
            assert result_data["status"] in ["completed", "pending", "extracting", "analyzing"]

    def test_processing_unknown_document_returns_404(self, client: TestClient):
        """Verify processing unknown document returns 404."""
        response = client.get(f"{settings.API_PREFIX}/documents/unknown-doc-uuid-999/processing")
        assert response.status_code == 404

    def test_result_unknown_document_returns_404(self, client: TestClient):
        """Verify querying result for unknown document returns 404."""
        response = client.get(f"{settings.API_PREFIX}/documents/unknown-doc-uuid-999/result")
        assert response.status_code == 404
