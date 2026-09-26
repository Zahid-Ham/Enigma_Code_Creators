"""Content preparation and chunking service for structured LLM extraction."""

from app.services.documents.relevance_detector import RelevantPage


class DocumentChunker:
    """Prepares structured, page-tagged document context for Groq AI analysis."""

    @staticmethod
    def prepare_llm_context(
        relevant_pages: list[RelevantPage],
        max_chars: int = 25000,
    ) -> tuple[str, list[int]]:
        """Combine relevant pages into a tagged prompt string preserving page numbers.

        Returns:
            tuple of (formatted_context_string, included_page_numbers)
        """
        if not relevant_pages:
            return "", []

        chunks: list[str] = []
        included_pages: list[int] = []
        current_length = 0

        for page in relevant_pages:
            page_header = f"\n\n--- [PAGE {page.page_number}] ---\n"
            page_body = page.text.strip()
            page_chunk = f"{page_header}{page_body}"

            if current_length + len(page_chunk) > max_chars and len(chunks) > 0:
                # Truncate remaining to fit budget
                remaining_budget = max_chars - current_length - len(page_header)
                if remaining_budget > 200:
                    truncated_body = page_body[:remaining_budget] + "\n...[truncated]..."
                    chunks.append(f"{page_header}{truncated_body}")
                    included_pages.append(page.page_number)
                break

            chunks.append(page_chunk)
            included_pages.append(page.page_number)
            current_length += len(page_chunk)

        context_str = "".join(chunks).strip()
        return context_str, included_pages


document_chunker = DocumentChunker()
