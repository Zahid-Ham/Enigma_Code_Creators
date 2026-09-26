import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * RecurringFilters Component
 * Provides filter pills by strength/frequency and a sort control.
 */
export default function RecurringFilters({
  activeFilter,
  onFilterChange,
  relationships = [],
  sortBy,
  onSortChange,
}) {
  const allCount = relationships.length;
  const strongCount = relationships.filter((r) => r.recurrence_strength === 'strong').length;
  const moderateCount = relationships.filter((r) => r.recurrence_strength === 'moderate').length;
  const weakCount = relationships.filter((r) => r.recurrence_strength === 'weak').length;
  const oneTimeCount = relationships.filter(
    (r) => r.recurrence_strength === 'insufficient' || r.occurrence_count < 2
  ).length;

  const filterTabs = [
    { id: 'all', label: `All (${allCount})` },
    { id: 'strong', label: `Strong (${strongCount})` },
    { id: 'moderate', label: `Moderate (${moderateCount})` },
    { id: 'weak', label: `Weak (${weakCount})` },
    { id: 'onetime', label: `One-time (${oneTimeCount})` },
  ];

  return (
    <div className="recurring-filter-bar">
      {/* Filter Tabs */}
      <div className="filter-pills-group" role="tablist" aria-label="Filter recurring relationships">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`filter-pill-btn ${activeFilter === tab.id ? 'active' : ''}`}
            onClick={() => onFilterChange(tab.id)}
            role="tab"
            aria-selected={activeFilter === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort Select */}
      <div className="sort-dropdown-wrap">
        <label htmlFor="recurring-sort-select" className="sort-label">
          Sort by
        </label>
        <div className="sort-select-pill">
          <select
            id="recurring-sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-native-select"
          >
            <option value="strength">Recurrence Strength</option>
            <option value="amount">Highest Amount</option>
            <option value="occurrences">Most Occurrences</option>
            <option value="confidence">Confidence</option>
            <option value="name">Merchant Name</option>
          </select>
          <ChevronDown size={14} className="sort-chevron" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
