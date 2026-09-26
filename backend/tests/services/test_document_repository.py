import pytest
from app.models.document_processing import (
    DocumentProcessingResult,
    DocumentType,
    EvidenceItem,
    EvidenceSource,
    ExtractedEntity,
    ProcessingStatus,
)
from app.models.financial_entity import (
    EntityType,
    NomineeStatus,
)
from app.services.documents.document_repository import (
    FirestoreDocumentRepository,
    InMemoryDocumentRepository,
)
from app.integrations.firebase.firestore import get_firestore_client


@pytest.mark.asyncio
async def test_in_memory_document_repository_lifecycle():
    """Test full document metadata, status, and result persistence lifecycle with InMemory repository."""
    repo = InMemoryDocumentRepository()
    doc_id = "test-doc-001"

    # 1. Save and retrieve document metadata
    meta = {
        "document_id": doc_id,
        "filename": "hdfc_statement.pdf",
        "content_type": "application/pdf",
        "file_size": 1024,
        "estate_id": "demo-estate-001",
    }
    await repo.save_document_metadata(doc_id, meta)
    retrieved_meta = await repo.get_document_metadata(doc_id)
    assert retrieved_meta is not None
    assert retrieved_meta["filename"] == "hdfc_statement.pdf"

    # 2. Update and retrieve processing status
    await repo.update_processing_status(
        document_id=doc_id,
        status="extracting",
        message="Extracting PDF pages...",
        progress=30,
    )
    status = await repo.get_processing_status(doc_id)
    assert status is not None
    assert status["status"] == "extracting"
    assert status["progress"] == 30

    # 3. Save and retrieve processing result
    result = DocumentProcessingResult(
        document_id=doc_id,
        status=ProcessingStatus.COMPLETED,
        document_type=DocumentType.BANK_STATEMENT,
        extracted_text_page_count=2,
        relevant_page_count=1,
        entities=[
            ExtractedEntity(
                entity_type=EntityType.INSURANCE,
                institution_name="ABC Life",
                display_name="Life Insurance Policy",
                premium_amount=4250.0,
                nominee_status=NomineeStatus.KNOWN,
            )
        ],
        evidence=[
            EvidenceItem(
                field="premium",
                value="4250",
                page=1,
                source=EvidenceSource.PDF_TEXT,
                confidence=0.95,
            )
        ],
        warnings=[],
        overall_confidence=0.92,
    )
    await repo.save_processing_result(doc_id, result.to_dict())

    persisted_result_dict = await repo.get_processing_result(doc_id)
    assert persisted_result_dict is not None
    reconstructed = DocumentProcessingResult.from_dict(persisted_result_dict)
    assert reconstructed.document_id == doc_id
    assert reconstructed.document_type == DocumentType.BANK_STATEMENT
    assert len(reconstructed.entities) == 1
    assert reconstructed.entities[0].premium_amount == 4250.0


@pytest.mark.asyncio
async def test_firestore_document_repository_if_configured():
    """Test Firestore Document Repository when credentials are present."""
    client = get_firestore_client()
    if not client:
        pytest.skip("Firestore client not configured in current environment")

    repo = FirestoreDocumentRepository(client)
    doc_id = "test-doc-firestore-001"

    # Save metadata
    meta = {
        "document_id": doc_id,
        "filename": "bank_statement_test.pdf",
        "content_type": "application/pdf",
        "file_size": 2048,
    }
    await repo.save_document_metadata(doc_id, meta)
    retrieved = await repo.get_document_metadata(doc_id)
    assert retrieved is not None
    assert retrieved["filename"] == "bank_statement_test.pdf"

    # Update status
    await repo.update_processing_status(
        document_id=doc_id,
        status="completed",
        message="Done",
        progress=100,
        document_type="bank_statement",
    )
    status = await repo.get_processing_status(doc_id)
    assert status is not None
    assert status["status"] == "completed"

    # Save result
    result = DocumentProcessingResult(
        document_id=doc_id,
        status=ProcessingStatus.COMPLETED,
        document_type=DocumentType.BANK_STATEMENT,
        extracted_text_page_count=1,
        relevant_page_count=1,
        entities=[
            ExtractedEntity(
                entity_type=EntityType.BANK_ACCOUNT,
                institution_name="HDFC Bank",
                display_name="Salary Account",
                amount=245000.0,
            )
        ],
        evidence=[],
        warnings=[],
        overall_confidence=0.96,
    )
    await repo.save_processing_result(doc_id, result.to_dict())

    result_dict = await repo.get_processing_result(doc_id)
    assert result_dict is not None
    assert result_dict["document_type"] == "bank_statement"
    assert len(result_dict["entities"]) == 1
    assert result_dict["entities"][0]["display_name"] == "Salary Account"

