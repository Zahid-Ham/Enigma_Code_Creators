/**
 * Evidence List Component
 * Displays traceable evidence snippets with source page numbers and confidence scores.
 */

import React from 'react';
import {
  Shield,
  Hash,
  Clock,
  User,
  Calendar,
  DollarSign,
  FileText,
  Search,
} from 'lucide-react';

export default function EvidenceList({ evidence = [] }) {
  const getFieldIcon = (field = '') => {
    const f = field.toLowerCase();
    if (f.includes('institution') || f.includes('provider') || f.includes('bank') || f.includes('insurer')) {
      return <Shield size={16} className="text-emerald-700" />;
    }
    if (f.includes('policy') || f.includes('account') || f.includes('number') || f.includes('reference')) {
      return <Hash size={16} className="text-blue-700" />;
    }
    if (f.includes('premium') || f.includes('amount') || f.includes('sum') || f.includes('valuation') || f.includes('balance')) {
      return <DollarSign size={16} className="text-amber-700" />;
    }
    if (f.includes('nominee') || f.includes('holder') || f.includes('assured') || f.includes('name')) {
      return <User size={16} className="text-purple-700" />;
    }
    if (f.includes('date') || f.includes('maturity') || f.includes('expiry') || f.includes('period')) {
      return <Calendar size={16} className="text-rose-700" />;
    }
    if (f.includes('frequency') || f.includes('schedule') || f.includes('mode')) {
      return <Clock size={16} className="text-teal-700" />;
    }
    return <FileText size={16} className="text-slate-700" />;
  };

  const formatFieldName = (field = '') => {
    return field
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const count = evidence.length;

  return (
    <div className="side-card evidence-card" aria-labelledby="evidence-heading">
      <div className="side-card-header-row">
        <h3 id="evidence-heading" className="side-card-title mb-0">
          Evidence Found
        </h3>
        <span className="evidence-count-badge">
          {count} {count === 1 ? 'key piece of evidence' : 'key pieces of evidence'}
        </span>
      </div>

      {count === 0 ? (
        <div className="evidence-empty-state">
          <Search size={22} className="text-muted" aria-hidden="true" />
          <p className="text-sm text-muted">No explicit text snippets were tagged as evidence.</p>
        </div>
      ) : (
        <div className="evidence-items-list" role="list">
          {evidence.map((item, idx) => {
            const confPercent = Math.round((item.confidence || 0) * 100);

            return (
              <div key={idx} className="evidence-item-row" role="listitem">
                <div className="evidence-item-left">
                  <div className="evidence-icon-box" aria-hidden="true">
                    {getFieldIcon(item.field)}
                  </div>
                  <div className="evidence-item-meta">
                    <div className="evidence-field-name">{formatFieldName(item.field)}</div>
                    <div className="evidence-field-value" title={item.value}>
                      {item.value}
                    </div>
                  </div>
                </div>

                <div className="evidence-item-right">
                  <span
                    className="page-reference-pill"
                    title={`Extracted from source page ${item.page || 1}`}
                  >
                    Page {item.page || 1}
                  </span>
                  <span
                    className={`evidence-conf-pill ${
                      confPercent >= 90
                        ? 'conf-high'
                        : confPercent >= 70
                        ? 'conf-med'
                        : 'conf-low'
                    }`}
                    title={`Field confidence: ${confPercent}%`}
                  >
                    {confPercent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
