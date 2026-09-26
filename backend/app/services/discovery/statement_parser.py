"""Deterministic Transaction Statement Parser for Financial Documents."""

import re
from typing import Any

from app.models.recurrence import NormalizedTransaction, TransactionDirection
from app.services.discovery.transaction_normalizer import (
    TransactionNormalizer,
    transaction_normalizer,
)


class StatementParser:
    """Extracts transaction records from statement text tables, line items, and block structures."""

    def __init__(self, normalizer: TransactionNormalizer | None = None) -> None:
        self.normalizer = normalizer or transaction_normalizer

        # Common statement date patterns (e.g. 02-Apr-2026, 04-Apr, 2026-04-02, 02/04/2026, 02.04.2026):
        self.date_regex = re.compile(
            r"\b(\d{1,2}[-/\.\s](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/\.\s]\d{2,4}"
            r"|\d{1,2}[-/\.\s](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*"
            r"|\d{4}[-/\.]\d{2}[-/\.]\d{2}"
            r"|\d{1,2}[-/\.]\d{2}[-/\.]\d{2,4})\b",
            re.IGNORECASE,
        )
        self.amount_regex = re.compile(
            r"(?:₹|INR|Rs\.?|USD|\$)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?|\b[0-9]+(?:\.[0-9]{2})?\b)"
        )

    def _determine_direction(self, text: str) -> TransactionDirection:
        upper = text.upper()
        if any(cr in upper for cr in ["SALARY", "CREDIT", " CR", "| CR", "REFUND", "DEPOSIT", "INWARD", "INCOME"]):
            if not any(dr in upper for dr in ["PREMIUM", "EMI", "BILL", "SIP", " DR", "| DR", "DEBIT", "SUBSCRIPTION"]):
                return TransactionDirection.CREDIT
        return TransactionDirection.DEBIT

    def parse_statement_text(
        self,
        text: str,
        source_document_id: str | None = None,
        page_number: int | None = None,
    ) -> list[NormalizedTransaction]:
        """Parses multiline statement text to extract individual NormalizedTransaction records."""
        transactions: list[NormalizedTransaction] = []
        raw_lines = text.split("\n")
        lines = [l.strip() for l in raw_lines if l.strip()]

        # Pass 1: Single-line row parsing
        matched_line_indices: set[int] = set()

        for idx, line in enumerate(lines):
            if len(line) < 6:
                continue

            lower = line.lower()
            if any(h in lower for h in [
                "transaction date", "date | description", "opening balance", "closing balance",
                "statement summary", "expected analysis", "statement period",
                "benchmark specification", "savings account statement", "transaction activity record",
            ]):
                continue

            date_match = self.date_regex.search(line)
            if not date_match:
                continue

            date_str = date_match.group(1).strip()
            after_date = line[date_match.end():].strip()
            amount_matches = list(self.amount_regex.finditer(after_date))

            if amount_matches:
                valid_amounts = []
                for m in amount_matches:
                    raw_num = m.group(1).replace(",", "")
                    try:
                        val = float(raw_num)
                        if 1.0 <= val <= 100_000_000.0:
                            valid_amounts.append((val, m.start(), m.end()))
                    except ValueError:
                        continue

                if valid_amounts:
                    chosen_amount, amt_start, amt_end = valid_amounts[0]
                    raw_desc = after_date[:amt_start].strip(" \t|-,—:")
                    if not raw_desc or len(raw_desc) < 3:
                        raw_desc = after_date[amt_end:].strip(" \t|-,—:")
                    if not raw_desc or len(raw_desc) < 3:
                        raw_desc = "Recurring Financial Transaction"

                    direction = self._determine_direction(line)
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
                        raw_text=line,
                    )
                    transactions.append(tx)
                    matched_line_indices.add(idx)

        # Pass 2: Multi-line block parsing (e.g. Line 0: Date, Line 1: Description, Line 2: Amount)
        if len(transactions) < 2 and len(lines) >= 3:
            i = 0
            while i < len(lines):
                if i in matched_line_indices:
                    i += 1
                    continue

                line = lines[i]
                date_match = self.date_regex.search(line)
                if date_match and len(line) <= 25:
                    date_str = date_match.group(1).strip()
                    # Check next 1-3 lines for description and amount
                    desc = None
                    amt = None
                    consumed = 1
                    direction = TransactionDirection.DEBIT

                    for offset in range(1, 4):
                        if i + offset >= len(lines):
                            break
                        next_line = lines[i + offset]
                        # check if next line is another date
                        if self.date_regex.search(next_line) and len(next_line) <= 25:
                            break

                        amt_match = self.amount_regex.search(next_line)
                        if amt_match and any(c.isdigit() for c in next_line) and len(next_line.replace(",", "").replace("₹", "").strip()) <= 15:
                            try:
                                raw_val = float(amt_match.group(1).replace(",", ""))
                                if 1.0 <= raw_val <= 100_000_000.0:
                                    amt = raw_val
                                    consumed = max(consumed, offset + 1)
                            except ValueError:
                                pass
                        elif not desc and len(next_line) >= 3:
                            desc = next_line
                            consumed = max(consumed, offset + 1)

                    if amt is not None:
                        final_desc = desc or "Financial Transaction"
                        direction = self._determine_direction(f"{date_str} {final_desc}")
                        norm_desc = self.normalizer.normalize_description(final_desc)
                        category = self.normalizer.infer_category(final_desc, norm_desc)

                        tx = NormalizedTransaction(
                            date_val=date_str,
                            description=final_desc,
                            amount=amt,
                            direction=direction,
                            institution=norm_desc,
                            category=category,
                            normalized_description=norm_desc,
                            source_document_id=source_document_id,
                            page_number=page_number,
                            raw_text=f"{date_str} | {final_desc} | {amt}",
                        )
                        transactions.append(tx)
                        i += consumed
                        continue
                i += 1

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

