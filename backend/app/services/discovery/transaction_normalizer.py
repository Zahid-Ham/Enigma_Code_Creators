"""Deterministic Transaction Normalization for FINCLOSURE Recurrence Discovery."""

import re
from typing import ClassVar


class TransactionNormalizer:
    """Normalizes raw transaction descriptions, narratives, and merchant names

    to canonical institution/relationship identifiers without losing distinct entity identities.
    """

    # Delimiters frequently used to append transaction types
    DELIMITERS: ClassVar[list[str]] = ["—", "–", "-", "/", "\\", "|", ":", ";", "*", "#", "_", ","]

    # Payment system and transaction mode tokens
    PAYMENT_MODES: ClassVar[list[str]] = [
        "PREMIUM ECS",
        "PREMIUM NACH",
        "PREMIUM ACH",
        "PREMIUM AUTO DEBIT",
        "PREMIUM",
        "AUTO DEBIT",
        "AUTODEBIT",
        "DIRECT DEBIT",
        "DIRECT-DEBIT",
        "E-MANDATE",
        "EMANDATE",
        "ECS",
        "NACH",
        "ACH",
        "UPI",
        "NEFT",
        "RTGS",
        "IMPS",
        "POS",
        "CHQ",
        "CHEQUE",
    ]

    # Specific product/transaction type suffixes to strip
    TRANSACTION_TYPES: ClassVar[list[str]] = [
        "HOME LOAN EMI",
        "HOME LOAN - EMI",
        "HOME LOAN — EMI",
        "HOME LOAN",
        "PERSONAL LOAN EMI",
        "AUTO LOAN EMI",
        "CAR LOAN EMI",
        "LOAN EMI",
        "EMI PAYMENT",
        "EMI",
        "MONTHLY SUBSCRIPTION",
        "ANNUAL SUBSCRIPTION",
        "SUBSCRIPTION FEE",
        "SUBSCRIPTION PLAN",
        "MONTHLY PLAN",
        "SUBSCRIPTION",
        "MONTHLY SIP",
        "SIP INSTALLMENT",
        "SIP PURCHASE",
        "SIP PAYMENT",
        "MUTUAL FUND SIP",
        "SIP",
        "ELECTRICITY BILL",
        "POWER BILL",
        "WATER BILL",
        "GAS BILL",
        "UTILITY BILL",
        "BILL PAYMENT",
        "BILL DESK",
        "ONE TIME RENEWAL",
        "ONE-TIME RENEWAL",
        "ANNUAL RENEWAL",
        "POLICY RENEWAL",
        "RENEWAL PAYMENT",
        "RENEWAL",
        "ONE TIME",
        "ONE-TIME",
        "INSTALLMENT",
        "RECURRING",
        "RECHARGE",
        "PAYMENT",
        "DEBIT",
        "CREDIT",
    ]

    # Canonical aliases mapping for known merchant variations
    CANONICAL_ALIASES: ClassVar[dict[str, str]] = {
        "STREAMFLIX DIGITAL SERVICES": "STREAMFLIX",
        "STREAMFLIX OTT": "STREAMFLIX",
        "STREAMFLIX INDIA": "STREAMFLIX",
        "GREENWOOD MF": "GREENWOOD ASSET MANAGEMENT",
        "GREENWOOD MUTUAL FUND": "GREENWOOD ASSET MANAGEMENT",
        "GREENWOOD AM": "GREENWOOD ASSET MANAGEMENT",
        "GREENWOOD ASSET MGMT": "GREENWOOD ASSET MANAGEMENT",
        "GREENWOOD BALANCED GROWTH FUND": "GREENWOOD ASSET MANAGEMENT",
        "GREENWOOD BALANCED GROWTH": "GREENWOOD ASSET MANAGEMENT",
        "ABC LIFE INSURANCE POLICY": "ABC LIFE INSURANCE",
        "ABC LIFE INSURANCE CO": "ABC LIFE INSURANCE",
        "ABC LIFE": "ABC LIFE INSURANCE",
        "CITY POWER DISTRIBUTION CORP": "CITY POWER",
        "CITY POWER CORP": "CITY POWER",
        "CITY ELECTRICITY BOARD": "CITY POWER",
        "NATIONAL HOUSING BANK HOME LOAN": "NATIONAL HOUSING BANK",
    }

    # Category inference hints
    CATEGORY_KEYWORDS: ClassVar[dict[str, list[str]]] = {
        "income": ["SALARY", "PAYROLL", "STIPEND", "BONUS", "CYRUS", "WAGES", "EARNINGS"],
        "insurance": ["INSURANCE", "LIFE", "GENERAL", "ASSURANCE", "POLICY", "PREMIUM", "HEALTH"],
        "loan": ["LOAN", "HOUSING", "MORTGAGE", "EMI", "FINANCE", "DEBT"],
        "investment": ["ASSET MANAGEMENT", "MUTUAL FUND", "MF", "SIP", "SECURITIES", "WEALTH", "PORTFOLIO"],
        "subscription": ["STREAMFLIX", "NETFLIX", "SPOTIFY", "PRIME", "SUBSCRIPTION", "MEMBERSHIP"],
        "utility": ["POWER", "ELECTRICITY", "WATER", "GAS", "BROADBAND", "TELECOM", "BILL"],
        "tax": ["TAX", "INCOME TAX", "TDS", "CBDT", "GST"],
    }

    @classmethod
    def normalize_description(cls, raw_desc: str) -> str:
        """Deterministically normalizes a raw transaction narrative to its canonical merchant identity."""
        if not raw_desc:
            return "UNKNOWN"

        text = raw_desc.strip().upper()

        # Step 1: Check exact alias mapping first before stripping
        if text in cls.CANONICAL_ALIASES:
            return cls.CANONICAL_ALIASES[text]

        # Step 2: Clean punctuation delimiters while checking right-hand suffix tokens
        for delim in cls.DELIMITERS:
            if delim in text:
                parts = [p.strip() for p in text.split(delim)]
                # If right-hand part is just a known suffix/token, drop it
                first_part = parts[0].strip()
                second_part = " ".join(parts[1:]).strip()

                if cls._is_noise_phrase(second_part):
                    text = first_part
                else:
                    # Replace delimiter with space
                    text = " ".join(parts)

        # Step 3: Strip known trailing / embedded suffix phrases (longest phrases first)
        all_suffixes = sorted(cls.PAYMENT_MODES + cls.TRANSACTION_TYPES, key=len, reverse=True)
        for suffix in all_suffixes:
            # Check trailing suffix
            if text.endswith(" " + suffix) or text == suffix:
                text = text[: -len(suffix)].strip()
            # Check pattern like "NATIONAL HOUSING BANK HOME LOAN EMI"
            pattern = rf"\b{re.escape(suffix)}\b"
            text = re.sub(pattern, " ", text).strip()

        # Step 4: Clean remaining non-alphanumeric punctuation (except &)
        text = re.sub(r"[^\w\s&]", " ", text)

        # Step 5: Collapse multiple spaces
        text = re.sub(r"\s+", " ", text).strip()

        # Step 6: Check canonical aliases after cleanup
        if text in cls.CANONICAL_ALIASES:
            return cls.CANONICAL_ALIASES[text]

        return text or "UNKNOWN"

    @classmethod
    def _is_noise_phrase(cls, phrase: str) -> bool:
        """Determines if a sub-phrase consists solely of transaction type or payment noise."""
        clean = phrase.strip().upper()
        if not clean:
            return True

        for noise in cls.PAYMENT_MODES + cls.TRANSACTION_TYPES:
            if clean == noise or clean.startswith(noise) or clean.endswith(noise):
                return True
        return False

    @classmethod
    def infer_category(cls, raw_desc: str, normalized_name: str, institution: str | None = None) -> str:
        """Infers the financial category (insurance, loan, investment, subscription, utility, etc.)."""
        combined = f"{raw_desc} {normalized_name} {institution or ''}".upper()

        def has_kw(kws: list[str]) -> bool:
            for kw in kws:
                if len(kw) <= 3:
                    if re.search(rf"\b{re.escape(kw)}\b", combined):
                        return True
                else:
                    if kw in combined:
                        return True
            return False

        # Direct classification priorities
        if has_kw(["SALARY", "PAYROLL", "STIPEND", "BONUS", "CYRUS", "WAGES", "EARNINGS"]):
            return "income"
        if has_kw(["INSURANCE", "ASSURANCE", "POLICY", "PREMIUM"]):
            return "insurance"
        if has_kw(["HOUSING", "HOME LOAN", "LOAN", "MORTGAGE", "EMI"]):
            return "loan"
        if has_kw(["STREAMFLIX", "NETFLIX", "SPOTIFY", "SUBSCRIPTION", "PRIME", "OTT"]):
            return "subscription"
        if has_kw(["ASSET MANAGEMENT", "MUTUAL FUND", "MF", "SIP", "SECURITIES", "INVESTMENT"]):
            return "investment"
        if has_kw(["POWER", "ELECTRICITY", "WATER", "GAS", "UTILITY", "BILL"]):
            return "utility"
        if has_kw(["TAX", "INCOME TAX", "TDS", "CBDT", "GST"]):
            return "tax"

        return "other"

    @classmethod
    def to_display_name(cls, normalized_name: str) -> str:
        """Formats the normalized uppercase identifier to Title Case for human display."""
        if not normalized_name or normalized_name == "UNKNOWN":
            return "Unknown Relationship"

        # Special acronym preservation
        words = normalized_name.split()
        capitalized = []
        for w in words:
            if w in ("ABC", "NHB", "HDFC", "ICICI", "SBI", "LIC", "SIP", "EMI", "MF", "EPF", "PPF", "OTT"):
                capitalized.append(w)
            else:
                capitalized.append(w.capitalize())
        return " ".join(capitalized)


transaction_normalizer = TransactionNormalizer()
