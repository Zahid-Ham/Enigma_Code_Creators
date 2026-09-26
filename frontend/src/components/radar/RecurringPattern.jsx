/**
 * Dynamic Monthly Pattern Visualization Chart
 */

import React from 'react';
import { Check } from 'lucide-react';

export default function RecurringPattern({ pattern = [], averageAmount = 0 }) {
  // If pattern is empty, provide default fallback structure
  const displayMonths = pattern && pattern.length > 0 ? pattern : [
    { month: 'Apr', amount: averageAmount || 4250, occurrences: 1, status: 'active' },
    { month: 'May', amount: averageAmount || 4250, occurrences: 1, status: 'active' },
    { month: 'Jun', amount: averageAmount || 4250, occurrences: 1, status: 'active' },
    { month: 'Jul', amount: averageAmount || 4250, occurrences: 1, status: 'active' },
    { month: 'Aug', amount: averageAmount || 4250, occurrences: 1, status: 'active' },
    { month: 'Sep', amount: averageAmount || 4250, occurrences: 1, status: 'active' },
  ];

  const maxVal = Math.max(...displayMonths.map((p) => p.amount), 1);
  const scaleMax = maxVal > 10000 ? Math.ceil(maxVal / 5000) * 5000 : Math.ceil(maxVal / 2000) * 2000;

  return (
    <div className="recurring-pattern-container" aria-label="Monthly Recurring Payment Activity">
      <div className="pattern-header">
        <h4 className="pattern-title">Monthly Pattern</h4>
      </div>

      {/* Top Status Checkmark Indicators */}
      <div className="pattern-check-row" aria-hidden="true">
        {displayMonths.map((item, idx) => (
          <div key={`check-${item.month}-${idx}`} className="pattern-check-item">
            <div className="pattern-check-circle">
              <Check size={12} strokeWidth={3} className="text-white" />
            </div>
            <span className="pattern-check-label">{item.month}</span>
          </div>
        ))}
      </div>

      {/* Bar Chart Area */}
      <div className="pattern-chart-wrapper">
        {/* Y-Axis scale hints */}
        <div className="pattern-y-axis" aria-hidden="true">
          <span>₹{scaleMax >= 1000 ? `${Math.round(scaleMax / 1000)}k` : scaleMax}</span>
          <span>₹{scaleMax >= 1000 ? `${Math.round((scaleMax * 0.66) / 1000)}k` : Math.round(scaleMax * 0.66)}</span>
          <span>₹{scaleMax >= 1000 ? `${Math.round((scaleMax * 0.33) / 1000)}k` : Math.round(scaleMax * 0.33)}</span>
          <span>₹0</span>
        </div>

        {/* Bars Container */}
        <div className="pattern-bars-track">
          {displayMonths.map((item, idx) => {
            const heightPct = Math.min(100, Math.max(15, (item.amount / scaleMax) * 100));
            const formattedAmt = `₹${Number(item.amount).toLocaleString('en-IN')}`;

            return (
              <div key={`bar-${item.month}-${idx}`} className="pattern-bar-column">
                <span className="pattern-bar-value">{formattedAmt}</span>
                <div className="pattern-bar-fill-slot">
                  <div
                    className="pattern-bar-fill"
                    style={{ height: `${heightPct}%` }}
                    title={`${item.month}: ${formattedAmt}`}
                  />
                </div>
                <span className="pattern-bar-bottom-label">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
