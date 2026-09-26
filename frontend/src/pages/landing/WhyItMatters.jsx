import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, FileX, FileCheck2, ArrowRight } from 'lucide-react';

export default function WhyItMatters() {
  const withoutItems = [
    'Forgotten accounts and policies',
    'Missing or outdated nominee information',
    'Unclear liabilities and obligations',
    'Repeated paperwork with different institutions',
    'Difficulty understanding next steps',
    'Untracked claims and long delays',
  ];

  const withItems = [
    'One organized view of all financial relationships',
    'Clear evidence and documentation',
    'Guided next steps for every asset and claim',
    'Identify missing or forgotten assets',
    'Track progress until closure',
    'Reduced stress and uncertainty for your family',
  ];

  return (
    <section id="why-it-matters" className="why-matters-section">
      <div className="landing-container">
        <div className="why-matters-layout">
          {/* Left Column: Narrative Headline & Description */}
          <div className="why-matters-narrative">
            <span className="section-eyebrow">WHY IT MATTERS</span>
            <h2 className="why-matters-heading">
              Because Financial<br />
              Closure Is <span className="accent-serif">More<br />Than Paperwork.</span>
            </h2>
            <p className="why-matters-description">
              When financial information is fragmented, families often face unnecessary
              stress, missed assets and long, repeated processes.
            </p>
          </div>

          {/* Right Column: Side-by-Side Comparison Panels */}
          <div className="comparison-panels-wrapper">
            {/* Without FINCLOSURE Card */}
            <motion.div
              className="comparison-card without-card"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4 }}
            >
              <div className="comparison-card-header without-header">
                <div className="header-icon-circle without-icon">
                  <AlertCircle size={15} strokeWidth={2.4} />
                </div>
                <h4>Without FINCLOSURE</h4>
              </div>

              <ul className="comparison-list">
                {withoutItems.map((item) => (
                  <li key={item} className="comparison-list-item without-item">
                    <FileX size={15} className="item-icon without-item-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Transition Center Arrow */}
            <div className="comparison-transition-indicator" aria-hidden="true">
              <div className="transition-arrow-circle">
                <ArrowRight size={18} strokeWidth={2.2} />
              </div>
            </div>

            {/* With FINCLOSURE Card */}
            <motion.div
              className="comparison-card with-card"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <div className="comparison-card-header with-header">
                <div className="header-icon-circle with-icon">
                  <CheckCircle2 size={15} strokeWidth={2.4} />
                </div>
                <h4>With FINCLOSURE</h4>
              </div>

              <ul className="comparison-list">
                {withItems.map((item) => (
                  <li key={item} className="comparison-list-item with-item">
                    <FileCheck2 size={15} className="item-icon with-item-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
