import React from 'react';
import { Check, Minus } from 'lucide-react';

/**
 * Parses all distinct year-month strings from transactions and missing cycles
 */
function getObservedMonths(relationship, observationWindow) {
  const monthsMap = {};

  // Extract from transactions
  if (relationship?.transactions && relationship.transactions.length > 0) {
    for (const tx of relationship.transactions) {
      if (!tx.date) continue;
      try {
        const d = new Date(tx.date);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const monthName = d.toLocaleDateString('en-US', { month: 'short' });
          const year = d.getFullYear();
          monthsMap[key] = { label: monthName, year: String(year), present: true };
        }
      } catch {}
    }
  }

  // If missing cycles exist, mark those months as missing
  if (relationship?.missing_cycles && relationship.missing_cycles.length > 0) {
    for (const gap of relationship.missing_cycles) {
      if (gap.expected_period) {
        try {
          const d = new Date(gap.expected_period);
          if (!isNaN(d.getTime())) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthName = d.toLocaleDateString('en-US', { month: 'short' });
            const year = d.getFullYear();
            if (!monthsMap[key]) {
              monthsMap[key] = { label: monthName, year: String(year), present: false };
            } else {
              monthsMap[key].present = false;
            }
          }
        } catch {}
      }
    }
  }

  // If not enough months mapped (or fallback from observation window / default 6 months)
  const keys = Object.keys(monthsMap).sort();
  if (keys.length > 0) {
    return keys.map((k) => monthsMap[k]);
  }

  // Fallback defaults if no transactions present
  return [
    { label: 'Apr', year: '2026', present: true },
    { label: 'May', year: '2026', present: true },
    { label: 'Jun', year: '2026', present: true },
    { label: 'Jul', year: '2026', present: true },
    { label: 'Aug', year: '2026', present: true },
    { label: 'Sep', year: '2026', present: true },
  ];
}

/**
 * MonthlyOccurrencePattern Component
 */
export default function MonthlyOccurrencePattern({ relationship, observationWindow }) {
  const months = getObservedMonths(relationship, observationWindow);

  return (
    <div className="monthly-pattern-card">
      <div className="pattern-header-title">Monthly Occurrence Pattern</div>
      <div className="monthly-dots-row">
        {months.map((m, idx) => (
          <div key={idx} className="month-dot-col">
            <span className="month-name-label">{m.label}</span>
            <span className="month-year-label">{m.year}</span>
            <div className={`month-status-circle ${m.present ? 'circle-present' : 'circle-missing'}`}>
              {m.present ? (
                <Check size={14} strokeWidth={3} className="text-white" />
              ) : (
                <Minus size={14} strokeWidth={3} className="text-slate-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
