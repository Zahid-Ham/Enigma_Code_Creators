/**
 * Document Preview Component
 * Renders document page preview mockup with pagination controls and fallback state.
 */

import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileCheck2,
  Shield,
  Eye,
} from 'lucide-react';

export default function DocumentPreview({
  documentData,
  resultData,
  totalPages = 1,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const total = Math.max(1, totalPages || resultData?.extracted_text_page_count || 1);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(total, prev + 1));
  };

  const institutionName =
    resultData?.entities?.[0]?.institution_name || 'HDFC Life';
  const docTitle =
    resultData?.entities?.[0]?.display_name || 'Policy Certificate';

  return (
    <div className="side-card document-preview-card" aria-labelledby="preview-heading">
      <div className="side-card-header-row">
        <h3 id="preview-heading" className="side-card-title mb-0">
          Document Preview
        </h3>
        <button
          type="button"
          className="btn-link-preview"
          title="Open document viewer in full window"
          onClick={() => {
            alert('Full document viewer will be available with persistent Cloudinary storage in the next phase.');
          }}
        >
          <span>Open Full Document</span>
          <ExternalLink size={13} aria-hidden="true" />
        </button>
      </div>

      <div className="document-preview-stage">
        {/* Document Page Frame Mockup */}
        <div className="preview-page-sheet" role="region" aria-label={`Preview of page ${currentPage} of ${total}`}>
          <div className="preview-sheet-header">
            <div className="preview-brand-mark">
              <Shield size={16} className="text-red-600 mr-1" aria-hidden="true" />
              <span className="brand-text-red font-bold text-xs uppercase">{institutionName}</span>
            </div>
            <div className="preview-watermark-tag">Schedule</div>
          </div>

          <div className="preview-sheet-body">
            <h5 className="preview-sheet-title">{docTitle}</h5>

            <div className="preview-lines-group">
              <div className="preview-mock-line line-w-80"></div>
              <div className="preview-mock-line line-w-60"></div>
              <div className="preview-mock-line line-w-90"></div>
              <div className="preview-mock-line line-w-50"></div>
              <div className="preview-mock-line line-w-75"></div>
              <div className="preview-mock-line line-w-40"></div>
            </div>

            <div className="preview-sub-box">
              <div className="preview-mock-line line-w-70"></div>
              <div className="preview-mock-line line-w-85"></div>
            </div>
          </div>

          <div className="preview-sheet-footer">
            <span className="text-[10px] text-slate-400">FINCLOSURE AI Verification Ref: Page {currentPage}</span>
          </div>
        </div>

        {/* Floating Page Navigation Bar */}
        <div className="preview-pagination-bar" aria-label="Page navigation">
          <button
            type="button"
            className="btn-page-nav"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="pagination-text" aria-live="polite">
            {currentPage} / {total}
          </span>

          <button
            type="button"
            className="btn-page-nav"
            onClick={handleNextPage}
            disabled={currentPage >= total}
            aria-label="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Storage Fallback Note */}
      <div className="preview-storage-note">
        <p>Document preview is synthesized from in-memory extraction data.</p>
      </div>
    </div>
  );
}
