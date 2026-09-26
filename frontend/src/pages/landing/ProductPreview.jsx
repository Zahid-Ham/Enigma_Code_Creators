import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderLock,
  FileText,
  Radar,
  ClipboardList,
  TrendingUp,
  Settings,
  Search,
  Bell,
  Wallet,
  ShieldCheck,
  Clock,
  AlertCircle,
  Play,
  ArrowRight,
  FileCheck,
  Sparkles,
} from 'lucide-react';

export default function ProductPreview({ onGetStarted }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'estate', label: 'My Estate', icon: FolderLock },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'radar', label: 'Estate Radar', icon: Radar },
    { id: 'claims', label: 'Claims & Closure', icon: ClipboardList },
    { id: 'tracking', label: 'Tracking', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleWatchDemo = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="product-preview-section" id="product-preview">
      <div className="landing-container">
        <div className="product-preview-plate">
          <div className="preview-split-layout">
            {/* Left Column: Heading + Copy + Action CTAs */}
            <div className="preview-narrative-col">
              <span className="section-eyebrow">PRODUCT PREVIEW</span>
              <h2 className="preview-heading">
                A Closer Look<br />
                Inside FINCLOSURE
              </h2>
              <p className="preview-description">
                Organize, discover and track every financial asset — all in one simple, intuitive platform.
              </p>

              <div className="preview-cta-group">
                <button
                  type="button"
                  className="btn-preview-primary"
                  onClick={onGetStarted}
                  aria-label="Get started with FINCLOSURE"
                >
                  Get Started →
                </button>
                <button
                  type="button"
                  className="btn-preview-secondary"
                  onClick={handleWatchDemo}
                  aria-label="Watch FINCLOSURE product demo"
                >
                  <Play size={13} fill="currentColor" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>

            {/* Right Column: High-Fidelity Interactive Dashboard Preview Mockup */}
            <motion.div
              className="preview-dashboard-mockup"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5 }}
            >
              {/* Mockup Topbar / Header */}
              <div className="dashboard-topbar">
                <div className="dashboard-search-bar">
                  <Search size={14} className="search-icon" />
                  <span className="search-placeholder">Search assets, documents...</span>
                </div>
                <div className="topbar-actions">
                  <button type="button" className="topbar-icon-btn" aria-label="Notifications">
                    <Bell size={15} />
                  </button>
                  <div className="user-avatar-pill">
                    <span>Z</span>
                  </div>
                </div>
              </div>

              {/* Mockup Main Body (Sidebar + Content Canvas) */}
              <div className="dashboard-body-layout">
                {/* Dashboard Sidebar */}
                <div className="dashboard-sidebar">
                  <div className="sidebar-brand-row">
                    <div className="sidebar-leaf-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                      </svg>
                    </div>
                    <span className="sidebar-brand-name">FINCLOSURE</span>
                  </div>

                  <nav className="sidebar-nav-list" aria-label="Dashboard preview navigation">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                          onClick={() => setActiveTab(item.id)}
                        >
                          <Icon size={15} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Dashboard Canvas Area */}
                <div className="dashboard-canvas">
                  {/* Canvas Greeting Header */}
                  <div className="canvas-header-row">
                    <div>
                      <h3 className="canvas-greeting">Welcome Back</h3>
                      <p className="canvas-subtext">Here's an overview of your financial estate.</p>
                    </div>
                  </div>

                  {/* 4 Stat Metric Cards */}
                  <div className="canvas-stats-grid">
                    <div className="stat-card stat-total">
                      <div className="stat-icon-wrap stat-icon-green">
                        <Wallet size={16} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-number">12</div>
                        <div className="stat-label">Total Assets</div>
                      </div>
                    </div>

                    <div className="stat-card stat-verified">
                      <div className="stat-icon-wrap stat-icon-verified">
                        <ShieldCheck size={16} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-number">5</div>
                        <div className="stat-label">Verified</div>
                      </div>
                    </div>

                    <div className="stat-card stat-progress">
                      <div className="stat-icon-wrap stat-icon-progress">
                        <Clock size={16} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-number">3</div>
                        <div className="stat-label">In Progress</div>
                      </div>
                    </div>

                    <div className="stat-card stat-attention">
                      <div className="stat-icon-wrap stat-icon-attention">
                        <AlertCircle size={16} />
                      </div>
                      <div className="stat-info">
                        <div className="stat-number">4</div>
                        <div className="stat-label">Need Attention</div>
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Visual Detail (Asset Categories + Recent Activity) */}
                  <div className="canvas-bottom-split">
                    {/* Left: Asset Categories Donut Visualization */}
                    <div className="canvas-panel categories-panel">
                      <h4 className="panel-title">Asset Categories</h4>
                      <div className="categories-content-layout">
                        {/* Donut Chart */}
                        <div className="categories-donut-wrap">
                          <svg className="categories-donut-svg" viewBox="0 0 100 100">
                            {/* Bank Accounts (Green: ~33%) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="38"
                              fill="transparent"
                              stroke="#2E7D52"
                              strokeWidth="13"
                              strokeDasharray="80 240"
                              strokeDashoffset="0"
                            />
                            {/* Insurance (Blue: ~25%) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="38"
                              fill="transparent"
                              stroke="#3B82F6"
                              strokeWidth="13"
                              strokeDasharray="60 240"
                              strokeDashoffset="-80"
                            />
                            {/* Investments (Purple: ~17%) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="38"
                              fill="transparent"
                              stroke="#8B5CF6"
                              strokeWidth="13"
                              strokeDasharray="40 240"
                              strokeDashoffset="-140"
                            />
                            {/* Properties (Amber: ~8%) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="38"
                              fill="transparent"
                              stroke="#F59E0B"
                              strokeWidth="13"
                              strokeDasharray="20 240"
                              strokeDashoffset="-180"
                            />
                            {/* Others (Teal/Gray: ~17%) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="38"
                              fill="transparent"
                              stroke="#94A3B8"
                              strokeWidth="13"
                              strokeDasharray="40 240"
                              strokeDashoffset="-200"
                            />
                          </svg>
                          <div className="categories-donut-center">
                            <span className="cat-donut-count">12</span>
                            <span className="cat-donut-label">Assets</span>
                          </div>
                        </div>

                        {/* Legend Items */}
                        <div className="categories-legend-list">
                          <div className="cat-legend-row">
                            <div className="cat-legend-left">
                              <span className="cat-legend-dot dot-green" />
                              <span className="cat-legend-name">Bank Accounts</span>
                            </div>
                            <span className="cat-legend-val">4</span>
                          </div>
                          <div className="cat-legend-row">
                            <div className="cat-legend-left">
                              <span className="cat-legend-dot dot-blue" />
                              <span className="cat-legend-name">Insurance</span>
                            </div>
                            <span className="cat-legend-val">3</span>
                          </div>
                          <div className="cat-legend-row">
                            <div className="cat-legend-left">
                              <span className="cat-legend-dot dot-purple" />
                              <span className="cat-legend-name">Investments</span>
                            </div>
                            <span className="cat-legend-val">2</span>
                          </div>
                          <div className="cat-legend-row">
                            <div className="cat-legend-left">
                              <span className="cat-legend-dot dot-amber" />
                              <span className="cat-legend-name">Properties</span>
                            </div>
                            <span className="cat-legend-val">1</span>
                          </div>
                          <div className="cat-legend-row">
                            <div className="cat-legend-left">
                              <span className="cat-legend-dot dot-gray" />
                              <span className="cat-legend-name">Others</span>
                            </div>
                            <span className="cat-legend-val">2</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Recent Activity Feed */}
                    <div className="canvas-panel activity-panel">
                      <div className="panel-header-row">
                        <h4 className="panel-title">Recent Activity</h4>
                        <span className="panel-action-link">View All</span>
                      </div>

                      <div className="activity-feed-list">
                        <div className="activity-row">
                          <div className="activity-icon-badge badge-green">
                            <FileCheck size={14} />
                          </div>
                          <div className="activity-info">
                            <div className="activity-title">New document processed</div>
                            <div className="activity-meta">Bank statement • 2 hours ago</div>
                          </div>
                        </div>

                        <div className="activity-row">
                          <div className="activity-icon-badge badge-amber">
                            <Sparkles size={14} />
                          </div>
                          <div className="activity-info">
                            <div className="activity-title">Potential asset detected</div>
                            <div className="activity-meta">Insurance relationship • 5 hours ago</div>
                          </div>
                        </div>

                        <div className="activity-row">
                          <div className="activity-icon-badge badge-blue">
                            <ClipboardList size={14} />
                          </div>
                          <div className="activity-info">
                            <div className="activity-title">Claim status updated</div>
                            <div className="activity-meta">EPFO claim • 1 day ago</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
