import React from 'react';
import { FileText, FileImage, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * UploadQueue Component
 * Renders the queue of selected/in-flight documents with individual progress & status.
 */
export default function UploadQueue({
  queue,
  currentProcessingIndex,
  onRemoveItem,
  onClearAll,
  isProcessing,
}) {
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (filename = '') => {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.pdf')) {
      return (
        <div className="queue-file-icon-box pdf-icon-box" aria-hidden="true">
          <FileText size={18} className="text-red-600" />
        </div>
      );
    }
    if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      return (
        <div className="queue-file-icon-box img-icon-box" aria-hidden="true">
          <FileImage size={18} className="text-blue-600" />
        </div>
      );
    }
    return (
      <div className="queue-file-icon-box doc-icon-box" aria-hidden="true">
        <FileSpreadsheet size={18} className="text-emerald-700" />
      </div>
    );
  };

  const getStatusLabel = (item, isCurrent) => {
    if (item.status === 'completed') return 'Completed';
    if (item.status === 'failed') return 'Failed';
    if (item.status === 'extracting') return 'Extracting Text';
    if (item.status === 'analyzing') return 'Analyzing with AI';
    if (item.status === 'recurring') return 'Detecting Patterns';
    if (item.status === 'saving') return 'Saving Results';
    if (item.status === 'uploading' || isCurrent) return 'Processing...';
    return 'Queued';
  };

  return (
    <div className="upload-queue-card" aria-label="Document upload queue">
      <div className="upload-queue-header">
        <div className="upload-queue-title-wrap">
          <h3 className="upload-queue-title">
            Upload Queue <span className="queue-count">({queue.length} files)</span>
          </h3>
        </div>
        {queue.length > 0 && (
          <button
            type="button"
            className="btn-clear-queue"
            onClick={onClearAll}
            disabled={isProcessing}
            title={isProcessing ? 'Cannot clear queue while processing' : 'Clear all queued files'}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="upload-queue-list">
        {queue.length === 0 ? (
          <div className="queue-empty-state">
            <p>No documents queued. Add files to begin batch analysis.</p>
          </div>
        ) : (
          queue.map((item, idx) => {
            const isCurrent = isProcessing && idx === currentProcessingIndex;
            const progress = item.progress || 0;
            const statusLabel = getStatusLabel(item, isCurrent);
            const isFinished = item.status === 'completed';
            const hasFailed = item.status === 'failed';

            return (
              <div
                key={item.id || item.name + idx}
                className={`queue-item-row ${isCurrent ? 'row-processing' : ''} ${isFinished ? 'row-completed' : ''} ${hasFailed ? 'row-failed' : ''}`}
              >
                {/* File Icon */}
                {getFileIcon(item.name)}

                {/* File Meta */}
                <div className="queue-item-meta">
                  <span className="queue-item-name" title={item.name}>
                    {item.name}
                  </span>
                  <span className="queue-item-size">{formatFileSize(item.size)}</span>
                </div>

                {/* Progress Bar & Status Text */}
                <div className="queue-item-progress-col">
                  <div className="queue-progress-track">
                    <div
                      className={`queue-progress-bar ${isFinished ? 'bar-success' : hasFailed ? 'bar-danger' : 'bar-active'}`}
                      style={{ width: `${hasFailed ? 100 : Math.max(progress, isFinished ? 100 : 0)}%` }}
                    />
                  </div>
                  <div className="queue-item-status-text">
                    <span className={`status-tag ${hasFailed ? 'text-red-600' : isFinished ? 'text-emerald-700' : ''}`}>
                      {statusLabel}
                    </span>
                    <span className="queue-percent">{hasFailed ? 'Error' : `${progress}%`}</span>
                  </div>
                </div>

                {/* Remove Action Button */}
                <div className="queue-item-action">
                  <button
                    type="button"
                    className="btn-remove-queue-item"
                    onClick={() => onRemoveItem(idx)}
                    disabled={isCurrent}
                    aria-label={`Remove ${item.name}`}
                    title={isCurrent ? 'Processing in progress' : 'Remove document'}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
