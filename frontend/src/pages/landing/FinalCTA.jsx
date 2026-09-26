import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Play,
  FileText,
  Search,
  ListChecks,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export default function FinalCTA({ onGetStarted }) {
  const handleHowItWorksClick = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const progressionNodes = [
    { id: 'docs', label: 'Documents', icon: FileText, sub: 'Upload evidence' },
    { id: 'discovery', label: 'Discovery', icon: Search, sub: 'Estate Radar' },
    { id: 'claims', label: 'Claims', icon: ListChecks, sub: 'Guided steps' },
    { id: 'tracking', label: 'Tracking', icon: BarChart3, sub: 'Closure score' },
    { id: 'closure', label: 'Closure', icon: CheckCircle2, sub: 'Resolved' },
  ];

  return (
    <section className="final-cta-section" id="final-cta">
      <div className="landing-container">
        <div className="final-journey-card">
          {/* Left Column: Eyebrow, Heading, Subtitle, and Dual Buttons */}
          <div className="journey-text-content">
            <span className="section-eyebrow">READY TO TAKE CONTROL</span>
            <h2 className="journey-heading">
              Start Your Financial<br />
              Closure Journey Today.
            </h2>
            <p className="journey-subtext">
              Bring clarity to your financial life. Discover what exists, understand what's missing, and take the next step with confidence.
            </p>

            <div className="journey-actions-cluster">
              <button
                type="button"
                className="btn-journey-primary"
                onClick={onGetStarted}
                aria-label="Get Started with FINCLOSURE"
              >
                Get Started →
              </button>
              <button
                type="button"
                className="btn-journey-secondary"
                onClick={handleHowItWorksClick}
                aria-label="See how FINCLOSURE works"
              >
                <Play size={13} fill="currentColor" />
                <span>See How It Works</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Journey Pathway with Connecting SVG Curve and Cards */}
          <motion.div
            className="journey-visual-wrapper"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
          >
            {/* SVG Connecting Progression Line */}
            <svg
              className="journey-curve-svg"
              viewBox="0 0 500 180"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 20 140 C 90 140, 130 40, 200 40 C 270 40, 320 120, 380 120 C 420 120, 460 140, 480 140"
                stroke="#C5DCD0"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Stepper Node Icons along the curve */}
            <div className="journey-step-node node-docs" title="Documents">
              <div className="node-icon-circle">
                <FileText size={16} />
              </div>
            </div>

            <div className="journey-step-node node-search" title="Discovery">
              <div className="node-icon-circle">
                <Search size={16} />
              </div>
            </div>

            <div className="journey-step-node node-claims" title="Claims">
              <div className="node-icon-circle">
                <ListChecks size={16} />
              </div>
            </div>

            <div className="journey-step-node node-tracking" title="Tracking">
              <div className="node-icon-circle">
                <BarChart3 size={16} />
              </div>
            </div>

            <div className="journey-step-node node-closure" title="Closure">
              <div className="node-icon-circle success-circle">
                <CheckCircle2 size={18} strokeWidth={2.4} />
              </div>
            </div>

            {/* Floating Folders / Cards Mockup */}
            <div className="journey-folders-cluster">
              <div className="journey-folder folder-docs">
                <div className="folder-tab">Documents</div>
                <div className="folder-label">Assets</div>
              </div>

              <div className="journey-folder folder-claims">
                <div className="folder-tab">Claims</div>
                <div className="folder-label">Tracking</div>
              </div>
            </div>

            {/* Context Labels */}
            <div className="journey-caption from-caption">From information...</div>
            <div className="journey-caption to-caption">...to closure.</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
