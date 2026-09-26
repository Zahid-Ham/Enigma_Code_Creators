"""Document processing pipeline orchestrating text extraction, OCR, relevance detection, and Groq AI analysis."""

import asyncio
import threading
import time
from datetime import datetime, timezone
from typing import Any

from app.core.exceptions import ResourceNotFoundError
from app.core.logging import logger
from app.models.document_processing import (
    DocumentProcessingResult,
    DocumentType,
    PageContent,
    ProcessingStatus,
)
from app.schemas.document_processing import (
    DocumentProcessingResultResponse,
    ProcessingStatusResponse,
)
from app.services.ai.extraction_service import (
    AIExtractionService,
    ai_extraction_service,
)
from app.services.documents.chunking import (
    DocumentChunker,
    document_chunker,
)
from app.services.documents.document_repository import (
    DocumentRepositoryProtocol,
    get_document_repository,
)
from app.services.documents.memory_storage import memory_storage
from app.services.documents.ocr_service import OCRService, ocr_service
from app.services.documents.pdf_parser import PDFParser, pdf_parser
from app.services.documents.relevance_detector import (
    RelevanceDetector,
    relevance_detector,
)


class DocumentProcessingService:
    """Orchestrates end-to-end extraction and AI intelligence generation for documents."""

    def __init__(
        self,
        parser: PDFParser | None = None,
        ocr: OCRService | None = None,
        detector: RelevanceDetector | None = None,
        chunker: DocumentChunker | None = None,
        extractor: AIExtractionService | None = None,
        repository: DocumentRepositoryProtocol | None = None,
    ) -> None:
        self.parser = parser or pdf_parser
        self.ocr = ocr or ocr_service
        self.detector = detector or relevance_detector
        self.chunker = chunker or document_chunker
        self.extractor = extractor or ai_extraction_service
        self.repository = repository or get_document_repository()

        self._lock = threading.Lock()
        self._states: dict[str, dict[str, Any]] = {}
        self._results: dict[str, DocumentProcessingResult] = {}

    def _get_progress_percentage(self, status: ProcessingStatus) -> int:
        mapping = {
            ProcessingStatus.PENDING: 0,
            ProcessingStatus.EXTRACTING: 30,
            ProcessingStatus.ANALYZING: 70,
            ProcessingStatus.COMPLETED: 100,
            ProcessingStatus.FAILED: 0,
        }
        return mapping.get(status, 0)

    def _get_default_message(self, status: ProcessingStatus) -> str:
        mapping = {
            ProcessingStatus.PENDING: "Document queued for processing",
            ProcessingStatus.EXTRACTING: "Extracting text and page structure...",
            ProcessingStatus.ANALYZING: "Analyzing financial information with Groq AI...",
            ProcessingStatus.COMPLETED: "Document processing completed successfully",
            ProcessingStatus.FAILED: "Document processing failed",
        }
        return mapping.get(status, "Processing")

    def _update_state(
        self,
        document_id: str,
        status: ProcessingStatus,
        message: str | None = None,
        document_type: DocumentType | None = None,
        error: str | None = None,
    ) -> ProcessingStatusResponse:
        with self._lock:
            state_data = {
                "document_id": document_id,
                "status": status,
                "progress": self._get_progress_percentage(status),
                "document_type": document_type,
                "message": message or self._get_default_message(status),
                "error": error,
            }
            self._states[document_id] = state_data

        try:
            loop = asyncio.get_running_loop()
            loop.create_task(
                self.repository.update_processing_status(
                    document_id=document_id,
                    status=status.value,
                    message=state_data["message"],
                    progress=state_data["progress"],
                    document_type=document_type.value if document_type else None,
                    error=error,
                )
            )
        except RuntimeError:
            pass

        return ProcessingStatusResponse.model_validate(state_data)

    async def get_processing_status(self, document_id: str) -> ProcessingStatusResponse:
        """Retrieve current processing status and progress for a document."""
        with self._lock:
            state_data = self._states.get(document_id)

        if not state_data:
            # Check persistent repository for status
            repo_status = await self.repository.get_processing_status(document_id)
            if repo_status:
                with self._lock:
                    self._states[document_id] = repo_status
                return ProcessingStatusResponse.model_validate(repo_status)

            # Check if document exists in memory storage or persistent metadata
            file_record = await memory_storage.get(document_id)
            if not file_record:
                meta = await self.repository.get_document_metadata(document_id)
                if not meta:
                    raise ResourceNotFoundError(
                        f"Document with ID '{document_id}' was not found.",
                        details={"document_id": document_id},
                    )
            return self._update_state(document_id, ProcessingStatus.PENDING)

        return ProcessingStatusResponse.model_validate(state_data)

    async def get_processing_result(self, document_id: str) -> DocumentProcessingResultResponse:
        """Retrieve complete structured intelligence result for a processed document."""
        with self._lock:
            result = self._results.get(document_id)

        if result:
            return DocumentProcessingResultResponse.model_validate(result.to_dict())

        # Check persistent repository for result
        persisted_result = await self.repository.get_processing_result(document_id)
        if persisted_result:
            result = DocumentProcessingResult.from_dict(persisted_result)
            with self._lock:
                self._results[document_id] = result
            return DocumentProcessingResultResponse.model_validate(result.to_dict())

        # Check status
        status_res = await self.get_processing_status(document_id)
        if status_res.status in (ProcessingStatus.PENDING, ProcessingStatus.EXTRACTING, ProcessingStatus.ANALYZING):
            return DocumentProcessingResultResponse(
                document_id=document_id,
                status=status_res.status,
                document_type=DocumentType.UNKNOWN,
                processed_at=datetime.now(timezone.utc),
                extracted_text_page_count=0,
                relevant_page_count=0,
                entities=[],
                evidence=[],
                warnings=[f"Document is currently in stage: {status_res.status.value}"],
                overall_confidence=0.0,
                error=None,
                processing_duration_ms=0,
            )

        raise ResourceNotFoundError(
            f"No processing result found for document '{document_id}'.",
            details={"document_id": document_id},
        )

    async def trigger_processing(
        self,
        document_id: str,
        force: bool = False,
    ) -> ProcessingStatusResponse:
        """Trigger background processing pipeline for a document."""
        file_record = await memory_storage.get(document_id)
        if not file_record:
            raise ResourceNotFoundError(
                f"Document with ID '{document_id}' was not found in storage.",
                details={"document_id": document_id},
            )

        with self._lock:
            existing_state = self._states.get(document_id)

        if existing_state and not force:
            curr_status = existing_state["status"]
            if curr_status in (ProcessingStatus.EXTRACTING, ProcessingStatus.ANALYZING):
                return ProcessingStatusResponse.model_validate(existing_state)
            if curr_status == ProcessingStatus.COMPLETED and document_id in self._results:
                return ProcessingStatusResponse.model_validate(existing_state)

        # Set pending and launch background processing task
        pending_state = self._update_state(document_id, ProcessingStatus.PENDING)
        asyncio.create_task(self.run_pipeline(document_id))
        return pending_state

    async def run_pipeline(self, document_id: str) -> DocumentProcessingResult:
        """Execute the full extraction and AI processing pipeline."""
        start_time = time.time()
        logger.info("Document processing pipeline started for '%s'", document_id)

        file_record = await memory_storage.get(document_id)
        if not file_record:
            err = f"Document '{document_id}' not found in storage"
            self._update_state(document_id, ProcessingStatus.FAILED, error=err)
            raise ResourceNotFoundError(err)

        file_bytes = file_record["file_bytes"]
        mime_type = file_record.get("content_type", "application/pdf").lower()
        original_filename = file_record.get("filename", "document.pdf")

        try:
            # Stage 1: Text Extraction & OCR
            self._update_state(
                document_id,
                ProcessingStatus.EXTRACTING,
                message="Extracting document text and pages...",
            )

            pages: list[PageContent] = []
            if mime_type == "application/pdf" or original_filename.lower().endswith(".pdf"):
                extracted_pages = self.parser.extract_pages(file_bytes)
                for page in extracted_pages:
                    # If page has insufficient text, attempt OCR
                    if len(page.text) < 30:
                        ocr_page = self.ocr.ocr_pdf_page(file_bytes, page.page_number)
                        if len(ocr_page.text) > len(page.text):
                            page = ocr_page
                    pages.append(page)
            else:
                # Standalone image OCR
                image_page = self.ocr.extract_image_text(file_bytes)
                pages.append(image_page)

            logger.info("Document text extraction completed (%d pages)", len(pages))

            # Stage 2: Relevance Detection
            relevant_pages = self.detector.detect_relevant_pages(pages)
            logger.info("Relevant pages identified: %d of %d pages", len(relevant_pages), len(pages))

            # Stage 3: Chunking & LLM Context Preparation
            context_text, included_page_numbers = self.chunker.prepare_llm_context(relevant_pages)
            if not context_text.strip():
                # Fallback to entire extracted text if relevance detector was too strict
                context_text = "\n\n".join([f"--- [PAGE {p.page_number}] ---\n{p.text}" for p in pages])
                included_page_numbers = [p.page_number for p in pages]

            # Stage 4: Groq AI Analysis
            self._update_state(
                document_id,
                ProcessingStatus.ANALYZING,
                message="Analyzing financial information with Groq AI...",
            )
            logger.info("Groq analysis started for '%s'", document_id)

            doc_type, confidence, entities, evidence, warnings = await self.extractor.analyze_document_content(
                document_text=context_text,
                filename=original_filename,
                actual_page_numbers=included_page_numbers if included_page_numbers else [1],
            )
            logger.info("Groq analysis completed: classified as '%s' with %d entities", doc_type.value, len(entities))

            # Extract transactions from statement text or infer from entities
            full_text = "\n".join([p.text for p in pages]) if pages else context_text
            extracted_tx_dicts = []
            parsed_txs = []
            try:
                from app.services.discovery.statement_parser import statement_parser
                parsed_txs = statement_parser.parse_statement_text(
                    text=full_text,
                    source_document_id=document_id,
                )
                if not parsed_txs and entities:
                    parsed_txs = statement_parser.infer_transactions_from_entities(
                        entities=entities,
                        source_document_id=document_id,
                    )
                
                extracted_tx_dicts = [
                    {
                        "id": getattr(tx, "transaction_id", f"tx-{document_id}-{i}"),
                        "date": str(getattr(tx, "date", getattr(tx, "date_val", ""))),
                        "description": getattr(tx, "description", ""),
                        "normalized_description": getattr(tx, "normalized_description", getattr(tx, "description", "")),
                        "category": tx.category.value if hasattr(getattr(tx, "category", None), "value") else str(getattr(tx, "category", "other")),
                        "direction": tx.direction.value if hasattr(getattr(tx, "direction", None), "value") else str(getattr(tx, "direction", "debit")),
                        "amount": float(getattr(tx, "amount", 0.0)),
                        "currency": getattr(tx, "currency", "INR"),
                        "raw_text": getattr(tx, "raw_text", ""),
                    }
                    for i, tx in enumerate(parsed_txs)
                ]
            except Exception as tx_err:
                logger.warning("Transaction extraction fallback encountered error for '%s': %s", document_id, str(tx_err))

            # Finalize Result
            duration_ms = int((time.time() - start_time) * 1000)
            result = DocumentProcessingResult(
                document_id=document_id,
                status=ProcessingStatus.COMPLETED,
                document_type=doc_type,
                processed_at=datetime.now(timezone.utc),
                extracted_text_page_count=len(pages),
                relevant_page_count=len(relevant_pages),
                entities=entities,
                evidence=evidence,
                warnings=warnings,
                transactions=extracted_tx_dicts,
                overall_confidence=confidence,
                error=None,
                processing_duration_ms=duration_ms,
            )

            with self._lock:
                self._results[document_id] = result

            self._update_state(
                document_id,
                ProcessingStatus.COMPLETED,
                message="Document processing completed successfully",
                document_type=doc_type,
            )

            # Persist full structured result to Firestore
            await self.repository.save_processing_result(document_id, result.to_dict())

            # Automatically extract transactions and discover recurring relationships
            try:
                from app.services.discovery.recurrence_service import recurrence_service
                meta = file_record.get("metadata", {})
                estate_id = meta.get("estate_id") if isinstance(meta, dict) else getattr(meta, "estate_id", None)
                if not estate_id:
                    doc_meta = await self.repository.get_document_metadata(document_id)
                    if doc_meta:
                        estate_id = doc_meta.get("estate_id") if isinstance(doc_meta, dict) else getattr(doc_meta, "estate_id", None)
                estate_id = estate_id or "demo-estate-001"

                if parsed_txs:
                    await recurrence_service.analyze_and_store_transactions(
                        estate_id=estate_id,
                        transactions=parsed_txs,
                    )
                    logger.info("Stored %d transactions and updated recurrence analysis for estate '%s'", len(parsed_txs), estate_id)
                elif full_text:
                    await recurrence_service.process_document_for_recurrence(
                        estate_id=estate_id,
                        document_id=document_id,
                        statement_text=full_text,
                        entities=entities,
                    )
                    logger.info("Recurrence analysis completed for document '%s' in estate '%s'", document_id, estate_id)
            except Exception as rec_exc:
                logger.warning("Recurrence discovery skipped or encountered non-fatal error for '%s': %s", document_id, str(rec_exc))

            logger.info("Document processing completed for '%s' in %d ms", document_id, duration_ms)
            return result

        except Exception as exc:  # noqa: BLE001
            duration_ms = int((time.time() - start_time) * 1000)
            error_message = str(exc)
            logger.error("Document processing failed for '%s': %s", document_id, error_message, exc_info=True)

            failed_result = DocumentProcessingResult(
                document_id=document_id,
                status=ProcessingStatus.FAILED,
                document_type=DocumentType.UNKNOWN,
                processed_at=datetime.now(timezone.utc),
                extracted_text_page_count=0,
                relevant_page_count=0,
                entities=[],
                evidence=[],
                warnings=[],
                overall_confidence=0.0,
                error=error_message,
                processing_duration_ms=duration_ms,
            )

            with self._lock:
                self._results[document_id] = failed_result

            self._update_state(
                document_id,
                ProcessingStatus.FAILED,
                message=f"Processing failed: {error_message}",
                error=error_message,
            )

            await self.repository.update_processing_status(
                document_id=document_id,
                status=ProcessingStatus.FAILED.value,
                error=error_message,
            )

            return failed_result


document_processing_service = DocumentProcessingService()
