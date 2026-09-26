/**
 * Center Detail Workspace for Selected Discovered Relationship
 */

import React, { useState } from 'react';
import {
  Shield,
  Home,
  TrendingUp,
  CreditCard,
  Zap,
  Landmark,
  FileText,
  CheckCircle2,
  ChevronLeft,
  Building,
  Tag,
  Repeat,
  Sparkles,
  Percent,
  Calendar,
  Clock,
  CircleDollarSign,
  UserCheck,
} from 'lucide-react';
import RecurringPattern from './RecurringPattern';
import { EvidenceSummaryCard, TransactionEvidenceTable, SourceDocumentsList } from './EvidencePanel';

function getCategoryIcon(type = '', category = '') {
  const text = `${type} ${category}`.toLowerCase();
  if (text.includes('insurance') || text.includes('life') || text.includes('policy')) {
    return <Shield size={26} className="text-emerald-700" />;
  }
  if (text.includes('loan') || text.includes('home') || text.includes('mortgage') || text.includes('nhb')) {
    return <Home size={26} className="text-emerald-800" />;
  }
  if (text.includes('investment') || text.includes('mutual') || text.includes('sip') || text.includes('asset')) {
    return <TrendingUp size={26} className="text-emerald-700" />;
  }
  if (text.includes('streamflix') || text.includes('subscription') || text.includes('ott')) {
    return <CreditCard size={26} className="text-emerald-700" />;
  }
  if (text.includes('power') || text.includes('utility') || text.includes('electricity')) {
    return <Zap size={26} className="text-blue-600" />;
  }
  if (text.includes('bank') || text.includes('hdfc') || text.includes('sbi') || text.includes('icici')) {
    return <Landmark size={26} className="text-purple-700" />;
  }
  return <FileText size={26} className="text-gray-700" />;
}

export default function DiscoveryDetails({
  discovery = null,
  onBack = () => {},
}) {
  const [detailTab, setDetailTab] = useState('overview'); // 'overview' | 'timeline' | 'evidence' | 'documents'

  if (!discovery) {
    return (
      <article className="radar-detail-workspace radar-detail-empty" aria-label="Discovery Workspace">
        <div className="radar-empty-state-wrap">
          <FileText size={38} className="text-gray-400" />
          <h3>No Relationship Selected</h3>
          <p>Select a discovered financial entity from the left list to inspect cross-document evidence, cadence patterns, and nominee details.</p>
        </div>
      </article>
    );
  }

  const instName = discovery.institution_name || 'Financial Provider';
  const relType = discovery.relationship_type || 'Recurring Relationship';
  const confPct = discovery.confidence_pct || Math.round((discovery.confidence || 0.95) * 100);
  const avgFormatted = `₹${Number(discovery.average_amount || 0).toLocaleString('en-IN')}`;
  const docCount = (discovery.source_documents || []).length || 1;
  const docNamesLabel = (discovery.source_documents || []).map((d) => {
    const fn = (d.filename || '').toLowerCase();
    if (fn.includes('bank')) return 'Bank';
    if (fn.includes('insurance') || fn.includes('policy')) return 'Policy';
    if (fn.includes('loan')) return 'Loan';
    if (fn.includes('mutual') || fn.includes('sip')) return 'MF';
    return 'Document';
  }).join(' + ') || 'Bank Statement';

  return (
    <article className="radar-detail-workspace" aria-label={`Discovery detail for ${instName}`}>
      {/* Back breadcrumb for compact/mobile */}
      <div className="radar-detail-breadcrumb">
        <button type="button" className="radar-back-link" onClick={onBack}>
          <ChevronLeft size={16} />
          <span>Back to Radar</span>
        </button>
      </div>

      {/* Main Detail Header */}
      <header className="radar-detail-header">
        <div className="radar-detail-header-left">
          <div className="radar-detail-icon-circle" aria-hidden="true">
            {getCategoryIcon(discovery.financial_entity_type, discovery.relationship_label)}
          </div>

          <div className="radar-detail-title-group">
            <h2 className="radar-detail-inst-title">{instName}</h2>
            <p className="radar-detail-rel-subtitle">{relType}</p>
          </div>
        </div>

        <div className="radar-detail-header-right">
          <div className="radar-strong-match-badge" title="High confidence discovery verified across sources">
            <CheckCircle2 size={15} className="text-emerald-700" />
            <span className="font-semibold text-emerald-800">{discovery.status || 'Strong Match'}</span>
            <span className="text-emerald-700 font-normal">({confPct}% confidence)</span>
          </div>
        </div>
      </header>

      {/* 4 Metric Summary Cards */}
      <div className="radar-detail-metrics-grid">
        <div className="radar-metric-card">
          <span className="radar-metric-val">{discovery.occurrence_count}</span>
          <span className="radar-metric-label">Occurrences</span>
          <span className="radar-metric-sub">{discovery.occurrence_count}/{discovery.occurrence_count} months</span>
        </div>

        <div className="radar-metric-card">
          <span className="radar-metric-val">{discovery.cadence || 'Monthly'}</span>
          <span className="radar-metric-label">Cadence</span>
          <span className="radar-metric-sub">Regular interval</span>
        </div>

        <div className="radar-metric-card">
          <span className="radar-metric-val">{avgFormatted}</span>
          <span className="radar-metric-label">Avg. Amount</span>
          <span className="radar-metric-sub">{discovery.amount_pattern || 'Fixed'} amount</span>
        </div>

        <div className="radar-metric-card">
          <span className="radar-metric-val">{docCount}</span>
          <span className="radar-metric-label">Source Documents</span>
          <span className="radar-metric-sub">{docNamesLabel}</span>
        </div>
      </div>

      {/* Detail Tab Navigation */}
      <div className="radar-detail-tabs-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={detailTab === 'overview'}
          className={`radar-detail-tab-btn ${detailTab === 'overview' ? 'active' : ''}`}
          onClick={() => setDetailTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={detailTab === 'timeline'}
          className={`radar-detail-tab-btn ${detailTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setDetailTab('timeline')}
        >
          Timeline
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={detailTab === 'evidence'}
          className={`radar-detail-tab-btn ${detailTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setDetailTab('evidence')}
        >
          Transaction Evidence ({discovery.transactions?.length || 0})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={detailTab === 'documents'}
          className={`radar-detail-tab-btn ${detailTab === 'documents' ? 'active' : ''}`}
          onClick={() => setDetailTab('documents')}
        >
          Source Documents ({docCount})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="radar-tab-content-pane">
        {detailTab === 'overview' && (
          <div className="radar-overview-grid">
            {/* Left Box: Relationship Details Table */}
            <div className="radar-rel-details-card">
              <h4 className="radar-box-title">Relationship Details</h4>

              <div className="radar-key-val-list">
                <div className="radar-kv-row">
                  <span className="radar-kv-label">
                    <Building size={14} className="inline mr-2 text-gray-400" />
                    Institution / Merchant
                  </span>
                  <span className="radar-kv-val font-semibold">{instName}</span>
                </div>

                <div className="radar-kv-row">
                  <span className="radar-kv-label">
                    <Tag size={14} className="inline mr-2 text-gray-400" />
                    Category
                  </span>
                  <span className="radar-kv-val capitalize">{discovery.financial_entity_type || 'Insurance'}</span>
                </div>

                <div className="radar-kv-row">
                  <span className="radar-kv-label">
                    <Repeat size={14} className="inline mr-2 text-gray-400" />
                    Relationship Type
                  </span>
                  <span className="radar-kv-val">{relType}</span>
                </div>

                <div className="radar-kv-row">
                  <span className="radar-kv-label">
                    <Sparkles size={14} className="inline mr-2 text-gray-400" />
                    Strength
                  </span>
                  <span className="radar-kv-val">
                    <span className="radar-badge-strength badge-strong">{discovery.strength || 'Strong'}</span>
                  </span>
                </div>

                <div className="radar-kv-row">
                  <span className="radar-kv-label">
                    <Percent size={14} className="inline mr-2 text-gray-400" />
                    Confidence
                  </span>
                  <span className="radar-kv-val font-semibold">{confPct}%</span>
                </div>

                <div className="radar-kv-row">
                  <span className="radar-kv-label">
                    <Calendar size={14} className="inline mr-2 text-gray-400" />
                    First Observed
                  </span>
                  <span className="radar-kv-val">{discovery.first_observed || 'Apr 2026'}</span>
                </div>

                <div className="radar-kv-row">
                  <span className="radar-kv-label">
                    <Clock size={14} className="inline mr-2 text-gray-400" />
                    Last Observed
                  </span>
                  <span className="radar-kv-val">{discovery.last_observed || 'Sep 2026'}</span>
                </div>

                <div className="radar-kv-row">
                  <span className="radar-kv-label">
                    <Repeat size={14} className="inline mr-2 text-gray-400" />
                    Cadence
                  </span>
                  <span className="radar-kv-val">{discovery.cadence || 'Monthly'}</span>
                </div>

                <div className="radar-kv-row">
                  <span className="radar-kv-label">
                    <CircleDollarSign size={14} className="inline mr-2 text-gray-400" />
                    Amount Pattern
                  </span>
                  <span className="radar-kv-val">{discovery.amount_pattern || 'Fixed'}</span>
                </div>

                <div className="radar-kv-row">
                  <span className="radar-kv-label">
                    <UserCheck size={14} className="inline mr-2 text-gray-400" />
                    Nominee Status
                  </span>
                  <span className={`radar-kv-val ${discovery.nominee_name ? 'text-emerald-800 font-semibold' : 'text-gray-600'}`}>
                    {discovery.nominee_status || 'Not detected in available evidence'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Box: Monthly Pattern Chart */}
            <div className="radar-pattern-box">
              <RecurringPattern
                pattern={discovery.monthly_pattern}
                averageAmount={discovery.average_amount}
              />
            </div>

            {/* Bottom Full-Width Evidence Card */}
            <div className="radar-overview-bottom-span">
              <EvidenceSummaryCard
                sourceDocuments={discovery.source_documents}
                onViewSources={() => setDetailTab('documents')}
              />
            </div>
          </div>
        )}

        {(detailTab === 'timeline' || detailTab === 'evidence') && (
          <div className="radar-tab-section">
            <h4 className="radar-section-title">Verified Transaction Evidence</h4>
            <TransactionEvidenceTable transactions={discovery.transactions} />
          </div>
        )}

        {detailTab === 'documents' && (
          <div className="radar-tab-section">
            <h4 className="radar-section-title">Backing Source Documents</h4>
            <SourceDocumentsList sourceDocuments={discovery.source_documents} />
          </div>
        )}
      </div>
    </article>
  );
}
