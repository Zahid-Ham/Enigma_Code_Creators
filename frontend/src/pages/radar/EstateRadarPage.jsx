/**
 * FINCLOSURE Estate Radar Page
 * Cross-document financial relationship discovery, recurrence aggregation, and missing asset detection.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Menu,
  ChevronRight,
} from 'lucide-react';

import AppSidebar from '../../components/layout/AppSidebar';
import AppTopbar from '../../components/layout/AppTopbar';
import RadarSummary from '../../components/radar/RadarSummary';
import DiscoveryList from '../../components/radar/DiscoveryList';
import DiscoveryDetails from '../../components/radar/DiscoveryDetails';
import MissingAssets from '../../components/radar/MissingAssets';
import RiskAlerts from '../../components/radar/RiskAlerts';
import { getEstateRadar } from '../../services/api/discovery';

const DEMO_ESTATE = {
  id: 'demo-estate-001',
  name: 'Arjun Mehta Estate',
};

export default function EstateRadarPage() {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedEstate, setSelectedEstate] = useState(DEMO_ESTATE.id);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [radarData, setRadarData] = useState(null);

  const [selectedDiscovery, setSelectedDiscovery] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('all'); // 'all' | 'missing'
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchRadar = useCallback(async (estateId = selectedEstate) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getEstateRadar(estateId);
      setRadarData(data);
      if (data?.discoveries && data.discoveries.length > 0) {
        setSelectedDiscovery(data.discoveries[0]);
      } else {
        setSelectedDiscovery(null);
      }
      setLastUpdated(
        new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    } catch (err) {
      console.error('Failed to load Estate Radar data:', err);
      setError('Unable to load Estate Radar discovery data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedEstate]);

  useEffect(() => {
    fetchRadar(selectedEstate);
  }, [fetchRadar, selectedEstate]);

  const handleSelectDiscovery = (item) => {
    setSelectedDiscovery(item);
  };

  const handleSelectMissingAsset = (asset) => {
    // When clicking a missing asset from left or right, find or generate a synthetic preview or navigate to documents
    const matched = (radarData?.discoveries || []).find(
      (d) => d.institution_name.toLowerCase() === asset.institution_name?.toLowerCase() ||
             d.financial_entity_type === asset.category
    );
    if (matched) {
      setSelectedDiscovery(matched);
      setActiveLeftTab('all');
    }
  };

  const handleInvestigate = (asset) => {
    navigate('/documents');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <AppSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="app-main-content">
        <AppTopbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        <div className="radar-page-container">
          {/* Top Header Banner */}
          <header className="radar-hero-header">
            <div className="radar-hero-left">
              <div className="radar-tag-pill">
                <span>ESTATE RADAR</span>
                <ChevronRight size={13} className="inline ml-1" />
              </div>

              <h1 className="radar-hero-title">Uncover Hidden Financial Relationships</h1>

              <p className="radar-hero-subtitle">
                FINCLOSURE analyzes your documents to find recurring patterns, identify missing assets,
                and highlight potential financial risks — so nothing is overlooked.
              </p>
            </div>

            {/* Right-Side AI Discovery Badge Card */}
            <div className="radar-hero-right-card" aria-hidden="true">
              <div className="radar-hero-badge-icon">
                <Target size={26} className="text-emerald-700" />
              </div>
              <div className="radar-hero-badge-text">
                <h4 className="radar-hero-badge-title">AI-Powered Discovery</h4>
                <p className="radar-hero-badge-desc">
                  Finding what matters, beyond what's visible in your documents.
                </p>
              </div>
            </div>
          </header>

          {/* Loading & Error States */}
          {isLoading && (
            <div className="radar-loading-skeleton" aria-label="Loading Estate Radar analysis">
              <div className="radar-skeleton-cards">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="radar-skeleton-card" />
                ))}
              </div>
              <div className="radar-skeleton-grid">
                <div className="radar-skeleton-col-left" />
                <div className="radar-skeleton-col-center" />
                <div className="radar-skeleton-col-right" />
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="radar-error-banner" role="alert">
              <AlertCircle size={20} className="text-red-500 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-red-900">{error}</p>
              </div>
              <button
                type="button"
                className="radar-retry-btn"
                onClick={() => fetchRadar(selectedEstate)}
              >
                <RefreshCw size={14} className="mr-1 inline" />
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && radarData && (
            <>
              {/* Summary 4-Metric Cards Grid */}
              <RadarSummary summary={radarData.summary} />

              {/* 3-Column Discovery Workspace */}
              <div className="radar-workspace-grid">
                {/* Column 1: Left Discovery List */}
                <div className="radar-column-left">
                  <DiscoveryList
                    discoveries={radarData.discoveries || []}
                    missingAssets={radarData.missing_assets || []}
                    selectedId={selectedDiscovery?.discovery_id}
                    activeTab={activeLeftTab}
                    onChangeTab={setActiveLeftTab}
                    onSelectDiscovery={handleSelectDiscovery}
                    onSelectMissingAsset={handleSelectMissingAsset}
                  />
                </div>

                {/* Column 2: Center Detail Panel */}
                <div className="radar-column-center">
                  <DiscoveryDetails
                    discovery={selectedDiscovery}
                    onBack={() => {}}
                  />
                </div>

                {/* Column 3: Right Missing Assets & Insights Panel */}
                <div className="radar-column-right">
                  <MissingAssets
                    missingAssets={radarData.missing_assets || []}
                    onInvestigate={handleInvestigate}
                  />

                  <RiskAlerts
                    insights={radarData.insights || []}
                    riskAlerts={radarData.risk_alerts || []}
                  />
                </div>
              </div>
            </>
          )}

          {/* Footer Status Bar */}
          <footer className="radar-footer-bar">
            <div className="radar-footer-left">
              <span>FINCLOSURE • Estate Radar</span>
            </div>
            <div className="radar-footer-right">
              <span>Last updated: {lastUpdated || '26 Sept 2026, 03:50 PM'}</span>
              <button
                type="button"
                className="radar-refresh-icon-btn"
                onClick={() => fetchRadar(selectedEstate)}
                title="Refresh Estate Radar calculations"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
