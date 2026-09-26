import React, { useState } from 'react';
import {
  Link2,
  Calendar,
  Receipt,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Shield,
  Home,
  TrendingUp,
  CreditCard,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import RecurringRelationshipDetail from './RecurringRelationshipDetail';

/**
 * Format date range to e.g. "Apr – Sep"
 */
function formatObservationPeriod(startStr, endStr) {
  if (!startStr || !endStr) return 'Apr – Sep';
  try {
    const s = new Date(startStr);
    const e = new Date(endStr);
    const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
    const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
    return `${sMonth} – ${eMonth}`;
  } catch {
    return 'Apr – Sep';
  }
}

/**
 * Category color badge mapping
 */
function getCategoryBadge(category = '') {
  const cat = (category || '').toLowerCase();
  if (cat.includes('insurance')) {
    return { bg: '#FCE7F3', text: '#9D174D', label: 'Insurance' };
  }
  if (cat.includes('loan')) {
    return { bg: '#DBEAFE', text: '#1E40AF', label: 'Loan' };
  }
  if (cat.includes('investment') || cat.includes('sip')) {
    return { bg: '#DCFCE7', text: '#166534', label: 'Investment' };
  }
  if (cat.includes('subscription')) {
    return { bg: '#FEF3C7', text: '#92400E', label: 'Subscription' };
  }
  if (cat.includes('utility')) {
    return { bg: '#E0F2FE', text: '#0369A1', label: 'Utility' };
  }
  return { bg: '#F3F4F6', text: '#374151', label: category || 'Other' };
}

/**
 * Institution icon mapping
 */
function getInstitutionIcon(institution = '', category = '') {
  const text = `${institution} ${category}`.toLowerCase();
  if (text.includes('insurance') || text.includes('life') || text.includes('securehealth')) {
    return <Shield size={16} className="text-red-500" />;
  }
  if (text.includes('housing') || text.includes('loan') || text.includes('mortgage')) {
    return <Home size={16} className="text-blue-600" />;
  }
  if (text.includes('greenwood') || text.includes('investment') || text.includes('asset')) {
    return <TrendingUp size={16} className="text-emerald-700" />;
  }
  if (text.includes('streamflix') || text.includes('subscription') || text.includes('netflix')) {
    return <CreditCard size={16} className="text-amber-500" />;
  }
  if (text.includes('power') || text.includes('utility') || text.includes('city')) {
    return <Sparkles size={16} className="text-blue-500" />;
  }
  return <Layers size={16} className="text-gray-500" />;
}

/**
 * CombinedAnalysis Component (Right Column)
 * Displays Estate-wide cross-document synthesized recurring financial relationships.
 */
export default function CombinedAnalysis({
  recurrenceData,
  totalDocs = 4,
  onSelectSourceDocument,
  uploadedDocuments = [],
}) {
  const [activeTab, setActiveTab] = useState('combined'); // 'combined' | 'recurring_tx'
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRel, setSelectedRel] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Derive dynamic counts & metrics from backend recurrenceData
  const relationships = recurrenceData?.relationships || [];

  const obsWindow = recurrenceData?.observation_window || {};
  const totalTransactions = recurrenceData?.total_transactions_analyzed || 0;
  const totalObservedMonths = obsWindow.total_months ? Math.round(obsWindow.total_months) : (relationships.length > 0 ? 6 : 0);
  const periodStr = formatObservationPeriod(obsWindow.start, obsWindow.end);

  const strongCount = relationships.filter((r) => r.recurrence_strength === 'strong').length;
  const moderateCount = relationships.filter((r) => r.recurrence_strength === 'moderate').length;
  const weakCount = relationships.filter((r) => r.recurrence_strength === 'weak').length;
  const oneTimeCount = relationships.filter(
    (r) => r.recurrence_strength === 'insufficient' || r.occurrence_count < 2
  ).length;

  const filteredRelationships = relationships.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'strong') return r.recurrence_strength === 'strong';
    if (activeFilter === 'moderate') return r.recurrence_strength === 'moderate';
    if (activeFilter === 'weak') return r.recurrence_strength === 'weak';
    if (activeFilter === 'onetime') return r.recurrence_strength === 'insufficient' || r.occurrence_count < 2;
    return true;
  });

  const handleRowClick = (rel) => {
    setSelectedRel(rel);
    setIsDetailDrawerOpen(true);
  };

  return (
    <article className="combined-analysis-panel" aria-label="Combined Cross-Document Recurring Analysis">
      {/* Top Header Tabs */}
      <div className="combined-tabs-row">
        <button
          type="button"
          className={`combined-tab-btn ${activeTab === 'combined' ? 'active' : ''}`}
          onClick={() => setActiveTab('combined')}
        >
          <span>Combined Analysis</span>
        </button>
        <button
          type="button"
          className={`combined-tab-btn ${activeTab === 'recurring_tx' ? 'active' : ''}`}
          onClick={() => setActiveTab('recurring_tx')}
        >
          <span>Recurring Transactions ({relationships.length})</span>
        </button>
      </div>

      {/* Title Section */}
      <div className="combined-title-section">
        <h3 className="combined-title">Recurring Financial Relationships</h3>
        <p className="combined-subtitle">
          {relationships.length > 0
            ? `Detected from ${totalTransactions} transactions across ${totalDocs} documents`
            : 'Multi-document cross-correlation & recurrence discovery'}
        </p>
      </div>

      {relationships.length === 0 ? (
        <div className="combined-empty-card">
          <div className="combined-empty-icon-wrap">
            <Link2 size={32} className="text-gray-400" />
          </div>
          <h4 className="combined-empty-title">No Recurring Relationships Discovered Yet</h4>
          <p className="combined-empty-desc">
            Upload multiple financial records (such as 3–6 months of bank statements or policies) to automatically uncover recurring premiums, loan EMIs, SIP investments, and utility patterns across your estate.
          </p>
        </div>
      ) : (
        <>
          {/* 5 Summary Stat Metric Cards */}
          <div className="combined-summary-cards-grid">
            <div className="comb-stat-card">
              <div className="comb-stat-icon-wrap bg-blue-50">
                <Link2 size={16} className="text-blue-600" />
              </div>
              <div className="comb-stat-val">{relationships.length}</div>
              <div className="comb-stat-lbl">Recurring Relationships</div>
            </div>

            <div className="comb-stat-card">
              <div className="comb-stat-icon-wrap bg-emerald-50">
                <Calendar size={16} className="text-emerald-700" />
              </div>
              <div className="comb-stat-val">{totalObservedMonths} Months</div>
              <div className="comb-stat-lbl">Observation Period ({periodStr})</div>
            </div>

            <div className="comb-stat-card">
              <div className="comb-stat-icon-wrap bg-purple-50">
                <Receipt size={16} className="text-purple-600" />
              </div>
              <div className="comb-stat-val">{totalTransactions}</div>
              <div className="comb-stat-lbl">Total Transactions</div>
            </div>

            <div className="comb-stat-card">
              <div className="comb-stat-icon-wrap bg-emerald-50">
                <BarChart3 size={16} className="text-emerald-700" />
              </div>
              <div className="comb-stat-val">{strongCount}</div>
              <div className="comb-stat-lbl">Strong Relationships</div>
            </div>

            <div className="comb-stat-card">
              <div className="comb-stat-icon-wrap bg-red-50">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <div className="comb-stat-val">{oneTimeCount}</div>
              <div className="comb-stat-lbl">One-time / Non-recurring</div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="comb-filter-pills-row">
            <button
              type="button"
              className={`comb-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({relationships.length})
            </button>
            <button
              type="button"
              className={`comb-pill ${activeFilter === 'strong' ? 'active' : ''}`}
              onClick={() => setActiveFilter('strong')}
            >
              Strong ({strongCount})
            </button>
            <button
              type="button"
              className={`comb-pill ${activeFilter === 'moderate' ? 'active' : ''}`}
              onClick={() => setActiveFilter('moderate')}
            >
              Moderate ({moderateCount})
            </button>
            <button
              type="button"
              className={`comb-pill ${activeFilter === 'weak' ? 'active' : ''}`}
              onClick={() => setActiveFilter('weak')}
            >
              Weak ({weakCount})
            </button>
            <button
              type="button"
              className={`comb-pill ${activeFilter === 'onetime' ? 'active' : ''}`}
              onClick={() => setActiveFilter('onetime')}
            >
              One-time ({oneTimeCount})
            </button>
          </div>

          {/* Recurring Relationships Table */}
          <div className="comb-table-container">
            <table className="comb-recurring-table">
              <thead>
                <tr>
                  <th>Institution / Merchant</th>
                  <th>Category</th>
                  <th>Occurrences</th>
                  <th>Cadence</th>
                  <th>Avg Amount</th>
                  <th>Strength</th>
                  <th aria-label="Action"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRelationships.map((rel) => {
                  const catBadge = getCategoryBadge(rel.category);
                  const strength = rel.recurrence_strength || 'strong';
                  const strengthLabel =
                    strength === 'strong'
                      ? 'Strong'
                      : strength === 'moderate'
                      ? 'Moderate'
                      : strength === 'weak'
                      ? 'Weak'
                      : 'Insufficient';

                  const strengthBadgeClass =
                    strength === 'strong'
                      ? 'badge-str-strong'
                      : strength === 'moderate'
                      ? 'badge-str-moderate'
                      : strength === 'weak'
                      ? 'badge-str-weak'
                      : 'badge-str-insufficient';

                  const occurrencesText = `${rel.occurrence_count} (${rel.occurrence_count}/${rel.expected_occurrences || totalObservedMonths} months)`;
                  const cadenceText = rel.cadence ? rel.cadence.charAt(0).toUpperCase() + rel.cadence.slice(1) : '-';

                  return (
                    <tr
                      key={rel.relationship_id || rel.display_name}
                      onClick={() => handleRowClick(rel)}
                      className="comb-table-row"
                      tabIndex={0}
                    >
                      {/* Institution */}
                      <td className="comb-cell-merchant">
                        <div className="comb-merchant-wrap">
                          <div className="comb-inst-icon-box">
                            {getInstitutionIcon(rel.display_name, rel.category)}
                          </div>
                          <span className="comb-merchant-name">{rel.display_name || rel.merchant_name}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span
                          className="comb-cat-pill"
                          style={{ backgroundColor: catBadge.bg, color: catBadge.text }}
                        >
                          {catBadge.label}
                        </span>
                      </td>

                      {/* Occurrences */}
                      <td className="comb-cell-occ">{occurrencesText}</td>

                      {/* Cadence */}
                      <td className="comb-cell-cadence">{cadenceText}</td>

                      {/* Avg Amount */}
                      <td className="comb-cell-amount font-semibold">
                        ₹{Number(rel.average_amount || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Strength */}
                      <td>
                        <span className={`comb-strength-badge ${strengthBadgeClass}`}>
                          {strengthLabel}
                        </span>
                      </td>

                      {/* Chevron */}
                      <td className="comb-cell-arrow text-right">
                        <ChevronRight size={15} className="text-gray-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Info Callout Card */}
          <div className="comb-info-banner">
            <div className="comb-info-icon-box">
              <Lightbulb size={18} className="text-emerald-800" />
            </div>
            <p className="comb-info-text">
              <strong>These recurring relationships are detected across multiple documents.</strong> Click on any relationship to view detailed analysis, transaction history, and source documents.
            </p>
          </div>
        </>
      )}

      {/* Relationship Detail Modal / Drawer */}
      {isDetailDrawerOpen && selectedRel && (
        <div className="comb-detail-modal-overlay" onClick={() => setIsDetailDrawerOpen(false)}>
          <div className="comb-detail-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="comb-modal-header">
              <h3 className="modal-title">{selectedRel.display_name || selectedRel.merchant_name}</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsDetailDrawerOpen(false)}
                aria-label="Close detail modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="comb-modal-body">
              <RecurringRelationshipDetail
                relationship={selectedRel}
                observationWindow={obsWindow}
                uploadedDocuments={uploadedDocuments}
                totalObservedMonths={totalObservedMonths}
                onSelectSourceDoc={(docId) => {
                  setIsDetailDrawerOpen(false);
                  if (onSelectSourceDocument) onSelectSourceDocument(docId);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
