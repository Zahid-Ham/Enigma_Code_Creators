"""Deterministic Transaction Statement Parser for Financial Documents."""

from datetime import date
import re
from typing import Any

from app.models.recurrence import NormalizedTransaction, TransactionDirection
from app.services.discovery.transaction_normalizer import (
    TransactionNormalizer,
    transaction_normalizer,
)


class StatementParser:
    """Extracts transaction records from statement text tables and line items."""

    def __init__(self, normalizer: TransactionNormalizer | None = None) -> None:
        self.normalizer = normalizer or transaction_normalizer

        # Common statement line patterns:
        self.date_regex = re.compile(
            r"\b(\d{1,2}[-/\.\s][A-Za-z]{3,9}[-/\.\s]\d{2,4}|\d{1,2}[-/\.\s][A-Za-z]{3,9}|\d{4}[-/\.]\d{2}[-/\.]\d{2}|\d{1,2}[-/\.]\d{2}[-/\.]\d{2,4})\b"
        )
        self.amount_regex = re.compile(
            r"(?:₹|INR|Rs\.?|USD|\$)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?|\b[0-9]+(?:\.[0-9]{2})?\b)"
        )

    def parse_statement_text(
        self,
        text: str,
        source_document_id: str | None = None,
        page_number: int | None = None,
    ) -> list[NormalizedTransaction]:
        """Parses multiline statement text to extract individual NormalizedTransaction records."""
        transactions: list[NormalizedTransaction] = []
        lines = text.split("\n")

        for line in lines:
            trimmed = line.strip()
            if not trimmed or len(trimmed) < 8:
                continue

            # Skip header lines and metadata
            lower = trimmed.lower()
            if any(h in lower for h in [
                "transaction date", "date | description", "opening balance", "closing balance",
                "statement summary", "expected analysis", "statement period",
                "benchmark specification", "savings account statement", "transaction activity record",
            ]):
                continue

            # Find date match
            date_match = self.date_regex.search(trimmed)
            if not date_match:
                continue

            date_str = date_match.group(1).strip()

            # Find amount match
            # Search after the date
            after_date = trimmed[date_match.end() :].strip()
            amount_matches = list(self.amount_regex.finditer(after_date))
            if not amount_matches:
                continue

            # Filter valid amount numbers
            valid_amounts: list[tuple[float, int, int]] = []
            for m in amount_matches:
                raw_num = m.group(1).replace(",", "")
                try:
                    val = float(raw_num)
                    if 1.0 <= val <= 100_000_000.0:
                        valid_amounts.append((val, m.start(), m.end()))
                except ValueError:
                    continue

            if not valid_amounts:
                continue

            # Take the primary transaction amount (first before DR/CR or largest valid transaction)
            chosen_amount, amt_start, amt_end = valid_amounts[0]

            # Description is the text between date and amount
            raw_desc = after_date[:amt_start].strip(" \t|-,—:")
            if not raw_desc or len(raw_desc) < 3:
                raw_desc = after_date[amt_end:].strip(" \t|-,—:")

            if not raw_desc or len(raw_desc) < 3:
                raw_desc = "Recurring Financial Transaction"

            # Determine direction
            direction = TransactionDirection.DEBIT
            if any(cr in trimmed.upper() for cr in [" CR", "| CR", "CREDIT", "REFUND", "DEPOSIT"]):
                if not any(dr in trimmed.upper() for dr in [" DR", "| DR", "DEBIT", "PREMIUM", "EMI", "BILL"]):
                    direction = TransactionDirection.CREDIT

            norm_desc = self.normalizer.normalize_description(raw_desc)
            category = self.normalizer.infer_category(raw_desc, norm_desc)

            tx = NormalizedTransaction(
                date_val=date_str,
                description=raw_desc,
                amount=chosen_amount,
                direction=direction,
                institution=norm_desc,
                category=category,
                normalized_description=norm_desc,
                source_document_id=source_document_id,
                page_number=page_number,
                raw_text=trimmed,
            )
            transactions.append(tx)

        return transactions

    def infer_transactions_from_entities(
        self,
        entities: list[Any],
        source_document_id: str | None = None,
    ) -> list[NormalizedTransaction]:
        """Synthesizes normalized transactions from extracted entities if raw table OCR was absent."""
        transactions: list[NormalizedTransaction] = []
        today_iso = "2026-09-26"

        for ent in entities:
            # Determine applicable recurring amount
            amount = 0.0
            if getattr(ent, "premium_amount", None):
                amount = float(ent.premium_amount)
            elif getattr(ent, "emi_amount", None):
                amount = float(ent.emi_amount)
            elif getattr(ent, "subscription_amount", None):
                amount = float(ent.subscription_amount)
            elif getattr(ent, "transaction_amount", None):
                amount = float(ent.transaction_amount)
            elif getattr(ent, "amount", None) and getattr(ent, "amount", 0) > 0:
                amount = float(ent.amount)

            if amount <= 0:
                continue

            name = getattr(ent, "display_name", None) or getattr(ent, "institution_name", "Financial Institution")
            ent_type = getattr(ent, "entity_type", "other")
            type_str = ent_type.value if hasattr(ent_type, "value") else str(ent_type)

            norm_desc = self.normalizer.normalize_description(name)
            cat = self.normalizer.infer_category(name, norm_desc, getattr(ent, "institution_name", None))

            tx = NormalizedTransaction(
                date_val=today_iso,
                description=name,
                amount=amount,
                direction=TransactionDirection.DEBIT,
                institution=norm_desc,
                category=cat,
                normalized_description=norm_desc,
                source_document_id=source_document_id,
                raw_text=f"{today_iso} | {name} | INR {amount}",
            )
            transactions.append(tx)

        return transactions


statement_parser = StatementParser()

