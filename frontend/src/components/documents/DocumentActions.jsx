/**
 * Document Actions Component
 * Handles Reprocess trigger, Client-Side JSON download, and disabled Estate Twin integration.
 */

import React from 'react';
import {
  RotateCw,
  Download,
  FolderPlus,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function DocumentActions({
  documentId,
  documentData,
  resultData,
  isReprocessing = false,
  onReprocess,
}) {
  const handleDownloadJson = () => {
    if (!resultData) return;

    const exportPayload = {
      finclosure_version: '1.0',
      document_id: documentId,
      original_filename: documentData?.original_filename || 'document.pdf',
      extracted_at: resultData?.processed_at || new Date().toISOString(),
      document_type: resultData?.document_type,
      overall_confidence: resultData?.overall_confidence,
      entities: resultData?.entities || [],
      evidence: resultData?.evidence || [],
      warnings: resultData?.warnings || [],
      processing_metrics: {
        duration_ms: resultData?.processing_duration_ms,
        pages_analyzed: resultData?.extracted_text_page_count,
        relevant_pages: resultData?.relevant_page_count,
      },
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportPayload, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    const baseName = (documentData?.original_filename || 'document').replace(/\.[^/.]+$/, '');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${baseName}_extracted.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="side-card actions-card" aria-labelledby="actions-heading">
      <h3 id="actions-heading" className="side-card-title">
        Actions
      </h3>

      <div className="actions-button-stack">
        {/* Reprocess Document Button */}
        <button
          type="button"
          className="btn btn-action-reprocess"
          onClick={onReprocess}
          disabled={isReprocessing}
          aria-label="Reprocess document with AI"
        >
          {isReprocessing ? (
            <>
              <Loader2 size={16} className="animate-spin text-emerald-700" aria-hidden="true" />
              <span>Reprocessing...</span>
            </>
          ) : (
            <>
              <RotateCw size={16} className="text-emerald-700" aria-hidden="true" />
              <span>Reprocess Document</span>
            </>
          )}
        </button>

        {/* Download Extracted Data JSON Button */}
        <button
          type="button"
          className="btn btn-action-download"
          onClick={handleDownloadJson}
          disabled={!resultData}
          aria-label="Download extracted financial intelligence as JSON"
        >
          <Download size={16} aria-hidden="true" />
          <span>Download Extracted Data (JSON)</span>
        </button>

        {/* Add to Financial Estate (Coming Soon) */}
        <button
          type="button"
          className="btn btn-action-estate btn-disabled"
          disabled
          aria-label="Add detected assets to financial estate (Feature coming in later phase)"
        >
          <FolderPlus size={16} aria-hidden="true" />
          <span>Add to Financial Estate (Coming Soon)</span>
        </button>
      </div>
    </div>
  );
}
