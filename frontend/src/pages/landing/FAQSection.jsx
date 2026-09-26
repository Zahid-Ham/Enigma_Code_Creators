import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { FAQS } from './landingData';

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleFAQ = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  // Split FAQs into 2 columns (0..3 in col 1, 4..6 in col 2) matching visual reference
  const col1Faqs = FAQS.slice(0, 4).map((faq, idx) => ({ ...faq, originalIdx: idx }));
  const col2Faqs = FAQS.slice(4).map((faq, idx) => ({ ...faq, originalIdx: idx + 4 }));

  const renderFAQItem = (faq) => {
    const isOpen = openIdx === faq.originalIdx;
    const faqId = `faq-answer-${faq.originalIdx}`;
    const buttonId = `faq-btn-${faq.originalIdx}`;

    return (
      <div key={faq.question} className={`faq-card ${isOpen ? 'is-open' : ''}`}>
        <button
          type="button"
          id={buttonId}
          className="faq-trigger-btn"
          onClick={() => toggleFAQ(faq.originalIdx)}
          aria-expanded={isOpen}
          aria-controls={faqId}
        >
          <span className="faq-question-text">{faq.question}</span>
          <span className="faq-icon-pill" aria-hidden="true">
            {isOpen ? <Minus size={15} strokeWidth={2.5} /> : <Plus size={15} strokeWidth={2.5} />}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={faqId}
              role="region"
              aria-labelledby={buttonId}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.26, ease: [0.04, 0.62, 0.23, 0.98] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="faq-body-text">
                <p>{faq.answer}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <section id="faqs" className="faq-section">
      <div className="landing-container">
        <div className="faq-split-layout">
          {/* Left Column: Eyebrow + Heading + Subtitle */}
          <div className="faq-narrative-col">
            <span className="section-eyebrow">FAQS</span>
            <h2 className="faq-heading">
              Frequently Asked<br />
              <span className="accent-serif">Questions</span>
            </h2>
            <p className="faq-description">
              Clear answers to common questions about FINCLOSURE.
            </p>
          </div>

          {/* Right Column: 2-Column Accordion Grid */}
          <div className="faq-accordion-2col">
            <div className="faq-col">
              {col1Faqs.map((faq) => renderFAQItem(faq))}
            </div>
            <div className="faq-col">
              {col2Faqs.map((faq) => renderFAQItem(faq))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

