/**
 * Application Sidebar Navigation Component with Badges
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  Radar,
  ClipboardCheck,
  ChartNoAxesCombined,
  FileSpreadsheet,
  Settings,
  X,
} from 'lucide-react';

export default function AppSidebar({ isOpen = false, onClose = () => {} }) {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/#dashboard' },
    { label: 'My Estate', icon: BriefcaseBusiness, path: '/#estate' },
    { label: 'Documents', icon: FileText, path: '/documents' },
    { label: 'Estate Radar', icon: Radar, path: '/estate-radar', badge: 'New', badgeType: 'new' },
    { label: 'Claims & Closure', icon: ClipboardCheck, path: '/#claims', badge: 'Soon', badgeType: 'soon' },
    { label: 'Tracking', icon: ChartNoAxesCombined, path: '/#tracking', badge: 'Soon', badgeType: 'soon' },
    { label: 'Prepare My Estate', icon: FileSpreadsheet, path: '/#prepare', badge: 'Soon', badgeType: 'soon' },
    { label: 'Settings', icon: Settings, path: '/#settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="app-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${isOpen ? 'sidebar-mobile-open' : ''}`}
        aria-label="Application Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand-link">
            <div className="sidebar-brand-leaf-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
              </svg>
            </div>
            <span className="sidebar-brand-text">FINCLOSURE</span>
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            className="sidebar-close-mobile-btn"
            onClick={onClose}
            aria-label="Close navigation sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav" aria-label="Main Application Menu">
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrentRoute =
                item.path === location.pathname ||
                (item.path === '/documents' && location.pathname.startsWith('/documents')) ||
                (item.path === '/estate-radar' && location.pathname === '/estate-radar');

              return (
                <li key={item.label} className="sidebar-nav-item">
                  <Link
                    to={item.path}
                    className={`sidebar-nav-link ${isCurrentRoute ? 'active' : ''}`}
                    onClick={() => {
                      if (window.innerWidth <= 768) {
                        onClose();
                      }
                    }}
                  >
                    <Icon size={18} className="nav-item-icon" />
                    <span className="nav-item-label">{item.label}</span>
                    {item.badge && (
                      <span className={`nav-item-badge badge-${item.badgeType}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Callout in Sidebar as in Visual Reference */}
        <div className="sidebar-bottom-callout" aria-hidden="true">
          <div className="sidebar-callout-leaf">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>
          <h4 className="sidebar-callout-title">From documents to complete closure</h4>
          <p className="sidebar-callout-desc">
            Discover, verify and close your financial relationships with AI.
          </p>
        </div>
      </aside>
    </>
  );
}
