import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileSearch,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';

export default function RealImpact() {
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  const testimonials = [
    {
      quote:
        "FINCLOSURE helped our family discover several old accounts we didn't even know existed. The step-by-step guidance made a difficult process much more manageable.",
      author: 'A Family Member',
      role: 'Used FINCLOSURE for estate recovery',
      avatarColor: '#DCECE2',
      initials: 'FM',
    },
    {
      quote:
        'Having all documents, policies, and institutional requirements mapped in one place gave our entire family clarity during an overwhelming period.',
      author: 'An Authorized Executor',
      role: 'Organized estate documentation & claims',
      avatarColor: '#E0EDF8',
      initials: 'AE',
    },
    {
      quote:
        'Estate Radar surfaced a recurring premium debit we would have never known to look for. It saved us months of repeated paperwork.',
      author: 'A Surviving Heir',
      role: 'Resolved unlisted insurance relationship',
      avatarColor: '#F3EAE0',
      initials: 'SH',
    },
  ];

  const handlePrev = () => {
    setActiveTestimonialIdx((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveTestimonialIdx((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const currentTestimonial = testimonials[activeTestimonialIdx];

  const valueIndicators = [
    {
      title: 'Unified Financial View',
      desc: 'Bring fragmented financial information into one organized view.',
      icon: Users,
    },
    {
      title: 'Fewer Missed Assets',
      desc: 'Surface potential financial relationships that may otherwise remain unknown.',
      icon: FileSearch,
    },
    {
      title: 'Clear Next Steps',
      desc: 'Turn discovered information into actionable next steps.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="real-impact-section" id="real-impact">
      <div className="landing-container">
        <div className="real-impact-layout">
          {/* Left Column: Heading + Subtitle + 3 Value Indicators */}
          <div className="real-impact-narrative">
            <span className="section-eyebrow">REAL IMPACT</span>
            <h2 className="real-impact-heading">
              Helping Families<br />
              <span className="accent-serif">Find What Matters.</span>
            </h2>
            <p className="real-impact-description">
              From forgotten accounts to missing policies, FINCLOSURE helps families bring clarity and closure to complex financial lives.
            </p>

            <div className="value-indicators-row">
              {valueIndicators.map((val) => {
                const Icon = val.icon;
                return (
                  <div key={val.title} className="value-indicator-item">
                    <div className="value-indicator-icon">
                      <Icon size={18} strokeWidth={2.2} />
                    </div>
                    <span className="value-indicator-label">{val.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Two Side-by-Side Cards (Experience Card + Progress Card) */}
          <div className="real-impact-cards-wrapper">
            {/* Card 1: Illustrative Experience / Testimonial Card */}
            <motion.div
              className="impact-experience-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4 }}
            >
              {/* Green Quote Mark */}
              <div className="quote-mark-icon" aria-hidden="true">
                “
              </div>

              <blockquote className="experience-quote-text">
                "{currentTestimonial.quote}"
              </blockquote>

              <div className="experience-author-row">
                <div
                  className="author-avatar-circle"
                  style={{ backgroundColor: currentTestimonial.avatarColor }}
                >
                  <span>{currentTestimonial.initials}</span>
                </div>
                <div>
                  <div className="author-name">{currentTestimonial.author}</div>
                  <div className="author-role">{currentTestimonial.role}</div>
                </div>
              </div>

              {/* Carousel Controls */}
              <div className="experience-carousel-controls">
                <button
                  type="button"
                  className="carousel-arrow-btn"
                  onClick={handlePrev}
                  aria-label="Previous illustrative experience"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="carousel-dots-row">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`carousel-dot ${idx === activeTestimonialIdx ? 'active' : ''}`}
                      onClick={() => setActiveTestimonialIdx(idx)}
                      aria-label={`View example ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="carousel-arrow-btn"
                  onClick={handleNext}
                  aria-label="Next illustrative experience"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>

            {/* Card 2: Closure Progress Card */}
            <motion.div
              className="impact-progress-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.12, duration: 0.4 }}
            >
              <div className="progress-card-header">
                <h4>Your Progress Towards Closure</h4>
              </div>

              <div className="progress-visual-row">
                {/* Donut Chart */}
                <div className="progress-donut-wrapper">
                  <svg className="progress-donut-svg" viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#E5EAE7"
                      strokeWidth="11"
                    />
                    {/* In Progress Arc (Amber) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="11"
                      strokeDasharray="251.2"
                      strokeDashoffset="180"
                      strokeLinecap="round"
                    />
                    {/* Attention Arc (Red) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#EF4444"
                      strokeWidth="11"
                      strokeDasharray="251.2"
                      strokeDashoffset="225"
                      strokeLinecap="round"
                    />
                    {/* Verified Main Arc (Emerald) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#183B2B"
                      strokeWidth="11"
                      strokeDasharray="251.2"
                      strokeDashoffset="80"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="progress-donut-center">
                    <span className="donut-percentage">68%</span>
                    <span className="donut-status-label">Complete</span>
                  </div>
                </div>

                {/* Status Breakdown Legend */}
                <div className="progress-breakdown-list">
                  <div className="breakdown-item">
                    <span className="breakdown-dot verified-dot" />
                    <span className="breakdown-text">5 Assets Verified</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-dot progress-dot" />
                    <span className="breakdown-text">2 In Progress</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-dot attention-dot" />
                    <span className="breakdown-text">1 Needs Attention</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-dot pending-dot" />
                    <span className="breakdown-text">0 Pending Review</span>
                  </div>
                </div>
              </div>

              {/* Bottom Guidance Note Box */}
              <div className="progress-guidance-box">
                <div className="guidance-icon-wrap">
                  <Lightbulb size={16} strokeWidth={2.4} />
                </div>
                <p className="guidance-text">
                  <strong>You're on track.</strong> Complete the remaining items to reach full financial closure.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
