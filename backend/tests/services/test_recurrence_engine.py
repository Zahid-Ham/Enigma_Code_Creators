"""Unit tests for Deterministic Recurrence Engine in FINCLOSURE."""

import pytest
from app.models.recurrence import (
    AmountType,
    Cadence,
    NormalizedTransaction,
    RecurrenceStrength,
)
from app.services.discovery.recurrence_engine import RecurrenceEngine


@pytest.fixture
def engine() -> RecurrenceEngine:
    return RecurrenceEngine()


def test_1_six_identical_monthly_insurance_payments(engine: RecurrenceEngine):
    """Test 1 — Six identical monthly insurance payments.

    Expected: occurrence_count = 6, cadence = monthly, strength = strong, amount_type = fixed.
    """
    transactions = [
        NormalizedTransaction(
            date_val=f"2026-0{i+4}-04",
            description="ABC LIFE INSURANCE / PREMIUM ECS",
            amount=4250.0,
            institution="ABC Life Insurance",
            category="insurance",
        )
        for i in range(6)
    ]

    relationships = engine.analyze_transactions("demo-estate", transactions)
    assert len(relationships) == 1
    rel = relationships[0]

    assert rel.occurrence_count == 6
    assert rel.unique_month_count == 6
    assert rel.cadence == Cadence.MONTHLY
    assert rel.recurrence_strength == RecurrenceStrength.STRONG
    assert rel.amount_type == AmountType.FIXED
    assert rel.average_amount == 4250.0
    assert rel.amount_consistency == 1.0
    assert len(rel.recurrence_gaps) == 0


def test_2_variable_monthly_utility_payments(engine: RecurrenceEngine):
    """Test 2 — Variable monthly utility payments.

    Expected: occurrence_count = 6, cadence = monthly, amount_type = variable, strength = strong or moderate.
    """
    amounts = [2340.0, 2510.0, 2420.0, 2680.0, 2560.0, 2410.0]
    transactions = [
        NormalizedTransaction(
            date_val=f"2026-0{i+4}-10",
            description="CITY POWER — ELECTRICITY BILL",
            amount=amounts[i],
            institution="City Power",
            category="utility",
        )
        for i in range(6)
    ]

    relationships = engine.analyze_transactions("demo-estate", transactions)
    assert len(relationships) == 1
    rel = relationships[0]

    assert rel.occurrence_count == 6
    assert rel.unique_month_count == 6
    assert rel.cadence == Cadence.MONTHLY
    assert rel.amount_type == AmountType.VARIABLE
    assert rel.recurrence_strength in (RecurrenceStrength.STRONG, RecurrenceStrength.MODERATE)
    assert rel.min_amount == 2340.0
    assert rel.max_amount == 2680.0


def test_3_one_transaction(engine: RecurrenceEngine):
    """Test 3 — Single transaction.

    Expected: strength = insufficient.
    """
    transactions = [
        NormalizedTransaction(
            date_val="2026-05-15",
            description="SECUREHEALTH INSURANCE",
            amount=6500.0,
            category="insurance",
        )
    ]

    relationships = engine.analyze_transactions("demo-estate", transactions)
    assert len(relationships) == 1
    rel = relationships[0]

    assert rel.occurrence_count == 1
    assert rel.recurrence_strength == RecurrenceStrength.INSUFFICIENT


def test_4_two_transactions(engine: RecurrenceEngine):
    """Test 4 — Two transactions.

    Expected: not automatically strong.
    """
    transactions = [
        NormalizedTransaction(
            date_val="2026-04-05",
            description="QUICK REPAIR SERVICES",
            amount=1500.0,
        ),
        NormalizedTransaction(
            date_val="2026-05-05",
            description="QUICK REPAIR SERVICES",
            amount=1500.0,
        ),
    ]

    relationships = engine.analyze_transactions("demo-estate", transactions)
    assert len(relationships) == 1
    rel = relationships[0]

    assert rel.occurrence_count == 2
    assert rel.recurrence_strength != RecurrenceStrength.STRONG


def test_5_missing_month_gap_detected(engine: RecurrenceEngine):
    """Test 5 — Missing month.

    Expected: recurrence gap detected (June missing between April, May, July, August, September).
    """
    dates = ["2026-04-04", "2026-05-04", "2026-07-04", "2026-08-04", "2026-09-04"]
    transactions = [
        NormalizedTransaction(
            date_val=d,
            description="ABC LIFE INSURANCE PREMIUM",
            amount=4250.0,
            category="insurance",
        )
        for d in dates
    ]

    relationships = engine.analyze_transactions("demo-estate", transactions)
    assert len(relationships) == 1
    rel = relationships[0]

    assert rel.occurrence_count == 5
    assert len(rel.recurrence_gaps) == 1
    assert "June 2026" in rel.recurrence_gaps[0].expected_period


def test_6_different_merchant_names_same_relationship(engine: RecurrenceEngine):
    """Test 6 — Different merchant name variants normalize to same relationship."""
    transactions = [
        NormalizedTransaction(
            date_val="2026-04-04",
            description="ABC LIFE INSURANCE / PREMIUM ECS",
            amount=4250.0,
            category="insurance",
        ),
        NormalizedTransaction(
            date_val="2026-05-04",
            description="ABC LIFE INSURANCE PREMIUM",
            amount=4250.0,
            category="insurance",
        ),
        NormalizedTransaction(
            date_val="2026-06-04",
            description="ABC LIFE INSURANCE — PREMIUM",
            amount=4250.0,
            category="insurance",
        ),
    ]

    relationships = engine.analyze_transactions("demo-estate", transactions)
    assert len(relationships) == 1
    rel = relationships[0]

    assert rel.normalized_name == "ABC LIFE INSURANCE"
    assert rel.occurrence_count == 3
    assert len(rel.original_names) == 3


def test_7_similar_but_different_institutions(engine: RecurrenceEngine):
    """Test 7 — Similar but different institutions remain separate relationships."""
    transactions = [
        NormalizedTransaction(
            date_val="2026-04-04",
            description="ABC LIFE INSURANCE PREMIUM",
            amount=4250.0,
            category="insurance",
        ),
        NormalizedTransaction(
            date_val="2026-05-04",
            description="ABC LIFE INSURANCE PREMIUM",
            amount=4250.0,
            category="insurance",
        ),
        NormalizedTransaction(
            date_val="2026-06-04",
            description="ABC LIFE INSURANCE PREMIUM",
            amount=4250.0,
            category="insurance",
        ),
        NormalizedTransaction(
            date_val="2026-04-10",
            description="ABC GENERAL INSURANCE PREMIUM",
            amount=12000.0,
            category="insurance",
        ),
        NormalizedTransaction(
            date_val="2026-05-10",
            description="ABC GENERAL INSURANCE PREMIUM",
            amount=12000.0,
            category="insurance",
        ),
        NormalizedTransaction(
            date_val="2026-06-10",
            description="ABC GENERAL INSURANCE PREMIUM",
            amount=12000.0,
            category="insurance",
        ),
    ]

    relationships = engine.analyze_transactions("demo-estate", transactions)
    assert len(relationships) == 2
    names = {r.normalized_name for r in relationships}
    assert "ABC LIFE INSURANCE" in names
    assert "ABC GENERAL INSURANCE" in names


def test_8_cross_document_transactions(engine: RecurrenceEngine):
    """Test 8 — Cross-document transactions combine into one recurring relationship."""
    # Doc 1: April - June
    doc1_txs = [
        NormalizedTransaction(
            date_val=f"2026-0{i+4}-04",
            description="ABC LIFE INSURANCE",
            amount=4250.0,
            source_document_id="doc-001",
            category="insurance",
        )
        for i in range(3)
    ]
    # Doc 2: July - September
    doc2_txs = [
        NormalizedTransaction(
            date_val=f"2026-0{i+7}-04",
            description="ABC LIFE INSURANCE PREMIUM ECS",
            amount=4250.0,
            source_document_id="doc-002",
            category="insurance",
        )
        for i in range(3)
    ]

    all_txs = doc1_txs + doc2_txs
    relationships = engine.analyze_transactions("demo-estate", all_txs)

    assert len(relationships) == 1
    rel = relationships[0]
    assert rel.occurrence_count == 6
    assert rel.cadence == Cadence.MONTHLY
    assert rel.recurrence_strength == RecurrenceStrength.STRONG
    assert set(rel.source_document_ids) == {"doc-001", "doc-002"}


def test_9_duplicate_transaction_protection(engine: RecurrenceEngine):
    """Test 9 — Same transaction appearing in overlapping statements is not counted twice."""
    tx1 = NormalizedTransaction(
        date_val="2026-04-04",
        description="ABC LIFE INSURANCE / PREMIUM ECS",
        amount=4250.0,
        source_document_id="statement-1.pdf",
    )
    # Duplicate from overlapping statement
    tx2 = NormalizedTransaction(
        date_val="2026-04-04",
        description="ABC LIFE INSURANCE / PREMIUM ECS",
        amount=4250.0,
        source_document_id="statement-2.pdf",
    )
    tx3 = NormalizedTransaction(
        date_val="2026-05-04",
        description="ABC LIFE INSURANCE / PREMIUM ECS",
        amount=4250.0,
        source_document_id="statement-2.pdf",
    )

    relationships = engine.analyze_transactions("demo-estate", [tx1, tx2, tx3])
    assert len(relationships) == 1
    rel = relationships[0]
    # Deduplication should reduce 3 records (with 1 duplicate) to 2 occurrences
    assert rel.occurrence_count == 2
