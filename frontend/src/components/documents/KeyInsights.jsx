/**
 * Key Insights Component
 * Displays human-readable, deterministic intelligence bullet points and disclaimer.
 */

import React from 'react';
import {
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

export default function KeyInsights({
  resultData,
  entities = [],
  evidence = [],
  warnings = [],
  overallConfidence = 0.0,
}) {
  const formatCurrency = (amount, currency = 'INR') => {
    if (amount === null || amount === undefined) return null;
    const symbol = currency === 'INR' ? '₹' : currency;
    return `${symbol} ${Number(amount).toLocaleString('en-IN')}`;
  };

  // Generate deterministic insights from real data
  const generateInsights = () => {
    const list = [];
    const entity = entities && entities.length > 0 ? entities[0] : null;

    if (!entity && (!evidence || evidence.length === 0)) {
      list.push({
        text: 'Document processed without structured entity detection.',
        type: 'info',
      });
      return list;
    }

    if (entity) {
      // 1. Entity & Amounts
      if (entity.sum_assured) {
        list.push({
          text: `${entity.display_name || 'Policy'} with sum assured of ${formatCurrency(
            entity.sum_assured,
            entity.currency
          )} identified`,
          type: 'success',
        });
      } else if (entity.investment_value) {
        list.push({
          text: `${entity.display_name || 'Investment'} with current valuation of ${formatCurrency(
            entity.investment_value,
            entity.currency
          )} identified`,
          type: 'success',
        });
      } else if (entity.account_balance) {
        list.push({
          text: `${entity.display_name || 'Account'} with balance of ${formatCurrency(
            entity.account_balance,
            entity.currency
          )} identified`,
          type: 'success',
        });
      } else if (entity.outstanding_amount) {
        list.push({
          text: `${entity.display_name || 'Liability'} with outstanding amount of ${formatCurrency(
            entity.outstanding_amount,
            entity.currency
          )} identified`,
          type: 'success',
        });
      } else if (entity.premium_amount) {
        const freqText = entity.frequency ? ` (${entity.frequency})` : '';
        list.push({
          text: `${entity.display_name || 'Insurance policy'} with recurring premium of ${formatCurrency(
            entity.premium_amount,
            entity.currency
          )}${freqText} identified`,
          type: 'success',
        });
      } else if (entity.amount) {
        list.push({
          text: `${entity.display_name || 'Financial asset'} with ${formatCurrency(
            entity.amount,
            entity.currency
          )} identified`,
          type: 'success',
        });
      } else if (entity.display_name) {
        list.push({
          text: `${entity.display_name} relationship identified`,
          type: 'success',
        });
      }

      // 2. Premium / Recurring (if not already covered in primary insight)
      if (!entity.premium_amount) {
        const premiumEvidence = evidence.find(
          (ev) =>
            ev.field.toLowerCase().includes('premium') ||
            ev.field.toLowerCase().includes('installment')
        );
        if (premiumEvidence) {
          const freqText = entity.frequency ? ` (${entity.frequency})` : '';
          list.push({
            text: `Recurring payment of ${premiumEvidence.value}${freqText} detected`,
            type: 'success',
          });
        } else if (entity.frequency && entity.frequency !== 'one_time') {
          list.push({
            text: `Payment frequency identified as ${entity.frequency}`,
            type: 'success',
          });
        }
      }

      // 3. Nominee
      const nomineeEvidence = evidence.find((ev) =>
        ev.field.toLowerCase().includes('nominee')
      );
      if (nomineeEvidence) {
        list.push({
          text: `Nominee identified: ${nomineeEvidence.value}`,
          type: 'success',
        });
      } else if (entity.nominee_status && entity.nominee_status !== 'unverified' && entity.nominee_status !== 'none') {
        list.push({
          text: `Nominee status recorded as ${entity.nominee_status}`,
          type: 'success',
        });
      }

      // 4. Maturity / Expiry Date
      const maturityEvidence = evidence.find(
        (ev) =>
          ev.field.toLowerCase().includes('maturity') ||
          ev.field.toLowerCase().includes('expiry') ||
          ev.field.toLowerCase().includes('validity')
      );
      if (maturityEvidence) {
        list.push({
          text: `Maturity date recorded: ${maturityEvidence.value}`,
          type: 'success',
        });
      }

      // 5. High confidence summary
      if (overallConfidence >= 0.85) {
        list.push({
          text: 'All key relationship details extracted with high confidence',
          type: 'success',
        });
      } else if (overallConfidence >= 0.6) {
        list.push({
          text: 'Document extraction completed with moderate confidence',
          type: 'info',
        });
      }
    }

    // Backend warnings
    if (warnings && warnings.length > 0) {
      warnings.forEach((warn) => {
        list.push({
          text: warn,
          type: 'warning',
        });
      });
    }

    return list;
  };

  const insights = generateInsights();

  return (
    <div className="key-insights-container" aria-label="Key Insights Section">
      <div className="insights-header-row">
        <div className="insights-icon-circle" aria-hidden="true">
          <Lightbulb size={18} />
        </div>
        <h4 className="insights-title">Key Insights</h4>
      </div>

      <ul className="insights-list">
        {insights.map((item, idx) => (
          <li key={idx} className={`insight-item insight-${item.type}`}>
            {item.type === 'warning' ? (
              <AlertCircle size={16} className="insight-icon text-amber-600" aria-hidden="true" />
            ) : item.type === 'info' ? (
              <AlertCircle size={16} className="insight-icon text-blue-600" aria-hidden="true" />
            ) : (
              <CheckCircle2 size={16} className="insight-icon text-emerald-600" aria-hidden="true" />
            )}
            <span className="insight-text">{item.text}</span>
          </li>
        ))}
      </ul>

      {/* Verification Disclaimer */}
      <div className="ai-disclaimer-box" role="note">
        <AlertTriangle size={15} className="disclaimer-icon" aria-hidden="true" />
        <p className="disclaimer-text">
          AI-extracted information should be verified against the original document before taking financial action.
        </p>
      </div>
    </div>
  );
}
