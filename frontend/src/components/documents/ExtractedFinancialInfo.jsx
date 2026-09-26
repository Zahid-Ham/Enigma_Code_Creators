/**
 * Extracted Financial Information Component
 * Renders detected financial relationships, key-value data fields, and paired insights.
 */

import React from 'react';
import {
  Shield,
  Landmark,
  PiggyBank,
  Receipt,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import {
  getEntityCardFields,
  normalizeEntityType,
} from '../../constants/financialFields';
import KeyInsights from './KeyInsights';

export default function ExtractedFinancialInfo({
  entities = [],
  evidence = [],
  warnings = [],
  overallConfidence = 0.0,
}) {
  const formatCurrency = (amount, currency = 'INR') => {
    if (amount === null || amount === undefined || isNaN(amount)) return null;
    const symbol = currency === 'INR' ? '₹' : currency;
    return `${symbol} ${Number(amount).toLocaleString('en-IN')}`;
  };

  const getEntityIcon = (type = '') => {
    const norm = normalizeEntityType(type);
    if (norm === 'insurance') return <Shield size={20} className="text-emerald-700" />;
    if (norm === 'bank_account' || norm === 'fixed_deposit' || norm === 'ppf')
      return <Landmark size={20} className="text-emerald-700" />;
    if (norm === 'investment' || norm === 'epf')
      return <PiggyBank size={20} className="text-emerald-700" />;
    return <Receipt size={20} className="text-emerald-700" />;
  };

  const entityCount = entities.length;

  return (
    <section
      className="intel-card extracted-financial-card"
      aria-labelledby="extracted-financial-heading"
    >
      <div className="extracted-section-header">
        <h3 id="extracted-financial-heading" className="extracted-section-title">
          Extracted Financial Information
        </h3>
        <span className="relationship-count-badge">
          {entityCount} {entityCount === 1 ? 'financial relationship' : 'financial relationships'} identified
        </span>
      </div>

      {entityCount === 0 ? (
        <div className="no-entities-state">
          <AlertCircle size={24} className="text-muted" aria-hidden="true" />
          <p>No financial entities were directly detected in this document.</p>
        </div>
      ) : (
        <div className="extracted-content-grid">
          {entities.map((entity, idx) => {
            const entityConfidencePercent = Math.round((entity.confidence || overallConfidence || 0) * 100);
            const cardFields = getEntityCardFields(entity, evidence, formatCurrency);

            return (
              <div key={idx} className="entity-breakdown-card">
                {/* Entity Heading */}
                <div className="entity-header-row">
                  <div className="entity-title-left">
                    <div className="entity-icon-badge" aria-hidden="true">
                      {getEntityIcon(entity.entity_type || entity.display_name)}
                    </div>
                    <h4 className="entity-display-name">{entity.display_name || 'Financial Entity'}</h4>
                  </div>

                  <span className="ai-extracted-tag">
                    <Sparkles size={13} aria-hidden="true" />
                    <span>AI Extracted</span>
                  </span>
                </div>

                {/* Key-Value Fields Grid */}
                <div className="entity-fields-table">
                  {cardFields.map((field, fIdx) => (
                    <div className="field-data-row" key={fIdx}>
                      <span className="field-data-label">{field.label}</span>
                      <span
                        className={`field-data-val ${field.isEmpty ? 'val-empty' : ''} ${
                          field.highlight ? 'val-highlight' : ''
                        }`}
                      >
                        {field.value}
                      </span>
                    </div>
                  ))}

                  <div className="field-data-row">
                    <span className="field-data-label">Status</span>
                    <span className="field-data-val">
                      <span className="status-pill-inferred">
                        {entity.status
                          ? entity.status.charAt(0).toUpperCase() + entity.status.slice(1)
                          : 'Inferred'}
                      </span>
                    </span>
                  </div>

                  <div className="field-data-row">
                    <span className="field-data-label">Confidence</span>
                    <span className="field-data-val font-semibold">
                      {entityConfidencePercent}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Right Section: Key Insights */}
          <KeyInsights
            entities={entities}
            evidence={evidence}
            warnings={warnings}
            overallConfidence={overallConfidence}
          />
        </div>
      )}
    </section>
  );
}
