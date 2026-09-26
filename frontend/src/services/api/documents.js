/**
 * Documents API Service
 */

import { apiClient } from './apiClient';

/**
 * Upload a financial document to the backend.
 * @param {File} file - The file object from input or drop event.
 * @param {string} estateId - The estate identifier (e.g. 'demo-estate-001').
 * @param {Function} [onUploadProgress] - Optional progress callback.
 * @returns {Promise<Object>} The uploaded document metadata record.
 */
export async function uploadDocument(file, estateId = 'demo-estate-001', onUploadProgress = null) {
  const formData = new FormData();
  formData.append('estate_id', estateId);
  formData.append('file', file);

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  if (onUploadProgress && typeof onUploadProgress === 'function') {
    config.onUploadProgress = onUploadProgress;
  }

  const response = await apiClient.post('/documents/upload', formData, config);
  return response.data;
}

/**
 * Retrieve metadata for a previously uploaded document.
 * @param {string} documentId - The document UUID.
 * @returns {Promise<Object>} The document metadata record.
 */
export async function getDocumentMetadata(documentId) {
  const response = await apiClient.get(`/documents/${documentId}`);
  return response.data;
}

/**
 * Poll or get document processing status.
 * @param {string} documentId - The document UUID.
 * @returns {Promise<Object>} The processing status response (status, progress, message, document_type, error).
 */
export async function getDocumentProcessing(documentId) {
  const response = await apiClient.get(`/documents/${documentId}/processing`);
  return response.data;
}

/**
 * Retrieve the structured AI processing result for a completed document.
 * @param {string} documentId - The document UUID.
 * @returns {Promise<Object>} The structured analysis result.
 */
export async function getDocumentResult(documentId) {
  const response = await apiClient.get(`/documents/${documentId}/result`);
  return response.data;
}

/**
 * Trigger or retry document AI processing.
 * @param {string} documentId - The document UUID.
 * @param {boolean} [force=false] - Force re-processing even if already completed.
 * @returns {Promise<Object>} The processing status response.
 */
export async function processDocument(documentId, force = false) {
  const response = await apiClient.post(`/documents/${documentId}/process`, { force });
  return response.data;
}

