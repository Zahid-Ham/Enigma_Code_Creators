/**
 * Recently Uploaded Document Component
 * Displays only the real document metadata returned from the current upload session.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  FileCheck,
  Clock,
  HardDrive,
  Hash,
  Layers,
  ChevronRight,
  X,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';


export default function RecentDocument({ uploadedDocument }) {
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <section className="recent-documents-section" aria-labelledby="recently-uploaded-heading">
      <div className="recent-documents-card">
        {/* Section Header */}
        <div className="recent-header-row">
          <div>
            <h2 id="recently-uploaded-heading" className="recent-title">
              Recently Uploaded
            </h2>
            <p className="recent-subtitle">
              Your most recent document upload is shown below. Full document management will be available in a later stage.
            </p>
          </div>
          <span className="coming-soon-badge" title="Full document listing will be added in a future phase">
            View All (Coming Soon)
          </span>
        </div>

        {/* Content: Real Upload Record or Clean Session Placeholder */}
        {uploadedDocument ? (
          <div className="recent-document-item" tabIndex={0} role="article" aria-label={`Uploaded document: ${uploadedDocument.original_filename}`}>
            <div className="recent-item-left">
              <div className="recent-file-icon-box" aria-hidden="true">
                <FileText size={22} className="recent-file-icon" />
              </div>
              <div className="recent-item-meta">
                <h4 className="recent-filename">{uploadedDocument.original_filename}</h4>
                <p className="recent-meta-sub">
                  <span>Uploaded {formatTime(uploadedDocument.uploaded_at)}</span>
                  <span className="meta-dot">•</span>
                  <span>{formatFileSize(uploadedDocument.file_size_bytes)}</span>
                  <span className="meta-dot">•</span>
                  <span>{uploadedDocument.mime_type || 'application/octet-stream'}</span>
                </p>
              </div>
            </div>

            <div className="recent-item-right">
              <div className="recent-badges-row">
                <span className="status-badge badge-uploaded" title="File staged in server memory">
                  ✓ Uploaded
                </span>
                <span className="status-badge badge-analyzing-pill" title="AI Document Intelligence Active">
                  <Sparkles size={12} className="inline mr-1" />
                  Intelligence Ready
                </span>
              </div>

              <div className="recent-actions-row">
                <Link
                  to={`/documents/${uploadedDocument.document_id}`}
                  className="btn btn-sm btn-primary btn-view-intel"
                  aria-label={`View intelligence result for ${uploadedDocument.original_filename}`}
                >
                  <span>View Intelligence</span>
                  <ChevronRight size={14} />
                </Link>

                <button
                  type="button"
                  className="btn-view-details-subtle"
                  onClick={() => setShowMetadataModal(true)}
                  aria-label={`View technical metadata for ${uploadedDocument.original_filename}`}
                  title="Technical Metadata"
                >
                  <span>Raw Details</span>
                </button>
              </div>
            </div>
          </div>

        ) : (
          <div className="recent-empty-state">
            <div className="empty-state-icon-box" aria-hidden="true">
              <FileCheck size={26} className="text-muted" />
            </div>
            <p className="empty-state-text">
              No documents uploaded in this active session. Upload a document using the intake dropzone above.
            </p>
          </div>
        )}
      </div>

      {/* Technical Metadata Modal */}
      {showMetadataModal && uploadedDocument && (
        <div
          className="metadata-modal-backdrop"
          onClick={() => setShowMetadataModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="metadata-modal-title"
        >
          <div className="metadata-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <FileText size={20} className="modal-title-icon" />
                <h3 id="metadata-modal-title" className="modal-title">
                  Document Intake Metadata
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowMetadataModal(false)}
                aria-label="Close details modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-notice-banner">
                <Clock size={16} />
                <span>
                  <strong>Intake Completed:</strong> Document is verified & stored in temporary memory. Document processing will be available in the next stage.
                </span>
              </div>

              <div className="metadata-grid">
                <div className="metadata-field">
                  <span className="field-label">Document ID</span>
                  <div className="field-value-row">
                    <code className="field-code">{uploadedDocument.document_id}</code>
                    <button
                      type="button"
                      className="btn-copy-code"
                      onClick={() => copyToClipboard(uploadedDocument.document_id, 'docId')}
                      aria-label="Copy Document ID"
                    >
                      {copiedKey === 'docId' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="metadata-field">
                  <span className="field-label">Estate ID</span>
                  <div className="field-value-row">
                    <code className="field-code">{uploadedDocument.estate_id}</code>
                  </div>
                </div>

                <div className="metadata-field">
                  <span className="field-label">Original Filename</span>
                  <span className="field-value">{uploadedDocument.original_filename}</span>
                </div>

                <div className="metadata-field">
                  <span className="field-label">Sanitized Filename</span>
                  <span className="field-value">{uploadedDocument.sanitized_filename}</span>
                </div>

                <div className="metadata-field">
                  <span className="field-label">File Size</span>
                  <span className="field-value">
                    {formatFileSize(uploadedDocument.file_size_bytes)} ({uploadedDocument.file_size_bytes?.toLocaleString()} bytes)
                  </span>
                </div>

                <div className="metadata-field">
                  <span className="field-label">MIME Type</span>
                  <span className="field-value">{uploadedDocument.mime_type}</span>
                </div>

                <div className="metadata-field">
                  <span className="field-label">SHA-256 Checksum</span>
                  <div className="field-value-row">
                    <code className="field-code hash-code">{uploadedDocument.file_hash || 'N/A'}</code>
                    {uploadedDocument.file_hash && (
                      <button
                        type="button"
                        className="btn-copy-code"
                        onClick={() => copyToClipboard(uploadedDocument.file_hash, 'hash')}
                        aria-label="Copy SHA-256 checksum"
                      >
                        {copiedKey === 'hash' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="metadata-field">
                  <span className="field-label">Storage Backend</span>
                  <span className="field-value font-mono">
                    <HardDrive size={13} className="inline mr-1" />
                    {uploadedDocument.storage_type || 'memory'} (in-memory dev buffer)
                  </span>
                </div>

                <div className="metadata-field">
                  <span className="field-label">Status</span>
                  <span className="field-value font-semibold text-emerald-700">
                    {uploadedDocument.status?.toUpperCase() || 'UPLOADED'}
                  </span>
                </div>

                <div className="metadata-field">
                  <span className="field-label">Processing Status</span>
                  <span className="field-value font-semibold text-amber-700">
                    {uploadedDocument.processing_status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowMetadataModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
