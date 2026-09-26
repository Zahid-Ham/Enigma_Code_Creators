"""OCR extraction service for images and scanned PDF pages."""

import io

import fitz  # PyMuPDF
import pytesseract
from PIL import Image

from app.core.logging import logger
from app.models.document_processing import EvidenceSource, PageContent


class OCRService:
    """Provides OCR extraction for standalone images and scanned document pages."""

    @staticmethod
    def extract_image_text(image_bytes: bytes) -> PageContent:
        """Extract text from standalone image (JPG, JPEG, PNG)."""
        if not image_bytes:
            return PageContent(page_number=1, text="", source=EvidenceSource.OCR)

        try:
            image = Image.open(io.BytesIO(image_bytes))
            # Convert to RGB if palette/RGBA
            if image.mode not in ("L", "RGB"):
                image = image.convert("RGB")

            text = pytesseract.image_to_string(image).strip()
            logger.info("OCR successfully extracted %d characters from image", len(text))
            return PageContent(
                page_number=1,
                text=text,
                char_count=len(text),
                source=EvidenceSource.OCR,
            )
        except Exception as e:  # noqa: BLE001
            logger.warning("OCR image extraction failed or Tesseract not configured: %s", e)
            return PageContent(page_number=1, text="", source=EvidenceSource.OCR)

    @staticmethod
    def ocr_pdf_page(pdf_bytes: bytes, page_number: int) -> PageContent:
        """Render a specific PDF page to pixmap and perform OCR extraction."""
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            page_idx = page_number - 1
            if page_idx < 0 or page_idx >= len(doc):
                doc.close()
                return PageContent(page_number=page_number, text="", source=EvidenceSource.OCR)

            page = doc[page_idx]
            # Render at 2x matrix for high OCR accuracy
            matrix = fitz.Matrix(2, 2)
            pix = page.get_pixmap(matrix=matrix)
            img_bytes = pix.tobytes("png")
            doc.close()

            image = Image.open(io.BytesIO(img_bytes))
            text = pytesseract.image_to_string(image).strip()
            logger.info("OCR on PDF page %d yielded %d characters", page_number, len(text))
            return PageContent(
                page_number=page_number,
                text=text,
                char_count=len(text),
                source=EvidenceSource.OCR,
            )
        except Exception as e:  # noqa: BLE001
            logger.warning("OCR on PDF page %d skipped/failed: %s", page_number, e)
            return PageContent(page_number=page_number, text="", source=EvidenceSource.OCR)


ocr_service = OCRService()
