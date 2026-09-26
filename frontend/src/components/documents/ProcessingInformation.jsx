/**
 * Processing Information Component
 * Displays execution metrics: pipeline duration, pages extracted, relevant pages, and model.
 */

import React from 'react';
import { Cpu, CheckCircle2, Clock } from 'lucide-react';

export default function ProcessingInformation({
  resultData,
  processingStatus,
}) {
  const formatDuration = (ms) => {
    if (!ms && ms !== 0) return 'In progress';
    if (ms < 1000) return `${ms} ms`;
    const seconds = Math.round(ms / 1000);
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'Just now';
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
      return 'Just now';
    }
  };

  const status = resultData?.status || processingStatus?.status || 'Completed';
  const durationMs = resultData?.processing_duration_ms || 0;
  const totalPages = resultData?.extracted_text_page_count || 1;
  const relevantPages = resultData?.relevant_page_count || totalPages;
  const processedAt = resultData?.processed_at;
  const modelName = 'openai/gpt-oss-120b';

  return (
    <div className="intel-card proc-info-card" aria-labelledby="proc-info-heading">
      <div className="details-card-header">
        <Cpu size={18} className="details-card-icon text-emerald-700" aria-hidden="true" />
        <h4 id="proc-info-heading" className="details-card-title">
          Processing Information
        </h4>
      </div>

      <div className="details-table">
        <div className="details-row">
          <span className="details-label">Processing Status</span>
          <span className="details-value">
            <span className="status-pill-completed">
              <CheckCircle2 size={13} aria-hidden="true" />
              <span>{status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}</span>
            </span>
          </span>
        </div>

        <div className="details-row">
          <span className="details-label">Processing Time</span>
          <span className="details-value font-medium">{formatDuration(durationMs)}</span>
        </div>

        <div className="details-row">
          <span className="details-label">Pages Analyzed</span>
          <span className="details-value">{totalPages} {totalPages === 1 ? 'page' : 'pages'}</span>
        </div>

        <div className="details-row">
          <span className="details-label">Relevant Pages</span>
          <span className="details-value">{relevantPages} {relevantPages === 1 ? 'page' : 'pages'}</span>
        </div>

        <div className="details-row">
          <span className="details-label">Model Used</span>
          <span className="details-value font-mono text-xs text-slate-700">{modelName}</span>
        </div>

        <div className="details-row">
          <span className="details-label">Processed At</span>
          <span className="details-value">{formatDateTime(processedAt)}</span>
        </div>
      </div>
    </div>
  );
}
