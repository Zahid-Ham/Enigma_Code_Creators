/**
 * Document Intelligence Header Component
 * Displays back navigation, file identity, technical metadata, and current processing status badge.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  FileImage,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function DocumentHeader({
  documentId,
  documentData,
  resultData,
  processingStatus,
}) {
  const filename =
    documentData?.original_filename ||
    documentData?.sanitized_filename ||
    `document_${documentId?.slice(0, 8) || 'unknown'}.pdf`;

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatUploadDate = (isoString) => {
    if (!isoString) return 'Recently';
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
      return 'Recently';
    }
  };

  const getFileExtensionLabel = (name = '', mime = '') => {
    if (name.toLowerCase().endsWith('.pdf') || mime.includes('pdf')) return 'PDF';
    if (name.toLowerCase().endsWith('.png') || mime.includes('png')) return 'PNG';
    if (name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg') || mime.includes('jpeg'))
      return 'JPEG';
    return 'Document';
  };

  const getFileIcon = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      return <FileImage size={24} className="doc-type-icon text-blue-600" aria-hidden="true" />;
    }
    if (lower.endsWith('.csv') || lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      return <FileSpreadsheet size={24} className="doc-type-icon text-emerald-600" aria-hidden="true" />;
    }
    return <FileText size={24} className="doc-type-icon text-red-500" aria-hidden="true" />;
  };

  const status = processingStatus?.status || documentData?.processing_status || 'pending';

  const renderStatusBadge = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="doc-status-badge badge-completed" role="status">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>Processing Completed</span>
          </span>
        );
      case 'extracting':
        return (
          <span className="doc-status-badge badge-processing" role="status">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            <span>Extracting Text...</span>
          </span>
        );
      case 'analyzing':
        return (
          <span className="doc-status-badge badge-analyzing" role="status">
            <Sparkles size={16} className="animate-pulse" aria-hidden="true" />
            <span>Analyzing with AI...</span>
          </span>
        );
      case 'failed':
        return (
          <span className="doc-status-badge badge-failed" role="status">
            <AlertTriangle size={16} aria-hidden="true" />
            <span>Processing Failed</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="doc-status-badge badge-pending-state" role="status">
            <Clock size={16} aria-hidden="true" />
            <span>Preparing Document...</span>
          </span>
        );
    }
  };

  return (
    <header className="document-intel-header" aria-label="Document Header">
      <div className="back-nav-row">
        <Link to="/documents" className="back-to-documents-link" aria-label="Back to Documents upload page">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Documents</span>
        </Link>
      </div>

      <div className="document-identity-card">
        <div className="doc-identity-left">
          <div className="doc-icon-wrapper" aria-hidden="true">
            {getFileIcon(filename)}
          </div>
          <div className="doc-identity-meta">
            <h2 className="doc-identity-filename" title={filename}>
              {filename}
            </h2>
            <p className="doc-identity-subtext">
              <span>{getFileExtensionLabel(filename, documentData?.mime_type)}</span>
              <span className="meta-separator">•</span>
              <span>{formatFileSize(documentData?.file_size_bytes)}</span>
              <span className="meta-separator">•</span>
              <span>
                Uploaded {formatUploadDate(documentData?.uploaded_at || resultData?.processed_at)}
              </span>
            </p>
          </div>
        </div>

        <div className="doc-identity-right">
          {renderStatusBadge()}
        </div>
      </div>
    </header>
  );
}
