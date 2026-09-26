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
    def _parse_amount(val: Any) -> float | None:
        if val is None:
            return None
        try:
            res = float(str(val).replace(",", "").replace("₹", "").replace("INR", "").replace("Rs.", "").strip())
            return abs(res)
        except (ValueError, TypeError):
            return None

    def validate_and_normalize(
        self,
        raw_data: dict[str, Any],
        actual_page_numbers: list[int],
    ) -> tuple[
        DocumentType,
        float,
        list[ExtractedEntity],
        list[EvidenceItem],
        list[str],
        dict[str, Any] | None,
        dict[str, Any] | None,
        dict[str, Any] | None,
        dict[str, Any] | None,
        dict[str, Any] | None,
        list[dict[str, Any]],
    ]:
        """Validate LLM output and return strongly-typed domain models and structured details.

        Returns:
            tuple of (
                document_type, overall_confidence, entities, evidence, warnings,
                policy_details, loan_details, investment_details, account_details, nominee_details, transactions
            )
        """
        warnings: list[str] = list(raw_data.get("warnings") or [])

        # 1. Document Type Validation
        raw_doc_type = str(raw_data.get("document_type", "unknown")).lower().strip()
        doc_type_aliases = {
            "mutual_fund_statement": DocumentType.INVESTMENT_STATEMENT,
            "mutual_fund": DocumentType.INVESTMENT_STATEMENT,
            "sip_statement": DocumentType.INVESTMENT_STATEMENT,
            "investment": DocumentType.INVESTMENT_STATEMENT,
            "insurance": DocumentType.INSURANCE_POLICY,
            "life_insurance": DocumentType.INSURANCE_POLICY,
            "loan": DocumentType.LOAN_STATEMENT,
            "home_loan": DocumentType.LOAN_STATEMENT,
            "bank": DocumentType.BANK_STATEMENT,
        }

        if raw_doc_type in doc_type_aliases:
            document_type = doc_type_aliases[raw_doc_type]
        else:
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
            overall_confidence = 0.85

        # 3. Entities Validation
        entities: list[ExtractedEntity] = []
        raw_entities = raw_data.get("entities") or []

        for item in raw_entities:
            if not isinstance(item, dict):
                continue

            display_name = str(item.get("display_name") or item.get("institution_name") or "").strip()
            if not display_name:
                continue

            raw_type = str(item.get("entity_type", "other")).lower().strip()
            try:
                entity_type = EntityType(raw_type)
            except ValueError:
                entity_type = EntityType.OTHER

            amount = self._parse_amount(item.get("amount"))
            premium_amount = self._parse_amount(item.get("premium_amount"))
            sum_assured = self._parse_amount(item.get("sum_assured"))
            emi_amount = self._parse_amount(item.get("emi_amount"))
            outstanding_amount = self._parse_amount(item.get("outstanding_amount"))
            investment_value = self._parse_amount(item.get("investment_value"))
            subscription_amount = self._parse_amount(item.get("subscription_amount"))
            transaction_amount = self._parse_amount(item.get("transaction_amount"))
            account_balance = self._parse_amount(item.get("account_balance"))
            maturity_amount = self._parse_amount(item.get("maturity_amount"))
            tax_amount = self._parse_amount(item.get("tax_amount"))

            raw_status = str(item.get("status", "inferred")).lower().strip()
            try:
                status = EntityStatus(raw_status)
            except ValueError:
                status = EntityStatus.INFERRED

            try:
                conf = float(item.get("confidence", 0.85))
                conf = max(0.0, min(1.0, conf))
            except (ValueError, TypeError):
                conf = 0.85

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
                    confidence=conf,
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

            try:
                page_num = int(ev.get("page", 1))
            except (ValueError, TypeError):
                page_num = 1

            if actual_page_numbers and page_num not in valid_page_set:
                nearest_page = min(actual_page_numbers, key=lambda p: abs(p - page_num))
                warnings.append(f"Adjusted hallucinated evidence page {page_num} to valid document page {nearest_page}.")
                page_num = nearest_page

            raw_src = str(ev.get("source", "pdf_text")).lower().strip()
            source = EvidenceSource.OCR if "ocr" in raw_src else EvidenceSource.PDF_TEXT

            try:
                ev_conf = float(ev.get("confidence", 0.9))
                ev_conf = max(0.0, min(1.0, ev_conf))
            except (ValueError, TypeError):
                ev_conf = 0.9

            evidence.append(
                EvidenceItem(
                    field=field,
                    value=value,
                    page=page_num,
                    source=source,
                    confidence=ev_conf,
                )
            )

        # 5. Nominee Details Normalization
        raw_nominee_dict = raw_data.get("nominee_details")
        nominee_details: dict[str, Any] | None = None
        if isinstance(raw_nominee_dict, dict) and raw_nominee_dict.get("name"):
            nominee_details = {
                "name": str(raw_nominee_dict.get("name")).strip(),
                "relationship": raw_nominee_dict.get("relationship"),
                "status": raw_nominee_dict.get("status", "known"),
                "share_percentage": self._parse_amount(raw_nominee_dict.get("share_percentage")),
                "source_page": raw_nominee_dict.get("source_page", 1),
                "confidence": float(raw_nominee_dict.get("confidence", 0.95)),
            }
        else:
            # Fallback check from evidence
            nominee_ev = next((ev for ev in evidence if "nominee" in ev.field.lower()), None)
            if nominee_ev:
                nominee_details = {
                    "name": nominee_ev.value,
                    "relationship": "Beneficiary",
                    "status": "known",
                    "share_percentage": 100.0,
                    "source_page": nominee_ev.page,
                    "confidence": nominee_ev.confidence,
                }

        # 6. Policy Details Normalization
        raw_pol = raw_data.get("policy_details")
        policy_details: dict[str, Any] | None = None
        if isinstance(raw_pol, dict) and any(raw_pol.values()):
            policy_details = {
                "policy_number": raw_pol.get("policy_number"),
                "policy_holder": raw_pol.get("policy_holder"),
                "policy_type": raw_pol.get("policy_type", "Term Life Insurance"),
                "sum_assured": self._parse_amount(raw_pol.get("sum_assured")),
                "death_benefit": self._parse_amount(raw_pol.get("death_benefit")),
                "accidental_rider": self._parse_amount(raw_pol.get("accidental_rider")),
                "premium": self._parse_amount(raw_pol.get("premium")),
                "frequency": raw_pol.get("frequency", "Monthly"),
                "policy_start_date": raw_pol.get("policy_start_date"),
                "policy_term": raw_pol.get("policy_term"),
                "payment_term": raw_pol.get("payment_term"),
                "nominee": nominee_details,
                "status": raw_pol.get("status", "Active"),
                "benefits": raw_pol.get("benefits") or [],
            }
        elif document_type in (DocumentType.INSURANCE_POLICY, DocumentType.INSURANCE_CORRESPONDENCE):
            # Fallback build from entities/evidence
            ins_ent = next((e for e in entities if e.entity_type == EntityType.INSURANCE), None)
            policy_details = {
                "policy_number": getattr(ins_ent, "account_reference", None),
                "policy_holder": getattr(ins_ent, "display_name", None),
                "policy_type": "Life Insurance",
                "sum_assured": getattr(ins_ent, "sum_assured", None),
                "death_benefit": getattr(ins_ent, "sum_assured", None),
                "accidental_rider": None,
                "premium": getattr(ins_ent, "premium_amount", None),
                "frequency": getattr(ins_ent, "frequency", "Monthly"),
                "policy_start_date": None,
                "policy_term": None,
                "payment_term": None,
                "nominee": nominee_details,
                "status": "Active",
                "benefits": [],
            }

        # 7. Loan Details Normalization
        raw_loan = raw_data.get("loan_details")
        loan_details: dict[str, Any] | None = None
        if isinstance(raw_loan, dict) and any(raw_loan.values()):
            loan_details = {
                "loan_account": raw_loan.get("loan_account"),
                "borrower": raw_loan.get("borrower"),
                "co_borrower": raw_loan.get("co_borrower"),
                "loan_type": raw_loan.get("loan_type", "Home Loan"),
                "sanctioned_principal": self._parse_amount(raw_loan.get("sanctioned_principal")),
                "outstanding_principal": self._parse_amount(raw_loan.get("outstanding_principal")),
                "emi_amount": self._parse_amount(raw_loan.get("emi_amount")),
                "interest_rate": str(raw_loan.get("interest_rate")) if raw_loan.get("interest_rate") is not None else None,
                "next_due_date": raw_loan.get("next_due_date"),
                "tenure_remaining": raw_loan.get("tenure_remaining"),
                "repayment_history": raw_loan.get("repayment_history") or [],
            }
        elif document_type == DocumentType.LOAN_STATEMENT:
            loan_ent = next((e for e in entities if e.entity_type == EntityType.LOAN), None)
            loan_details = {
                "loan_account": getattr(loan_ent, "account_reference", None),
                "borrower": getattr(loan_ent, "display_name", None),
                "co_borrower": None,
                "loan_type": "Home Loan",
                "sanctioned_principal": None,
                "outstanding_principal": getattr(loan_ent, "outstanding_amount", None),
                "emi_amount": getattr(loan_ent, "emi_amount", None),
                "interest_rate": None,
                "next_due_date": None,
                "tenure_remaining": None,
                "repayment_history": [],
            }

        # 8. Investment Details Normalization
        raw_inv = raw_data.get("investment_details")
        investment_details: dict[str, Any] | None = None
        if isinstance(raw_inv, dict) and any(raw_inv.values()):
            investment_details = {
                "folio_number": raw_inv.get("folio_number"),
                "fund_name": raw_inv.get("fund_name"),
                "investor_name": raw_inv.get("investor_name"),
                "investment_type": raw_inv.get("investment_type", "Mutual Fund / Equity"),
                "sip_amount": self._parse_amount(raw_inv.get("sip_amount")),
                "frequency": raw_inv.get("frequency", "Monthly"),
                "current_value": self._parse_amount(raw_inv.get("current_value")),
                "total_invested": self._parse_amount(raw_inv.get("total_invested")),
                "units_held": self._parse_amount(raw_inv.get("units_held")),
                "nav": self._parse_amount(raw_inv.get("nav")),
                "nominee": nominee_details,
                "transactions": raw_inv.get("transactions") or [],
            }
        elif document_type == DocumentType.INVESTMENT_STATEMENT:
            inv_ent = next((e for e in entities if e.entity_type == EntityType.INVESTMENT), None)
            investment_details = {
                "folio_number": getattr(inv_ent, "account_reference", None),
                "fund_name": getattr(inv_ent, "display_name", None),
                "investor_name": None,
                "investment_type": "Mutual Fund",
                "sip_amount": getattr(inv_ent, "transaction_amount", None),
                "frequency": getattr(inv_ent, "frequency", "Monthly"),
                "current_value": getattr(inv_ent, "investment_value", None),
                "total_invested": None,
                "units_held": None,
                "nav": None,
                "nominee": nominee_details,
                "transactions": [],
            }

        # 9. Account Details Normalization
        raw_acc = raw_data.get("account_details")
        account_details: dict[str, Any] | None = None
        if isinstance(raw_acc, dict) and any(raw_acc.values()):
            account_details = {
                "account_holder": raw_acc.get("account_holder"),
                "account_number": raw_acc.get("account_number"),
                "bank_name": raw_acc.get("bank_name"),
                "account_type": raw_acc.get("account_type", "Savings Account"),
                "statement_period": raw_acc.get("statement_period"),
                "opening_balance": self._parse_amount(raw_acc.get("opening_balance")),
                "closing_balance": self._parse_amount(raw_acc.get("closing_balance")),
            }

        # 10. Direct Transactions Normalization from LLM
        raw_txs = raw_data.get("transactions") or []
        transactions: list[dict[str, Any]] = []
        for i, tx in enumerate(raw_txs):
            if not isinstance(tx, dict):
                continue
            amt = self._parse_amount(tx.get("amount"))
            if amt is None:
                continue
            desc = str(tx.get("description") or "Transaction").strip()
            date_str = str(tx.get("date") or "").strip()
            direction = str(tx.get("direction", "debit")).lower()
            if direction not in ("debit", "credit"):
                direction = "debit"
            category = str(tx.get("category", "other")).lower()
            transactions.append({
                "id": tx.get("id") or tx.get("transaction_id") or f"tx-ai-{i}",
                "date": date_str,
                "description": desc,
                "normalized_description": tx.get("normalized_description") or desc,
                "amount": amt,
                "direction": direction,
                "category": category,
                "institution": tx.get("institution") or desc,
                "source_page": int(tx.get("source_page", 1)),
            })

        return (
            document_type,
            overall_confidence,
            entities,
            evidence,
            warnings,
            policy_details,
            loan_details,
            investment_details,
            account_details,
            nominee_details,
            transactions,
        )


ai_validation_service = AIValidationService()

