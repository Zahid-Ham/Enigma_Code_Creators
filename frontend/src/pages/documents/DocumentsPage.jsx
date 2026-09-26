/**
 * FINCLOSURE Document Intake & Recurring Transactions Page
 * Route: /documents
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppSidebar from '../../components/layout/AppSidebar';
import AppTopbar from '../../components/layout/AppTopbar';
import HeaderDocumentGraphic from '../../components/documents/HeaderDocumentGraphic';
import MultiDocumentUpload from '../../components/documents/MultiDocumentUpload';
import UploadQueue from '../../components/documents/UploadQueue';
import ProcessingStepper from '../../components/documents/ProcessingStepper';

// 3-Column Analysis Components
import DocumentNavigator from '../../components/documents/DocumentNavigator';
import DocumentAnalysisPanel from '../../components/documents/DocumentAnalysisPanel';
import CombinedAnalysis from '../../components/recurring/CombinedAnalysis';

// API Services & Initial Data
import {
  uploadDocument,
  getDocumentProcessing,
  getDocumentResult,
} from '../../services/api/documents';
import { getRecurringRelationships } from '../../services/api/discovery';
import { DEMO_ESTATE } from '../../constants/documents';
import { INITIAL_SAMPLE_DOCUMENTS } from '../../constants/sampleDocuments';

// Styles
import '../../styles/documents.css';
import '../../styles/recurring.css';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedEstate, setSelectedEstate] = useState(DEMO_ESTATE.id);

  // All estate & uploaded documents list
  const [documentsList, setDocumentsList] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  // Multi-Document Queue State
  const [queue, setQueue] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState('idle'); // 'uploading' | 'extracting' | 'analyzing' | 'recurring' | 'saving' | 'completed' | 'failed'
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  // Active Document Data for Extracted Panel
  const [activeResultData, setActiveResultData] = useState(null);
  const [activeProcessingStatus, setActiveProcessingStatus] = useState(null);

  // Recurrence Analysis State
  const [recurrenceData, setRecurrenceData] = useState(null);
  const [isLoadingRecurrence, setIsLoadingRecurrence] = useState(false);

  // Upload Time formatted
  const [lastUploadTime, setLastUploadTime] = useState('');

  // Hidden File Input Trigger Ref
  const uploadAreaRef = useRef(null);
  const isProcessingRef = useRef(false);

  /**
   * Fetch latest discovered recurring financial relationships
   */
  const refreshRecurrence = useCallback(async (estateId = selectedEstate) => {
    try {
      setIsLoadingRecurrence(true);
      const data = await getRecurringRelationships(estateId);
      if (data && data.relationships && data.relationships.length > 0) {
        setRecurrenceData(data);
      } else {
        setRecurrenceData(data || null);
      }
    } catch (err) {
      console.warn('Could not load recurring relationships from backend:', err);
    } finally {
      setIsLoadingRecurrence(false);
    }
  }, [selectedEstate]);

  // Initial Load: Fetch existing recurring relationships for the estate
  useEffect(() => {
    refreshRecurrence(selectedEstate);
  }, [selectedEstate, refreshRecurrence]);

  /**
   * Helper to determine document type and label from filename
   */
  const getDocTypeFromFilename = (filename) => {
    const f = (filename || '').toLowerCase();
    if (f.includes('insurance') || f.includes('policy') || f.includes('term')) {
      return { type: 'insurance_policy', typeLabel: 'Insurance Policy' };
    }
    if (f.includes('loan') || f.includes('mortgage') || f.includes('nhb') || f.includes('housing')) {
      return { type: 'loan_statement', typeLabel: 'Loan Statement' };
    }
    if (f.includes('mutual') || f.includes('sip') || f.includes('fund') || f.includes('investment') || f.includes('folio') || f.includes('growth') || f.includes('greenwood')) {
      return { type: 'investment_statement', typeLabel: 'Investment Statement' };
    }
    return { type: 'bank_statement', typeLabel: 'Bank Statement' };
  };

  /**
   * Helper to format human-friendly document type labels
   */
  const getDocTypeDisplayLabel = (rawType) => {
    const mapping = {
      bank_statement: 'Bank Statement',
      insurance_policy: 'Insurance Policy',
      insurance_correspondence: 'Insurance Policy',
      loan_statement: 'Loan Statement',
      investment_statement: 'Investment Statement',
      credit_card_statement: 'Credit Card Statement',
      tax_document: 'Tax Document',
      salary_document: 'Salary Document',
      utility_bill: 'Utility Bill',
      fixed_deposit: 'Fixed Deposit',
      other: 'Financial Document',
    };
    return mapping[rawType] || 'Financial Document';
  };

  /**
   * Handle files added from dropzone or file picker
   */
  const handleFilesSelected = (files) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastUploadTime(timeStr);

    const newItems = files.map((file, idx) => {
      const typeInfo = getDocTypeFromFilename(file.name);
      return {
        id: `doc-upload-${Date.now()}-${idx}`,
        file,
        name: file.name,
        filename: file.name,
        size: file.size,
        sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'queued',
        progress: 0,
        error: null,
        documentId: null,
        timestamp: `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${timeStr}`,
        type: typeInfo.type,
        typeLabel: typeInfo.typeLabel,
      };
    });

    setQueue((prev) => [...prev, ...newItems]);
    // Prepend/append to documentsList so navigator updates
    setDocumentsList((prev) => {
      const existingIds = new Set(prev.map((d) => d.id || d.name));
      const filteredNew = newItems.filter((it) => !existingIds.has(it.id) && !existingIds.has(it.name));
      return [...filteredNew, ...prev];
    });

    if (newItems.length > 0) {
      setSelectedDocumentId(newItems[0].id);
    }
    setIsAllCompleted(false);
  };

  /**
   * Remove individual item from queue
   */
  const handleRemoveQueueItem = (index) => {
    const itemToRemove = queue[index];
    setQueue((prev) => prev.filter((_, idx) => idx !== index));
    if (itemToRemove) {
      setDocumentsList((prev) => prev.filter((d) => d.id !== itemToRemove.id && d.name !== itemToRemove.name));
    }
  };

  /**
   * Clear all non-processing items from queue
   */
  const handleClearQueue = () => {
    if (isProcessingQueue) return;
    setQueue([]);
    setIsAllCompleted(false);
  };

  /**
   * Poll a single document until completion or failure
   */
  const pollDocumentUntilComplete = async (docId, onStageChange, onProgress) => {
    const maxPollAttempts = 35;
    const intervalMs = 1200;

    for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
      await new Promise((res) => setTimeout(res, intervalMs));
      try {
        const statusRes = await getDocumentProcessing(docId);
        setActiveProcessingStatus(statusRes);

        if (statusRes.status === 'extracting') {
          onStageChange('extracting');
          onProgress(35);
        } else if (statusRes.status === 'analyzing') {
          onStageChange('analyzing');
          onProgress(70);
        } else if (statusRes.status === 'completed') {
          onStageChange('recurring');
          onProgress(85);
          return { success: true, statusRes };
        } else if (statusRes.status === 'failed') {
          return { success: false, error: statusRes.error || 'Processing failed.' };
        }
      } catch (err) {
        console.warn(`Polling attempt ${attempt} error for ${docId}:`, err);
      }
    }
    return { success: false, error: 'Processing timed out after 40 seconds.' };
  };

  /**
   * Process a single queued item sequentially
   */
  const processSingleQueueItem = async (item, itemIndex) => {
    setCurrentStage('uploading');
    setQueue((prev) =>
      prev.map((it, idx) => (idx === itemIndex ? { ...it, status: 'uploading', progress: 15 } : it))
    );
    setDocumentsList((prev) =>
      prev.map((d) => (d.id === item.id || d.name === item.name ? { ...d, status: 'uploading' } : d))
    );

    let docMeta = null;
    try {
      docMeta = await uploadDocument(
        item.file,
        selectedEstate,
        (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            const uploadPct = Math.min(25, Math.round(pct * 0.25));
            setQueue((prev) =>
              prev.map((it, idx) => (idx === itemIndex ? { ...it, progress: uploadPct } : it))
            );
          }
        }
      );
    } catch (uploadErr) {
      setQueue((prev) =>
        prev.map((it, idx) =>
          idx === itemIndex
            ? { ...it, status: 'failed', error: uploadErr.message || 'Upload failed', progress: 0 }
            : it
        )
      );
      setDocumentsList((prev) =>
        prev.map((d) => (d.id === item.id || d.name === item.name ? { ...d, status: 'failed' } : d))
      );
      return { success: false };
    }

    const docId = docMeta.document_id;
    setSelectedDocumentId(docId);

    setQueue((prev) =>
      prev.map((it, idx) =>
        idx === itemIndex ? { ...it, documentId: docId, status: 'extracting', progress: 30 } : it
      )
    );
    setDocumentsList((prev) =>
      prev.map((d) =>
        d.id === item.id || d.name === item.name ? { ...d, id: docId, status: 'extracting' } : d
      )
    );

    // Poll Extraction & Analysis
    const pollRes = await pollDocumentUntilComplete(
      docId,
      (stage) => {
        setCurrentStage(stage);
        setQueue((prev) =>
          prev.map((it, idx) => (idx === itemIndex ? { ...it, status: stage } : it))
        );
        setDocumentsList((prev) =>
          prev.map((d) => (d.id === docId || d.name === item.name ? { ...d, status: stage } : d))
        );
      },
      (progress) => {
        setQueue((prev) =>
          prev.map((it, idx) => (idx === itemIndex ? { ...it, progress } : it))
        );
      }
    );

    if (!pollRes.success) {
      setQueue((prev) =>
        prev.map((it, idx) =>
          idx === itemIndex
            ? { ...it, status: 'failed', error: pollRes.error || 'Failed processing', progress: 0 }
            : it
        )
      );
      setDocumentsList((prev) =>
        prev.map((d) => (d.id === docId || d.name === item.name ? { ...d, status: 'failed' } : d))
      );
      return { success: false };
    }

    // Stage 4 & 5: Recurring Patterns & Saving Results
    setCurrentStage('saving');
    setQueue((prev) =>
      prev.map((it, idx) => (idx === itemIndex ? { ...it, status: 'saving', progress: 95 } : it))
    );

    try {
      const finalResult = await getDocumentResult(docId);
      setActiveResultData(finalResult);
      // Update document item with parsed entities, transactions, and structured result
      setDocumentsList((prev) =>
        prev.map((d) => {
          if (d.id === docId || d.name === item.name) {
            const classifiedType = finalResult.document_type || d.type;
            return {
              ...d,
              id: docId,
              status: 'completed',
              statusLabel: 'Processed',
              type: classifiedType,
              typeLabel: getDocTypeDisplayLabel(classifiedType),
              entities: finalResult.entities || d.entities || [],
              transactions: finalResult.transactions || d.transactions || [],
              evidence: finalResult.evidence || d.evidence || [],
              policyDetails: finalResult.policy_details || d.policyDetails,
              loanDetails: finalResult.loan_details || d.loanDetails,
              investmentDetails: finalResult.investment_details || d.investmentDetails,
              accountDetails: finalResult.account_details || d.accountDetails,
              nomineeDetails: finalResult.nominee_details || d.nomineeDetails,
              confidence: finalResult.overall_confidence || 0.95,
              rawText: finalResult.extracted_text || d.rawText || '',
              result: finalResult,
            };
          }
          return d;
        })
      );
    } catch (resErr) {
      console.warn('Could not fetch final structured result:', resErr);
      setDocumentsList((prev) =>
        prev.map((d) =>
          d.id === docId || d.name === item.name
            ? { ...d, id: docId, status: 'completed', statusLabel: 'Processed' }
            : d
        )
      );
    }

    // Complete item
    setQueue((prev) =>
      prev.map((it, idx) =>
        idx === itemIndex ? { ...it, status: 'completed', progress: 100 } : it
      )
    );

    // Refresh cross-document recurring relationships
    await refreshRecurrence(selectedEstate);

    return { success: true };
  };

  /**
   * Main Sequential Queue Processing Loop
   */
  useEffect(() => {
    const uncompletedIdx = queue.findIndex((it) => it.status === 'queued');

    if (uncompletedIdx !== -1 && !isProcessingRef.current) {
      isProcessingRef.current = true;
      setIsProcessingQueue(true);

      (async () => {
        for (let i = 0; i < queue.length; i++) {
          if (queue[i].status === 'queued') {
            setCurrentProcessingIndex(i);
            await processSingleQueueItem(queue[i], i);
          }
        }

        isProcessingRef.current = false;
        setIsProcessingQueue(false);
        setCurrentStage('completed');
        setIsAllCompleted(true);
        await refreshRecurrence(selectedEstate);
      })();
    }
  }, [queue, selectedEstate, refreshRecurrence]);

  // Selected document data for Center Column
  const selectedDoc =
    documentsList.find((d) => (d.id || d.document_id) === selectedDocumentId) || null;

  const completedCount = queue.filter((it) => it.status === 'completed').length;

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <AppSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Content Area */}
      <div className="app-main-wrapper">
        <AppTopbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="documents-main-content">
          {/* 1. Header Row */}
          <section className="documents-header-row" aria-labelledby="documents-page-heading">
            <div className="documents-header-left">
              <div className="section-eyebrow mb-2">DOCUMENTS</div>
              <h1 id="documents-page-heading" className="documents-page-title">
                Upload and Analyze Your Financial Documents
              </h1>
              <p className="documents-page-description">
                Upload multiple documents like bank statements, policies, tax documents and other financial records. We'll process them sequentially and build both individual document insights and a unified view of your financial relationships.
              </p>
            </div>

            <div className="documents-header-right">
              <HeaderDocumentGraphic />
            </div>
          </section>

          {/* 2. Multi-Upload & Queue Row */}
          <section className="multi-upload-grid-row" aria-label="Document Upload Area">
            <div className="multi-upload-col-left" ref={uploadAreaRef}>
              <MultiDocumentUpload
                onFilesSelected={handleFilesSelected}
                isUploading={isProcessingQueue}
              />
            </div>

            <div className="multi-upload-col-right">
              <UploadQueue
                queue={queue}
                currentProcessingIndex={currentProcessingIndex}
                onRemoveItem={handleRemoveQueueItem}
                onClearAll={handleClearQueue}
                isProcessing={isProcessingQueue}
              />
            </div>
          </section>

          {/* 3. Global Processing Stepper (Visible when queue or documents exist) */}
          {(queue.length > 0 || isProcessingQueue) && (
            <section className="global-stepper-section" aria-label="Processing Progress Stepper">
              <ProcessingStepper
                currentDocIndex={currentProcessingIndex}
                totalDocs={Math.max(1, queue.length)}
                currentStage={currentStage}
                isAllCompleted={isAllCompleted}
                completedCount={completedCount}
                timeString={lastUploadTime}
              />
            </section>
          )}

          {/* 4. INDIVIDUAL DOCUMENT WORKSPACE (2-Column: Left Navigator + Main Analysis) */}
          <section className="doc-workspace-2col-grid" aria-label="Individual Document Workspace">
            {/* LEFT: Document List / Navigator */}
            <div className="workspace-col-navigator">
              <DocumentNavigator
                documents={documentsList}
                selectedDocumentId={selectedDocumentId}
                onSelectDocument={(doc) => {
                  const targetId = doc.id || doc.document_id;
                  setSelectedDocumentId(targetId);
                  if (doc.result) {
                    setActiveResultData(doc.result);
                  } else if (targetId) {
                    getDocumentResult(targetId)
                      .then((res) => setActiveResultData(res))
                      .catch(() => {});
                  }
                }}
                onUploadMoreClick={() => {
                  const input = document.querySelector('.hidden-file-input');
                  if (input) input.click();
                }}
              />
            </div>

            {/* RIGHT: Selected Document's Individual Analysis Panel */}
            <div className="workspace-col-analysis">
              <DocumentAnalysisPanel
                documentData={selectedDoc}
                resultData={selectedDoc?.result || activeResultData}
                processingStatus={activeProcessingStatus}
                onViewSourceDoc={(docId) => setSelectedDocumentId(docId)}
              />
            </div>
          </section>

          {/* 5. COMBINED ESTATE ANALYSIS (Full-Width Bottom Section) */}
          <section className="combined-bottom-section" aria-label="Combined Cross-Document Recurring Analysis">
            <CombinedAnalysis
              recurrenceData={recurrenceData}
              totalDocs={documentsList.length}
              uploadedDocuments={documentsList}
              onSelectSourceDocument={(docId) => setSelectedDocumentId(docId)}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
