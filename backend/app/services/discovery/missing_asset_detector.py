"""Deterministic rule engine for detecting missing assets and financial risks."""

import uuid
from typing import Any

from app.models.recurrence import RecurringRelationship
from app.schemas.discovery import (
    EvidenceSourceDocument,
    MissingAssetSchema,
    RiskAlertSchema,
)


class MissingAssetDetector:
    """Evaluates cross-document coverage to detect missing financial assets and risk alerts."""

    @classmethod
    def detect_missing_assets(
        cls,
        estate_id: str,
        relationships: list[RecurringRelationship],
        processed_documents: list[dict[str, Any]],
    ) -> tuple[list[MissingAssetSchema], list[RiskAlertSchema]]:
        """Compares discovered recurring relationships against uploaded standalone documents

        to surface potential missing master documents, unlinked assets, and nominee risks.
        """
        missing_assets: list[MissingAssetSchema] = []
        risk_alerts: list[RiskAlertSchema] = []

        # Index available document types by canonical type and institution
        doc_types = {d.get("document_type") for d in processed_documents if d.get("document_type")}
        has_insurance_doc = any(dt in ("insurance_policy", "life_insurance", "health_insurance") for dt in doc_types)
        has_loan_doc = any(dt in ("loan_statement", "home_loan", "personal_loan") for dt in doc_types)
        has_investment_doc = any(dt in ("investment_statement", "mutual_fund", "mf_statement") for dt in doc_types)

        # Track institutions with master documents
        institutions_with_docs: set[str] = set()
        for doc in processed_documents:
            entities = doc.get("entities", [])
            for ent in entities:
                inst = (ent.get("institution_name") or ent.get("institution") or "").strip().upper()
                if inst:
                    institutions_with_docs.add(inst)
            # Also check document details
            policy_inst = (doc.get("policy_details", {}) or {}).get("insurer_name")
            if policy_inst:
                institutions_with_docs.add(policy_inst.strip().upper())
            loan_inst = (doc.get("loan_details", {}) or {}).get("lender_name")
            if loan_inst:
                institutions_with_docs.add(loan_inst.strip().upper())
            inv_inst = (doc.get("investment_details", {}) or {}).get("fund_house")
            if inv_inst:
                institutions_with_docs.add(inv_inst.strip().upper())

        # Evaluate each discovered recurring relationship
        for rel in relationships:
            norm_name = (rel.normalized_name or "").strip().upper()
            cat = rel.category.lower()
            disp_name = rel.display_name

            # Check if this relationship has a dedicated master document
            has_dedicated_doc = any(inst in norm_name or norm_name in inst for inst in institutions_with_docs)

            # Rule 1: Health / Insurance premium detected without policy document
            if cat == "insurance" and not (has_dedicated_doc and has_insurance_doc):
                # E.g. SecureHealth, Health Insurance, or Life Insurance with no policy
                title = f"{disp_name} Policy" if "Insurance" not in disp_name else disp_name
                missing_assets.append(
                    MissingAssetSchema(
                        missing_asset_id=f"miss-{uuid.uuid4().hex[:8]}",
                        estate_id=estate_id,
                        title=title,
                        category="insurance",
                        institution_name=disp_name,
                        reason="Inferred from recurring patterns. No policy document found.",
                        evidence=(
                            f"Inferred from {rel.occurrence_count} recurring transactions totaling "
                            f"₹{int(rel.average_amount * rel.occurrence_count):,} in Bank Statement."
                        ),
                        occurrence_count=rel.occurrence_count,
                        average_amount=rel.average_amount,
                        source_document_ids=rel.source_document_ids,
                        source_documents=[
                            EvidenceSourceDocument(
                                document_id=doc_id,
                                filename=cls._find_doc_name(doc_id, processed_documents),
                                doc_type="bank_statement",
                                pages="1–3",
                            )
                            for doc_id in rel.source_document_ids
                        ],
                        confidence=0.92,
                        severity="high",
                        status="needs_review",
                        recommended_action=(
                            f"Upload the official policy document from {disp_name} to verify coverage "
                            "amount, claim procedure, and registered beneficiary/nominee details."
                        ),
                    )
                )

            # Rule 2: Investment SIP detected without investment statement
            elif cat == "investment" and not (has_dedicated_doc and has_investment_doc):
                missing_assets.append(
                    MissingAssetSchema(
                        missing_asset_id=f"miss-{uuid.uuid4().hex[:8]}",
                        estate_id=estate_id,
                        title=f"{disp_name} Portfolio",
                        category="investment",
                        institution_name=disp_name,
                        reason="Inferred from SIP transactions. No detailed statement found.",
                        evidence=(
                            f"Inferred from {rel.occurrence_count} recurring SIP transactions totaling "
                            f"₹{int(rel.average_amount * rel.occurrence_count):,} in Bank Statement."
                        ),
                        occurrence_count=rel.occurrence_count,
                        average_amount=rel.average_amount,
                        source_document_ids=rel.source_document_ids,
                        source_documents=[
                            EvidenceSourceDocument(
                                document_id=doc_id,
                                filename=cls._find_doc_name(doc_id, processed_documents),
                                doc_type="bank_statement",
                                pages="1–3",
                            )
                            for doc_id in rel.source_document_ids
                        ],
                        confidence=0.90,
                        severity="medium",
                        status="inferred",
                        recommended_action=(
                            f"Upload the latest Consolidated Account Statement (CAS) or {disp_name} "
                            "statement to record accumulated units, current valuation, and nominee records."
                        ),
                    )
                )

            # Rule 3: Loan EMI detected without loan sanction/statement
            elif cat == "loan" and not (has_dedicated_doc and has_loan_doc):
                missing_assets.append(
                    MissingAssetSchema(
                        missing_asset_id=f"miss-{uuid.uuid4().hex[:8]}",
                        estate_id=estate_id,
                        title=f"{disp_name} Loan Account",
                        category="loan",
                        institution_name=disp_name,
                        reason="Inferred from recurring EMI payments. No loan statement found.",
                        evidence=(
                            f"Inferred from {rel.occurrence_count} recurring EMI debits totaling "
                            f"₹{int(rel.average_amount * rel.occurrence_count):,} in Bank Statement."
                        ),
                        occurrence_count=rel.occurrence_count,
                        average_amount=rel.average_amount,
                        source_document_ids=rel.source_document_ids,
                        source_documents=[
                            EvidenceSourceDocument(
                                document_id=doc_id,
                                filename=cls._find_doc_name(doc_id, processed_documents),
                                doc_type="bank_statement",
                                pages="1–3",
                            )
                            for doc_id in rel.source_document_ids
                        ],
                        confidence=0.94,
                        severity="high",
                        status="needs_review",
                        recommended_action=(
                            f"Upload the loan account statement or agreement from {disp_name} "
                            "to verify outstanding principal balance, interest rate, and loan insurance status."
                        ),
                    )
                )

        # Risk Alerts Evaluation
        # Alert 1: Check for missing nominees across processed documents
        for doc in processed_documents:
            doc_type = doc.get("document_type", "")
            nominee_details = doc.get("nominee_details") or {}
            nominee_name = nominee_details.get("name") if isinstance(nominee_details, dict) else getattr(nominee_details, "name", None)

            if doc_type in ("insurance_policy", "life_insurance") and not nominee_name:
                policy = doc.get("policy_details") or {}
                inst = policy.get("insurer_name") if isinstance(policy, dict) else "Insurance Policy"
                risk_alerts.append(
                    RiskAlertSchema(
                        alert_id=f"alt-{uuid.uuid4().hex[:8]}",
                        estate_id=estate_id,
                        title="Missing Nominee Registration",
                        severity="high",
                        category="nominee",
                        institution_name=str(inst or "Insurance Provider"),
                        description="No registered beneficiary or nominee was identified on the active insurance policy.",
                        recommended_action="Verify nominee registration with insurer or update legal heir documentation.",
                    )
                )

            # Alert 2: Recurring liability with high monthly outflow
            for rel in relationships:
                if rel.category == "loan" and rel.average_amount > 20000:
                    risk_alerts.append(
                        RiskAlertSchema(
                            alert_id=f"alt-{uuid.uuid4().hex[:8]}",
                            estate_id=estate_id,
                            title="Active High-Value Recurring Liability",
                            severity="medium",
                            category="liability",
                            institution_name=rel.display_name,
                            description=f"Monthly EMI liability of ₹{int(rel.average_amount):,} detected. Ensure loan insurance or payoff provisions are reviewed.",
                            recommended_action="Check if credit life insurance exists to cover the outstanding principal upon claim settlement.",
                        )
                    )
                    break  # avoid duplicate high loan alerts

        return missing_assets, risk_alerts

    @staticmethod
    def _find_doc_name(doc_id: str, processed_documents: list[dict[str, Any]]) -> str:
        for doc in processed_documents:
            if doc.get("document_id") == doc_id:
                return doc.get("filename") or doc.get("original_filename") or f"Document_{doc_id[:6]}.pdf"
        return "Bank_Statement.pdf"


missing_asset_detector = MissingAssetDetector()
