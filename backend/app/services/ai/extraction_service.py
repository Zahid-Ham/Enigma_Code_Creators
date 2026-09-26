"""AI extraction orchestration service coordinating Groq AI and validation."""

from typing import Any

from app.core.logging import logger
from app.models.document_processing import (
    DocumentType,
    EvidenceItem,
    ExtractedEntity,
)
from app.services.ai.groq_client import GroqAIClient, groq_ai_client
from app.services.ai.validation_service import (
    AIValidationService,
    ai_validation_service,
)


class AIExtractionService:
    """Orchestrates AI intelligence extraction and validation for prepared documents."""

    def __init__(
        self,
        ai_client: GroqAIClient | None = None,
        validator: AIValidationService | None = None,
    ) -> None:
        self.ai_client = ai_client or groq_ai_client
        self.validator = validator or ai_validation_service

    async def analyze_document_content(
        self,
        document_text: str,
        filename: str,
        actual_page_numbers: list[int],
    ) -> tuple[DocumentType, float, list[ExtractedEntity], list[EvidenceItem], list[str]]:
        """Send content to Groq and return validated, strongly-typed extraction results."""
        logger.info("Executing Groq financial analysis for '%s'", filename)

        raw_result: dict[str, Any] = await self.ai_client.extract_financial_intelligence(
            document_text=document_text,
            filename=filename,
        )

        return self.validator.validate_and_normalize(
            raw_data=raw_result,
            actual_page_numbers=actual_page_numbers,
        )


ai_extraction_service = AIExtractionService()
