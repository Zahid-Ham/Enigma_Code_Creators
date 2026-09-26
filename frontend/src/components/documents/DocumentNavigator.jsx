import React from 'react';
import {
  FileText,
  Landmark,
  Shield,
  Home,
  TrendingUp,
  Plus,
  ChevronRight,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
  Leaf,
} from 'lucide-react';

/**
 * Helper to select appropriate icon for document type
 */
function getDocumentIcon(docType = '', filename = '') {
  const lowerName = (filename || '').toLowerCase();
  const lowerType = (docType || '').toLowerCase();

  if (lowerType.includes('bank') || lowerName.includes('bank')) {
    return {
      icon: <Landmark size={18} className="text-purple-600" />,
      bg: '#F3E8FF',
      badgeClass: 'badge-bank',
    };
  }
  if (lowerType.includes('insurance') || lowerType.includes('policy') || lowerName.includes('policy') || lowerName.includes('insurance')) {
    return {
      icon: <Shield size={18} className="text-emerald-700" />,
      bg: '#DCFCE7',
      badgeClass: 'badge-insurance',
    };
  }
  if (lowerType.includes('loan') || lowerName.includes('loan')) {
    return {
      icon: <Home size={18} className="text-blue-600" />,
      bg: '#DBEAFE',
      badgeClass: 'badge-loan',
    };
  }
  if (lowerType.includes('invest') || lowerType.includes('fund') || lowerName.includes('mutual')) {
    return {
      icon: <TrendingUp size={18} className="text-emerald-700" />,
      bg: '#DCFCE7',
      badgeClass: 'badge-investment',
    };
  }

  // Default PDF or file
  return {
    icon: <FileText size={18} className="text-red-600" />,
    bg: '#FEE2E2',
    badgeClass: 'badge-default',
  };
}

/**
 * Format bytes into KB / MB
 */
function formatSize(bytes) {
  if (!bytes) return '1.2 MB';
  if (typeof bytes === 'string') return bytes;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * DocumentNavigator Component (Left Column)
 * Persistent document navigator listing all estate & uploaded documents.
 */
export default function DocumentNavigator({
  documents = [],
  selectedDocumentId,
  onSelectDocument,
  onUploadMoreClick,
}) {
  return (
    <aside className="doc-nav-container" aria-label="Uploaded Documents Navigator">
      {/* Header */}
      <div className="doc-nav-header">
        <h2 className="doc-nav-title">
          Uploaded Documents <span className="doc-nav-count">({documents.length})</span>
        </h2>
        <button
          type="button"
          className="btn-upload-more"
          onClick={onUploadMoreClick}
          aria-label="Upload more documents"
        >
          <Plus size={14} />
          <span>Upload More</span>
        </button>
      </div>

      {/* Document List */}
      <div className="doc-nav-list" role="list">
        {documents.length === 0 ? (
          <div className="doc-nav-empty-state">
            <div className="doc-nav-empty-icon">
              <FileText size={24} className="text-gray-400" />
            </div>
            <p className="doc-nav-empty-title">No documents yet</p>
            <p className="doc-nav-empty-sub">Upload statements or policies above to begin analysis.</p>
          </div>
        ) : (
          documents.map((doc) => {
            const isSelected = (doc.id || doc.document_id) === selectedDocumentId;
            const { icon, bg } = getDocumentIcon(doc.type || doc.document_type, doc.name || doc.filename);
            const isProcessing = doc.status === 'uploading' || doc.status === 'extracting' || doc.status === 'analyzing' || doc.status === 'saving' || doc.status === 'processing';
            const isCompleted = doc.status === 'completed' || doc.status === 'Processed';
            const isQueued = doc.status === 'queued';

            return (
              <div
                key={doc.id || doc.document_id || doc.name}
                role="listitem"
                tabIndex={0}
                className={`doc-nav-item ${isSelected ? 'doc-nav-item-active' : ''}`}
                onClick={() => onSelectDocument(doc)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDocument(doc);
                  }
                }}
                aria-selected={isSelected}
              >
                {/* Type Icon */}
                <div className="doc-nav-icon-box" style={{ backgroundColor: bg }} aria-hidden="true">
                  {icon}
                </div>

                {/* Meta */}
                <div className="doc-nav-meta">
                  <span className="doc-nav-filename" title={doc.name || doc.filename}>
                    {doc.name || doc.filename}
                  </span>
                  <span className="doc-nav-sub">
                    {doc.typeLabel || doc.document_type || 'Bank Statement'} • {formatSize(doc.size || doc.file_size_bytes)}
                  </span>
                  <span className="doc-nav-date">
                    {doc.timestamp || '26 Sept 2026, 02:52 PM'}
                  </span>
                </div>

                {/* Status Pill & Arrow */}
                <div className="doc-nav-right-meta">
                  {isProcessing ? (
                    <span className="doc-status-badge badge-processing">
                      <Loader2 size={11} className="spin-icon" />
                      <span>Processing</span>
                    </span>
                  ) : isCompleted ? (
                    <span className="doc-status-badge badge-completed">
                      <CheckCircle2 size={11} />
                      <span>Processed</span>
                    </span>
                  ) : isQueued ? (
                    <span className="doc-status-badge badge-queued">
                      <Clock size={11} />
                      <span>Queued</span>
                    </span>
                  ) : (
                    <span className="doc-status-badge badge-error">Failed</span>
                  )}
                  <ChevronRight size={16} className="doc-nav-chevron" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Brand Value Promo Banner at Bottom Left */}
      <div className="doc-nav-footer-card">
        <div className="footer-leaf-icon">
          <Leaf size={20} className="text-emerald-700" />
        </div>
        <h4 className="footer-card-title">From documents to complete closure</h4>
        <p className="footer-card-text">
          Discover, verify and close your financial relationships with AI.
        </p>
      </div>
    </aside>
  );
}
