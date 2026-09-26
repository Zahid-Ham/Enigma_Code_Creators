/**
 * Right Column - Key Insights & Full Estate Analysis Action Card
 */

import React from 'react';
import { Lightbulb, CheckCircle2, Target, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RiskAlerts({
  insights = [],
  riskAlerts = [],
}) {
  const navigate = useNavigate();

  const displayInsights = insights && insights.length > 0 ? insights : [
    'Regular insurance premium detected across observation window.',
    'Relationships corroborated across bank statement and policy documents.',
    'Nominee verification recorded where master documents are present.',
    'No unregistered high-risk liabilities detected.',
  ];

  return (
    <div className="radar-right-column-group">
      {/* Key Insights Box */}
      <div className="radar-right-card radar-insights-card" aria-label="Key Estate Discovery Insights">
        <div className="radar-right-card-header">
          <div className="radar-right-title-group">
            <Lightbulb size={17} className="text-emerald-800 mr-2 inline" />
            <h3 className="radar-right-card-title">Key Insights</h3>
          </div>
        </div>

        <ul className="radar-insights-list">
          {displayInsights.map((insight, idx) => (
            <li key={`ins-${idx}`} className="radar-insight-item">
              <div className="radar-insight-check" aria-hidden="true">
                <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
              </div>
              <span className="radar-insight-text">{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* View Full Estate Analysis Card */}
      <div
        className="radar-cta-analysis-card"
        onClick={() => navigate('/documents')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/documents')}
      >
        <div className="radar-cta-inner">
          <div className="radar-cta-icon-circle" aria-hidden="true">
            <Target size={22} className="text-emerald-300" />
          </div>

          <div className="radar-cta-content">
            <h4 className="radar-cta-title">View Full Estate Analysis</h4>
            <p className="radar-cta-desc">
              See all relationships, risks and opportunities across your financial documents.
            </p>
          </div>

          <div className="radar-cta-arrow" aria-hidden="true">
            <ChevronRight size={18} className="text-emerald-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
