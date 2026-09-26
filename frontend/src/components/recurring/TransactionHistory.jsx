import React from 'react';
import { FileText, ArrowDownRight, ArrowUpRight } from 'lucide-react';

/**
 * Formats date into "04 Sep 2026"
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Recent';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats amount into "₹ 4,250"
 */
function formatAmount(amt) {
  if (amt === undefined || amt === null) return '—';
  return '₹ ' + Math.round(amt).toLocaleString('en-IN');
}

/**
 * TransactionHistory Component
 */
export default function TransactionHistory({
  relationship,
  limit = null,
  showTitle = true,
  onViewAll = null,
}) {
  const allTxs = relationship?.transactions || [];

  // Sort descending by date
  const sortedTxs = [...allTxs].sort((a, b) => {
    const da = new Date(a.date).getTime() || 0;
    const db = new Date(b.date).getTime() || 0;
    return db - da;
  });

  const displayTxs = limit ? sortedTxs.slice(0, limit) : sortedTxs;

  return (
    <div className="recent-transactions-card" aria-label={`Recent transactions for ${relationship?.display_name}`}>
      {showTitle && (
        <div className="recent-transactions-header">
          <h4 className="recent-transactions-title">
            Recent Transactions <span className="entity-scope">({relationship?.display_name || 'Selected Entity'})</span>
          </h4>
          {onViewAll && sortedTxs.length > (limit || 0) && (
            <button type="button" className="btn-view-all-txs" onClick={onViewAll}>
              View All ({sortedTxs.length})
            </button>
          )}
        </div>
      )}

      {displayTxs.length === 0 ? (
        <div className="no-transactions-state">
          <p>No transaction records found for this relationship.</p>
        </div>
      ) : (
        <div className="transaction-history-table-wrap">
          <table className="transaction-history-table">
            <thead>
              <tr>
                <th className="th-tx-date">Date</th>
                <th className="th-tx-desc">Description</th>
                <th className="th-tx-amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {displayTxs.map((tx, idx) => (
                <tr key={tx.transaction_id || idx} className="tx-table-row">
                  <td className="td-tx-date">
                    <div className="tx-date-cell">
                      <div className="tx-doc-icon-box" aria-hidden="true">
                        <FileText size={14} className="text-red-600" />
                      </div>
                      <span className="tx-date-text">{formatDate(tx.date)}</span>
                    </div>
                  </td>
                  <td className="td-tx-desc">
                    <span className="tx-desc-text" title={tx.description || tx.normalized_description}>
                      {tx.description || tx.normalized_description || relationship?.display_name}
                    </span>
                  </td>
                  <td className="td-tx-amount">
                    <span className="tx-amount-text">{formatAmount(tx.amount)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
