import React from 'react';
import {
  Shield,
  Landmark,
  TrendingUp,
  PlayCircle,
  Zap,
  PlusCircle,
  ChevronRight,
  HelpCircle,
  FileText,
} from 'lucide-react';

/**
 * Returns icon and color for institution/merchant based on category or name
 */
function getInstitutionIcon(category = '', name = '') {
  const cat = category.toLowerCase();
  const lowerName = name.toLowerCase();

  if (cat === 'insurance' || lowerName.includes('insurance') || lowerName.includes('life')) {
    return {
      icon: <Shield size={18} className="text-red-600" />,
      bgColor: '#FEF2F2',
      badgeClass: 'category-insurance',
    };
  }
  if (cat === 'loan' || lowerName.includes('loan') || lowerName.includes('bank') || lowerName.includes('housing')) {
    return {
      icon: <Landmark size={18} className="text-blue-700" />,
      bgColor: '#EFF6FF',
      badgeClass: 'category-loan',
    };
  }
  if (cat === 'investment' || lowerName.includes('asset') || lowerName.includes('mutual') || lowerName.includes('fund') || lowerName.includes('sip')) {
    return {
      icon: <TrendingUp size={18} className="text-emerald-700" />,
      bgColor: '#ECFDF5',
      badgeClass: 'category-investment',
    };
  }
  if (cat === 'subscription' || lowerName.includes('stream') || lowerName.includes('netflix') || lowerName.includes('spotify') || lowerName.includes('digital')) {
    return {
      icon: <PlayCircle size={18} className="text-amber-600" />,
      bgColor: '#FFFBEB',
      badgeClass: 'category-subscription',
    };
  }
  if (cat === 'utility' || lowerName.includes('power') || lowerName.includes('electric') || lowerName.includes('water') || lowerName.includes('gas')) {
    return {
      icon: <Zap size={18} className="text-blue-600" />,
      bgColor: '#EFF6FF',
      badgeClass: 'category-utility',
    };
  }
  return {
    icon: <PlusCircle size={18} className="text-slate-600" />,
    bgColor: '#F1F5F9',
    badgeClass: 'category-default',
  };
}

/**
 * Formats currency amount in INR
 */
function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '—';
  return '₹ ' + Math.round(amount).toLocaleString('en-IN');
}

/**
 * Returns subtitle for relationship
 */
function getRelationshipSubtitle(rel) {
  const cat = (rel.category || '').toLowerCase();
  const name = (rel.display_name || '').toLowerCase();

  if (rel.occurrence_count === 1) return 'One-time payment';
  if (cat === 'insurance' || name.includes('insurance')) return 'Recurring premium payments';
  if (cat === 'loan' || name.includes('loan')) return 'Home loan EMI';
  if (cat === 'investment' || name.includes('asset')) return 'SIP / Investment';
  if (cat === 'subscription') return 'Monthly subscription';
  if (cat === 'utility') return 'Electricity bill';
  return `${rel.cadence || 'Recurring'} transaction`;
}

/**
 * RecurringRelationshipTable Component
 */
export default function RecurringRelationshipTable({
  relationships = [],
  selectedRelationshipId,
  onSelectRelationship,
  totalObservedMonths = 6,
}) {
  if (!relationships.length) {
    return (
      <div className="table-empty-card">
        <p>No recurring financial relationships found matching this filter.</p>
      </div>
    );
  }

  return (
    <div className="recurring-table-wrapper" tabIndex={0} aria-label="Recurring relationships table">
      <table className="recurring-table">
        <thead>
          <tr>
            <th className="th-institution">Institution / Merchant</th>
            <th className="th-category">Category</th>
            <th className="th-occurrences">Occurrences</th>
            <th className="th-cadence">Cadence</th>
            <th className="th-amount">Avg Amount</th>
            <th className="th-pattern">Amount Pattern</th>
            <th className="th-strength">Strength</th>
            <th className="th-confidence">Confidence</th>
            <th className="th-action">Action</th>
          </tr>
        </thead>
        <tbody>
          {relationships.map((rel) => {
            const isSelected = selectedRelationshipId === (rel.relationship_id || rel.display_name);
            const { icon, bgColor, badgeClass } = getInstitutionIcon(rel.category, rel.display_name);
            const subtitle = getRelationshipSubtitle(rel);
            const isOneTime = rel.occurrence_count < 2 || rel.recurrence_strength === 'insufficient';
            const confidencePercent = Math.round((rel.confidence || 0.8) * 100);

            // Amount range string
            const hasRange = rel.amount_type === 'variable' && rel.min_amount && rel.max_amount && rel.min_amount !== rel.max_amount;
            const rangeStr = hasRange
              ? ` (${formatCurrency(rel.min_amount)} – ${formatCurrency(rel.max_amount)})`
              : '';

            return (
              <tr
                key={rel.relationship_id || rel.display_name}
                className={`table-row-item ${isSelected ? 'row-selected' : ''}`}
                onClick={() => onSelectRelationship(rel)}
              >
                {/* 1. Institution / Merchant */}
                <td className="td-institution">
                  <div className="institution-cell">
                    <div className="institution-icon-box" style={{ backgroundColor: bgColor }} aria-hidden="true">
                      {icon}
                    </div>
                    <div className="institution-meta">
                      <span className="institution-name">{rel.display_name}</span>
                      <span className="institution-sub">{subtitle}</span>
                    </div>
                  </div>
                </td>

                {/* 2. Category */}
                <td className="td-category">
                  <span className={`category-badge ${badgeClass}`}>
                    {rel.category ? rel.category.charAt(0).toUpperCase() + rel.category.slice(1) : 'General'}
                  </span>
                </td>

                {/* 3. Occurrences */}
                <td className="td-occurrences">
                  <div className="occurrences-cell">
                    <span className="occ-count">{rel.occurrence_count}</span>
                    <span className="occ-months">
                      ({rel.unique_month_count || rel.occurrence_count}/{totalObservedMonths} months)
                    </span>
                  </div>
                </td>

                {/* 4. Cadence */}
                <td className="td-cadence">
                  {isOneTime ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    <div className="cadence-cell">
                      <span className="cadence-title">
                        {rel.cadence ? rel.cadence.charAt(0).toUpperCase() + rel.cadence.slice(1) : 'Monthly'}
                      </span>
                      {rel.average_interval_days && (
                        <span className="cadence-sub">
                          ~{Math.round(rel.average_interval_days)} days
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* 5. Avg Amount */}
                <td className="td-amount">
                  <div className="amount-cell">
                    <span className="amount-main">{formatCurrency(rel.average_amount)}</span>
                    {rangeStr && <span className="amount-range">{rangeStr}</span>}
                  </div>
                </td>

                {/* 6. Amount Pattern */}
                <td className="td-pattern">
                  {isOneTime ? (
                    <span className="pattern-badge pattern-na">N/A</span>
                  ) : rel.amount_type === 'variable' ? (
                    <span className="pattern-badge pattern-variable">Variable</span>
                  ) : (
                    <span className="pattern-badge pattern-fixed">Fixed</span>
                  )}
                </td>

                {/* 7. Strength */}
                <td className="td-strength">
                  <span className={`strength-badge strength-${rel.recurrence_strength || 'strong'}`}>
                    {rel.recurrence_strength ? rel.recurrence_strength.charAt(0).toUpperCase() + rel.recurrence_strength.slice(1) : 'Strong'}
                  </span>
                </td>

                {/* 8. Confidence */}
                <td className="td-confidence">
                  <div className="confidence-cell">
                    <span className="confidence-percent">{confidencePercent}%</span>
                    <div className="confidence-track">
                      <div
                        className="confidence-fill"
                        style={{ width: `${confidencePercent}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* 9. Action */}
                <td className="td-action">
                  <button
                    type="button"
                    className={`btn-view-relationship ${isSelected ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRelationship(rel);
                    }}
                    aria-label={`View details for ${rel.display_name}`}
                  >
                    <span>View</span>
                    <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
