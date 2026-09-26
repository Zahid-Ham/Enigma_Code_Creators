import React from 'react';
import { Link2, Calendar, FileText, BarChart3, Clock, AlertCircle } from 'lucide-react';

/**
 * Formats date range into human friendly string (e.g. "Apr – Sep 2026")
 */
function formatObservationPeriod(startStr, endStr) {
  if (!startStr || !endStr) return '';
  try {
    const s = new Date(startStr);
    const e = new Date(endStr);
    const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
    const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
    const eYear = e.getFullYear();
    return `(${sMonth} – ${eMonth} ${eYear})`;
  } catch {
    return '';
  }
}

/**
 * RecurringSummary Component
 * Displays the 5 top-level recurring analysis metric cards.
 */
export default function RecurringSummary({ recurrenceData }) {
  const relationships = recurrenceData?.relationships || [];
  const obsWindow = recurrenceData?.observation_window || {};
  const totalTransactions = recurrenceData?.total_transactions_analyzed || 0;

  const totalRelationships = relationships.length;
  const strongCount = relationships.filter((r) => r.recurrence_strength === 'strong').length;
  const oneTimeCount = relationships.filter(
    (r) => r.recurrence_strength === 'insufficient' || r.occurrence_count < 2
  ).length;

  const totalMonths = obsWindow.total_months ? Math.round(obsWindow.total_months) : 6;
  const periodText = formatObservationPeriod(obsWindow.start, obsWindow.end);

  const cards = [
    {
      id: 'relationships',
      icon: <Link2 size={20} className="text-blue-600" />,
      iconBg: '#EFF6FF',
      value: totalRelationships,
      label: 'Recurring Relationships Detected',
      sublabel: null,
    },
    {
      id: 'window',
      icon: <Calendar size={20} className="text-emerald-700" />,
      iconBg: '#ECFDF5',
      value: `${totalMonths} Months`,
      label: 'Observation Period',
      sublabel: periodText || '(Recent Statements)',
    },
    {
      id: 'transactions',
      icon: <FileText size={20} className="text-purple-600" />,
      iconBg: '#F5F3FF',
      value: totalTransactions,
      label: 'Total Transactions Analyzed',
      sublabel: null,
    },
    {
      id: 'strong',
      icon: <BarChart3 size={20} className="text-emerald-700" />,
      iconBg: '#ECFDF5',
      value: strongCount,
      label: 'Strong Recurring Relationships',
      sublabel: null,
    },
    {
      id: 'onetime',
      icon: <Clock size={20} className="text-blue-600" />,
      iconBg: '#EFF6FF',
      value: oneTimeCount,
      label: 'One-time / Non-recurring',
      sublabel: 'Transactions',
    },
  ];

  return (
    <div className="recurring-summary-grid" aria-label="Recurring Transactions Analytics Overview">
      {cards.map((card) => (
        <div key={card.id} className="summary-metric-card">
          <div className="summary-metric-icon-box" style={{ backgroundColor: card.iconBg }} aria-hidden="true">
            {card.icon}
          </div>
          <div className="summary-metric-content">
            <div className="summary-metric-value">{card.value}</div>
            <div className="summary-metric-label">
              <span>{card.label}</span>
              {card.sublabel && <span className="summary-metric-sublabel"> {card.sublabel}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
