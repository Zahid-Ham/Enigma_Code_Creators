/**
 * Right Column - Potential Missing Assets Card
 */

import React from 'react';
import { HeartPulse, TrendingUp, Home, Landmark, AlertCircle } from 'lucide-react';

function getMissingIcon(category = '') {
  const cat = category.toLowerCase();
  if (cat.includes('insurance') || cat.includes('health') || cat.includes('life')) {
    return { icon: <HeartPulse size={18} className="text-red-500" />, bg: 'bg-red-50' };
  }
  if (cat.includes('investment') || cat.includes('mutual') || cat.includes('sip')) {
    return { icon: <TrendingUp size={18} className="text-amber-600" />, bg: 'bg-amber-50' };
  }
  if (cat.includes('loan') || cat.includes('home')) {
    return { icon: <Home size={18} className="text-blue-600" />, bg: 'bg-blue-50' };
  }
  return { icon: <Landmark size={18} className="text-purple-600" />, bg: 'bg-purple-50' };
}

export default function MissingAssets({
  missingAssets = [],
  onInvestigate = () => {},
}) {
  const count = missingAssets.length;

  return (
    <div className="radar-right-card radar-missing-assets-card" aria-label="Potential Missing Assets">
      <div className="radar-right-card-header">
        <div className="radar-right-title-group">
          <AlertCircle size={17} className="text-amber-600 mr-2 inline" />
          <h3 className="radar-right-card-title">Potential Missing Assets</h3>
        </div>
        <span className="radar-count-pill">{count}</span>
      </div>

      <div className="radar-missing-list">
        {count === 0 ? (
          <p className="radar-right-empty-msg">No unlinked or missing assets detected across uploaded documents.</p>
        ) : (
          missingAssets.map((item) => {
            const { icon, bg } = getMissingIcon(item.category || item.title);

            return (
              <div key={item.missing_asset_id} className="radar-missing-item-row">
                <div className="radar-missing-left">
                  <div className={`radar-missing-icon-circle ${bg}`} aria-hidden="true">
                    {icon}
                  </div>

                  <div className="radar-missing-info">
                    <h4 className="radar-missing-title">{item.title}</h4>
                    <p className="radar-missing-reason">Inferred from recurring patterns</p>
                    <p className="radar-missing-subreason">{item.reason || 'No master document found'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="radar-investigate-btn"
                  onClick={() => onInvestigate(item)}
                >
                  <span>Investigate</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
