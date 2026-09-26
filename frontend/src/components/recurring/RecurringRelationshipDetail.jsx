import React, { useState } from 'react';
import {
  Shield,
  Landmark,
  TrendingUp,
  PlayCircle,
  Zap,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';
import MonthlyOccurrencePattern from './MonthlyOccurrencePattern';
import TransactionHistory from './TransactionHistory';
import EvidenceSources from './EvidenceSources';

/**
 * Returns icon and colors for institution
 */
function getInstitutionIcon(category = '', name = '') {
  const cat = (category || '').toLowerCase();
  const lowerName = (name || '').toLowerCase();

  if (cat === 'insurance' || lowerName.includes('insurance') || lowerName.includes('life')) {
    return {
      icon: <Shield size={20} className="text-red-600" />,
      bgColor: '#FEF2F2',
      badgeClass: 'category-insurance',
    };
  }
  if (cat === 'loan' || lowerName.includes('loan') || lowerName.includes('bank') || lowerName.includes('housing')) {
    return {
      icon: <Landmark size={20} className="text-blue-700" />,
      bgColor: '#EFF6FF',
      badgeClass: 'category-loan',
    };
  }
  if (cat === 'investment' || lowerName.includes('asset') || lowerName.includes('mutual') || lowerName.includes('fund') || lowerName.includes('sip')) {
    return {
      icon: <TrendingUp size={20} className="text-emerald-700" />,
      bgColor: '#ECFDF5',
      badgeClass: 'category-investment',
    };
  }
  if (cat === 'subscription' || lowerName.includes('stream') || lowerName.includes('netflix') || lowerName.includes('spotify') || lowerName.includes('digital')) {
    return {
      icon: <PlayCircle size={20} className="text-amber-600" />,
      bgColor: '#FFFBEB',
      badgeClass: 'category-subscription',
    };
  }
  if (cat === 'utility' || lowerName.includes('power') || lowerName.includes('electric') || lowerName.includes('water') || lowerName.includes('gas')) {
    return {
      icon: <Zap size={20} className="text-blue-600" />,
      bgColor: '#EFF6FF',
      badgeClass: 'category-utility',
    };
  }
  return {
    icon: <PlusCircle size={20} className="text-slate-600" />,
    bgColor: '#F1F5F9',
    badgeClass: 'category-default',
  };
}

/**
 * Formats date into readable string "04 Apr 2026"
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
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
 * Formats currency amount
 */
function formatCurrency(amt) {
  if (amt === undefined || amt === null) return '—';
  return '₹ ' + Math.round(amt).toLocaleString('en-IN');
}

/**
 * RecurringRelationshipDetail Component
 */
export default function RecurringRelationshipDetail({
  relationship,
  observationWindow,
  uploadedDocuments = [],
  totalObservedMonths = 6,
}) {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'transactions' | 'evidence'

  if (!relationship) {
    return (
      <div className="relationship-detail-card empty-detail-state">
        <p>Select a financial relationship to view detailed intelligence.</p>
      </div>
    );
  }

  const { icon, bgColor } = getInstitutionIcon(relationship.category, relationship.display_name);
  const isRecurring = (relationship.occurrence_count || 0) >= 2 && relationship.recurrence_strength !== 'insufficient';
  const confidencePercent = Math.round((relationship.confidence || 0.85) * 100);
  const txList = relationship.transactions || [];
  const sourceDocs = relationship.source_document_ids || [];
  const evidenceCount = sourceDocs.length || (isRecurring ? 2 : 1);

  // Variance & Pattern text
  const variancePct = relationship.amount_consistency !== undefined
    ? Math.round((1 - relationship.amount_consistency) * 100)
    : 0;
  const patternLabel = relationship.amount_type === 'fixed'
    ? 'Fixed (0% variance)'
    : relationship.amount_type === 'variable'
    ? `Variable (${variancePct}% variance)`
    : 'N/A';

  // Subtitle
  const subCategoryTitle = relationship.category === 'insurance'
    ? 'Recurring Insurance Premium'
    : relationship.category === 'loan'
    ? 'Recurring Loan EMI'
    : relationship.category === 'investment'
    ? 'Recurring SIP / Investment'
    : relationship.category === 'subscription'
    ? 'Monthly Digital Subscription'
    : relationship.category === 'utility'
    ? 'Recurring Utility Service'
    : 'Financial Relationship';

  return (
    <div className="relationship-detail-card" aria-label="Relationship detail view">
      {/* Header */}
      <div className="rel-detail-header">
        <div className="rel-header-left">
          <div className="rel-icon-box" style={{ backgroundColor: bgColor }} aria-hidden="true">
            {icon}
          </div>
          <div className="rel-header-title-wrap">
            <h3 className="rel-title">{relationship.display_name}</h3>
            <span className="rel-subtitle">{subCategoryTitle}</span>
          </div>
        </div>

        <div className="rel-header-right">
          {isRecurring ? (
            <span className="recurring-active-pill">
              <CheckCircle2 size={13} className="mr-1" />
              <span>Recurring</span>
            </span>
          ) : (
            <span className="recurring-onetime-pill">
              <span>One-time</span>
            </span>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="rel-detail-tabs" role="tablist">
        <button
          type="button"
          className={`rel-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
          role="tab"
          aria-selected={activeTab === 'summary'}
        >
          Summary
        </button>
        <button
          type="button"
          className={`rel-tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
          role="tab"
          aria-selected={activeTab === 'transactions'}
        >
          Transactions ({txList.length || relationship.occurrence_count})
        </button>
        <button
          type="button"
          className={`rel-tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
          role="tab"
          aria-selected={activeTab === 'evidence'}
        >
          Evidence ({evidenceCount})
        </button>
      </div>

      {/* Tab 1: SUMMARY */}
      {activeTab === 'summary' && (
        <div className="rel-summary-pane">
          {/* 2-Column Metrics Grid */}
          <div className="rel-metrics-grid">
            {/* Row 1 */}
            <div className="metric-col">
              <span className="metric-label">Occurrences</span>
              <span className="metric-val">{relationship.occurrence_count}</span>
            </div>
            <div className="metric-col">
              <span className="metric-label">Months observed</span>
              <span className="metric-val">
                {relationship.unique_month_count || relationship.occurrence_count} / {totalObservedMonths}
              </span>
            </div>

            {/* Row 2 */}
            <div className="metric-col">
              <span className="metric-label">First transaction</span>
              <span className="metric-val">{formatDate(relationship.first_observed_date)}</span>
            </div>
            <div className="metric-col">
              <span className="metric-label">Last transaction</span>
              <span className="metric-val">{formatDate(relationship.last_observed_date)}</span>
            </div>

            {/* Row 3 */}
            <div className="metric-col">
              <span className="metric-label">Average interval</span>
              <span className="metric-val">
                {relationship.average_interval_days ? `${relationship.average_interval_days.toFixed(1)} days` : '—'}
              </span>
            </div>
            <div className="metric-col">
              <span className="metric-label">Cadence</span>
              <span className="metric-val">
                {relationship.cadence ? relationship.cadence.charAt(0).toUpperCase() + relationship.cadence.slice(1) : '—'}
              </span>
            </div>

            {/* Row 4 */}
            <div className="metric-col">
              <span className="metric-label">Average amount</span>
              <span className="metric-val">{formatCurrency(relationship.average_amount)}</span>
            </div>
            <div className="metric-col">
              <span className="metric-label">Amount range</span>
              <span className="metric-val">
                {formatCurrency(relationship.min_amount || relationship.average_amount)} – {formatCurrency(relationship.max_amount || relationship.average_amount)}
              </span>
            </div>

            {/* Row 5 */}
            <div className="metric-col">
              <span className="metric-label">Amount pattern</span>
              <span className="metric-val font-medium text-emerald-800">{patternLabel}</span>
            </div>
            <div className="metric-col">
              <span className="metric-label">Recurrence strength</span>
              <div className="metric-strength-wrap">
                <span className={`detail-strength-badge strength-${relationship.recurrence_strength || 'strong'}`}>
                  {relationship.recurrence_strength ? relationship.recurrence_strength.charAt(0).toUpperCase() + relationship.recurrence_strength.slice(1) : 'Strong'}
                </span>
                <span className="detail-confidence-text">{confidencePercent}%</span>
              </div>
            </div>
          </div>

          {/* Monthly Occurrence Pattern */}
          <MonthlyOccurrencePattern
            relationship={relationship}
            observationWindow={observationWindow}
          />
        </div>
      )}

      {/* Tab 2: TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="rel-transactions-pane">
          <TransactionHistory
            relationship={relationship}
            showTitle={false}
          />
        </div>
      )}

      {/* Tab 3: EVIDENCE */}
      {activeTab === 'evidence' && (
        <div className="rel-evidence-pane">
          <EvidenceSources
            relationship={relationship}
            uploadedDocuments={uploadedDocuments}
          />
        </div>
      )}
    </div>
  );
}
