"""Integration tests for Discovery / Recurrence API endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.discovery.recurrence_repository import (
    InMemoryRecurrenceRepository,
    _recurrence_repo_instance,
)
import app.services.discovery.recurrence_repository as recurrence_repo_mod
import app.services.discovery.recurrence_service as recurrence_srv_mod
from app.services.discovery.radar_engine import radar_engine


@pytest.fixture
def client() -> TestClient:
    # Use in-memory recurrence repository for tests
    repo = InMemoryRecurrenceRepository()
    recurrence_repo_mod._recurrence_repo_instance = repo
    recurrence_srv_mod.recurrence_service.repository = repo
    radar_engine.recurrence_repo = repo
    return TestClient(app)


def test_discovery_analyze_and_get_recurring(client: TestClient):
    estate_id = "test-estate-recurrence-123"

    transactions_payload = [
        {
            "date": f"2026-0{i+4}-04",
            "description": "ABC LIFE INSURANCE / PREMIUM ECS",
            "amount": 4250.0,
            "direction": "debit",
            "institution": "ABC Life Insurance",
            "category": "insurance",
        }
        for i in range(6)
    ] + [
        {
            "date": "2026-05-15",
            "description": "SECUREHEALTH INSURANCE ONE-TIME",
            "amount": 6500.0,
            "direction": "debit",
            "category": "insurance",
        }
    ]

    # POST analyze
    res = client.post(f"/api/v1/discovery/recurring/{estate_id}/analyze", json=transactions_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["estate_id"] == estate_id
    assert data["total_transactions_analyzed"] == 7
    assert len(data["relationships"]) == 2

    # Check top strong relationship
    strong_rel = data["relationships"][0]
    assert strong_rel["normalized_name"] == "ABC LIFE INSURANCE"
    assert strong_rel["occurrence_count"] == 6
    assert strong_rel["cadence"] == "monthly"
    assert strong_rel["recurrence_strength"] == "strong"
    assert strong_rel["average_amount"] == 4250.0
    rel_id = strong_rel["relationship_id"]

    # Check second insufficient relationship
    weak_rel = data["relationships"][1]
    assert weak_rel["occurrence_count"] == 1
    assert weak_rel["recurrence_strength"] == "insufficient"

    # GET estate relationships
    get_res = client.get(f"/api/v1/discovery/recurring/{estate_id}")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert len(get_data["relationships"]) == 2

    # GET single relationship detail
    detail_res = client.get(f"/api/v1/discovery/recurring/{estate_id}/{rel_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["relationship_id"] == rel_id
    assert detail_data["normalized_name"] == "ABC LIFE INSURANCE"

    # GET Estate Radar dashboard payload
    radar_res = client.get(f"/api/v1/estate-radar/{estate_id}")
    assert radar_res.status_code == 200
    radar_data = radar_res.json()
    assert radar_data["estate_id"] == estate_id
    assert "summary" in radar_data
    assert "discoveries" in radar_data
    assert "missing_assets" in radar_data
    assert "risk_alerts" in radar_data
    assert "insights" in radar_data
    assert radar_data["summary"]["recurring_relationships"] >= 1
