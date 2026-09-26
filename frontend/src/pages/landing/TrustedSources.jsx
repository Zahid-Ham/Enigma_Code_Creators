import React from 'react';
import { Landmark, Building2, Coins } from 'lucide-react';
import { TRUSTED_SOURCES } from './landingData';

export default function TrustedSources() {
  const iconMap = {
    udgam: Landmark,
    epfo: Building2,
    iepf: Coins,
  };

  return (
    <section className="trusted-sources-section" aria-label="Official verification pathways">
      <div className="landing-container">
        <div className="trusted-grid">
          <div className="trusted-header">
            <h4>Trusted Government Sources. Unified in One Place.</h4>
            <p>We help you discover and navigate financial assets across multiple official platforms.</p>
          </div>

          <div className="trusted-badges">
            {TRUSTED_SOURCES.map((source) => {
              const Icon = iconMap[source.id] || Landmark;
              return (
                <div key={source.id} className="portal-badge" title={source.fullName}>
                  <div className="portal-icon-wrapper">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="portal-name">{source.name}</div>
                    <div className="portal-desc">{source.tag}</div>
                  </div>
                </div>
              );
            })}
            <div className="portal-more-tag">and many more...</div>
          </div>
        </div>
      </div>
    </section>
  );
}
