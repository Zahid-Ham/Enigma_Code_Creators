/**
 * Application Topbar Component
 */

import React from 'react';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react';

export default function AppTopbar({ onToggleMobileSidebar = () => {} }) {
  return (
    <header className="app-topbar" aria-label="Application Header">
      {/* Mobile Menu Toggle & Brand */}
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-mobile-toggle"
          onClick={onToggleMobileSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <div className="topbar-search-container" role="search">
          <Search size={16} className="topbar-search-icon" aria-hidden="true" />
          <input
            type="search"
            className="topbar-search-input"
            placeholder="Search documents, assets, or guidance..."
            aria-label="Search documents, assets, or guidance"
            readOnly
          />
        </div>
      </div>

      {/* Right Controls: Notifications & User Avatar */}
      <div className="topbar-right">
        {/* Notification Bell */}
        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Notifications (1 unread)"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="topbar-notification-badge" aria-hidden="true" />
        </button>

        {/* User Profile Chip */}
        <div className="topbar-user-profile" tabIndex={0} role="button" aria-haspopup="menu" aria-label="User profile menu: Zahid Hamdule">
          <div className="user-avatar-circle" aria-hidden="true">
            Z
          </div>
          <span className="user-profile-name">Zahid Hamdule</span>
          <ChevronDown size={14} className="user-chevron-icon" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
