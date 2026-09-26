"""Unit tests for Document Intelligence services: PDF parsing, OCR, relevance detection, chunking, and validation."""

import fitz  # PyMuPDF
from app.models.document_processing import (
    DocumentType,
    EvidenceSource,
    PageContent,
)
from app.models.financial_entity import EntityType, NomineeStatus
from app.services.ai.validation_service import AIValidationService
from app.services.documents.chunking import DocumentChunker
from app.services.documents.ocr_service import OCRService
from app.services.documents.pdf_parser import PDFParser
from app.services.documents.relevance_detector import RelevanceDetector, RelevantPage


def create_test_pdf_bytes(pages_text: list[str]) -> bytes:
    """Helper to generate in-memory synthetic PDF with custom text per page."""
    doc = fitz.open()
    for text in pages_text:
        page = doc.new_page()
        page.insert_text((50, 72), text, fontsize=12)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


class TestPDFParserUnit:
    """Unit tests for PDF text extraction."""

    def test_extract_pages_preserves_page_numbers(self):
        """Verify page-by-page extraction preserves 1-based page indices."""
        text_p1 = "HDFC Life Insurance Policy Document for Arjun Mehta. Premium: Rs. 4,250 monthly."
        text_p2 = "Nominee Details: Priya Mehta (Spouse). Nominee share: 100%."
        pdf_bytes = create_test_pdf_bytes([text_p1, text_p2])

        pages = PDFParser.extract_pages(pdf_bytes)
        assert len(pages) == 2
        assert pages[0].page_number == 1
        assert "HDFC Life Insurance" in pages[0].text
        assert pages[1].page_number == 2
        assert "Nominee Details" in pages[1].text
        assert pages[0].source == EvidenceSource.PDF_TEXT

    def test_empty_bytes_returns_empty_list(self):
        """Verify handling empty byte array gracefully."""
        pages = PDFParser.extract_pages(b"")
        assert pages == []


class TestOCRServiceUnit:
    """Unit tests for OCR service error safety."""

    def test_empty_bytes_handling(self):
        """Verify empty byte inputs do not crash."""
        res = OCRService.extract_image_text(b"")
        assert res.page_number == 1
        assert res.text == ""

    def test_ocr_pdf_page_out_of_range(self):
        """Verify out-of-range page number returns empty page without error."""
        pdf_bytes = create_test_pdf_bytes(["Sample text"])
        res = OCRService.ocr_pdf_page(pdf_bytes, page_number=99)
        assert res.page_number == 99
        assert res.text == ""


class TestRelevanceDetectorUnit:
    """Unit tests for financial signal detection."""

    def test_financial_keywords_detected(self):
        """Verify financial keywords score page as relevant."""
        p1 = PageContent(
            page_number=1,
            text="HDFC Bank Statement. Account: 1234. EMI debit: Rs. 15,000 for Home Loan.",
        )
        p2 = PageContent(
            page_number=2,
            text="Terms and conditions general privacy notice lorem ipsum dolor sit amet.",
        )

        relevant = RelevanceDetector.detect_relevant_pages([p1, p2])
        assert len(relevant) >= 1
        p1_match = next((r for r in relevant if r.page_number == 1), None)
        assert p1_match is not None
        assert p1_match.relevance_score > 0.2
        assert "bank_account" in p1_match.reasons or "loan_and_emi" in p1_match.reasons


class TestDocumentChunkerUnit:
    """Unit tests for prompt formatting and chunking."""

    def test_chunking_includes_page_tags(self):
        """Verify chunks include [PAGE X] headers."""
        p1 = RelevantPage(page_number=1, text="Bank statement content", relevance_score=0.8, reasons=["bank"])
        p2 = RelevantPage(page_number=2, text="Fixed deposit receipt content", relevance_score=0.9, reasons=["deposits"])

        context, pages = DocumentChunker.prepare_llm_context([p1, p2])
        assert "[PAGE 1]" in context
        assert "[PAGE 2]" in context
        assert "Bank statement content" in context
        assert "Fixed deposit receipt content" in context
        assert pages == [1, 2]


class TestAIValidationServiceUnit:
    """Unit tests for AI response validation and normalization."""

    def test_validation_normalizes_valid_json(self):
        """Verify normal raw LLM JSON is converted to strongly typed domain objects."""
        raw_llm_output = {
            "document_type": "insurance_policy",
            "overall_confidence": 0.95,
            "entities": [
                {
                    "entity_type": "insurance",
                    "display_name": "Max Life Term Plan",
                    "institution_name": "Max Life Insurance",
                    "account_reference": "POL-889900",
                    "amount": 12500.0,
                    "currency": "INR",
                    "frequency": "annual",
                    "status": "inferred",
                    "confidence": 0.92,
                    "nominee_status": "known",
                    "notes": "Policy term 30 years",
                }
            ],
            "evidence": [
                {
                    "field": "policy_number",
                    "value": "POL-889900",
                    "page": 1,
                    "source": "pdf_text",
                    "confidence": 0.98,
                }
            ],
            "warnings": ["Original physical certificate recommended"],
        }

        doc_type, conf, entities, evidence, warnings = AIValidationService.validate_and_normalize(
            raw_data=raw_llm_output,
            actual_page_numbers=[1, 2],
        )

        assert doc_type == DocumentType.INSURANCE_POLICY
        assert conf == 0.95
        assert len(entities) == 1
        assert entities[0].entity_type == EntityType.INSURANCE
        assert entities[0].amount == 12500.0
        assert entities[0].nominee_status == NomineeStatus.KNOWN
        assert len(evidence) == 1
        assert evidence[0].page == 1
        assert len(warnings) >= 1

    def test_hallucinated_page_number_adjusted(self):
        """Verify page number outside document range is clamped to valid document page."""
        raw_output = {
            "document_type": "bank_statement",
            "overall_confidence": 0.8,
            "entities": [],
            "evidence": [
                {
                    "field": "account_number",
                    "value": "123456",
                    "page": 99,  # Document only has pages 1 and 2
                    "source": "pdf_text",
                    "confidence": 0.9,
                }
            ],
            "warnings": [],
        }

        _doc_type, _conf, _entities, evidence, warnings = AIValidationService.validate_and_normalize(
            raw_data=raw_output,
            actual_page_numbers=[1, 2],
        )

        assert evidence[0].page in [1, 2]
        assert any("hallucinated" in w.lower() for w in warnings)

    def test_semantic_financial_fields_normalized(self):
        """Verify semantic amount fields like premium_amount, emi_amount, sum_assured are parsed and preserved."""
        raw_output = {
            "document_type": "bank_statement",
            "overall_confidence": 0.94,
            "entities": [
                {
                    "entity_type": "insurance",
                    "display_name": "ABC Life Insurance",
                    "institution_name": "ABC Life Insurance",
                    "premium_amount": 4250.0,
                    "sum_assured": None,
                    "frequency": "monthly",
                    "currency": "INR",
                },
                {
                    "entity_type": "loan",
                    "display_name": "Home Loan",
                    "institution_name": "HDFC Bank",
                    "emi_amount": 35000.0,
                    "outstanding_amount": 4500000.0,
                    "frequency": "monthly",
                    "currency": "INR",
                },
                {
                    "entity_type": "mutual_fund",
                    "display_name": "Nifty 50 Index Fund",
                    "institution_name": "UTI AMC",
                    "investment_value": 150000.0,
                    "currency": "INR",
                },
            ],
            "evidence": [
                {
                    "field": "transaction_narration",
                    "value": "ABC LIFE INSURANCE — PREMIUM ECS ₹ 4,250",
                    "page": 1,
                    "source": "pdf_text",
                    "confidence": 0.95,
                }
            ],
            "warnings": [],
        }

        doc_type, conf, entities, evidence, warnings = AIValidationService.validate_and_normalize(
            raw_data=raw_output,
            actual_page_numbers=[1],
        )

        assert doc_type == DocumentType.BANK_STATEMENT
        assert len(entities) == 3

        # Entity 1: Insurance from bank statement ECS
        ins = entities[0]
        assert ins.display_name == "ABC Life Insurance"
        assert ins.premium_amount == 4250.0
        assert ins.sum_assured is None

        # Entity 2: Loan EMI
        loan = entities[1]
        assert loan.emi_amount == 35000.0
        assert loan.outstanding_amount == 4500000.0

        # Entity 3: Investment
        inv = entities[2]
        assert inv.investment_value == 150000.0

