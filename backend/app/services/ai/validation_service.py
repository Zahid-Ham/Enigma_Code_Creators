"""AI extraction validation, schema enforcement, and normalization service."""

from typing import Any

from app.core.logging import logger
from app.models.document_processing import (
    DocumentType,
    EvidenceItem,
    EvidenceSource,
    ExtractedEntity,
)
from app.models.financial_entity import EntityStatus, EntityType, NomineeStatus


class AIValidationService:
    """Validates, sanitizes, and normalizes raw JSON data returned by the LLM."""

    @staticmethod
    def validate_and_normalize(
        raw_data: dict[str, Any],
        actual_page_numbers: list[int],
    ) -> tuple[DocumentType, float, list[ExtractedEntity], list[EvidenceItem], list[str]]:
        """Validate LLM output and return strongly-typed domain models.

        Args:
            raw_data: JSON dictionary from LLM.
            actual_page_numbers: Valid 1-based page indices from the extracted document.

        Returns:
            tuple of (document_type, overall_confidence, entities, evidence, warnings)
        """
        warnings: list[str] = list(raw_data.get("warnings") or [])

        # 1. Document Type Validation
        raw_doc_type = str(raw_data.get("document_type", "unknown")).lower().strip()
        try:
            document_type = DocumentType(raw_doc_type)
        except ValueError:
            logger.warning("Unrecognized document_type '%s'; falling back to UNKNOWN", raw_doc_type)
            document_type = DocumentType.UNKNOWN
            warnings.append(f"AI returned non-standard document category '{raw_doc_type}'.")

        # 2. Overall Confidence Validation
        try:
            overall_confidence = float(raw_data.get("overall_confidence", 0.85))
            overall_confidence = max(0.0, min(1.0, overall_confidence))
        except (ValueError, TypeError):
            overall_confidence = 0.5

        # 3. Entities Validation
        entities: list[ExtractedEntity] = []
        raw_entities = raw_data.get("entities") or []

        for item in raw_entities:
            if not isinstance(item, dict):
                continue

            display_name = str(item.get("display_name") or "").strip()
            if not display_name:
                continue

            # Entity Type
            raw_type = str(item.get("entity_type", "other")).lower().strip()
            try:
                entity_type = EntityType(raw_type)
            except ValueError:
                entity_type = EntityType.OTHER

            def _parse_amount(val: Any) -> float | None:
                if val is None:
                    return None
                try:
                    res = float(val)
                    return abs(res)
                except (ValueError, TypeError):
                    return None

            amount = _parse_amount(item.get("amount"))
            premium_amount = _parse_amount(item.get("premium_amount"))
            sum_assured = _parse_amount(item.get("sum_assured"))
            emi_amount = _parse_amount(item.get("emi_amount"))
            outstanding_amount = _parse_amount(item.get("outstanding_amount"))
            investment_value = _parse_amount(item.get("investment_value"))
            subscription_amount = _parse_amount(item.get("subscription_amount"))
            transaction_amount = _parse_amount(item.get("transaction_amount"))
            account_balance = _parse_amount(item.get("account_balance"))
            maturity_amount = _parse_amount(item.get("maturity_amount"))
            tax_amount = _parse_amount(item.get("tax_amount"))

            # Entity Status (Default to INFERRED)
            raw_status = str(item.get("status", "inferred")).lower().strip()
            try:
                status = EntityStatus(raw_status)
            except ValueError:
                status = EntityStatus.INFERRED

            # Confidence
            try:
                confidence = float(item.get("confidence", 0.85))
                confidence = max(0.0, min(1.0, confidence))
            except (ValueError, TypeError):
                confidence = 0.85

            # Nominee Status
            raw_nominee = str(item.get("nominee_status", "unverified")).lower().strip()
            try:
                nominee_status = NomineeStatus(raw_nominee)
            except ValueError:
                nominee_status = NomineeStatus.UNVERIFIED

            entities.append(
                ExtractedEntity(
                    entity_type=entity_type,
                    display_name=display_name,
                    institution_name=item.get("institution_name"),
                    account_reference=item.get("account_reference"),
                    amount=amount,
                    premium_amount=premium_amount,
                    sum_assured=sum_assured,
                    emi_amount=emi_amount,
                    outstanding_amount=outstanding_amount,
                    investment_value=investment_value,
                    subscription_amount=subscription_amount,
                    transaction_amount=transaction_amount,
                    account_balance=account_balance,
                    maturity_amount=maturity_amount,
                    tax_amount=tax_amount,
                    currency=str(item.get("currency") or "INR").upper(),
                    frequency=item.get("frequency"),
                    status=status,
                    confidence=confidence,
                    nominee_status=nominee_status,
                    notes=item.get("notes"),
                )
            )

        # 4. Evidence Validation & Page Integrity
        evidence: list[EvidenceItem] = []
        raw_evidence = raw_data.get("evidence") or []
        valid_page_set = set(actual_page_numbers) if actual_page_numbers else {1}

        for ev in raw_evidence:
            if not isinstance(ev, dict):
                continue

            field = str(ev.get("field") or "fact").strip()
            value = str(ev.get("value") or "").strip()
            if not value:
                continue

            # Page verification
            try:
                page_num = int(ev.get("page", 1))
            except (ValueError, TypeError):
                page_num = 1

            if actual_page_numbers and page_num not in valid_page_set:
                # Clamp to nearest valid page and log warning
                nearest_page = min(actual_page_numbers, key=lambda p: abs(p - page_num))
                warnings.append(f"Adjusted hallucinated evidence page {page_num} to valid document page {nearest_page}.")
                page_num = nearest_page

            # Source
            raw_src = str(ev.get("source", "pdf_text")).lower().strip()
            source = EvidenceSource.OCR if "ocr" in raw_src else EvidenceSource.PDF_TEXT

            # Confidence
            try:
                conf = float(ev.get("confidence", 0.9))
                conf = max(0.0, min(1.0, conf))
            except (ValueError, TypeError):
                conf = 0.9

            evidence.append(
                EvidenceItem(
                    field=field,
                    value=value,
                    page=page_num,
                    source=source,
                    confidence=conf,
                )
            )

        return document_type, overall_confidence, entities, evidence, warnings


ai_validation_service = AIValidationService()
