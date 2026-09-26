/**
 * Document Intake Drag-and-Drop Upload Component
 */

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileImage,
  FileSpreadsheet,
  X,
  Upload,
  RefreshCw,
} from 'lucide-react';
import {
  MAX_DOCUMENT_SIZE_MB,
  MAX_DOCUMENT_SIZE_BYTES,
  SUPPORTED_EXTENSIONS,
  SUPPORTED_MIME_TYPES,
} from '../../constants/documents';

export default function DocumentUpload({
  selectedFile,
  onFileSelected,
  onFileRemoved,
  onUpload,
  isUploading,
  uploadProgress,
  uploadSuccess,
  uploadError,
  onResetSuccess,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const fileInputRef = useRef(null);

  const displayError = uploadError || localError;

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (filename = '') => {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.pdf')) {
      return <FileText size={32} className="text-red-500" />;
    }
    if (lower.endsWith('.png')) {
      return <FileImage size={32} className="text-blue-500" />;
    }
    return <FileSpreadsheet size={32} className="text-emerald-600" />;
  };

  /**
   * Validate a candidate file against size, MIME, and extension rules.
   */
  const validateFile = (file) => {
    setLocalError('');
    if (onResetSuccess) onResetSuccess();

    if (!file) {
      return false;
    }

    if (file.size === 0) {
      setLocalError('The selected file is empty (0 bytes). Please upload a valid document.');
      return false;
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      setLocalError(`File size exceeds the ${MAX_DOCUMENT_SIZE_MB} MB limit. Please select a smaller file.`);
      return false;
    }

    const filename = file.name.toLowerCase();
    const hasValidExt = SUPPORTED_EXTENSIONS.some((ext) => filename.endsWith(ext));

    if (!hasValidExt) {
      setLocalError(
        `This file type isn't supported. Allowed formats are ${SUPPORTED_EXTENSIONS.map((e) => e.replace('.', '').toUpperCase()).join(', ')}.`
      );
      return false;
    }

    // Optional MIME validation if provided by browser
    if (file.type && !SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase())) {
      const isKnownImageOrPdf =
        file.type.startsWith('image/') || file.type === 'application/pdf' || file.type === 'application/x-pdf';
      if (!isKnownImageOrPdf) {
        setLocalError('Invalid MIME type detected. Please upload a standard PDF, JPG, or PNG document.');
        return false;
      }
    }

    return true;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading && !isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploading) return;

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        onFileSelected(droppedFile);
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const chosenFile = e.target.files[0];
      if (validateFile(chosenFile)) {
        onFileSelected(chosenFile);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFilePicker = () => {
    if (isUploading) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFilePicker();
    }
  };

  return (
    <div className="document-upload-wrapper">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id="document-file-input"
        className="visually-hidden"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        onChange={handleFileInputChange}
        aria-label="Upload a financial document"
        disabled={isUploading}
      />

      {/* Main Dropzone Surface */}
      <div
        className={`document-dropzone ${isDragging ? 'dropzone-dragging' : ''} ${
          isUploading ? 'dropzone-uploading' : ''
        } ${uploadSuccess ? 'dropzone-success' : ''} ${
          selectedFile && !isUploading && !uploadSuccess ? 'dropzone-selected' : ''
        } ${displayError ? 'dropzone-has-error' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!selectedFile && !isUploading && !uploadSuccess ? triggerFilePicker : undefined}
        onKeyDown={!selectedFile && !isUploading && !uploadSuccess ? handleKeyDown : undefined}
        tabIndex={!selectedFile && !isUploading && !uploadSuccess ? 0 : -1}
        role="region"
        aria-label="Financial document intake zone"
      >
        {/* Watermark illustration background */}
        <div className="dropzone-watermark" aria-hidden="true" />

        {/* State 1: Uploading State */}
        {isUploading && (
          <div className="dropzone-state-content" aria-live="polite">
            <div className="upload-progress-ring-container">
              <svg className="progress-ring-svg" width="64" height="64" viewBox="0 0 64 64">
                <circle
                  className="progress-ring-circle-bg"
                  stroke="#D1E7DD"
                  strokeWidth="5"
                  fill="transparent"
                  r="26"
                  cx="32"
                  cy="32"
                />
                <circle
                  className="progress-ring-circle-bar"
                  stroke="#1E6B47"
                  strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - (uploadProgress || 65) / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                  r="26"
                  cx="32"
                  cy="32"
                />
              </svg>
              <span className="progress-ring-text">{uploadProgress > 0 ? `${uploadProgress}%` : '65%'}</span>
            </div>
            <h3 className="dropzone-state-title">Uploading document...</h3>
            <p className="dropzone-state-subtitle">Please don't close this page</p>
          </div>
        )}

        {/* State 2: Upload Success State */}
        {!isUploading && uploadSuccess && (
          <div className="dropzone-state-content dropzone-success-content" aria-live="polite">
            <div className="dropzone-icon-circle success-circle">
              <CheckCircle2 size={36} className="text-emerald-700" />
            </div>
            <h3 className="dropzone-state-title success-title">Document uploaded successfully!</h3>
            <p className="dropzone-state-subtitle">
              Your document is ready. Metadata has been indexed in server memory.
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-3"
              onClick={(e) => {
                e.stopPropagation();
                if (onResetSuccess) onResetSuccess();
                triggerFilePicker();
              }}
            >
              <RefreshCw size={15} className="mr-1" />
              Upload Another Document
            </button>
          </div>
        )}

        {/* State 3: Dragging Over State */}
        {!isUploading && !uploadSuccess && isDragging && (
          <div className="dropzone-state-content dropzone-dragging-content">
            <div className="dropzone-icon-circle dragging-circle animate-bounce-subtle">
              <FileText size={38} className="text-emerald-700" />
            </div>
            <h3 className="dropzone-state-title">Drop the file here</h3>
            <p className="dropzone-state-subtitle">Release your mouse to stage this document</p>
          </div>
        )}

        {/* State 4: File Selected (Ready to Upload) State */}
        {!isUploading && !uploadSuccess && !isDragging && selectedFile && (
          <div className="dropzone-state-content dropzone-selected-content" aria-live="polite">
            <div className="selected-dropzone-card">
              <div className="selected-dropzone-icon-box" aria-hidden="true">
                {getFileIcon(selectedFile.name)}
              </div>
              <div className="selected-dropzone-info">
                <h4 className="selected-dropzone-filename" title={selectedFile.name}>
                  {selectedFile.name}
                </h4>
                <p className="selected-dropzone-meta">
                  <span>{selectedFile.type || 'Document'}</span>
                  <span className="meta-dot">•</span>
                  <span>{formatFileSize(selectedFile.size)}</span>
                </p>
              </div>
              <button
                type="button"
                className="selected-dropzone-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemoved();
                }}
                aria-label="Remove selected file"
                title="Remove selected file"
              >
                <X size={18} />
              </button>
            </div>

            <div className="selected-dropzone-actions">
              <button
                type="button"
                className="btn btn-primary dropzone-upload-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onUpload) onUpload();
                }}
                aria-label="Upload selected document"
              >
                <Upload size={16} className="mr-1" />
                Upload Document
              </button>
              <button
                type="button"
                className="btn btn-secondary dropzone-change-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFilePicker();
                }}
                aria-label="Choose a different file"
              >
                Choose Different File
              </button>
            </div>

            <p className="selected-dropzone-hint">
              Ready to send. Click "Upload Document" to process with your selected estate.
            </p>
          </div>
        )}

        {/* State 5: Default (Idle) State */}
        {!isUploading && !uploadSuccess && !isDragging && !selectedFile && (
          <div className="dropzone-state-content">
            <div className="dropzone-icon-circle">
              <UploadCloud size={40} className="dropzone-cloud-icon" />
            </div>

            <h3 className="dropzone-state-title">Upload a financial document</h3>
            <p className="dropzone-state-subtitle">
              Drag and drop your file here, or browse from your device.
            </p>

            <button
              type="button"
              className="btn btn-primary dropzone-choose-btn"
              onClick={(e) => {
                e.stopPropagation();
                triggerFilePicker();
              }}
              aria-label="Choose file to upload"
            >
              <FileText size={16} className="mr-1" />
              Choose File
            </button>

            <div className="dropzone-specifications">
              <span className="spec-formats">Supported formats: PDF, JPG, JPEG, PNG</span>
              <span className="spec-size">Maximum file size: {MAX_DOCUMENT_SIZE_MB} MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Accessible Inline Error Banner */}
      {displayError && (
        <div className="upload-error-alert" role="alert" aria-live="assertive">
          <AlertCircle size={18} className="error-alert-icon" />
          <div className="error-alert-content">
            <strong>Upload Error:</strong> {displayError}
          </div>
          <button
            type="button"
            className="error-alert-dismiss"
            onClick={() => setLocalError('')}
            aria-label="Dismiss error message"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
