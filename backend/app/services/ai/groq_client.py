"""Groq AI client wrapper for structured financial intelligence extraction."""

import json
from typing import Any

from groq import AsyncGroq

from app.core.config import settings
from app.core.exceptions import ConfigurationError
from app.core.logging import logger
from app.services.ai.prompts import (
    DOCUMENT_EXTRACTION_SYSTEM_PROMPT,
    build_extraction_user_prompt,
)


class GroqAIClient:
    """Manages communication with Groq LLM API with structured JSON output."""

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self._api_key = api_key
        self._model = model
        self._client: AsyncGroq | None = None

    @property
    def model(self) -> str:
        return self._model or settings.GROQ_MODEL

    def _get_client(self) -> AsyncGroq:
        """Initialize or return AsyncGroq client singleton."""
        api_key = self._api_key or settings.GROQ_API_KEY
        if not api_key or not api_key.strip():
            logger.error("Groq API key is missing in backend configuration")
            raise ConfigurationError(
                "GROQ_API_KEY is not configured. Please supply a valid Groq API key in backend/.env"
            )

        if self._client is None or self._api_key != api_key:
            self._client = AsyncGroq(api_key=api_key, timeout=settings.PROCESSING_TIMEOUT_SECONDS)
        return self._client

    async def extract_financial_intelligence(
        self,
        document_text: str,
        filename: str = "document.pdf",
    ) -> dict[str, Any]:
        """Send extracted document context to Groq and return parsed JSON result."""
        client = self._get_client()
        user_prompt = build_extraction_user_prompt(document_text, filename)

        logger.info(
            "Dispatching document extraction prompt to Groq (model: %s, chars: %d)",
            self.model,
            len(document_text),
        )

        try:
            response = await client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": DOCUMENT_EXTRACTION_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
                max_tokens=4096,
            )

            raw_content = response.choices[0].message.content or "{}"
            logger.info("Received raw response from Groq (%d chars)", len(raw_content))

            # Parse JSON
            parsed_data = json.loads(raw_content)
            return parsed_data

        except json.JSONDecodeError as jde:
            logger.error("Failed to parse Groq response as JSON: %s", jde)
            raise ValueError(f"Groq returned malformed JSON: {jde}") from jde
        except Exception as e:
            logger.error("Groq API call failed: %s", e, exc_info=True)
            raise


groq_ai_client = GroqAIClient()
