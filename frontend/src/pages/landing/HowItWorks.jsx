import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, ShieldCheck, ListChecks, BarChart3, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const stages = [
    {
      step: '01',
      title: 'Collect',
      desc: 'Upload statements, policies, tax documents, emails and other financial evidence.',
      icon: FileText,
    },
    {
      step: '02',
      title: 'Discover',
      desc: 'FINCLOSURE identifies known and potentially missing financial relationships.',
      icon: Search,
    },
    {
      step: '03',
      title: 'Verify',
      desc: 'Review extracted information, confidence levels and official verification pathways.',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'Act',
      desc: 'Get step-by-step guidance with required documents and clear instructions.',
      icon: ListChecks,
    },
    {
      step: '05',
      title: 'Close',
      desc: 'Track progress until the financial responsibility is completely resolved.',
      icon: BarChart3,
    },
  ];

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="landing-container">
        {/* Section Header */}
        <div className="how-it-works-header">
          <span className="section-eyebrow">SIMPLE STEPS. MEANINGFUL OUTCOMES.</span>
          <h2 className="section-heading">From Fragmented Evidence to Financial Closure</h2>
          <p className="section-subheading">
            FINCLOSURE guides you through every step — from collecting documents to completing claims.
          </p>
        </div>

        {/* 5-Stage Process Flow */}
        <div className="process-flow-container">
          {stages.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === stages.length - 1;

            return (
              <React.Fragment key={item.step}>
                <motion.div
                  className="process-stage-item"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: index * 0.1, duration: 0.45 }}
                >
                  {/* Circular Icon with Numbered Badge */}
                  <div className="stage-icon-wrapper">
                    <div className="stage-icon-circle">
                      <Icon size={24} strokeWidth={1.8} />
                    </div>
                    <span className="stage-number-badge">{item.step}</span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="stage-title">{item.title}</h3>
                  <p className="stage-desc">{item.desc}</p>
                </motion.div>

                {/* Arrow Connector between items */}
                {!isLast && (
                  <div className="stage-connector-arrow" aria-hidden="true">
                    <ArrowRight size={20} strokeWidth={1.5} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
