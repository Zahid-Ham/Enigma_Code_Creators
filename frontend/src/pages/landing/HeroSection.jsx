import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Check } from 'lucide-react';
import HeroDashboard from './HeroDashboard';

export default function HeroSection({ onGetStarted, onHowItWorks }) {
  const trustPoints = [
    'Discover hidden assets',
    'Get step-by-step guidance',
    'Track until closure',
  ];

  return (
    <section id="hero" className="hero-section">
      <div className="landing-container">
        <div className="hero-grid">
          {/* Left Column: Copy & CTAs */}
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Eyebrow */}
            <div>
              <span className="section-eyebrow">
                PLAN AHEAD. RECOVER CONFIDENTLY. CLOSE COMPLETELY.
              </span>
            </div>

            {/* Main Title matching reference typography */}
            <h1 className="hero-heading">
              Your Financial<br />
              Legacy, <span className="accent-serif">Simplified.</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-description">
              FINCLOSURE helps your family discover, organize and recover every financial asset
              — so nothing important is left behind.
            </p>

            {/* CTAs */}
            <div className="hero-ctas">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onGetStarted}
                aria-label="Get Started with FINCLOSURE"
              >
                Get Started <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onHowItWorks}
                aria-label="See how FINCLOSURE works"
              >
                <Play size={13} fill="currentColor" /> See How It Works
              </button>
            </div>

            {/* Trust Checklist in one neat row */}
            <div className="hero-trust-list">
              {trustPoints.map((point) => (
                <div key={point} className="hero-trust-item">
                  <div className="trust-check-icon">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Hero Product Preview Mockup */}
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}
