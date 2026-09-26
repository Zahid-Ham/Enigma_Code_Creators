/**
 * Evidence Panel Component for Estate Radar
 * Displays cross-document source evidence and verified transaction breakdown.
 */

import React from 'react';
import { FileText, ArrowDownRight, ArrowUpRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function formatINR(val) {
  if (val == null || isNaN(val)) return '—';
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  } catch {}
  return dateStr;
}

export function EvidenceSummaryCard({ sourceDocuments = [], onViewSources = () => {} }) {
  const docCount = sourceDocuments.length || 1;
  const docNames = sourceDocuments.map((d) => d.filename || d.name).join(' and ');

  return (
    <div className="radar-evidence-card">
      <div className="radar-evidence-left">
        <div className="radar-evidence-icon">
          <FileText size={20} className="text-emerald-700" />
        </div>
        <div className="radar-evidence-text">
          <h4 className="radar-evidence-title">
            Evidence: Found in {docCount} document{docCount === 1 ? '' : 's'}
          </h4>
          <p className="radar-evidence-desc">
            {docCount > 1
              ? `Cross-verified across ${docNames}.`
              : `Observed in source statement records.`}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="radar-evidence-action-btn"
        onClick={onViewSources}
      >
        <span>View Sources</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

export function TransactionEvidenceTable({ transactions = [] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="radar-empty-tab-state">
        <p>No individual transaction evidence recorded for this discovery.</p>
      </div>
    );
  }

  return (
    <div className="radar-tx-table-container">
      <table className="radar-tx-table" aria-label="Transaction Evidence Breakdown">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Description / Narrative</th>
            <th scope="col">Category</th>
            <th scope="col" className="text-right">Amount</th>
            <th scope="col">Direction</th>
            <th scope="col">Source Page</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, idx) => {
            const isCredit = (tx.direction || '').toLowerCase() === 'credit';
            return (
              <tr key={tx.transaction_id || `tx-${idx}`}>
                <td className="tx-date-cell">{formatDate(tx.date)}</td>
                <td className="tx-desc-cell">
                  <span className="tx-desc-title">{tx.description}</span>
                  {tx.institution && (
                    <span className="tx-desc-sub">{tx.institution}</span>
                  )}
                </td>
                <td>
                  <span className="tx-cat-badge">{tx.category || 'financial'}</span>
                </td>
                <td className="tx-amount-cell text-right font-medium">
                  {formatINR(tx.amount)}
                </td>
                <td>
                  <span className={`tx-dir-pill ${isCredit ? 'dir-credit' : 'dir-debit'}`}>
                    {isCredit ? (
                      <ArrowDownRight size={12} className="inline mr-1" />
                    ) : (
                      <ArrowUpRight size={12} className="inline mr-1" />
                    )}
                    {isCredit ? 'Credit' : 'Debit'}
                  </span>
                </td>
                <td className="tx-page-cell">
                  Page {tx.page_number || 1}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function SourceDocumentsList({ sourceDocuments = [] }) {
  const navigate = useNavigate();

  if (!sourceDocuments || sourceDocuments.length === 0) {
    return (
      <div className="radar-empty-tab-state">
        <p>No source documents attached to this discovery.</p>
      </div>
    );
  }

  return (
    <div className="radar-source-docs-grid">
      {sourceDocuments.map((doc, idx) => (
        <div key={doc.document_id || `doc-${idx}`} className="radar-source-doc-card">
          <div className="radar-source-doc-icon">
            <FileText size={24} className="text-emerald-700" />
          </div>
          <div className="radar-source-doc-info">
            <h5 className="radar-source-doc-name">{doc.filename}</h5>
            <span className="radar-source-doc-type">
              {(doc.doc_type || 'document').replace(/_/g, ' ').toUpperCase()} • {doc.pages || 'Pages 1–3'}
            </span>
          </div>
          <button
            type="button"
            className="radar-source-doc-link-btn"
            onClick={() => navigate(`/documents/${doc.document_id}`)}
            title="Inspect full document extraction"
          >
            <span>Inspect</span>
            <ExternalLink size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
