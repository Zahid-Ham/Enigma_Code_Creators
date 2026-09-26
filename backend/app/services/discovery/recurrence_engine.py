"""Deterministic Recurrence Analysis Engine for FINCLOSURE.

Analyzes normalized transaction streams across observation windows to discover
recurring financial relationships, evaluate cadence and amount consistency,
and detect recurrence gaps.
"""

from datetime import date, datetime
import math
import re
import statistics
from typing import Any
import uuid

from app.models.recurrence import (
    AmountType,
    Cadence,
    NormalizedTransaction,
    RecurrenceGap,
    RecurrenceStrength,
    RecurringRelationship,
)
from app.services.discovery.transaction_normalizer import (
    TransactionNormalizer,
    transaction_normalizer,
)


class RecurrenceEngine:
    """Deterministic analytical engine for recurring financial relationship discovery."""

    def __init__(self, normalizer: TransactionNormalizer | None = None) -> None:
        self.normalizer = normalizer or transaction_normalizer

    def parse_date(self, date_str: str | date) -> date:
        """Robust parser for multi-format dates in financial statements."""
        if isinstance(date_str, date) and not isinstance(date_str, datetime):
            return date_str
        if isinstance(date_str, datetime):
            return date_str.date()

        cleaned = str(date_str).strip()
        # Try standard ISO
        try:
            return datetime.strptime(cleaned, "%Y-%m-%d").date()
        except ValueError:
            pass

        # Try DD-Mon-YYYY (e.g. 04-Apr-2026 or 04-Apr-26)
        for fmt in (
            "%d-%b-%Y",
            "%d-%B-%Y",
            "%d/%m/%Y",
            "%d-%m-%Y",
            "%Y/%m/%d",
            "%d %b %Y",
            "%d %B %Y",
            "%b %d, %Y",
            "%B %d, %Y",
            "%d-%b-%y",
            "%d/%m/%y",
        ):
            try:
                return datetime.strptime(cleaned, fmt).date()
            except ValueError:
                continue

        # Try day-month formats without year (e.g. 04-Apr, 04-May, 04-Jun, 02 Apr, 15/04)
        for fmt in (
            "%d-%b",
            "%d-%B",
            "%d %b",
            "%d %B",
            "%b-%d",
            "%b %d",
            "%B %d",
            "%d/%m",
            "%d-%m",
        ):
            try:
                dt = datetime.strptime(cleaned, fmt)
                return dt.replace(year=2026).date()
            except ValueError:
                continue

        # Fallback to reference date 2026-09-26 if completely unparseable
        return date(2026, 9, 26)

    def deduplicate_transactions(
        self, transactions: list[NormalizedTransaction]
    ) -> list[NormalizedTransaction]:
        """Removes duplicate transaction records across overlapping statement files."""
        seen_keys: set[str] = set()
        deduped: list[NormalizedTransaction] = []

        for tx in transactions:
            key = tx.deduplication_key
            if key not in seen_keys:
                seen_keys.add(key)
                deduped.append(tx)

        return deduped

    def group_transactions(
        self, transactions: list[NormalizedTransaction]
    ) -> dict[str, list[NormalizedTransaction]]:
        """Groups normalized transactions by canonical institution identity and category."""
        groups: dict[str, list[NormalizedTransaction]] = {}

        for tx in transactions:
            # Ensure normalized description is computed
            if not tx.normalized_description:
                tx.normalized_description = self.normalizer.normalize_description(tx.description)
            if not tx.category or tx.category == "other":
                tx.category = self.normalizer.infer_category(
                    tx.description, tx.normalized_description, tx.institution
                )

            group_key = tx.normalized_description
            if group_key not in groups:
                groups[group_key] = []
            groups[group_key].append(tx)

        return groups

    def classify_cadence(self, intervals: list[int], avg_interval: float, median_interval: float) -> Cadence:
        """Deterministically classifies cadence from observed intervals in days."""
        if not intervals:
            return Cadence.IRREGULAR

        # 1-3 days -> daily
        if 1 <= avg_interval <= 3 and median_interval <= 4:
            return Cadence.DAILY

        # 5-9 days -> weekly
        if 5 <= avg_interval <= 9 or (5 <= median_interval <= 9 and len(intervals) >= 2):
            return Cadence.WEEKLY

        # 12-18 days -> biweekly
        if 12 <= avg_interval <= 18 or 12 <= median_interval <= 18:
            return Cadence.BIWEEKLY

        # 25-35 days -> monthly (allow realistic banking variance 24 to 36 days)
        if 24 <= avg_interval <= 36 or (25 <= median_interval <= 35 and len(intervals) >= 2):
            return Cadence.MONTHLY

        # 50-70 days -> bi-monthly
        if 50 <= avg_interval <= 70 or 50 <= median_interval <= 70:
            return Cadence.BIMONTHLY

        # 80-100 days -> quarterly
        if 80 <= avg_interval <= 100 or 80 <= median_interval <= 100:
            return Cadence.QUARTERLY

        # 170-200 days -> semi-annual
        if 165 <= avg_interval <= 205 or 165 <= median_interval <= 205:
            return Cadence.SEMIANNUAL

        # 330-400 days -> annual
        if 330 <= avg_interval <= 400 or 330 <= median_interval <= 400:
            return Cadence.ANNUAL

        return Cadence.IRREGULAR

    def classify_amount_type(
        self, amounts: list[float], amount_stddev: float, avg_amount: float
    ) -> tuple[AmountType, float]:
        """Calculates amount consistency score (0.0 to 1.0) and classifies amount behavior."""
        if not amounts or avg_amount <= 0:
            return AmountType.FIXED, 1.0

        min_amt = min(amounts)
        max_amt = max(amounts)
        spread_ratio = (max_amt - min_amt) / avg_amount if avg_amount > 0 else 0.0
        consistency = max(0.0, 1.0 - (amount_stddev / avg_amount))

        if amount_stddev <= 0.05 or spread_ratio <= 0.01:
            return AmountType.FIXED, 1.0
        elif consistency >= 0.70 or spread_ratio <= 0.35:
            return AmountType.VARIABLE, round(consistency, 2)
        else:
            return AmountType.IRREGULAR, round(consistency, 2)

    def detect_recurrence_gaps(
        self, sorted_dates: list[date], cadence: Cadence
    ) -> list[RecurrenceGap]:
        """Detects missing intermediate cycles in an otherwise active cadence."""
        gaps: list[RecurrenceGap] = []
        if len(sorted_dates) < 2 or cadence != Cadence.MONTHLY:
            return gaps

        first_d = sorted_dates[0]
        last_d = sorted_dates[-1]

        # Collect observed (year, month) pairs
        observed_months = {(d.year, d.month) for d in sorted_dates}

        # Iterate all expected months
        curr_y = first_d.year
        curr_m = first_d.month
        end_y = last_d.year
        end_m = last_d.month

        while (curr_y < end_y) or (curr_y == end_y and curr_m <= end_m):
            if (curr_y, curr_m) not in observed_months:
                month_name = date(curr_y, curr_m, 1).strftime("%B %Y")
                gaps.append(
                    RecurrenceGap(
                        expected_period=month_name,
                        expected_date=f"{curr_y:04d}-{curr_m:02d}-{first_d.day:02d}",
                        gap_type="missing_cycle",
                    )
                )

            curr_m += 1
            if curr_m > 12:
                curr_m = 1
                curr_y += 1

        return gaps

    def evaluate_recurrence_strength(
        self,
        occurrence_count: int,
        unique_month_count: int,
        cadence: Cadence,
        interval_consistency: float,
        amount_type: AmountType,
        gaps: list[RecurrenceGap],
    ) -> tuple[RecurrenceStrength, float]:
        """Evaluates relationship recurrence strength and confidence score."""
        # Rule 15: Minimum evidence rule
        if occurrence_count < 2:
            return RecurrenceStrength.INSUFFICIENT, 0.20

        if occurrence_count == 2:
            if cadence != Cadence.IRREGULAR:
                return RecurrenceStrength.WEAK, 0.50
            return RecurrenceStrength.INSUFFICIENT, 0.30

        # occurrence_count >= 3
        if cadence != Cadence.IRREGULAR:
            if len(gaps) == 0 and interval_consistency >= 0.70:
                # Strong consistent recurrence
                conf = min(0.99, 0.85 + (occurrence_count * 0.02))
                return RecurrenceStrength.STRONG, round(conf, 2)
            elif len(gaps) <= 1:
                # Moderate with minor gap
                return RecurrenceStrength.MODERATE, 0.75
            else:
                return RecurrenceStrength.WEAK, 0.60
        else:
            if unique_month_count >= 3 and amount_type in (AmountType.FIXED, AmountType.VARIABLE):
                return RecurrenceStrength.MODERATE, 0.65
            return RecurrenceStrength.WEAK, 0.45

    def map_relationship_type(self, category: str) -> str:
        """Maps category to semantic relationship classification."""
        mapping = {
            "insurance": "recurring insurance premium",
            "loan": "recurring loan EMI",
            "investment": "recurring SIP",
            "subscription": "recurring subscription",
            "utility": "recurring utility payment",
            "tax": "recurring tax payment",
        }
        return mapping.get(category.lower(), f"recurring {category} payment")

    def analyze_group(
        self,
        estate_id: str,
        normalized_name: str,
        transactions: list[NormalizedTransaction],
    ) -> RecurringRelationship:
        """Analyzes a single group of normalized transactions to build a RecurringRelationship."""
        # Sort transactions chronologically
        sorted_txs = sorted(
            transactions, key=lambda t: self.parse_date(t.date)
        )
        parsed_dates = [self.parse_date(t.date) for t in sorted_txs]

        occurrence_count = len(sorted_txs)
        unique_months = {d.strftime("%Y-%m") for d in parsed_dates}
        unique_month_count = len(unique_months)

        first_d = parsed_dates[0]
        last_d = parsed_dates[-1]
        obs_days = (last_d - first_d).days
        obs_months = max(1.0, round(obs_days / 30.4375, 1))

        # Intervals
        intervals_days: list[int] = []
        avg_interval = 0.0
        median_interval = 0.0
        interval_stddev = 0.0
        interval_consistency = 0.0

        if occurrence_count >= 2:
            intervals_days = [(d2 - d1).days for d1, d2 in zip(parsed_dates[:-1], parsed_dates[1:])]
            avg_interval = sum(intervals_days) / len(intervals_days)
            median_interval = float(statistics.median(intervals_days))
            interval_stddev = float(statistics.stdev(intervals_days)) if len(intervals_days) > 1 else 0.0
            if avg_interval > 0:
                interval_consistency = max(0.0, 1.0 - (interval_stddev / avg_interval))

        # Cadence
        cadence = self.classify_cadence(intervals_days, avg_interval, median_interval)

        # Amount Statistics
        amounts = [t.amount for t in sorted_txs]
        avg_amount = sum(amounts) / len(amounts)
        median_amount = float(statistics.median(amounts))
        min_amount = min(amounts)
        max_amount = max(amounts)
        amount_stddev = float(statistics.stdev(amounts)) if len(amounts) > 1 else 0.0
        amount_var = float(statistics.variance(amounts)) if len(amounts) > 1 else 0.0
        amount_type, amount_consistency = self.classify_amount_type(amounts, amount_stddev, avg_amount)

        # Gaps
        gaps = self.detect_recurrence_gaps(parsed_dates, cadence)

        # Recurrence Strength & Confidence
        strength, confidence = self.evaluate_recurrence_strength(
            occurrence_count=occurrence_count,
            unique_month_count=unique_month_count,
            cadence=cadence,
            interval_consistency=interval_consistency,
            amount_type=amount_type,
            gaps=gaps,
        )

        # Display and category resolution
        primary_category = sorted_txs[0].category or "other"
        display_name = self.normalizer.to_display_name(normalized_name)
        original_names = list({t.description for t in sorted_txs})
        evidence_ids = [t.transaction_id for t in sorted_txs]
        source_doc_ids = list({t.source_document_id for t in sorted_txs if t.source_document_id})
        relationship_type = self.map_relationship_type(primary_category)

        clean_slug = re.sub(r"[^a-zA-Z0-9]+", "_", normalized_name.lower()).strip("_")
        rel_id = f"rel-{clean_slug}" if clean_slug else f"rel-{uuid.uuid4().hex[:8]}"

        return RecurringRelationship(
            relationship_id=rel_id,
            estate_id=estate_id,
            normalized_name=normalized_name,
            display_name=display_name,
            category=primary_category,
            direction=sorted_txs[0].direction.value if hasattr(sorted_txs[0].direction, "value") else str(sorted_txs[0].direction),
            original_names=original_names,
            occurrence_count=occurrence_count,
            unique_month_count=unique_month_count,
            first_observed_date=first_d.isoformat(),
            last_observed_date=last_d.isoformat(),
            observation_days=obs_days,
            observation_months=obs_months,
            intervals_days=intervals_days,
            average_interval_days=avg_interval,
            median_interval_days=median_interval,
            interval_stddev=interval_stddev,
            interval_consistency=interval_consistency,
            average_amount=avg_amount,
            median_amount=median_amount,
            min_amount=min_amount,
            max_amount=max_amount,
            amount_stddev=amount_stddev,
            amount_variance=amount_var,
            amount_type=amount_type,
            amount_consistency=amount_consistency,
            cadence=cadence,
            recurrence_strength=strength,
            recurrence_gaps=gaps,
            relationship_type=relationship_type,
            evidence_transaction_ids=evidence_ids,
            source_document_ids=source_doc_ids,
            status="inferred",
            confidence=confidence,
        )

    def analyze_transactions(
        self,
        estate_id: str,
        transactions: list[NormalizedTransaction],
    ) -> list[RecurringRelationship]:
        """Analyzes all transactions for an estate across all source documents

        and returns discovered recurring relationships.
        """
        if not transactions:
            return []

        # 1. Deduplicate cross-document overlaps
        deduped = self.deduplicate_transactions(transactions)

        # 2. Group by normalized merchant identity
        groups = self.group_transactions(deduped)

        # 3. Analyze each group
        relationships: list[RecurringRelationship] = []
        for norm_name, tx_list in groups.items():
            rel = self.analyze_group(estate_id, norm_name, tx_list)
            relationships.append(rel)

        # Sort: strong first, then by occurrence count descending
        order = {
            RecurrenceStrength.STRONG: 0,
            RecurrenceStrength.MODERATE: 1,
            RecurrenceStrength.WEAK: 2,
            RecurrenceStrength.INSUFFICIENT: 3,
        }
        relationships.sort(key=lambda r: (order.get(r.recurrence_strength, 4), -r.occurrence_count))
        return relationships


recurrence_engine = RecurrenceEngine()
