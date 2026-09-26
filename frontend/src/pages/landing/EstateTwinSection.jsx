import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Building,
  CreditCard,
  RefreshCw,
} from 'lucide-react';

export default function EstateTwinSection() {
  const leftCards = [
    {
      id: 'bank-accounts',
      title: 'Bank Accounts',
      count: '4 accounts',
      status: 'Verified',
      statusType: 'verified',
      icon: Landmark,
    },
    {
      id: 'insurance',
      title: 'Insurance',
      count: '3 policies',
      status: 'In Progress',
      statusType: 'progress',
      icon: ShieldCheck,
    },
    {
      id: 'investments',
      title: 'Investments',
      count: '5 holdings',
      status: 'Verified',
      statusType: 'verified',
      icon: TrendingUp,
    },
  ];

  const rightCards = [
    {
      id: 'assets',
      title: 'Assets',
      count: '2 properties',
      status: 'Inferred',
      statusType: 'inferred',
      icon: Building,
    },
    {
      id: 'liabilities',
      title: 'Liabilities',
      count: '2 loans',
      status: 'Missing',
      statusType: 'missing',
      icon: CreditCard,
    },
    {
      id: 'recurring',
      title: 'Recurring Services',
      count: '6 subscriptions',
      status: 'In Progress',
      statusType: 'progress',
      icon: RefreshCw,
    },
  ];

  const statuses = [
    {
      name: 'Verified',
      desc: 'Confirmed with supporting evidence',
      color: '#2E7D52',
    },
    {
      name: 'Inferred',
      desc: 'Identified from documents or patterns',
      color: '#6366F1',
    },
    {
      name: 'Missing',
      desc: 'Potential asset to be verified',
      color: '#DC2626',
    },
    {
      name: 'In Progress',
      desc: 'Claim or verification ongoing',
      color: '#D97706',
    },
    {
      name: 'Completed',
      desc: 'Claim/closure finished',
      color: '#15803D',
    },
  ];

  return (
    <section className="estate-twin-section" id="estate-twin">
      <div className="landing-container">
        <div className="estate-twin-layout">
          {/* Left Narrative Heading */}
          <div className="twin-narrative-col">
            <span className="section-eyebrow">FINANCIAL ESTATE TWIN</span>
            <h2 className="twin-heading">
              A Complete View<br />
              of a Person’s<br />
              <span className="accent-serif">Financial Life</span>
            </h2>
            <p className="twin-description">
              Bring together all known and discovered assets, liabilities and financial
              relationships in one organized view — so nothing important is overlooked.
            </p>
          </div>

          {/* Center Interactive Visual Node Network */}
          <div className="twin-network-visual">
            {/* Background SVG Connectors (Desktop) */}
            <svg
              className="twin-connectors-svg"
              viewBox="0 0 640 260"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Left branches into center */}
              <path
                d="M 215 42 C 260 42, 275 130, 320 130"
                stroke="#C2DACB"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 215 130 L 320 130"
                stroke="#C2DACB"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 215 218 C 260 218, 275 130, 320 130"
                stroke="#C2DACB"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Right branches into center */}
              <path
                d="M 425 42 C 380 42, 365 130, 320 130"
                stroke="#C2DACB"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 425 130 L 320 130"
                stroke="#C2DACB"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 425 218 C 380 218, 365 130, 320 130"
                stroke="#C2DACB"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Left 3 Relationship Cards */}
            <div className="twin-col-nodes left-nodes">
              {leftCards.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    className="twin-relationship-card"
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                  >
                    <div className="twin-card-left">
                      <div className="twin-card-icon">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="twin-card-title">{item.title}</div>
                        <div className="twin-card-count">{item.count}</div>
                      </div>
                    </div>
                    <span className={`twin-status-pill status-${item.statusType}`}>
                      {item.status}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Central Node: Financial Estate */}
            <motion.div
              className="twin-center-node"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45 }}
            >
              <div className="center-node-avatar">
                <User size={26} strokeWidth={2.2} />
              </div>
              <div className="center-node-title">Financial Estate</div>
              <div className="center-node-sub">Complete • Organized • Actionable</div>
            </motion.div>

            {/* Right 3 Relationship Cards */}
            <div className="twin-col-nodes right-nodes">
              {rightCards.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    className="twin-relationship-card"
                    initial={{ opacity: 0, x: 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                  >
                    <div className="twin-card-left">
                      <div className="twin-card-icon">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="twin-card-title">{item.title}</div>
                        <div className="twin-card-count">{item.count}</div>
                      </div>
                    </div>
                    <span className={`twin-status-pill status-${item.statusType}`}>
                      {item.status}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Far Right: Compact Asset Status Legend */}
          <div className="twin-status-legend">
            <h4 className="legend-heading">Asset Status</h4>
            <div className="legend-list">
              {statuses.map((st) => (
                <div key={st.name} className="legend-status-item">
                  <div className="legend-status-title">
                    <span className="legend-status-dot" style={{ backgroundColor: st.color }}></span>
                    <span className="legend-name">{st.name}</span>
                  </div>
                  <div className="legend-status-desc">{st.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

