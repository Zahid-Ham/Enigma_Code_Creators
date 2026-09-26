import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, ListChecks, BarChart3, ArrowRight } from 'lucide-react';

export default function FeatureOverview({ onExploreFeature }) {
  const capabilities = [
    {
      id: 'doc-intelligence',
      title: 'Document Intelligence',
      desc: 'Upload any financial document. Our AI extracts and understands the important information.',
      icon: FileText,
      isCore: false,
    },
    {
      id: 'estate-radar',
      title: 'Estate Radar',
      desc: 'Discover hidden and forgotten assets and relationships that may not have been explicitly entered.',
      icon: Search,
      isCore: true,
      badge: 'CORE FEATURE',
    },
    {
      id: 'guided-claims',
      title: 'Guided Claim Process',
      desc: 'Get step-by-step guidance with required documents, official links and clear instructions.',
      icon: ListChecks,
      isCore: false,
    },
    {
      id: 'tracking-closure',
      title: 'Track Until Closure',
      desc: 'Monitor the status of every claim with timelines, updates and next steps.',
      icon: BarChart3,
      isCore: false,
    },
  ];

  return (
    <section id="features" className="capabilities-section">
      <div className="landing-container">
        {/* Section Header */}
        <div className="capabilities-header">
          <span className="section-eyebrow">KEY CAPABILITIES</span>
          <h2 className="section-heading">A Complete Financial Closure Solution</h2>
          <p className="section-subheading">
            From discovery to final closure, FINCLOSURE guides your family at every step.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="capabilities-grid">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.id}
                className={`capability-card ${cap.isCore ? 'core-spotlight' : ''}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                whileHover={{ y: -3 }}
                onClick={() => onExploreFeature && onExploreFeature(cap.id)}
              >
                {/* Header row: Icon + optional Core Feature Badge */}
                <div className="capability-card-top">
                  <div className="capability-icon-circle">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  {cap.badge && (
                    <span className="core-feature-badge">{cap.badge}</span>
                  )}
                </div>

                {/* Content */}
                <h3 className="capability-title">{cap.title}</h3>
                <p className="capability-desc">{cap.desc}</p>

                {/* Bottom arrow action */}
                <div className="capability-arrow-action">
                  <ArrowRight size={18} strokeWidth={2} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
