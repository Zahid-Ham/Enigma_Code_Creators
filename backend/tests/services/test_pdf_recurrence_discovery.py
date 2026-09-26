"""End-to-end Verification Test for Multi-Month Recurring Transactions PDF."""

from pathlib import Path
import pymupdf
import pytest

from app.models.recurrence import AmountType, Cadence, RecurrenceStrength
from app.services.discovery.recurrence_engine import RecurrenceEngine
from app.services.discovery.recurrence_repository import InMemoryRecurrenceRepository
from app.services.discovery.recurrence_service import RecurrenceService
from app.services.discovery.statement_parser import statement_parser


@pytest.fixture
def test_pdf_path() -> Path:
    pdf_path = Path("data/samples/FINCLOSURE_Recurring_Transactions_Test.pdf")
    if not pdf_path.exists():
        from scripts.generate_recurring_test_pdf import create_recurring_transactions_pdf
        create_recurring_transactions_pdf(pdf_path)
    return pdf_path


def test_pdf_statement_parsing_and_recurrence_detection(test_pdf_path: Path):
    """Verifies that the synthetic 6-month bank statement PDF yields the exact

    expected recurring relationships and isolated transactions per the benchmark spec.
    """
    doc = pymupdf.open(str(test_pdf_path))
    assert len(doc) >= 2

    # Extract text from page 1 and page 2 (the actual statement tables)
    text_page1 = doc[0].get_text()
    text_page2 = doc[1].get_text()
    doc.close()

    txs_p1 = statement_parser.parse_statement_text(
        text_page1, source_document_id="bank-stmt-pdf", page_number=1
    )
    txs_p2 = statement_parser.parse_statement_text(
        text_page2, source_document_id="bank-stmt-pdf", page_number=2
    )
    all_txs = txs_p1 + txs_p2

    # Expect: 16 total transactions in the 6 months statement
    # Month 1: 5 txs
    # Month 2: 6 txs (includes SecureHealth)
    # Month 3: 5 txs
    # Month 4: 5 txs
    # Month 5: 5 txs
    # Month 6: 5 txs
    # Total = 31 debit transactions
    assert len(all_txs) == 31

    engine = RecurrenceEngine()
    relationships = engine.analyze_transactions("test-estate-001", all_txs)

    rel_by_name = {r.normalized_name: r for r in relationships}

    # Verify 1: ABC Life Insurance
    abc = rel_by_name.get("ABC LIFE INSURANCE")
    assert abc is not None, "ABC Life Insurance relationship not found"
    assert abc.occurrence_count == 6
    assert abc.cadence == Cadence.MONTHLY
    assert abc.amount_type == AmountType.FIXED
    assert abc.average_amount == 4250.0
    assert abc.recurrence_strength == RecurrenceStrength.STRONG

    # Verify 2: National Housing Bank
    nhb = rel_by_name.get("NATIONAL HOUSING BANK")
    assert nhb is not None, "National Housing Bank relationship not found"
    assert nhb.occurrence_count == 6
    assert nhb.cadence == Cadence.MONTHLY
    assert nhb.amount_type == AmountType.FIXED
    assert nhb.average_amount == 28600.0
    assert nhb.recurrence_strength == RecurrenceStrength.STRONG

    # Verify 3: Greenwood Asset Management
    greenwood = rel_by_name.get("GREENWOOD ASSET MANAGEMENT") or rel_by_name.get("GREENWOOD MF")
    assert greenwood is not None, "Greenwood relationship not found"
    assert greenwood.occurrence_count == 6
    assert greenwood.cadence == Cadence.MONTHLY
    assert greenwood.amount_type == AmountType.FIXED
    assert greenwood.average_amount == 10000.0
    assert greenwood.recurrence_strength == RecurrenceStrength.STRONG

    # Verify 4: Streamflix
    streamflix = rel_by_name.get("STREAMFLIX") or rel_by_name.get("STREAMFLIX DIGITAL SERVICES")
    assert streamflix is not None, "Streamflix relationship not found"
    assert streamflix.occurrence_count == 6
    assert streamflix.cadence == Cadence.MONTHLY
    assert streamflix.amount_type == AmountType.FIXED
    assert streamflix.average_amount == 699.0
    assert streamflix.recurrence_strength == RecurrenceStrength.STRONG

    # Verify 5: City Power
    city_power = rel_by_name.get("CITY POWER")
    assert city_power is not None, "City Power relationship not found"
    assert city_power.occurrence_count == 6
    assert city_power.cadence == Cadence.MONTHLY
    assert city_power.amount_type == AmountType.VARIABLE
    assert 2340.0 <= city_power.average_amount <= 2680.0
    assert city_power.recurrence_strength == RecurrenceStrength.STRONG

    # Verify 6: SecureHealth Insurance (Single isolated transaction)
    securehealth = rel_by_name.get("SECUREHEALTH INSURANCE")
    assert securehealth is not None, "SecureHealth relationship not found"
    assert securehealth.occurrence_count == 1
    assert securehealth.recurrence_strength == RecurrenceStrength.INSUFFICIENT


@pytest.mark.asyncio
async def test_pdf_recurrence_service_end_to_end(test_pdf_path: Path):
    """Verifies that RecurrenceService processes statement text, detects relationships,

    and persists them into the repository.
    """
    doc = pymupdf.open(str(test_pdf_path))
    full_text = doc[0].get_text() + "\n" + doc[1].get_text()
    doc.close()

    in_mem_repo = InMemoryRecurrenceRepository()
    service = RecurrenceService(repository=in_mem_repo, engine=RecurrenceEngine())

    discovered = await service.process_document_for_recurrence(
        estate_id="test-estate-002",
        document_id="doc-bank-stmt-002",
        statement_text=full_text,
    )

    assert len(discovered) == 6

    # Verify persisted relationships can be retrieved
    stored = await service.get_estate_recurring_relationships("test-estate-002")
    assert len(stored) == 6

    strong_rels = [r for r in stored if r.recurrence_strength == RecurrenceStrength.STRONG]
    assert len(strong_rels) == 5
