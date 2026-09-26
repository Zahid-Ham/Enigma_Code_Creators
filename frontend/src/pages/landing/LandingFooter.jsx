import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const handleSmoothScroll = (e, href) => {
    if (href.startsWith('#') && !['#privacy', '#terms', '#about', '#contact', '#support'].includes(href)) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      e.preventDefault();
    }
  };

  return (
    <footer className="landing-footer" id="footer">
      <div className="landing-container">
        <div className="footer-multi-layout">
          {/* Column 1: Brand & Copyright */}
          <div className="footer-brand-col">
            <div className="footer-logo-row">
              <span className="footer-leaf-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                </svg>
              </span>
              <span className="footer-brand-title">FINCLOSURE</span>
            </div>
            <div className="footer-brand-tagline">Financial Estate Discovery & Closure</div>
            <div className="footer-copyright-note">© {currentYear} FINCLOSURE. All rights reserved.</div>
          </div>

          {/* Navigation Links Columns */}
          <div className="footer-nav-columns">
            {/* Product Column */}
            <div className="footer-nav-col">
              <h5 className="nav-col-title">Product</h5>
              <a href="#hero" onClick={(e) => handleSmoothScroll(e, '#hero')}>
                Home
              </a>
              <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, '#how-it-works')}>
                How It Works
              </a>
              <a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')}>
                Features
              </a>
              <a href="#faqs" onClick={(e) => handleSmoothScroll(e, '#faqs')}>
                FAQs
              </a>
            </div>

            {/* Legal Column */}
            <div className="footer-nav-col">
              <h5 className="nav-col-title">Legal</h5>
              <a href="#privacy" onClick={(e) => handleSmoothScroll(e, '#privacy')}>
                Privacy Policy
              </a>
              <a href="#terms" onClick={(e) => handleSmoothScroll(e, '#terms')}>
                Terms of Service
              </a>
            </div>

            {/* Company Column */}
            <div className="footer-nav-col">
              <h5 className="nav-col-title">Company</h5>
              <a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')}>
                About FINCLOSURE
              </a>
            </div>

            {/* Support Column */}
            <div className="footer-nav-col">
              <h5 className="nav-col-title">Support</h5>
              <a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>
                Contact
              </a>
              <a href="#support" onClick={(e) => handleSmoothScroll(e, '#support')}>
                Help & Support
              </a>
            </div>
          </div>

          {/* Right Column: Guidance Box */}
          <div className="footer-guidance-col">
            <div className="footer-guidance-card">
              <div className="guidance-leaf-badge">
                <ShieldCheck size={16} strokeWidth={2.2} />
              </div>
              <p className="guidance-card-text">
                FINCLOSURE provides organizational and guidance tools. It does not replace legal, financial, or institutional advice.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Tagline Row */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-tagline">Organize. Discover. Guide. Close.</div>
        </div>
      </div>
    </footer>
  );
}
