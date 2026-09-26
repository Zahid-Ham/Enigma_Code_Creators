import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderLock,
  FileText,
  Radar,
  FileCheck2,
  TrendingUp,
  Settings,
  ChevronRight,
  FileSpreadsheet,
  Search,
  BarChart3,
  Landmark,
  Building2,
  Coins,
} from 'lucide-react';

export default function HeroDashboard() {
  const sidebarItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true },
    { label: 'My Estate', icon: FolderLock, active: false },
    { label: 'Documents', icon: FileText, active: false },
    { label: 'Estate Radar', icon: Radar, active: false },
    { label: 'Claims & Closure', icon: FileCheck2, active: false },
    { label: 'Tracking', icon: TrendingUp, active: false },
    { label: 'Settings', icon: Settings, active: false },
  ];

  const discoveredItems = [
    {
      institution: 'EPFO',
      sub: 'Provident Fund',
      amount: '₹ 3,45,000',
      icon: Building2,
      color: '#1E40AF',
    },
    {
      institution: 'IEPF',
      sub: 'Unclaimed Dividend',
      amount: '₹ 12,400',
      icon: Coins,
      color: '#B45309',
    },
    {
      institution: 'UDGAM',
      sub: 'Unclaimed Deposits',
      amount: '₹ 82,300',
      icon: Landmark,
      color: '#0F766E',
    },
  ];

  return (
    <div className="hero-visual-wrapper">
      <div className="mockup-canvas-layout">
        {/* Layered plate backdrop for tactile elevation */}
        <div className="mockup-plate-wrapper">
          <motion.div
            className="mockup-window"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Dashboard Sidebar */}
            <aside className="mockup-sidebar" aria-label="Mockup navigation">
              <div className="mockup-logo">
                <span style={{ color: 'var(--color-primary-accent)', fontSize: '10px' }}>●</span>
                <span>FINCLOSURE</span>
              </div>
              <div className="mockup-nav">
                {sidebarItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`mockup-nav-item ${item.active ? 'active' : ''}`}
                    >
                      <IconComponent size={13} strokeWidth={item.active ? 2.4 : 1.8} />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Dashboard Main Content */}
            <div className="mockup-main">
              <div className="mockup-header">
                <h3>Financial Estate</h3>
                <p>All your discovered and potential assets in one place.</p>
              </div>

              {/* Circular Donut & Breakdown */}
              <div className="mockup-chart-row">
                <div className="donut-preview">
                  <svg width="88" height="88" viewBox="0 0 88 88">
                    {/* Background Track */}
                    <circle
                      cx="44"
                      cy="44"
                      r="33"
                      fill="none"
                      stroke="#EDE8E0"
                      strokeWidth="9"
                    />
                    {/* 5 Active Accounts (42%) */}
                    <circle
                      cx="44"
                      cy="44"
                      r="33"
                      fill="none"
                      stroke="#2E7D52"
                      strokeWidth="9"
                      strokeDasharray="86 207"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                    {/* 3 Potential Assets (25%) */}
                    <circle
                      cx="44"
                      cy="44"
                      r="33"
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="9"
                      strokeDasharray="51 207"
                      strokeDashoffset="-88"
                      strokeLinecap="round"
                    />
                    {/* 2 In Progress (17%) */}
                    <circle
                      cx="44"
                      cy="44"
                      r="33"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="9"
                      strokeDasharray="34 207"
                      strokeDashoffset="-142"
                      strokeLinecap="round"
                    />
                    {/* 2 Completed (16%) */}
                    <circle
                      cx="44"
                      cy="44"
                      r="33"
                      fill="none"
                      stroke="#15803D"
                      strokeWidth="9"
                      strokeDasharray="29 207"
                      strokeDashoffset="-178"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="donut-center-info">
                    <span className="donut-number">12</span>
                    <span className="donut-label">Total Assets</span>
                  </div>
                </div>

                {/* Chart Legend */}
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-item-left">
                      <span className="legend-dot" style={{ backgroundColor: '#2E7D52' }}></span>
                      <span>5 Active Accounts</span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-item-left">
                      <span className="legend-dot" style={{ backgroundColor: '#D97706' }}></span>
                      <span>3 Potential Assets</span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-item-left">
                      <span className="legend-dot" style={{ backgroundColor: '#0284C7' }}></span>
                      <span>2 In Progress</span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-item-left">
                      <span className="legend-dot" style={{ backgroundColor: '#15803D' }}></span>
                      <span>2 Completed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discovered Assets Mini Table */}
              <div className="mockup-asset-section">
                <div className="mockup-asset-header">
                  <h4>Discovered Assets</h4>
                  <span>View All</span>
                </div>
                <div className="mockup-asset-list">
                  {discoveredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.institution} className="mockup-asset-row">
                        <div className="asset-left">
                          <div className="asset-badge-icon">
                            <Icon size={12} style={{ color: item.color }} />
                          </div>
                          <div>
                            <div className="asset-title">{item.institution}</div>
                            <div className="asset-sub">{item.sub}</div>
                          </div>
                        </div>
                        <div className="asset-right">
                          <span>{item.amount}</span>
                          <ChevronRight size={13} color="#88958D" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Feature Cards Stack on Right */}
        <div className="floating-features-stack">
          {/* Card 1: Upload Documents */}
          <motion.div
            className="floating-feature-card"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            whileHover={{ y: -2 }}
          >
            <div className="floating-card-icon green">
              <FileSpreadsheet size={15} />
            </div>
            <div>
              <div className="floating-card-title">Upload Documents</div>
              <div className="floating-card-desc">Bank statements, policies, KYC, etc.</div>
            </div>
          </motion.div>

          {/* Card 2: AI Finds Your Assets */}
          <motion.div
            className="floating-feature-card"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            whileHover={{ y: -2 }}
          >
            <div className="floating-card-icon amber">
              <Search size={15} />
            </div>
            <div>
              <div className="floating-card-title">AI Finds Your Assets</div>
              <div className="floating-card-desc">Across EPFO, IEPF, UDGAM and more.</div>
            </div>
          </motion.div>

          {/* Card 3: Track Until Complete */}
          <motion.div
            className="floating-feature-card"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            whileHover={{ y: -2 }}
          >
            <div className="floating-card-icon teal">
              <BarChart3 size={15} />
            </div>
            <div>
              <div className="floating-card-title">Track Until Complete</div>
              <div className="floating-card-desc">Step-by-step guidance to claim and close.</div>
            </div>
          </motion.div>

          {/* Hand-Drawn Annotation Note */}
          <div className="floating-arrow-note">
            ↳ From documents to closure — guided end to end.
          </div>
        </div>
      </div>
    </div>
  );
}
