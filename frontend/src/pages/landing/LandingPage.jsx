import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../../components/navigation/LandingNavbar';
import HeroSection from './HeroSection';
import TrustedSources from './TrustedSources';
import HowItWorks from './HowItWorks';
import FeatureOverview from './FeatureOverview';
import EstateRadarSpotlight from './EstateRadarSpotlight';
import EstateTwinSection from './EstateTwinSection';
import WhyItMatters from './WhyItMatters';
import ProductModes from './ProductModes';
import FAQSection from './FAQSection';
import RealImpact from './RealImpact';
import ProductPreview from './ProductPreview';
import FinalCTA from './FinalCTA';
import LandingFooter from './LandingFooter';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/documents');
  };

  const handleHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignIn = () => {
    alert('Sign in and authentication workflows will be configured in the next phase.');
  };

  const handleReviewFinding = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectMode = (modeId) => {
    const target = document.getElementById('how-it-works');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page-root">
      {/* Sticky Navigation Bar */}
      <LandingNavbar onGetStarted={handleGetStarted} onSignIn={handleSignIn} />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero Section with Product Mockup & Trust Points */}
        <HeroSection onGetStarted={handleGetStarted} onHowItWorks={handleHowItWorks} />

        {/* 2. Official Ecosystem & Government Sources */}
        <TrustedSources />

        {/* 3. 5-Step Process Flow: Evidence to Closure */}
        <HowItWorks />

        {/* 4. Core Features Grid with Estate Radar Spotlight */}
        <FeatureOverview />

        {/* 5. Estate Radar Dedicated USP Spotlight */}
        <EstateRadarSpotlight onReviewFinding={handleReviewFinding} />

        {/* 6. Financial Estate Twin Visual Map */}
        <EstateTwinSection />

        {/* 7. Why It Matters: Empathy & Clarity */}
        <WhyItMatters />

        {/* 8. Dual-Mode Product: Prepare Ahead vs Recover & Close */}
        <ProductModes onSelectMode={handleSelectMode} />

        {/* 9. Interactive FAQ Accordion */}
        <FAQSection />

        {/* 10. Real Impact: Illustrative Experience & Closure Progress */}
        <RealImpact />

        {/* 11. Product Preview: Interactive Dashboard Mockup */}
        <ProductPreview onGetStarted={handleGetStarted} />

        {/* 12. Final Journey Call to Action */}
        <FinalCTA onGetStarted={handleGetStarted} />
      </main>

      {/* 13. Multi-Column Minimalist Footer */}
      <LandingFooter />
    </div>
  );
}

