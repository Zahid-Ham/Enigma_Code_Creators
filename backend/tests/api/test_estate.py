"""API tests for Financial Estate Twin and Financial Entity endpoints."""

import pytest
from app.core.config import settings
from app.main import app
from fastapi.testclient import TestClient


@pytest.fixture
def client() -> TestClient:
    """TestClient fixture with fresh application context."""
    return TestClient(app)


class TestEstateEndpoints:
    """Test suite for /api/v1/estates CRUD operations."""

    def test_list_estates_includes_demo_estate(self, client: TestClient):
        """Verify listing estates returns the seeded demo estate."""
        response = client.get(f"{settings.API_PREFIX}/estates")
        assert response.status_code == 200
        data = response.json()
        assert "estates" in data
        assert "total" in data
        assert data["total"] >= 1
        estate_ids = [e["estate_id"] for e in data["estates"]]
        assert "demo-estate-001" in estate_ids

    def test_create_estate_success(self, client: TestClient):
        """Verify creating a new valid financial estate."""
        payload = {
            "estate_id": "test-estate-101",
            "subject_name": "Priya Sharma",
            "subject_type": "individual",
            "status": "active",
        }
        response = client.post(f"{settings.API_PREFIX}/estates", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["estate_id"] == "test-estate-101"
        assert data["subject_name"] == "Priya Sharma"
        assert data["subject_type"] == "individual"
        assert data["status"] == "active"
        assert "created_at" in data
        assert "updated_at" in data

    def test_retrieve_estate_success(self, client: TestClient):
        """Verify retrieving an existing estate by ID."""
        response = client.get(f"{settings.API_PREFIX}/estates/demo-estate-001")
        assert response.status_code == 200
        data = response.json()
        assert data["estate_id"] == "demo-estate-001"
        assert data["subject_name"] == "Arjun Mehta"
        assert data["subject_type"] == "individual"

    def test_missing_estate_returns_404(self, client: TestClient):
        """Verify querying non-existent estate returns 404."""
        response = client.get(f"{settings.API_PREFIX}/estates/non-existent-estate-999")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data or "message" in data

    def test_invalid_estate_status_rejected_422(self, client: TestClient):
        """Verify invalid estate status is rejected by Pydantic."""
        payload = {
            "subject_name": "Invalid Subject",
            "status": "not_a_real_status",
        }
        response = client.post(f"{settings.API_PREFIX}/estates", json=payload)
        assert response.status_code == 422


class TestFinancialEntityEndpoints:
    """Test suite for /api/v1/estates/{estate_id}/entities CRUD operations."""

    def test_create_financial_entity_success(self, client: TestClient):
        """Verify creating a valid financial entity under demo estate."""
        payload = {
            "entity_id": "ent-hdfc-bank-001",
            "entity_type": "bank_account",
            "institution_name": "HDFC Bank",
            "display_name": "HDFC Savings Account",
            "account_reference": "XX-1234",
            "amount": 245000.0,
            "currency": "INR",
            "frequency": "monthly",
            "status": "verified",
            "confidence": 1.0,
            "evidence_document_ids": ["doc-uuid-001"],
            "nominee_status": "known",
            "notes": "Primary salary account",
        }
        response = client.post(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities",
            json=payload,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["entity_id"] == "ent-hdfc-bank-001"
        assert data["estate_id"] == "demo-estate-001"
        assert data["entity_type"] == "bank_account"
        assert data["institution_name"] == "HDFC Bank"
        assert data["amount"] == 245000.0
        assert data["currency"] == "INR"
        assert data["status"] == "verified"
        assert data["confidence"] == 1.0
        assert data["evidence_document_ids"] == ["doc-uuid-001"]
        assert data["nominee_status"] == "known"

    def test_create_entity_missing_estate_returns_404(self, client: TestClient):
        """Verify creating entity under unknown estate returns 404."""
        payload = {
            "entity_type": "insurance",
            "display_name": "LIC Policy",
        }
        response = client.post(
            f"{settings.API_PREFIX}/estates/missing-estate-404/entities",
            json=payload,
        )
        assert response.status_code == 404

    def test_retrieve_financial_entity_success(self, client: TestClient):
        """Verify retrieving an existing financial entity."""
        # Create entity first
        create_res = client.post(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities",
            json={
                "entity_type": "insurance",
                "institution_name": "ABC Life Insurance",
                "display_name": "Term Life Policy",
                "amount": 5000000.0,
                "status": "inferred",
                "confidence": 0.88,
            },
        )
        assert create_res.status_code == 201
        created = create_res.json()
        entity_id = created["entity_id"]

        get_res = client.get(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities/{entity_id}"
        )
        assert get_res.status_code == 200
        data = get_res.json()
        assert data["entity_id"] == entity_id
        assert data["display_name"] == "Term Life Policy"
        assert data["status"] == "inferred"
        assert data["confidence"] == 0.88

    def test_retrieve_missing_entity_returns_404(self, client: TestClient):
        """Verify retrieving non-existent entity returns 404."""
        response = client.get(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities/missing-ent-999"
        )
        assert response.status_code == 404

    def test_list_financial_entities_success(self, client: TestClient):
        """Verify listing all entities under an estate."""
        response = client.get(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities"
        )
        assert response.status_code == 200
        data = response.json()
        assert "entities" in data
        assert "total" in data
        assert isinstance(data["entities"], list)

    def test_patch_entity_status_transition(self, client: TestClient):
        """Verify PATCH endpoint transitions entity from inferred to verified with evidence."""
        # 1. Create an inferred entity
        create_res = client.post(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities",
            json={
                "entity_type": "investment",
                "institution_name": "Zerodha",
                "display_name": "Mutual Fund Portfolio",
                "status": "inferred",
                "confidence": 0.75,
                "evidence_document_ids": [],
            },
        )
        assert create_res.status_code == 201
        entity_id = create_res.json()["entity_id"]

        # 2. Patch to verified
        patch_payload = {
            "status": "verified",
            "confidence": 1.0,
            "account_reference": "Z-998877",
            "amount": 350000.0,
            "evidence_document_ids": ["doc-verified-statement-123"],
            "nominee_status": "known",
        }
        patch_res = client.patch(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities/{entity_id}",
            json=patch_payload,
        )
        assert patch_res.status_code == 200
        data = patch_res.json()
        assert data["status"] == "verified"
        assert data["confidence"] == 1.0
        assert data["account_reference"] == "Z-998877"
        assert data["amount"] == 350000.0
        assert data["evidence_document_ids"] == ["doc-verified-statement-123"]
        assert data["nominee_status"] == "known"

    def test_patch_missing_entity_returns_404(self, client: TestClient):
        """Verify patching non-existent entity returns 404."""
        response = client.patch(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities/ent-non-existent",
            json={"status": "verified"},
        )
        assert response.status_code == 404

    def test_invalid_entity_type_rejected_422(self, client: TestClient):
        """Verify unsupported entity_type is rejected with 422."""
        payload = {
            "entity_type": "crypto_meme_coin_invalid",
            "display_name": "Invalid Asset",
        }
        response = client.post(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities",
            json=payload,
        )
        assert response.status_code == 422

    def test_invalid_entity_status_rejected_422(self, client: TestClient):
        """Verify invalid entity status is rejected with 422."""
        payload = {
            "entity_type": "bank_account",
            "display_name": "Test Bank",
            "status": "super_verified_custom",
        }
        response = client.post(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities",
            json=payload,
        )
        assert response.status_code == 422

    def test_invalid_nominee_status_rejected_422(self, client: TestClient):
        """Verify invalid nominee status is rejected with 422."""
        payload = {
            "entity_type": "insurance",
            "display_name": "Test Insurance",
            "nominee_status": "registered_online_custom",
        }
        response = client.post(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities",
            json=payload,
        )
        assert response.status_code == 422

    def test_negative_amount_rejected_422(self, client: TestClient):
        """Verify negative amount is rejected with 422."""
        payload = {
            "entity_type": "bank_account",
            "display_name": "Savings Account",
            "amount": -500.0,
        }
        response = client.post(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities",
            json=payload,
        )
        assert response.status_code == 422

    def test_confidence_out_of_bounds_rejected_422(self, client: TestClient):
        """Verify confidence scores outside [0.0, 1.0] are rejected with 422."""
        # Below 0.0
        res1 = client.post(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities",
            json={
                "entity_type": "loan",
                "display_name": "Car Loan",
                "confidence": -0.1,
            },
        )
        assert res1.status_code == 422

        # Above 1.0
        res2 = client.post(
            f"{settings.API_PREFIX}/estates/demo-estate-001/entities",
            json={
                "entity_type": "loan",
                "display_name": "Car Loan",
                "confidence": 1.25,
            },
        )
        assert res2.status_code == 422
