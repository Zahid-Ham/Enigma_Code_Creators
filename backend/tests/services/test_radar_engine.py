"""Unit and Integration tests for RadarEngine and Estate Radar discovery layer."""

import pytest
from app.models.recurrence import NormalizedTransaction, RecurringRelationship
from app.services.discovery.confidence_engine import confidence_engine
from app.services.discovery.missing_asset_detector import missing_asset_detector
from app.services.discovery.radar_engine import radar_engine
from app.services.discovery.recurrence_repository import InMemoryRecurrenceRepository
from app.services.documents.document_repository import InMemoryDocumentRepository


@pytest.mark.asyncio
async def test_radar_engine_synthesis_and_entity_resolution():
    estate_id = "test-radar-estate-001"

    # Setup in-memory repos
    doc_repo = InMemoryDocumentRepository()
    radar_engine.doc_repo = doc_repo
    rec_repo = InMemoryRecurrenceRepository()
    radar_engine.recurrence_repo = rec_repo

    # 1. Add Bank Statement document metadata & result
    doc1_id = "doc-bank-001"
    await doc_repo.save_document_metadata(
        doc1_id,
        {
            "estate_id": estate_id,
            "filename": "01_Bank_Statement_Apr-Jun.pdf",
            "document_type": "bank_statement",
        },
    )
    await doc_repo.save_processing_result(
        doc1_id,
        {
            "document_id": doc1_id,
            "document_type": "bank_statement",
            "extracted_text_page_count": 3,
            "entities": [{"institution_name": "HDFC Bank", "category": "bank"}],
        },
    )

    # 2. Add Life Insurance policy document metadata & result (with nominee Priya Mehta)
    doc2_id = "doc-ins-002"
    await doc_repo.save_document_metadata(
        doc2_id,
        {
            "estate_id": estate_id,
            "filename": "02_ABC_Life_Insurance_Policy.pdf",
            "document_type": "insurance_policy",
        },
    )
    await doc_repo.save_processing_result(
        doc2_id,
        {
            "document_id": doc2_id,
            "document_type": "insurance_policy",
            "extracted_text_page_count": 2,
            "policy_details": {
                "policy_number": "POL-8839201",
                "insurer_name": "ABC Life Insurance",
                "premium_amount": 4250.0,
            },
            "nominee_details": {
                "name": "Priya Mehta",
                "relationship": "Spouse",
            },
        },
    )

    # 3. Add recurring bank transactions for ABC Life Insurance
    txs = [
        NormalizedTransaction(
            date_val=f"2026-0{i+4}-04",
            description="ABC LIFE INSURANCE / PREMIUM ECS",
            amount=4250.0,
            direction="debit",
            institution="ABC Life Insurance",
            category="insurance",
            normalized_description="ABC LIFE INSURANCE",
            source_document_id=doc1_id,
            page_number=1,
        )
        for i in range(6)
    ]
    await rec_repo.save_transactions(estate_id, txs)

    rel = RecurringRelationship(
        relationship_id="rel-abc-life-01",
        estate_id=estate_id,
        normalized_name="ABC LIFE INSURANCE",
        display_name="ABC Life Insurance",
        category="insurance",
        occurrence_count=6,
        average_amount=4250.0,
        cadence="monthly",
        source_document_ids=[doc1_id],
        first_observed_date="2026-04-04",
        last_observed_date="2026-09-04",
    )
    await rec_repo.save_relationship(rel)

    # 4. Generate Radar
    radar_resp = await radar_engine.generate_estate_radar(estate_id)

    # Verify Summary
    assert radar_resp.estate_id == estate_id
    assert radar_resp.summary.recurring_relationships >= 1
    assert radar_resp.summary.documents_analyzed >= 2

    # Verify Discovery Item
    disc = next((d for d in radar_resp.discoveries if "ABC Life" in d.institution_name), None)
    assert disc is not None
    assert disc.occurrence_count == 6
    assert disc.average_amount == 4250.0
    assert disc.cadence == "Monthly"
    assert disc.strength == "Strong"
    assert "Priya Mehta" in disc.nominee_status
    assert disc.nominee_name == "Priya Mehta"
    assert disc.policy_or_account_reference == "POL-8839201"
    assert len(disc.monthly_pattern) == 6
    assert len(disc.source_documents) == 2  # Cross-document merged!


@pytest.mark.asyncio
async def test_missing_asset_detection():
    estate_id = "test-missing-estate-002"

    # Recurring relationship for Health Insurance but NO policy doc
    rel = RecurringRelationship(
        relationship_id="rel-health-01",
        estate_id=estate_id,
        normalized_name="HEALTHCARE CORP",
        display_name="Health Insurance",
        category="insurance",
        occurrence_count=6,
        average_amount=3500.0,
        cadence="monthly",
        source_document_ids=["doc-bank-only"],
    )

    processed_docs = [
        {
            "document_id": "doc-bank-only",
            "document_type": "bank_statement",
            "filename": "Bank_Statement.pdf",
            "entities": [],
        }
    ]

    missing, alerts = missing_asset_detector.detect_missing_assets(
        estate_id=estate_id,
        relationships=[rel],
        processed_documents=processed_docs,
    )

    assert len(missing) >= 1
    miss = missing[0]
    assert miss.category == "insurance"
    assert "No policy document found" in miss.reason
    assert miss.occurrence_count == 6
    assert miss.average_amount == 3500.0
