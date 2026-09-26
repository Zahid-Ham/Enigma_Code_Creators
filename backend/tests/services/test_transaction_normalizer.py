"""Unit tests for Transaction Normalization in FINCLOSURE."""

import pytest
from app.services.discovery.transaction_normalizer import TransactionNormalizer


@pytest.fixture
def normalizer() -> TransactionNormalizer:
    return TransactionNormalizer()


def test_normalize_insurance_variations(normalizer: TransactionNormalizer):
    descriptions = [
        "ABC LIFE INSURANCE / PREMIUM ECS",
        "ABC LIFE INSURANCE PREMIUM",
        "ABC LIFE INSURANCE — PREMIUM",
        "ABC LIFE INSURANCE - AUTO DEBIT",
        "ABC LIFE INSURANCE NACH",
    ]
    for desc in descriptions:
        assert normalizer.normalize_description(desc) == "ABC LIFE INSURANCE"


def test_normalize_loan_variations(normalizer: TransactionNormalizer):
    descriptions = [
        "NATIONAL HOUSING BANK — HOME LOAN EMI",
        "NATIONAL HOUSING BANK HOME LOAN — EMI",
        "NATIONAL HOUSING BANK — EMI",
        "NATIONAL HOUSING BANK / EMI PAYMENT",
    ]
    for desc in descriptions:
        assert normalizer.normalize_description(desc) == "NATIONAL HOUSING BANK"


def test_normalize_subscription_variations(normalizer: TransactionNormalizer):
    descriptions = [
        "STREAMFLIX DIGITAL SERVICES",
        "STREAMFLIX — MONTHLY SUBSCRIPTION",
        "STREAMFLIX MONTHLY PLAN",
        "STREAMFLIX / SUBSCRIPTION FEE",
    ]
    for desc in descriptions:
        assert normalizer.normalize_description(desc) == "STREAMFLIX"


def test_distinct_institutions_kept_separate(normalizer: TransactionNormalizer):
    # Distinct entities should NOT be merged
    norm1 = normalizer.normalize_description("ABC LIFE INSURANCE PREMIUM ECS")
    norm2 = normalizer.normalize_description("ABC GENERAL INSURANCE PREMIUM")
    norm3 = normalizer.normalize_description("ABC HEALTH INSURANCE PREMIUM")

    assert norm1 == "ABC LIFE INSURANCE"
    assert norm2 == "ABC GENERAL INSURANCE"
    assert norm3 == "ABC HEALTH INSURANCE"
    assert norm1 != norm2
    assert norm2 != norm3


def test_category_inference(normalizer: TransactionNormalizer):
    assert normalizer.infer_category("ABC LIFE INSURANCE / PREMIUM ECS", "ABC LIFE INSURANCE") == "insurance"
    assert normalizer.infer_category("NATIONAL HOUSING BANK — HOME LOAN EMI", "NATIONAL HOUSING BANK") == "loan"
    assert normalizer.infer_category("GREENWOOD MF — MONTHLY SIP", "GREENWOOD ASSET MANAGEMENT") == "investment"
    assert normalizer.infer_category("STREAMFLIX — RECURRING", "STREAMFLIX") == "subscription"
    assert normalizer.infer_category("CITY POWER — ELECTRICITY BILL", "CITY POWER") == "utility"
    assert normalizer.infer_category("INCOME TAX REFUND / TDS", "INCOME TAX") == "tax"


def test_display_name_formatting(normalizer: TransactionNormalizer):
    assert normalizer.to_display_name("ABC LIFE INSURANCE") == "ABC Life Insurance"
    assert normalizer.to_display_name("NATIONAL HOUSING BANK") == "National Housing Bank"
    assert normalizer.to_display_name("STREAMFLIX") == "Streamflix"
