/**
 * Left Column Discovery List with Tab Navigation
 */

import React from 'react';
import {
  Shield,
  Home,
  TrendingUp,
  CreditCard,
  Zap,
  Landmark,
  FileText,
  AlertCircle,
  PlusCircle,
  ChevronRight,
} from 'lucide-react';

function getCategoryIcon(type = '', category = '') {
  const text = `${type} ${category}`.toLowerCase();
  if (text.includes('insurance') || text.includes('life') || text.includes('policy')) {
    return { icon: <Shield size={18} className="text-emerald-700" />, bg: 'bg-emerald-50' };
  }
  if (text.includes('loan') || text.includes('home') || text.includes('mortgage') || text.includes('nhb')) {
    return { icon: <Home size={18} className="text-emerald-800" />, bg: 'bg-emerald-50' };
  }
  if (text.includes('investment') || text.includes('mutual') || text.includes('sip') || text.includes('asset')) {
    return { icon: <TrendingUp size={18} className="text-emerald-700" />, bg: 'bg-emerald-50' };
  }
  if (text.includes('streamflix') || text.includes('subscription') || text.includes('ott')) {
    return { icon: <CreditCard size={18} className="text-emerald-700" />, bg: 'bg-emerald-50' };
  }
  if (text.includes('power') || text.includes('utility') || text.includes('electricity')) {
    return { icon: <Zap size={18} className="text-blue-600" />, bg: 'bg-blue-50' };
  }
  if (text.includes('bank') || text.includes('hdfc') || text.includes('sbi') || text.includes('icici')) {
    return { icon: <Landmark size={18} className="text-purple-700" />, bg: 'bg-purple-50' };
  }
  return { icon: <FileText size={18} className="text-gray-700" />, bg: 'bg-gray-100' };
}

function getStrengthBadge(strength = 'Strong') {
  const s = (strength || '').toLowerCase();
  if (s.includes('strong')) {
    return <span className="radar-badge-strength badge-strong">Strong</span>;
  }
  if (s.includes('moderate')) {
    return <span className="radar-badge-strength badge-moderate">Moderate</span>;
  }
  if (s.includes('low')) {
    return <span className="radar-badge-strength badge-low">Low</span>;
  }
  return <span className="radar-badge-strength badge-review">Needs Review</span>;
}

function formatAmountCadence(amount, cadence = 'month') {
  const numStr = `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  const cad = cadence ? cadence.toLowerCase() : 'month';
  return `${numStr}/${cad === 'monthly' ? 'month' : cad}`;
}

export default function DiscoveryList({
  discoveries = [],
  missingAssets = [],
  selectedId = null,
  activeTab = 'all', // 'all' | 'missing'
  onSelectDiscovery = () => {},
  onSelectMissingAsset = () => {},
  onChangeTab = () => {},
}) {
  const allCount = discoveries.length;
  const missingCount = missingAssets.length;

  return (
    <nav className="radar-discoveries-sidebar" aria-label="Discovered Financial Relationships">
      {/* Top Left Navigation Tabs */}
      <div className="radar-sidebar-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'all'}
          className={`radar-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => onChangeTab('all')}
        >
          All Discoveries ({allCount})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'missing'}
          className={`radar-tab-btn ${activeTab === 'missing' ? 'active' : ''}`}
          onClick={() => onChangeTab('missing')}
        >
          Missing Assets ({missingCount})
        </button>
      </div>

      {/* Discovery Items List */}
      <div className="radar-items-scrollable">
        {activeTab === 'all' ? (
          discoveries.length === 0 ? (
            <div className="radar-sidebar-empty">
              <p>No financial discoveries found for this estate.</p>
            </div>
          ) : (
            discoveries.map((item) => {
              const isSelected = selectedId === item.discovery_id;
              const { icon, bg } = getCategoryIcon(item.financial_entity_type, item.relationship_label);

              return (
                <div
                  key={item.discovery_id}
                  className={`radar-discovery-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectDiscovery(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectDiscovery(item)}
                  aria-pressed={isSelected}
                >
                  <div className={`radar-item-icon-circle ${bg}`} aria-hidden="true">
                    {icon}
                  </div>

                  <div className="radar-item-content">
                    <div className="radar-item-top-row">
                      <h4 className="radar-item-title">{item.institution_name}</h4>
                      {getStrengthBadge(item.strength)}
                    </div>

                    <p className="radar-item-subtitle">{item.relationship_label || `${item.financial_entity_type} • Recurring`}</p>

                    <p className="radar-item-meta">
                      {item.occurrence_count} occurrence{item.occurrence_count === 1 ? '' : 's'} •{' '}
                      {formatAmountCadence(item.average_amount, item.cadence)}
                    </p>
                  </div>

                  <div className="radar-item-chevron" aria-hidden="true">
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* Missing Assets Tab in Left Panel */
          missingAssets.length === 0 ? (
            <div className="radar-sidebar-empty">
              <p>No potential missing assets detected.</p>
            </div>
          ) : (
            missingAssets.map((asset) => {
              const isSelected = selectedId === asset.missing_asset_id;
              return (
                <div
                  key={asset.missing_asset_id}
                  className={`radar-discovery-item missing-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectMissingAsset(asset)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectMissingAsset(asset)}
                  aria-pressed={isSelected}
                >
                  <div className="radar-item-icon-circle bg-amber-50" aria-hidden="true">
                    <AlertCircle size={18} className="text-amber-600" />
                  </div>

                  <div className="radar-item-content">
                    <div className="radar-item-top-row">
                      <h4 className="radar-item-title">{asset.title}</h4>
                      <span className="radar-badge-strength badge-review">Needs Review</span>
                    </div>

                    <p className="radar-item-subtitle">{asset.institution_name || 'Unidentified'} • Inferred</p>
                    <p className="radar-item-meta">{asset.reason}</p>
                  </div>

                  <div className="radar-item-chevron" aria-hidden="true">
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </nav>
  );
}
