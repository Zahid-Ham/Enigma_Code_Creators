import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../../pages/landing/landingData';

export default function LandingNavbar({ onGetStarted, onSignIn }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['hero', 'how-it-works', 'features', 'why-it-matters', 'faqs'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(targetId);
    }
  };

  return (
    <header className={`landing-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="landing-container navbar-content">
        {/* Brand Logo matching visual reference */}
        <a href="#hero" className="brand-logo" onClick={(e) => handleNavClick(e, '#hero')}>
          <div className="brand-leaf-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M5 21C5 21 7 17 12 16C17 15 23 16 23 16C23 16 21 19 16 20C11 21 5 21 5 21Z"
                fill="#183B2B"
              />
              <path
                d="M7 14C7 14 9 10 14 9C19 8 25 9 25 9C25 9 23 12 18 13C13 14 7 14 7 14Z"
                fill="#183B2B"
              />
              <path
                d="M10 7C10 7 12 4 16 3.5C20 3 25 4 25 4C25 4 23 7 19 7.5C15 8 10 7 10 7Z"
                fill="#183B2B"
              />
            </svg>
          </div>
          <span className="brand-text">FINCLOSURE</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="nav-links" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => {
            const sectionKey = link.href.replace('#', '');
            const isActive = activeSection === sectionKey;
            return (
              <li key={link.label} className="nav-link-item">
                <a
                  href={link.href}
                  className={isActive ? 'active' : ''}
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </nav>

        {/* Desktop CTA Actions */}
        <div className="nav-actions nav-actions-desktop">
          <button
            type="button"
            className="btn-signin"
            onClick={onSignIn}
            aria-label="Sign in"
          >
            Sign In
          </button>
          <button
            type="button"
            className="btn-get-started"
            onClick={onGetStarted}
            aria-label="Get started with FINCLOSURE"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-modal="true">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onSignIn) onSignIn();
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onGetStarted) onGetStarted();
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
