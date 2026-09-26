/**
 * FINCLOSURE Document Intelligence Page
 * Route: /documents/:documentId
 * Displays end-to-end processing timeline, classification, financial entities, evidence, and actions.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Layers,
  FileCode,
  Info,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import AppSidebar from '../../components/layout/AppSidebar';
import AppTopbar from '../../components/layout/AppTopbar';
import DocumentHeader from '../../components/documents/DocumentHeader';
import ProcessingTimeline from '../../components/documents/ProcessingTimeline';
import DocumentClassification from '../../components/documents/DocumentClassification';
import ExtractedFinancialInfo from '../../components/documents/ExtractedFinancialInfo';
import EvidenceList from '../../components/documents/EvidenceList';
import DocumentPreview from '../../components/documents/DocumentPreview';
import DocumentDetails from '../../components/documents/DocumentDetails';
import ProcessingInformation from '../../components/documents/ProcessingInformation';
import DocumentActions from '../../components/documents/DocumentActions';
import HeaderDocumentGraphic from '../../components/documents/HeaderDocumentGraphic';
import {
  getDocumentMetadata,
  getDocumentProcessing,
  getDocumentResult,
  processDocument,
} from '../../services/api/documents';
import '../../styles/documents.css';

export default function DocumentIntelligencePage() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('extracted'); // 'extracted' | 'preview' | 'raw_text' | 'processing'

  const [documentData, setDocumentData] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [resultData, setResultData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [announcedMessage, setAnnouncedMessage] = useState('');

  const pollTimerRef = useRef(null);
  const lastAnnouncedStatusRef = useRef('');

  /**
   * Stop any active polling interval safely.
   */
  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  /**
   * Fetch complete structured intelligence outcome when completed.
   */
  const fetchFinalResult = useCallback(async (docId) => {
    try {
      const result = await getDocumentResult(docId);
      setResultData(result);
    } catch (err) {
      // In-memory recovery or delayed result handling
      console.warn('Could not fetch final processing result:', err);
    }
  }, []);

  /**
   * Poll processing progress and update state.
   */
  const pollStatus = useCallback(
    async (docId) => {
      try {
        const statusRes = await getDocumentProcessing(docId);
        setProcessingStatus(statusRes);

        // Announce status change to screen readers only when status changes
        if (statusRes.status !== lastAnnouncedStatusRef.current) {
          lastAnnouncedStatusRef.current = statusRes.status;
          setAnnouncedMessage(`Document processing is now ${statusRes.status}.`);
        }

        if (statusRes.status === 'completed') {
          stopPolling();
          await fetchFinalResult(docId);
        } else if (statusRes.status === 'failed') {
          stopPolling();
          setGeneralError(
            statusRes.error ||
              "We couldn't finish analyzing this document. Please retry processing."
          );
        }
      } catch (err) {
        if (err.status === 404) {
          stopPolling();
          setGeneralError(
            'Document record was not found in server memory. This can occur if the server was restarted.'
          );
        }
      }
    },
    [fetchFinalResult, stopPolling]
  );

  /**
   * Initial page load: load metadata and kick off status polling.
   */
  useEffect(() => {
    if (!documentId) {
      navigate('/documents');
      return;
    }

    let isMounted = true;

    async function initializePage() {
      setIsLoading(true);
      setGeneralError('');

      try {
        // 1. Fetch document metadata
        try {
          const meta = await getDocumentMetadata(documentId);
          if (isMounted) setDocumentData(meta);
        } catch (metaErr) {
          console.warn('Metadata not directly available:', metaErr);
        }

        // 2. Query processing status
        const statusRes = await getDocumentProcessing(documentId);
        if (!isMounted) return;
        setProcessingStatus(statusRes);

        if (statusRes.status === 'completed') {
          await fetchFinalResult(documentId);
        } else if (statusRes.status === 'failed') {
          setGeneralError(
            statusRes.error ||
              "We couldn't finish analyzing this document. Please retry processing."
          );
        } else {
          // Status is pending, extracting, or analyzing -> start polling
          stopPolling();
          pollTimerRef.current = setInterval(() => {
            pollStatus(documentId);
          }, 1500);
        }
      } catch (err) {
        if (isMounted) {
          setGeneralError(
            err.status === 404
              ? 'Document session expired or not found in server memory.'
              : 'Failed to load document information.'
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initializePage();

    return () => {
      isMounted = false;
      stopPolling();
    };
  }, [documentId, navigate, pollStatus, fetchFinalResult, stopPolling]);

  /**
   * Manual Reprocess Trigger
   */
  const handleReprocess = async () => {
    if (!documentId || isReprocessing) return;

    setIsReprocessing(true);
    setGeneralError('');
    setResultData(null);

    try {
      const response = await processDocument(documentId, true);
      setProcessingStatus(response);

      // Restart polling
      stopPolling();
      pollTimerRef.current = setInterval(() => {
        pollStatus(documentId);
      }, 1500);
    } catch (err) {
      setGeneralError('Failed to trigger re-processing. Please try again.');
    } finally {
      setIsReprocessing(false);
    }
  };

  const status = processingStatus?.status || 'pending';
  const progressPercent = processingStatus?.progress || 0;
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  const isProcessing = ['pending', 'extracting', 'analyzing'].includes(status);

  return (
    <div className="app-layout">
      {/* Screen Reader Announcement Live Region */}
      <div className="visually-hidden" role="status" aria-live="polite">
        {announcedMessage}
      </div>

      {/* App Sidebar */}
      <AppSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Wrapper */}
      <div className="app-main-wrapper">
        <AppTopbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="documents-main-content">
          {/* Main Top Header Section */}
          <section className="documents-header-row" aria-labelledby="intel-page-heading">
            <div className="documents-header-left">
              <div className="section-eyebrow mb-2">DOCUMENTS</div>
              <h1 id="intel-page-heading" className="documents-page-title">
                Bring Your Financial Evidence Together
              </h1>
              <p className="documents-page-description">
                Upload statements, policies, tax documents and other financial records to begin building your financial estate.
              </p>
            </div>

            <div className="documents-header-right">
              <HeaderDocumentGraphic />
            </div>
          </section>

          {/* Loading Skeleton View */}
          {isLoading ? (
            <div className="intel-loading-skeleton" aria-label="Loading document intelligence">
              <div className="skeleton-bar header-skeleton" />
              <div className="skeleton-bar timeline-skeleton" />
              <div className="skeleton-grid">
                <div className="skeleton-bar col-main-skeleton" />
                <div className="skeleton-bar col-side-skeleton" />
              </div>
            </div>
          ) : (
            <div className="intelligence-page-body">
              {/* Document Header Card */}
              <DocumentHeader
                documentId={documentId}
                documentData={documentData}
                resultData={resultData}
                processingStatus={processingStatus}
              />

              {/* Multi-Stage Processing Timeline */}
              <ProcessingTimeline
                status={status}
                progress={progressPercent}
                uploadedAt={documentData?.uploaded_at}
                processedAt={resultData?.processed_at}
              />

              {/* Failure Alert Banner if failed */}
              {isFailed && (
                <div className="processing-failed-banner" role="alert">
                  <div className="failed-banner-content">
                    <AlertTriangle size={24} className="failed-icon" aria-hidden="true" />
                    <div className="failed-text-wrap">
                      <h4 className="failed-title">Processing Failed</h4>
                      <p className="failed-desc">
                        {generalError ||
                          "We couldn't finish analyzing this document. Please retry processing. If the issue continues, check that the document is readable and contains financial information."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-retry-process"
                    onClick={handleReprocess}
                    disabled={isReprocessing}
                  >
                    <RotateCw size={16} className={isReprocessing ? 'animate-spin' : ''} aria-hidden="true" />
                    <span>Retry Processing</span>
                  </button>
                </div>
              )}

              {/* In-Flight Processing Notice Card (when Extracting or Analyzing) */}
              {isProcessing && !isFailed && (
                <div className="processing-active-banner" role="status">
                  <div className="active-banner-left">
                    <Sparkles size={22} className="text-emerald-700 animate-pulse" aria-hidden="true" />
                    <div>
                      <h4 className="active-banner-title">
                        {status === 'extracting'
                          ? 'Extracting Document Text & Layout...'
                          : status === 'analyzing'
                          ? 'Analyzing Financial Information with AI...'
                          : 'Preparing Document Pipeline...'}
                      </h4>
                      <p className="active-banner-sub">
                        FINCLOSURE is inspecting document structure, identifying institutions, account references, and financial relations.
                      </p>
                    </div>
                  </div>

                  <div className="active-banner-progress-wrap">
                    <div className="active-progress-track">
                      <div
                        className="active-progress-bar"
                        style={{ width: `${progressPercent}%` }}
                        role="progressbar"
                        aria-valuenow={progressPercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <span className="active-progress-text">{progressPercent}%</span>
                  </div>
                </div>
              )}

              {/* Tab Navigation Controls */}
              <nav className="intel-tabs-navbar" aria-label="Document views tabs">
                <button
                  type="button"
                  className={`intel-tab-btn ${activeTab === 'extracted' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('extracted')}
                  role="tab"
                  aria-selected={activeTab === 'extracted'}
                  id="tab-btn-extracted"
                  aria-controls="tab-pane-extracted"
                >
                  <Layers size={16} aria-hidden="true" />
                  <span>Extracted Information</span>
                </button>

                <button
                  type="button"
                  className={`intel-tab-btn ${activeTab === 'preview' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('preview')}
                  role="tab"
                  aria-selected={activeTab === 'preview'}
                  id="tab-btn-preview"
                  aria-controls="tab-pane-preview"
                >
                  <FileText size={16} aria-hidden="true" />
                  <span>Document Preview</span>
                </button>

                <button
                  type="button"
                  className={`intel-tab-btn ${activeTab === 'raw_text' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('raw_text')}
                  role="tab"
                  aria-selected={activeTab === 'raw_text'}
                  id="tab-btn-raw"
                  aria-controls="tab-pane-raw"
                >
                  <FileCode size={16} aria-hidden="true" />
                  <span>Raw Text</span>
                </button>

                <button
                  type="button"
                  className={`intel-tab-btn ${activeTab === 'processing' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('processing')}
                  role="tab"
                  aria-selected={activeTab === 'processing'}
                  id="tab-btn-proc"
                  aria-controls="tab-pane-proc"
                >
                  <Info size={16} aria-hidden="true" />
                  <span>Processing Details</span>
                </button>
              </nav>

              {/* Tab Content Panes */}

              {/* 1. EXTRACTED INFORMATION (Default Main Tab) */}
              {activeTab === 'extracted' && (
                <div
                  id="tab-pane-extracted"
                  role="tabpanel"
                  aria-labelledby="tab-btn-extracted"
                  className="tab-pane-active"
                >
                  <div className="intel-main-grid">
                    {/* Left Intelligence Column */}
                    <div className="intel-left-col">
                      {/* Document Classification */}
                      <DocumentClassification
                        documentType={resultData?.document_type || processingStatus?.document_type || 'unknown'}
                        confidence={resultData?.overall_confidence || 0.0}
                        entities={resultData?.entities || []}
                        warnings={resultData?.warnings || []}
                      />

                      {/* Extracted Financial Information + Insights */}
                      <ExtractedFinancialInfo
                        entities={resultData?.entities || []}
                        evidence={resultData?.evidence || []}
                        warnings={resultData?.warnings || []}
                        overallConfidence={resultData?.overall_confidence || 0.0}
                      />

                      {/* Bottom Technical Grid: Document Details & Processing Information */}
                      <div className="intel-bottom-cards-grid">
                        <DocumentDetails
                          documentData={documentData}
                          resultData={resultData}
                        />

                        <ProcessingInformation
                          resultData={resultData}
                          processingStatus={processingStatus}
                        />
                      </div>
                    </div>

                    {/* Right Supplementary Column: Preview Mockup, Evidence List, Actions */}
                    <div className="intel-right-col">
                      {/* Document Preview Card */}
                      <DocumentPreview
                        documentData={documentData}
                        resultData={resultData}
                        totalPages={resultData?.extracted_text_page_count || 1}
                      />

                      {/* Evidence Found Card */}
                      <EvidenceList evidence={resultData?.evidence || []} />

                      {/* Actions Card */}
                      <DocumentActions
                        documentId={documentId}
                        documentData={documentData}
                        resultData={resultData}
                        isReprocessing={isReprocessing}
                        onReprocess={handleReprocess}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. DOCUMENT PREVIEW TAB */}
              {activeTab === 'preview' && (
                <div
                  id="tab-pane-preview"
                  role="tabpanel"
                  aria-labelledby="tab-btn-preview"
                  className="tab-pane-single-focus"
                >
                  <div className="preview-focus-wrapper">
                    <DocumentPreview
                      documentData={documentData}
                      resultData={resultData}
                      totalPages={resultData?.extracted_text_page_count || 1}
                    />
                  </div>
                </div>
              )}

              {/* 3. RAW TEXT TAB */}
              {activeTab === 'raw_text' && (
                <div
                  id="tab-pane-raw"
                  role="tabpanel"
                  aria-labelledby="tab-btn-raw"
                  className="tab-pane-single-focus"
                >
                  <div className="raw-text-notice-card">
                    <FileCode size={32} className="text-slate-500 mb-3" aria-hidden="true" />
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Raw Text Extraction Stream</h4>
                    <p className="text-slate-600 max-w-lg mb-4 leading-relaxed">
                      Raw text is available internally during processing and is not exposed in this view yet.
                    </p>
                    <div className="raw-text-badge">
                      <span>Analyzed Pages: {resultData?.extracted_text_page_count || 1}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PROCESSING DETAILS TAB */}
              {activeTab === 'processing' && (
                <div
                  id="tab-pane-proc"
                  role="tabpanel"
                  aria-labelledby="tab-btn-proc"
                  className="tab-pane-single-focus"
                >
                  <div className="processing-details-grid">
                    <DocumentDetails
                      documentData={documentData}
                      resultData={resultData}
                    />

                    <ProcessingInformation
                      resultData={resultData}
                      processingStatus={processingStatus}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
