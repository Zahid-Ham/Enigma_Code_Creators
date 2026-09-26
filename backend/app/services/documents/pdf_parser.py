"""PDF text extraction service utilizing PyMuPDF with pdfplumber fallback."""

import io

import fitz  # PyMuPDF
import pdfplumber

from app.core.logging import logger
from app.models.document_processing import EvidenceSource, PageContent


class PDFParser:
    """Extracts page-by-page text content from PDF documents."""

    @staticmethod
    def extract_pages(pdf_bytes: bytes) -> list[PageContent]:
        """Extract text from all pages preserving page indices (1-based).

        Attempts PyMuPDF first; falls back to pdfplumber for low-yield/table pages.
        """
        if not pdf_bytes:
            return []

        pages: list[PageContent] = []

        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            logger.info("PyMuPDF opened document with %d pages", len(doc))

            for page_idx in range(len(doc)):
                page_num = page_idx + 1
                page = doc[page_idx]
                text = page.get_text("text").strip()

                # If PyMuPDF yields very little text, try pdfplumber fallback
                if len(text) < 30:
                    try:
                        with pdfplumber.open(io.BytesIO(pdf_bytes)) as plumber_pdf:
                            if page_idx < len(plumber_pdf.pages):
                                plumber_text = (plumber_pdf.pages[page_idx].extract_text() or "").strip()
                                if len(plumber_text) > len(text):
                                    text = plumber_text
                    except Exception as e:  # noqa: BLE001
                        logger.debug("pdfplumber fallback skipped on page %d: %s", page_num, e)

                pages.append(
                    PageContent(
                        page_number=page_num,
                        text=text,
                        char_count=len(text),
                        source=EvidenceSource.PDF_TEXT,
                    )
                )

            doc.close()
            return pages

        except Exception as e:  # noqa: BLE001
            logger.error("Failed to parse PDF with PyMuPDF: %s", str(e), exc_info=True)
            # Final fallback: pure pdfplumber
            try:
                with pdfplumber.open(io.BytesIO(pdf_bytes)) as plumber_pdf:
                    fallback_pages: list[PageContent] = []
                    for idx, p in enumerate(plumber_pdf.pages):
                        p_text = (p.extract_text() or "").strip()
                        fallback_pages.append(
                            PageContent(
                                page_number=idx + 1,
                                text=p_text,
                                char_count=len(p_text),
                                source=EvidenceSource.PDF_TEXT,
                            )
                        )
                    return fallback_pages
            except Exception as plumber_err:  # noqa: BLE001
                logger.error("All PDF parsers failed: %s", str(plumber_err))
                return []


pdf_parser = PDFParser()
