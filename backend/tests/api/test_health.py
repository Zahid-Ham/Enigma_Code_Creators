"""Tests for API health check and root endpoints."""

import pytest
from app.core.config import settings
from app.main import app
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """Test client fixture for FastAPI app."""
    return TestClient(app)


def test_health_check_endpoint(client: TestClient):
    """Test that GET /api/v1/health returns 200 and expected status."""
    response = client.get(f"{settings.API_PREFIX}/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "finclosure-backend"
    assert data["version"] == settings.VERSION
    assert data["environment"] == settings.APP_ENV


def test_root_endpoint(client: TestClient):
    """Test that GET / returns 200 and basic service info."""
    response = client.get("/")
    assert response.status_code == 200

    data = response.json()
    assert data["service"] == settings.PROJECT_NAME
    assert data["status"] == "online"
    assert "health_check" in data


def test_openapi_schema_includes_document_routes(client: TestClient):
    """Test that OpenAPI schema properly registers document endpoints."""
    response = client.get("/openapi.json")
    assert response.status_code == 200

    schema = response.json()
    paths = schema.get("paths", {})

    upload_path = f"{settings.API_PREFIX}/documents/upload"
    get_doc_path = f"{settings.API_PREFIX}/documents/{{document_id}}"

    assert upload_path in paths
    assert "post" in paths[upload_path]

    assert get_doc_path in paths
    assert "get" in paths[get_doc_path]
