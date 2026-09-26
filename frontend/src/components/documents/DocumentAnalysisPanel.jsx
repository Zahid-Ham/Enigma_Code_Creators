import React, { useState } from 'react';
import {
  Landmark,
  Shield,
  Home,
  TrendingUp,
  FileText,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  CreditCard,
  User,
  Users,
  Percent,
} from 'lucide-react';
import DocumentTabs from './DocumentTabs';

/**
 * Helper to select appropriate icon for entity or institution
 */
function getEntityIcon(institution = '', category = '') {
  const text = `${institution} ${category}`.toLowerCase();
  if (text.includes('bank') || text.includes('hdfc') || text.includes('sbi') || text.includes('icici')) {
    return { icon: <Landmark size={18} className="text-purple-600" />, bg: '#F3E8FF' };
  }
  if (text.includes('insurance') || text.includes('life') || text.includes('policy')) {
    return { icon: <Shield size={18} className="text-red-500" />, bg: '#FEE2E2' };
  }
  if (text.includes('streamflix') || text.includes('subscription') || text.includes('netflix')) {
    return { icon: <CreditCard size={18} className="text-amber-500" />, bg: '#FEF3C7' };
  }
  if (text.includes('investment') || text.includes('asset') || text.includes('sip') || text.includes('mutual')) {
    return { icon: <TrendingUp size={18} className="text-emerald-700" />, bg: '#DCFCE7' };
  }
  if (text.includes('power') || text.includes('utility') || text.includes('electric')) {
    return { icon: <Sparkles size={18} className="text-blue-500" />, bg: '#E0F2FE' };
  }
  return { icon: <FileText size={18} className="text-gray-600" />, bg: '#F3F4F6' };
}

/**
 * Robust helper to extract semantic fields from an entity
 */
function formatEntityInfo(entity = {}) {
  const institution =
    entity.institution_name ||
    entity.institution ||
    entity.display_name ||
    'Financial Provider';

  const category =
    entity.entity_type ||
    entity.category ||
    'Financial Entity';

  const rawRef =
    entity.account_reference ||
    entity.accountReference ||
    (entity.entity_type ? entity.entity_type.replace(/_/g, ' ') : 'Account');

  const reference = rawRef ? String(rawRef) : 'Account Reference';

  // Semantic amount detection across schemas
  let amountStr = 'Not detected';
  let amountLabel = 'Observed Valuation';

  if (entity.account_balance != null && entity.account_balance > 0) {
    amountStr = `₹ ${Number(entity.account_balance).toLocaleString('en-IN')}`;
    amountLabel = 'Account Balance';
  } else if (entity.premium_amount != null && entity.premium_amount > 0) {
    amountStr = `₹ ${Number(entity.premium_amount).toLocaleString('en-IN')}`;
    amountLabel = entity.frequency ? `${entity.frequency} Premium` : 'Monthly Premium';
  } else if (entity.emi_amount != null && entity.emi_amount > 0) {
    amountStr = `₹ ${Number(entity.emi_amount).toLocaleString('en-IN')}`;
    amountLabel = 'Monthly EMI';
  } else if (entity.sum_assured != null && entity.sum_assured > 0) {
    amountStr = `₹ ${Number(entity.sum_assured).toLocaleString('en-IN')}`;
    amountLabel = 'Sum Assured';
  } else if (entity.outstanding_amount != null && entity.outstanding_amount > 0) {
    amountStr = `₹ ${Number(entity.outstanding_amount).toLocaleString('en-IN')}`;
    amountLabel = 'Outstanding Balance';
  } else if (entity.investment_value != null && entity.investment_value > 0) {
    amountStr = `₹ ${Number(entity.investment_value).toLocaleString('en-IN')}`;
    amountLabel = 'Portfolio Value';
  } else if (entity.subscription_amount != null && entity.subscription_amount > 0) {
    amountStr = `₹ ${Number(entity.subscription_amount).toLocaleString('en-IN')}`;
    amountLabel = 'Monthly Payment';
  } else if (entity.transaction_amount != null && entity.transaction_amount > 0) {
    amountStr = `₹ ${Number(entity.transaction_amount).toLocaleString('en-IN')}`;
    amountLabel = 'Transaction Amount';
  } else if (entity.amount != null && entity.amount > 0) {
    amountStr = `₹ ${Number(entity.amount).toLocaleString('en-IN')}`;
    amountLabel = 'Observed Amount';
  } else if (entity.balance && entity.balance !== '₹ 0') {
    amountStr = entity.balance;
    amountLabel = entity.amountLabel || 'Valuation';
  }

  const isPrimary = entity.isPrimary || entity.status === 'verified' || entity.role === 'Primary Institution';
  const roleLabel = isPrimary ? 'Primary Institution' : 'Inferred';

  return { institution, category, reference, amountStr, amountLabel, isPrimary, roleLabel };
}

/**
 * DocumentAnalysisPanel (Center Column)
 * Adapts seamlessly according to the selected document type and extracted payload.
 */
export default function DocumentAnalysisPanel({
  documentData,
  resultData,
  processingStatus,
  onViewSourceDoc,
}) {
  const [activeTab, setActiveTab] = useState('extracted');
  const [txSearch, setTxSearch] = useState('');
  const [copiedRaw, setCopiedRaw] = useState(false);

  if (!documentData) {
    return (
      <article className="doc-analysis-panel doc-analysis-empty" aria-label="Individual Document Analysis Workspace">
        <div className="empty-panel-content">
          <div className="empty-panel-icon-wrap">
            <FileText size={38} className="text-gray-400" />
          </div>
          <h3 className="empty-panel-title">No Document Selected</h3>
          <p className="empty-panel-desc">
            Upload financial records or select a document from the left list to view individual AI extraction, verified account details, and transaction breakdowns.
          </p>
        </div>
      </article>
    );
  }

  const docName = documentData.name || documentData.filename || 'Financial_Document.pdf';
  const docType = documentData.type || documentData.document_type || 'bank_statement';
  const docTypeLabel = documentData.typeLabel || 'Bank Statement';
  const docSize = documentData.sizeFormatted || '1.2 MB';
  const docTimestamp = documentData.timestamp || '26 Sept 2026, 02:53 PM';
  const confidencePct = Math.round((documentData.confidence || resultData?.overall_confidence || 0.99) * 100);

  // Entities list from documentData or backend resultData
  const entities = (documentData.entities && documentData.entities.length > 0)
    ? documentData.entities
    : (resultData?.entities || []);
  const transactions = (documentData.transactions && documentData.transactions.length > 0)
    ? documentData.transactions
    : (resultData?.transactions || []);
  const rawText = documentData.rawText || resultData?.extracted_text || 'No raw text available.';
  const summary = documentData.summary || {
    accountCount: 1,
    transactionCount: transactions.length,
    entityCount: entities.length || 5,
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!txSearch) return true;
    const q = txSearch.toLowerCase();
    return (
      (tx.description || '').toLowerCase().includes(q) ||
      (tx.category || '').toLowerCase().includes(q) ||
      (tx.date || '').toLowerCase().includes(q)
    );
  });

  const handleCopyRawText = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(rawText);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  return (
    <article className="doc-analysis-panel" aria-label="Individual Document Analysis Workspace">
      {/* Top Header */}
      <header className="doc-analysis-header">
        <div className="doc-analysis-header-left">
          <div className="doc-analysis-icon-box" aria-hidden="true">
            {docType.includes('policy') || docType.includes('insurance') ? (
              <Shield size={22} className="text-emerald-700" />
            ) : docType.includes('loan') ? (
              <Home size={22} className="text-blue-600" />
            ) : (
              <Landmark size={22} className="text-purple-600" />
            )}
          </div>
          <div className="doc-analysis-title-group">
            <h2 className="doc-analysis-filename" title={docName}>
              {docName}
            </h2>
            <div className="doc-analysis-submeta">
              <span>{docTypeLabel}</span>
              <span className="dot-sep">•</span>
              <span>{docSize}</span>
              <span className="dot-sep">•</span>
              <span>Processed {docTimestamp}</span>
            </div>
          </div>
        </div>

        <div className="doc-analysis-header-right">
          <span className="status-pill-processed">
            <CheckCircle2 size={13} />
            <span>Processed</span>
          </span>
        </div>
      </header>

      {/* Tabs Navigation */}
      <DocumentTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        transactionCount={transactions.length}
      />

      {/* TAB 1: EXTRACTED INFORMATION */}
      {activeTab === 'extracted' && (
        <div className="tab-pane-extracted">
          {/* Document Summary Card */}
          <div className="doc-summary-header-row">
            <div>
              <h3 className="doc-summary-title">Document Summary</h3>
              <p className="doc-summary-desc">AI-extracted information from this document</p>
            </div>
            <div className="confidence-pill">
              <CheckCircle2 size={13} className="text-emerald-700" />
              <span>{confidencePct}% confidence</span>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="doc-summary-metrics-grid">
            <div className="doc-metric-card">
              <div className="doc-metric-icon bg-purple-50">
                <Landmark size={18} className="text-purple-600" />
              </div>
              <div className="doc-metric-info">
                <span className="doc-metric-num">{summary.accountCount || 1}</span>
                <span className="doc-metric-lbl">
                  {docType.includes('insurance') ? 'Insurance Policy Detected' : docType.includes('loan') ? 'Loan Account Detected' : 'Bank Account Detected'}
                </span>
              </div>
            </div>

            <div className="doc-metric-card">
              <div className="doc-metric-icon bg-blue-50">
                <FileText size={18} className="text-blue-600" />
              </div>
              <div className="doc-metric-info">
                <span className="doc-metric-num">{summary.transactionCount || (docType.includes('insurance') ? 1 : 12)}</span>
                <span className="doc-metric-lbl">
                  {docType.includes('insurance') ? 'Policy Schedule Record' : docType.includes('loan') ? 'Repayment Schedules' : 'Transactions Extracted'}
                </span>
              </div>
            </div>

            <div className="doc-metric-card">
              <div className="doc-metric-icon bg-emerald-50">
                <Sparkles size={18} className="text-emerald-700" />
              </div>
              <div className="doc-metric-info">
                <span className="doc-metric-num">{summary.entityCount || 5}</span>
                <span className="doc-metric-lbl">Financial Entities Identified</span>
              </div>
            </div>
          </div>

          {/* Extracted Entities Section */}
          <div className="extracted-entities-section">
            <h4 className="entities-section-title">Extracted Entities (This Document)</h4>

            {entities.length === 0 ? (
              <div className="no-entities-row">
                <p className="text-gray-500 text-sm py-4 text-center">No financial entities extracted for this document.</p>
              </div>
            ) : (
              <div className="entities-cards-list">
                {entities.map((entity, idx) => {
                  const info = formatEntityInfo(entity);
                  const { icon, bg } = getEntityIcon(info.institution, info.category);
                  return (
                    <div key={entity.id || idx} className="entity-card-row">
                      <div className="entity-icon-box" style={{ backgroundColor: bg }}>
                        {icon}
                      </div>

                      <div className="entity-name-col">
                        <span className="entity-institution-name">{info.institution}</span>
                        <span className="entity-account-ref">{info.reference}</span>
                      </div>

                      <div className="entity-role-col">
                        <span className={info.isPrimary ? 'badge-primary-institution' : 'badge-inferred-entity'}>
                          {info.roleLabel}
                        </span>
                      </div>

                      <div className="entity-balance-col">
                        <span className="entity-balance-label">{info.amountLabel}</span>
                        <span className={`entity-balance-val ${info.amountStr === 'Not detected' ? 'text-gray-400 font-normal' : ''}`}>
                          {info.amountStr}
                        </span>
                      </div>

                      <ChevronRight size={16} className="entity-row-chevron" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Adaptive Details for Policy or Loan if available */}
          {documentData.policyDetails && (
            <div className="adaptive-policy-box">
              <h4 className="adaptive-box-title">Policy Terms & Beneficiaries</h4>
              <div className="adaptive-details-grid">
                <div className="adaptive-field">
                  <span className="field-lbl">Policy Number</span>
                  <span className="field-val">{documentData.policyDetails.policyNumber}</span>
                </div>
                <div className="adaptive-field">
                  <span className="field-lbl">Life Assured</span>
                  <span className="field-val">{documentData.policyDetails.policyHolder}</span>
                </div>
                <div className="adaptive-field">
                  <span className="field-lbl">Nominee Beneficiary</span>
                  <span className="field-val">{documentData.policyDetails.nominee}</span>
                </div>
                <div className="adaptive-field">
                  <span className="field-lbl">Sum Assured</span>
                  <span className="field-val text-emerald-800 font-bold">{documentData.policyDetails.sumAssured}</span>
                </div>
                <div className="adaptive-field">
                  <span className="field-lbl">Premium & Cadence</span>
                  <span className="field-val">{documentData.policyDetails.premium} ({documentData.policyDetails.frequency})</span>
                </div>
                <div className="adaptive-field">
                  <span className="field-lbl">Policy Status</span>
                  <span className="field-val badge-active-status">{documentData.policyDetails.status}</span>
                </div>
              </div>
            </div>
          )}

          {documentData.loanDetails && (
            <div className="adaptive-loan-box">
              <h4 className="adaptive-box-title">Loan Account & Repayment Schedule</h4>
              <div className="adaptive-details-grid">
                <div className="adaptive-field">
                  <span className="field-lbl">Loan Account</span>
                  <span className="field-val">{documentData.loanDetails.loanAccount}</span>
                </div>
                <div className="adaptive-field">
                  <span className="field-lbl">Primary Borrower</span>
                  <span className="field-val">{documentData.loanDetails.borrower}</span>
                </div>
                <div className="adaptive-field">
                  <span className="field-lbl">Sanctioned Principal</span>
                  <span className="field-val">{documentData.loanDetails.sanctionedPrincipal}</span>
                </div>
                <div className="adaptive-field">
                  <span className="field-lbl">Outstanding Principal</span>
                  <span className="field-val text-red-700 font-bold">{documentData.loanDetails.outstandingPrincipal}</span>
                </div>
                <div className="adaptive-field">
                  <span className="field-lbl">Monthly EMI</span>
                  <span className="field-val font-bold">{documentData.loanDetails.emiAmount}</span>
                </div>
                <div className="adaptive-field">
                  <span className="field-lbl">Interest Rate</span>
                  <span className="field-val">{documentData.loanDetails.interestRate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="tab-pane-transactions">
          <div className="tx-pane-toolbar">
            <div className="tx-search-wrap">
              <Search size={14} className="tx-search-icon" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="tx-search-input"
              />
            </div>
            <span className="tx-count-pill">{filteredTransactions.length} Transactions</span>
          </div>

          <div className="doc-tx-table-wrap">
            <table className="doc-tx-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="tx-empty-state-cell">
                      No matching transactions found in this document.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, idx) => (
                    <tr key={tx.id || `tx-${idx}`}>
                      <td className="tx-date-cell">{tx.date}</td>
                      <td className="tx-desc-cell font-medium">{tx.description}</td>
                      <td>
                        <span className="tx-cat-badge">{tx.category || 'financial'}</span>
                      </td>
                      <td className={`tx-amount-cell text-right font-semibold ${tx.direction === 'credit' ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {tx.direction === 'credit' ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT PREVIEW */}
      {activeTab === 'preview' && (
        <div className="tab-pane-preview">
          <div className="doc-preview-card">
            <div className="doc-preview-mock-header">
              <span className="mock-brand-title">OHDFC Life</span>
              <span className="mock-badge-tag">SCHEDULE</span>
            </div>
            <h4 className="mock-cert-title">Policy Certificate / Statement Schedule</h4>
            <div className="mock-cert-body">
              <p><strong>Account / Document:</strong> {docName}</p>
              <p><strong>Primary Holder:</strong> Zahid Hamdule</p>
              <p><strong>Verification:</strong> AI Verified Extraction & Digital Hash</p>
            </div>
            <div className="doc-preview-footer">
              <button type="button" className="btn-open-full-doc">
                <ExternalLink size={14} />
                <span>Open Full Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RAW TEXT */}
      {activeTab === 'raw_text' && (
        <div className="tab-pane-raw">
          <div className="raw-text-toolbar">
            <span className="raw-text-label">Extracted OCR Text</span>
            <button type="button" className="btn-copy-raw" onClick={handleCopyRawText}>
              {copiedRaw ? <Check size={13} className="text-emerald-700" /> : <Copy size={13} />}
              <span>{copiedRaw ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
          <pre className="raw-text-pre">{rawText}</pre>
        </div>
      )}

      {/* TAB 5: PROCESSING DETAILS */}
      {activeTab === 'processing' && (
        <div className="tab-pane-proc">
          <div className="proc-details-grid">
            <div className="proc-field-row">
              <span className="proc-lbl">Extraction Engine</span>
              <span className="proc-val font-semibold">Groq AI Vision & LLaMA 3.3 70B Versatile</span>
            </div>
            <div className="proc-field-row">
              <span className="proc-lbl">Document Classification</span>
              <span className="proc-val">{docTypeLabel} ({confidencePct}% Confidence)</span>
            </div>
            <div className="proc-field-row">
              <span className="proc-lbl">OCR Method</span>
              <span className="proc-val">Native PDF Vector Stream + Tesseract OCR Engine</span>
            </div>
            <div className="proc-field-row">
              <span className="proc-lbl">Persistence Store</span>
              <span className="proc-val">Google Cloud Firestore (Persistent Structured Collections)</span>
            </div>
            <div className="proc-field-row">
              <span className="proc-lbl">Recurrence Engine</span>
              <span className="proc-val">Deterministic Cadence & Amount Variance Engine</span>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
