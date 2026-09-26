import React, { useRef, useState } from 'react';
import { Plus, FileText, AlertCircle } from 'lucide-react';
import { MAX_DOCUMENT_SIZE_MB, SUPPORTED_EXTENSIONS } from '../../constants/documents';

/**
 * MultiDocumentUpload Component
 * Allows selecting/dropping multiple financial documents.
 */
export default function MultiDocumentUpload({ onFilesSelected, isUploading }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateAndProcessFiles = (fileList) => {
    setValidationError('');
    const files = Array.from(fileList);
    if (!files.length) return;

    const validFiles = [];
    const maxBytes = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        setValidationError(`"${file.name}" has an unsupported format. Supported: PDF, JPG, JPEG, PNG.`);
        return;
      }
      if (file.size > maxBytes) {
        setValidationError(`"${file.name}" exceeds the ${MAX_DOCUMENT_SIZE_MB}MB size limit.`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFiles(e.target.files);
      // Reset input value so same files can be re-selected if removed
      e.target.value = '';
    }
  };

  return (
    <div
      className={`multi-upload-dropzone ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload multiple financial documents"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="hidden-file-input"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      <div className="multi-upload-content">
        <div className="multi-upload-icon-wrap" aria-hidden="true">
          <FileText size={26} className="text-emerald-700" />
        </div>

        <div className="multi-upload-text-wrap">
          <h3 className="multi-upload-title">Upload Multiple Documents</h3>
          <p className="multi-upload-subtitle">
            Drag and drop files here, or click to browse
          </p>
          <span className="multi-upload-hint">
            Supports PDF, JPG, PNG (Max {MAX_DOCUMENT_SIZE_MB} MB each)
          </span>
        </div>

        <button
          type="button"
          className="btn btn-choose-files"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={isUploading}
        >
          <Plus size={16} />
          <span>Choose Files</span>
        </button>
      </div>

      {validationError && (
        <div className="multi-upload-error" role="alert" onClick={(e) => e.stopPropagation()}>
          <AlertCircle size={15} />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
