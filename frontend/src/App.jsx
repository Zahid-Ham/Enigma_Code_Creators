import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import DocumentsPage from './pages/documents/DocumentsPage';
import DocumentIntelligencePage from './pages/documents/DocumentIntelligencePage';
import EstateRadarPage from './pages/radar/EstateRadarPage';

/**
 * FINCLOSURE Root Application Component
 */
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/documents/:documentId" element={<DocumentIntelligencePage />} />
        <Route path="/estate-radar" element={<EstateRadarPage />} />
      </Routes>
    </Router>
  );
}
