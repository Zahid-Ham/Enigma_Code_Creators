import React from 'react';
import { motion } from 'framer-motion';
import {
  Landmark,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export default function EstateRadarSpotlight({ onReviewFinding }) {
  const statementRows = [
    {
      date: '25 Aug 2024',
      description: 'ABC LIFE INSURANCE',
      amount: '₹ 4,250',
      highlight: true,
    },
    {
      date: '18 Aug 2024',
      description: 'Online Shopping',
      amount: '₹ 1,299',
      highlight: false,
    },
    {
      date: '12 Aug 2024',
      description: 'Electricity Bill',
      amount: '₹ 2,430',
      highlight: false,
    },
  ];

  return (
    <section className="radar-spotlight-section" id="estate-radar-spotlight">
      <div className="landing-container">
        <div className="radar-spotlight-layout">
          {/* Left Column: Narrative Headline & Description */}
          <div className="radar-narrative-col">
            <span className="section-eyebrow">ESTATE RADAR</span>
            <h2 className="radar-heading">
              What If You Don’t Know<br />
              What <span className="accent-serif">You’re Missing?</span>
            </h2>
            <p className="radar-description">
              Most families don’t have a complete list of a person’s financial relationships.
              Estate Radar starts with the evidence they do have and helps uncover what may
              be missing.
            </p>
          </div>

          {/* Right Column: 3-Stage Visual Pipeline */}
          <div className="radar-pipeline-wrapper">
            {/* Stage 1: Bank Statement Card */}
            <motion.div
              className="pipeline-card stage-statement"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4 }}
            >
              <div className="statement-header">
                <Landmark size={15} className="statement-header-icon" />
                <span>BANK STATEMENT</span>
              </div>

              {/* Decorative wireframe header bars */}
              <div className="statement-wireframe-bars">
                <div className="bar bar-long"></div>
                <div className="bar bar-short"></div>
              </div>

              {/* Transactions List */}
              <div className="statement-table">
                {statementRows.map((row) => (
                  <div
                    key={row.description}
                    className={`statement-row ${row.highlight ? 'highlight-row' : ''}`}
                  >
                    <span className="row-date">{row.date}</span>
                    <span className="row-desc">{row.description}</span>
                    <span className="row-amount">{row.amount}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pipeline Arrow 1 */}
            <div className="pipeline-arrow" aria-hidden="true">
              <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                <path
                  d="M0 6H22M22 6L17 1M22 6L17 11"
                  stroke="#8A968E"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              </svg>
            </div>

            {/* Stage 2: Detection Card */}
            <motion.div
              className="pipeline-card stage-detection"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <div className="detection-header">
                <Sparkles size={14} className="sparkle-icon" />
                <span>Recurring Transaction Detected</span>
              </div>

              <div className="detection-body">
                <div className="detection-title">ABC LIFE INSURANCE</div>
                <div className="detection-amount">₹ 4,250 / month</div>
              </div>

              <div className="detection-footer-note">
                Regular deduction identified in bank statement.
              </div>
            </motion.div>

            {/* Pipeline Arrow 2 */}
            <div className="pipeline-arrow" aria-hidden="true">
              <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                <path
                  d="M0 6H22M22 6L17 1M22 6L17 11"
                  stroke="#8A968E"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              </svg>
            </div>

            {/* Stage 3: Finding Card */}
            <motion.div
              className="pipeline-card stage-finding"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="finding-header">
                <div className="finding-badge-icon">
                  <ShieldAlert size={14} />
                </div>
                <span>Potential Missing Financial Asset</span>
              </div>

              <div className="finding-details-list">
                <div className="finding-detail-row">
                  <span className="label">Evidence</span>
                  <span className="value">Bank statement — Page 12</span>
                </div>
                <div className="finding-detail-row">
                  <span className="label">Confidence</span>
                  <span className="value confidence-value">87%</span>
                </div>
                <div className="finding-detail-row">
                  <span className="label">Status</span>
                  <span className="status-pill">Needs verification</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-review-finding"
                onClick={onReviewFinding}
                aria-label="Review finding and official verification pathway"
              >
                Review Finding <ArrowRight size={15} />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
