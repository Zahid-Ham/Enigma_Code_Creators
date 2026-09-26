"""Deterministic confidence scoring engine for discovered financial relationships."""

from typing import Any


class ConfidenceEngine:
    """Calculates deterministic confidence scores and relationship strengths based on evidence volume,

    document cross-referencing, recurring consistency, and nominee detection.
    """

    @classmethod
    def calculate_confidence(
        cls,
        occurrence_count: int,
        source_doc_count: int,
        amount_consistency: float = 1.0,
        has_direct_doc: bool = False,
        has_nominee: bool = False,
        category: str = "other",
    ) -> tuple[float, str, str]:
        """Returns (confidence_score, strength_label, status_label).

        Confidence score ranges from 0.50 to 0.99.
        Strength is 'Strong' | 'Moderate' | 'Weak' | 'Needs Review'.
        Status is 'Strong Match' | 'Verified' | 'Inferred' | 'Needs Review'.
        """
        base_score = 0.60

        # Frequency boost (up to +0.20)
        if occurrence_count >= 6:
            base_score += 0.20
        elif occurrence_count >= 3:
            base_score += 0.15
        elif occurrence_count >= 1:
            base_score += 0.08

        # Cross-document confirmation boost (+0.12 if present across >1 document or direct policy)
        if source_doc_count >= 2 or (source_doc_count >= 1 and has_direct_doc):
            base_score += 0.12
        elif source_doc_count >= 1:
            base_score += 0.05

        # Amount stability boost
        if amount_consistency >= 0.90:
            base_score += 0.05
        elif amount_consistency >= 0.70:
            base_score += 0.02

        # Nominee verification boost
        if has_nominee:
            base_score += 0.03

        confidence = min(0.99, max(0.50, round(base_score, 2)))

        # Determine strength & status
        if confidence >= 0.92:
            strength = "Strong"
            status = "Strong Match" if source_doc_count >= 2 else "Verified"
        elif confidence >= 0.80:
            strength = "Moderate"
            status = "Inferred"
        elif confidence >= 0.65:
            strength = "Low"
            status = "Inferred"
        else:
            strength = "Needs Review"
            status = "Needs Review"

        return confidence, strength, status


confidence_engine = ConfidenceEngine()
