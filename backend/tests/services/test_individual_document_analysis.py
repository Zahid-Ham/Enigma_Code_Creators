"""Comprehensive unit tests for FINCLOSURE Individual Document Analysis across all document types."""

import pytest
from app.models.document_processing import DocumentType
from app.models.financial_entity import EntityType
from app.models.recurrence import TransactionDirection
from app.services.ai.validation_service import AIValidationService
from app.services.discovery.statement_parser import StatementParser
from app.services.documents.document_repository import InMemoryDocumentRepository


class TestBankStatementTransactionExtraction:
    """Tests deterministic bank statement transaction extraction, dates, directions, and categories."""

    def test_bank_statement_transactions_parsed_completely(self):
        sample_bank_text = """
HDFC BANK SAVINGS ACCOUNT STATEMENT
Account Number: 50100492833456
Customer Name: Arjun Mehta
Statement Period: 01-Apr-2026 to 30-Jun-2026

Transaction Activity Record:
02-Apr-2026
SALARY CREDIT — CYRUS TECHNOLOGIES
₹95,000

04-Apr-2026
ABC LIFE INSURANCE / PREMIUM ECS
₹4,250

07-Apr-2026
NATIONAL HOUSING BANK — HOME LOAN EMI
₹28,600

10-Apr-2026
STREAMFLIX DIGITAL SERVICES
₹699

12-Apr-2026
GREENWOOD ASSET MGMT — SIP
₹10,000

15-Apr-2026
CITY POWER — ELECTRICITY BILL
₹2,340

Closing Balance as of 30-Jun-2026: INR 3,54,415.00
"""
        parser = StatementParser()
        txs = parser.parse_statement_text(sample_bank_text, source_document_id="doc-bank-01")

        assert len(txs) == 6, f"Expected 6 transactions, got {len(txs)}"

        # 1. Salary Credit
        salary = next((t for t in txs if "CYRUS" in t.description.upper() or "SALARY" in t.description.upper()), None)
        assert salary is not None
        assert salary.amount == 95000.0
        assert salary.direction == TransactionDirection.CREDIT
        assert salary.category == "income"
        assert salary.date == "2026-04-02"

        # 2. Insurance Debit
        ins = next((t for t in txs if "ABC LIFE" in t.description.upper()), None)
        assert ins is not None
        assert ins.amount == 4250.0
        assert ins.direction == TransactionDirection.DEBIT
        assert ins.category == "insurance"
        assert ins.date == "2026-04-04"

        # 3. Loan EMI Debit
        loan = next((t for t in txs if "NATIONAL HOUSING" in t.description.upper()), None)
        assert loan is not None
        assert loan.amount == 28600.0
        assert loan.direction == TransactionDirection.DEBIT
        assert loan.category == "loan"
        assert loan.date == "2026-04-07"

        # 4. Streamflix Subscription Debit
        sub = next((t for t in txs if "STREAMFLIX" in t.description.upper()), None)
        assert sub is not None
        assert sub.amount == 699.0
        assert sub.direction == TransactionDirection.DEBIT
        assert sub.category == "subscription"
        assert sub.date == "2026-04-10"

        # 5. Greenwood SIP Debit
        sip = next((t for t in txs if "GREENWOOD" in t.description.upper()), None)
        assert sip is not None
        assert sip.amount == 10000.0
        assert sip.direction == TransactionDirection.DEBIT
        assert sip.category == "investment"
        assert sip.date == "2026-04-12"

        # 6. Utility Bill Debit
        util = next((t for t in txs if "CITY POWER" in t.description.upper()), None)
        assert util is not None
        assert util.amount == 2340.0
        assert util.direction == TransactionDirection.DEBIT
        assert util.category == "utility"
        assert util.date == "2026-04-15"


class TestDocumentSpecificStructuredDetails:
    """Tests structured details for Insurance, Loan, and Investment documents."""

    def test_insurance_policy_details_extraction(self):
        raw_insurance_llm = {
            "document_type": "insurance_policy",
            "overall_confidence": 0.99,
            "policy_details": {
                "policy_number": "AL-2026-45821",
                "policy_holder": "Arjun Mehta",
                "policy_type": "Term Life Insurance",
                "sum_assured": 5000000.0,
                "death_benefit": 5000000.0,
                "accidental_rider": 1000000.0,
                "premium": 51000.0,
                "frequency": "Monthly equivalent / ECS",
                "policy_start_date": "01-Apr-2026",
                "policy_term": "20 years",
                "payment_term": "10 years",
                "status": "Active / In Force",
            },
            "nominee_details": {
                "name": "Priya Mehta",
                "relationship": "Spouse",
                "status": "known",
                "share_percentage": 100.0,
                "source_page": 1,
                "confidence": 0.98,
            },
            "entities": [
                {
                    "entity_type": "insurance",
                    "display_name": "ABC Life Insurance Policy",
                    "institution_name": "ABC Life Insurance",
                    "account_reference": "AL-2026-45821",
                    "sum_assured": 5000000.0,
                    "premium_amount": 51000.0,
                    "currency": "INR",
                }
            ],
            "evidence": [
                {"field": "policy_number", "value": "AL-2026-45821", "page": 1, "confidence": 0.99},
                {"field": "nominee_name", "value": "Priya Mehta", "page": 1, "confidence": 0.98},
            ],
        }

        validator = AIValidationService()
        (
            doc_type,
            conf,
            entities,
            evidence,
            warnings,
            policy_details,
            loan_details,
            investment_details,
            account_details,
            nominee_details,
            transactions,
        ) = validator.validate_and_normalize(raw_insurance_llm, [1])

        assert doc_type == DocumentType.INSURANCE_POLICY
        assert policy_details["policy_number"] == "AL-2026-45821"
        assert policy_details["policy_holder"] == "Arjun Mehta"
        assert policy_details["sum_assured"] == 5000000.0
        assert policy_details["premium"] == 51000.0
        assert nominee_details["name"] == "Priya Mehta"
        assert nominee_details["relationship"] == "Spouse"

    def test_loan_statement_details_extraction(self):
        raw_loan_llm = {
            "document_type": "loan_statement",
            "overall_confidence": 0.98,
            "loan_details": {
                "loan_account": "HL-49920199",
                "borrower": "Arjun Mehta",
                "loan_type": "Home Loan",
                "sanctioned_principal": 4000000.0,
                "outstanding_principal": 3142600.0,
                "emi_amount": 28600.0,
                "interest_rate": "8.45%",
                "next_due_date": "10-May-2026",
                "tenure_remaining": "168 months remaining",
                "repayment_history": [
                    {"due_date": "10-Apr-2026", "emi": 28600.0, "principal": 12000.0, "interest": 16600.0, "status": "Paid"}
                ],
            },
            "entities": [
                {
                    "entity_type": "loan",
                    "display_name": "National Housing Bank Home Loan",
                    "institution_name": "National Housing Bank",
                    "account_reference": "HL-49920199",
                    "emi_amount": 28600.0,
                    "outstanding_amount": 3142600.0,
                    "currency": "INR",
                }
            ],
            "evidence": [
                {"field": "loan_account", "value": "HL-49920199", "page": 1, "confidence": 0.99},
            ],
        }

        validator = AIValidationService()
        (
            doc_type,
            conf,
            entities,
            evidence,
            warnings,
            policy_details,
            loan_details,
            investment_details,
            account_details,
            nominee_details,
            transactions,
        ) = validator.validate_and_normalize(raw_loan_llm, [1])

        assert doc_type == DocumentType.LOAN_STATEMENT
        assert loan_details["loan_account"] == "HL-49920199"
        assert loan_details["outstanding_principal"] == 3142600.0
        assert loan_details["emi_amount"] == 28600.0
        assert loan_details["interest_rate"] == "8.45%"
        assert len(loan_details["repayment_history"]) == 1

    def test_mutual_fund_investment_statement_details_extraction(self):
        raw_inv_llm = {
            "document_type": "investment_statement",
            "overall_confidence": 0.99,
            "investment_details": {
                "folio_number": "GF-2026-11872",
                "fund_name": "Greenwood Balanced Growth Fund",
                "investor_name": "Arjun Mehta",
                "investment_type": "Mutual Fund (Equity)",
                "sip_amount": 10000.0,
                "frequency": "Monthly",
                "current_value": 218450.0,
                "total_invested": 180000.0,
                "units_held": 1842.337,
                "nav": 118.57,
            },
            "nominee_details": {
                "name": "Priya Mehta",
                "relationship": "Spouse",
                "status": "known",
                "share_percentage": 100.0,
                "source_page": 1,
            },
            "entities": [
                {
                    "entity_type": "investment",
                    "display_name": "Greenwood Balanced Growth Fund",
                    "institution_name": "Greenwood Asset Management",
                    "account_reference": "GF-2026-11872",
                    "investment_value": 218450.0,
                    "transaction_amount": 10000.0,
                    "currency": "INR",
                }
            ],
            "evidence": [
                {"field": "folio_number", "value": "GF-2026-11872", "page": 1, "confidence": 0.99},
            ],
        }

        validator = AIValidationService()
        (
            doc_type,
            conf,
            entities,
            evidence,
            warnings,
            policy_details,
            loan_details,
            investment_details,
            account_details,
            nominee_details,
            transactions,
        ) = validator.validate_and_normalize(raw_inv_llm, [1])

        assert doc_type == DocumentType.INVESTMENT_STATEMENT
        assert investment_details["folio_number"] == "GF-2026-11872"
        assert investment_details["fund_name"] == "Greenwood Balanced Growth Fund"
        assert investment_details["sip_amount"] == 10000.0
        assert investment_details["current_value"] == 218450.0
        assert investment_details["units_held"] == 1842.337
        assert nominee_details["name"] == "Priya Mehta"


@pytest.mark.asyncio
async def test_persistence_and_fresh_api_retrieval():
    """Verify that structured document extraction results survive repository storage and fresh retrieval."""
    repo = InMemoryDocumentRepository()
    doc_id = "test-doc-persist-001"

    structured_data = {
        "document_id": doc_id,
        "status": "completed",
        "document_type": "investment_statement",
        "processed_at": "2026-09-26T12:00:00+00:00",
        "extracted_text_page_count": 1,
        "relevant_page_count": 1,
        "entities": [
            {
                "entity_type": "investment",
                "display_name": "Greenwood Balanced Growth Fund",
                "amount": 218450.0,
                "confidence": 0.99,
            }
        ],
        "evidence": [
            {"field": "folio_number", "value": "GF-2026-11872", "page": 1, "source": "pdf_text", "confidence": 0.99}
        ],
        "warnings": [],
        "transactions": [
            {"id": "tx-1", "date": "2026-04-12", "description": "SIP Greenwood", "amount": 10000.0, "direction": "debit"}
        ],
        "investment_details": {
            "folio_number": "GF-2026-11872",
            "fund_name": "Greenwood Balanced Growth Fund",
            "current_value": 218450.0,
        },
        "nominee_details": {
            "name": "Priya Mehta",
            "relationship": "Spouse",
            "status": "known",
        },
        "overall_confidence": 0.99,
        "error": None,
        "processing_duration_ms": 1200,
    }

    # Save to repository
    await repo.save_processing_result(doc_id, structured_data)

    # Fresh retrieval
    retrieved = await repo.get_processing_result(doc_id)
    assert retrieved is not None
    assert retrieved["document_id"] == doc_id
    assert retrieved["document_type"] == "investment_statement"
    assert retrieved["investment_details"]["folio_number"] == "GF-2026-11872"
    assert retrieved["nominee_details"]["name"] == "Priya Mehta"
    assert len(retrieved["transactions"]) == 1
    assert retrieved["transactions"][0]["amount"] == 10000.0
