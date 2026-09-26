/**
 * Header Document Graphic Component
 * Clean layered aesthetic graphic matching the visual reference.
 */

import React from 'react';
import { Shield, Check } from 'lucide-react';

export default function HeaderDocumentGraphic() {
  return (
    <div className="header-graphic-container" aria-hidden="true">
      <div className="graphic-stack">
        {/* Layer 1: Statements */}
        <div className="doc-layer layer-statements">
          <div className="doc-layer-header">
            <span className="doc-tag">Statements</span>
          </div>
          <div className="doc-skeleton-lines">
            <div className="line line-long" />
            <div className="line line-short" />
          </div>
        </div>

        {/* Layer 2: Policies */}
        <div className="doc-layer layer-policies">
          <div className="doc-layer-header">
            <span className="doc-tag">Policies</span>
          </div>
          <div className="doc-skeleton-lines">
            <div className="line line-med" />
          </div>
        </div>

        {/* Layer 3: Tax Documents */}
        <div className="doc-layer layer-tax">
          <div className="doc-layer-header">
            <span className="doc-tag">Tax Documents</span>
          </div>
          <div className="doc-skeleton-lines">
            <div className="line line-long" />
            <div className="line line-med" />
          </div>
        </div>

        {/* Layer 4: Other Records */}
        <div className="doc-layer layer-other">
          <div className="doc-layer-header">
            <span className="doc-tag">Other Records</span>
          </div>
          <div className="doc-skeleton-lines">
            <div className="line line-short" />
          </div>
        </div>

        {/* Shield Badge */}
        <div className="graphic-shield-badge">
          <Shield size={18} className="shield-bg-icon" />
          <Check size={12} className="shield-check-icon" />
        </div>

        {/* Decorative leafy vectors */}
        <div className="graphic-leaf-decor leaf-1">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#3E8E64" opacity="0.35">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
