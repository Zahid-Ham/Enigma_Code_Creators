/**
 * Estate Radar Top Aggregate Summary Cards
 */

import React from 'react';
import { RefreshCw, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';

export default function RadarSummary({ summary = {} }) {
  const recurringCount = summary.recurring_relationships || 0;
  const missingCount = summary.potential_missing_assets || 0;
  const riskCount = summary.risk_alerts || 0;
  const docCount = summary.documents_analyzed || 0;

  return (
    <section className="radar-summary-grid" aria-label="Estate Radar Summary Metrics">
      {/* Recurring Relationships */}
      <div className="radar-summary-card">
        <div className="radar-summary-icon-wrap icon-wrap-green" aria-hidden="true">
          <RefreshCw size={20} className="text-emerald-700" />
        </div>
        <div className="radar-summary-info">
          <span className="radar-summary-label">Recurring Relationships</span>
          <div className="radar-summary-value-row">
            <span className="radar-summary-value">{recurringCount}</span>
          </div>
          <span className="radar-summary-subtext">
            Across {docCount} document{docCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Potential Missing Assets */}
      <div className="radar-summary-card">
        <div className="radar-summary-icon-wrap icon-wrap-amber" aria-hidden="true">
          <AlertTriangle size={20} className="text-amber-600" />
        </div>
        <div className="radar-summary-info">
          <span className="radar-summary-label">Potential Missing Assets</span>
          <div className="radar-summary-value-row">
            <span className="radar-summary-value">{missingCount}</span>
          </div>
          <span className="radar-summary-subtext">Need your attention</span>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="radar-summary-card">
        <div className="radar-summary-icon-wrap icon-wrap-sage" aria-hidden="true">
          <ShieldCheck size={20} className="text-emerald-800" />
        </div>
        <div className="radar-summary-info">
          <span className="radar-summary-label">Risk Alerts</span>
          <div className="radar-summary-value-row">
            <span className="radar-summary-value">{riskCount}</span>
          </div>
          <span className="radar-summary-subtext">Requires review</span>
        </div>
      </div>

      {/* Documents Analyzed */}
      <div className="radar-summary-card">
        <div className="radar-summary-icon-wrap icon-wrap-teal" aria-hidden="true">
          <FileText size={20} className="text-teal-700" />
        </div>
        <div className="radar-summary-info">
          <span className="radar-summary-label">Documents Analyzed</span>
          <div className="radar-summary-value-row">
            <span className="radar-summary-value">{docCount}</span>
          </div>
          <span className="radar-summary-subtext">100% processed</span>
        </div>
      </div>
    </section>
  );
}
