"""Deterministic financial relevance detection service for filtering pages before AI analysis."""

import re

from app.models.document_processing import PageContent

FINANCIAL_KEYWORDS_MAP = {
    "insurance": [
        "insurance", "policy", "premium", "sum assured", "insured", "death benefit",
        "annuity", "claim", "coverage", "lic", "hdfc life", "icici pru", "max life", "sbi life"
    ],
    "nominee": [
        "nominee", "nomination", "beneficiary", "appointee", "relation to insured"
    ],
    "bank_account": [
        "bank", "account number", "a/c", "ifsc", "savings", "current", "balance",
        "debit", "credit", "transaction", "statement of account", "sbi", "hdfc", "icici", "axis"
    ],
    "loan_and_emi": [
        "loan", "emi", "borrower", "lender", "principal", "interest rate", "outstanding",
        "disbursement", "sanction", "tenure", "moratorium", "foreclosure"
    ],
    "investments": [
        "mutual fund", "folio", "nav", "units", "demat", "shares", "equity", "debt",
        "portfolio", "zerodha", "groww", "cams", "kfintech", "dividend", "sebi"
    ],
    "deposits": [
        "fixed deposit", "fd", "term deposit", "recurring deposit", "rd", "maturity amount", "roi"
    ],
    "statutory_savings": [
        "epf", "uan", "provident fund", "pf balance", "epfo", "ppf", "public provident fund", "nps", "pran"
    ],
    "tax_and_gov": [
        "income tax", "itr", "form 16", "form 26as", "pan", "tds", "assessment year", "financial year", "ay"
    ],
    "bills_and_recurring": [
        "utility bill", "electricity", "water", "gas", "broadband", "mobile postpaid", "subscription"
    ],
}


class RelevantPage:
    """Page identified as containing relevant financial evidence."""

    def __init__(
        self,
        page_number: int,
        text: str,
        relevance_score: float,
        reasons: list[str],
    ) -> None:
        self.page_number = page_number
        self.text = text
        self.relevance_score = relevance_score
        self.reasons = reasons

    def to_dict(self) -> dict:
        return {
            "page_number": self.page_number,
            "relevance_score": self.relevance_score,
            "reasons": self.reasons,
        }


class RelevanceDetector:
    """Filters and scores pages based on deterministic financial signal analysis."""

    @staticmethod
    def detect_relevant_pages(pages: list[PageContent]) -> list[RelevantPage]:
        """Evaluate page content against financial dictionary and return scored pages."""
        if not pages:
            return []

        scored_pages: list[RelevantPage] = []

        for page in pages:
            lower_text = page.text.lower()
            matched_reasons: list[str] = []
            hit_count = 0

            for category, keywords in FINANCIAL_KEYWORDS_MAP.items():
                for kw in keywords:
                    if re.search(rf"\b{re.escape(kw)}\b", lower_text):
                        hit_count += 1
                        if category not in matched_reasons:
                            matched_reasons.append(category)

            # Check monetary patterns (₹, Rs, INR, numbers with commas)
            has_currency = bool(re.search(r"(?:₹|rs\.?|inr)\s*[\d,]+(?:\.\d+)?", lower_text))
            if has_currency:
                hit_count += 2
                if "currency_amount" not in matched_reasons:
                    matched_reasons.append("currency_amount")

            score = min(1.0, round(hit_count / 8.0, 2))

            # If document has <= 5 pages, keep all non-empty pages; otherwise filter by signals
            is_relevant = (len(pages) <= 5 and len(lower_text) > 20) or score > 0.1 or page.page_number == 1

            if is_relevant:
                scored_pages.append(
                    RelevantPage(
                        page_number=page.page_number,
                        text=page.text,
                        relevance_score=max(0.1, score),
                        reasons=matched_reasons if matched_reasons else ["document_overview"],
                    )
                )

        return scored_pages


relevance_detector = RelevanceDetector()
