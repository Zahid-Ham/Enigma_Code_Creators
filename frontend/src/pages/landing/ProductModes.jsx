import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Check } from 'lucide-react';

export default function ProductModes({ onSelectMode }) {
  const prepareChecklist = [
    'Store and organize financial documents',
    'Track your assets, liabilities and policies',
    'Maintain nominee information',
    'Understand your financial footprint',
    'Be prepared for the future',
  ];

  const recoverChecklist = [
    'Collect and organize available evidence',
    'Discover known and potential assets',
    'Get guidance on claims and closure processes',
    'Track progress across multiple institutions',
    'Bring everything to a complete closure',
  ];

  const handleModeClick = (modeId) => {
    if (onSelectMode) {
      onSelectMode(modeId);
    } else {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="modes-section" id="product-modes">
      <div className="landing-container">
        <div className="modes-split-layout">
          {/* Left Column: Narrative Headline & Description */}
          <div className="modes-narrative-col">
            <span className="section-eyebrow">TWO WAYS TO USE FINCLOSURE</span>
            <h2 className="modes-heading">
              Built for<br />
              every stage<br />
              <span className="accent-serif">of life.</span>
            </h2>
            <p className="modes-description">
              Whether you want to get organized now or need to help a family member later,
              FINCLOSURE supports you at every step.
            </p>
          </div>

          {/* Right Column: Two Large Side-by-Side Mode Cards */}
          <div className="modes-cards-grid">
            {/* Card 1: Prepare Ahead */}
            <motion.div
              className="mode-card mode-prepare-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45 }}
            >
              {/* Card Illustration */}
              <div className="mode-illustration-wrapper">
                <svg
                  className="mode-svg-art"
                  viewBox="0 0 160 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* Subtle desk/backdrop */}
                  <ellipse cx="80" cy="85" rx="65" ry="12" fill="#D8EBE0" />
                  {/* Laptop */}
                  <rect x="52" y="58" width="40" height="24" rx="2" fill="#1C382B" />
                  <rect x="55" y="61" width="34" height="18" rx="1" fill="#E8F4EE" />
                  <path d="M44 82L98 82" stroke="#1C382B" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Person sitting */}
                  <circle cx="80" cy="30" r="11" fill="#2E6B4A" />
                  <path
                    d="M62 56C62 44 70 42 80 42C90 42 98 44 98 56"
                    stroke="#2E6B4A"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Hands typing */}
                  <path d="M68 54L60 66" stroke="#2E6B4A" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M92 54L86 66" stroke="#2E6B4A" strokeWidth="3.5" strokeLinecap="round" />
                  {/* Floating document badge */}
                  <circle cx="120" cy="32" r="12" fill="#FFFFFF" stroke="#C4E2D2" strokeWidth="1.5" />
                  <path d="M116 32L119 35L125 29" stroke="#2E6B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="mode-content-body">
                <h3 className="mode-card-title">Prepare Ahead</h3>
                <p className="mode-card-subtitle">
                  Organize your own financial estate while you're alive.
                </p>

                <ul className="mode-checklist">
                  {prepareChecklist.map((item) => (
                    <li key={item} className="mode-checklist-item">
                      <span className="mode-check-icon prepare-check">
                        <Check size={13} strokeWidth={3} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="btn-mode-cta btn-prepare-cta"
                  onClick={() => handleModeClick('prepare')}
                >
                  Start Preparing →
                </button>
              </div>
            </motion.div>

            {/* Card 2: Recover & Close */}
            <motion.div
              className="mode-card mode-recover-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.15, duration: 0.45 }}
            >
              {/* Card Illustration */}
              <div className="mode-illustration-wrapper">
                <svg
                  className="mode-svg-art"
                  viewBox="0 0 160 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* Subtle floor/backdrop */}
                  <ellipse cx="80" cy="85" rx="65" ry="12" fill="#D6E4F0" />
                  {/* Center Laptop */}
                  <rect x="62" y="60" width="36" height="22" rx="2" fill="#203A4D" />
                  <rect x="65" y="63" width="30" height="16" rx="1" fill="#E8F1F7" />
                  <path d="M54 82L106 82" stroke="#203A4D" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Person 1 (Left) */}
                  <circle cx="56" cy="34" r="10" fill="#3B698C" />
                  <path
                    d="M42 56C42 46 48 44 56 44C61 44 66 46 67 52"
                    stroke="#3B698C"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Person 2 (Center-Right) */}
                  <circle cx="86" cy="28" r="11" fill="#1F3C53" />
                  <path
                    d="M72 54C72 43 78 40 86 40C94 40 100 43 100 54"
                    stroke="#1F3C53"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Person 3 (Right) */}
                  <circle cx="112" cy="36" r="9" fill="#4B7B9F" />
                  <path
                    d="M102 54C102 47 106 45 112 45C118 45 122 47 122 55"
                    stroke="#4B7B9F"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  {/* Floating shield/recovery badge */}
                  <circle cx="34" cy="30" r="11" fill="#FFFFFF" stroke="#B8D5EB" strokeWidth="1.5" />
                  <path d="M34 24V32M34 32L38 30M34 32L30 30" stroke="#2B5B7E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="mode-content-body">
                <h3 className="mode-card-title">Recover & Close</h3>
                <p className="mode-card-subtitle">
                  Help an authorized family member after a loss.
                </p>

                <ul className="mode-checklist">
                  {recoverChecklist.map((item) => (
                    <li key={item} className="mode-checklist-item">
                      <span className="mode-check-icon recover-check">
                        <CheckCircle2 size={15} strokeWidth={2.4} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="btn-mode-cta btn-recover-cta"
                  onClick={() => handleModeClick('recover')}
                >
                  Start Recovery →
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

