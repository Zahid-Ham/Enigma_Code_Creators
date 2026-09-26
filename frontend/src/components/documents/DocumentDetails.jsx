/**
 * Document Details Component
 * Displays file technical attributes, byte size, MIME type, upload timestamp, and UUID.
 */

import React, { useState } from 'react';
import { FileText, Copy, Check } from 'lucide-react';

export default function DocumentDetails({
  documentData,
  resultData,
}) {
  const [copied, setCopied] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'Recent session';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent session';
    }
  };

  const filename =
    documentData?.original_filename ||
    documentData?.sanitized_filename ||
    'document.pdf';

  const docId =
    documentData?.document_id ||
    resultData?.document_id ||
    'N/A';

  const sizeBytes = documentData?.file_size_bytes || 0;
  const mimeType = documentData?.mime_type || 'application/pdf';
  const uploadedAt = documentData?.uploaded_at || resultData?.processed_at;

  const handleCopyId = () => {
    if (docId && docId !== 'N/A') {
      navigator.clipboard.writeText(docId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="intel-card doc-details-card" aria-labelledby="doc-details-heading">
      <div className="details-card-header">
        <FileText size={18} className="details-card-icon text-red-500" aria-hidden="true" />
        <h4 id="doc-details-heading" className="details-card-title">
          Document Details
        </h4>
      </div>

      <div className="details-table">
        <div className="details-row">
          <span className="details-label">Original Filename</span>
          <span className="details-value font-medium" title={filename}>
            {filename}
          </span>
        </div>

        <div className="details-row">
          <span className="details-label">File Size</span>
          <span className="details-value">
            {formatFileSize(sizeBytes)}{' '}
            <span className="text-muted text-xs">({sizeBytes.toLocaleString()} bytes)</span>
          </span>
        </div>

        <div className="details-row">
          <span className="details-label">File Type</span>
          <span className="details-value">
            {filename.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Image'} ({mimeType})
          </span>
        </div>

        <div className="details-row">
          <span className="details-label">Uploaded</span>
          <span className="details-value">{formatDateTime(uploadedAt)}</span>
        </div>

        <div className="details-row">
          <span className="details-label">Document ID</span>
          <div className="details-value-id">
            <code className="doc-uuid-code" title={docId}>
              {docId}
            </code>
            <button
              type="button"
              className="btn-copy-id"
              onClick={handleCopyId}
              aria-label="Copy Document ID"
              title="Copy ID"
            >
              {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
