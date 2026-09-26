/**
 * Processing Timeline Component
 * Visually illustrates document intake through OCR/extraction, AI analysis, and completion.
 */

import React from 'react';
import {
  Check,
  Loader2,
  AlertCircle,
  UploadCloud,
  FileSearch,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function ProcessingTimeline({
  status = 'pending',
  progress = 0,
  uploadedAt = null,
  processedAt = null,
}) {
  const formatTime = (isoString) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };

  const uploadTimeStr = formatTime(uploadedAt) || 'Uploaded';
  const processedTimeStr = formatTime(processedAt);

  const getStepStatus = (stepIndex) => {
    // stepIndex: 1 = Uploaded, 2 = Extracting Text, 3 = Analyzing with AI, 4 = Completed
    const normalized = (status || '').toLowerCase();

    if (normalized === 'failed') {
      if (stepIndex === 1) return 'completed';
      if (stepIndex === 2 && progress <= 30) return 'failed';
      if (stepIndex === 3) return 'failed';
      return 'pending';
    }

    if (normalized === 'completed') {
      return 'completed';
    }

    if (normalized === 'analyzing') {
      if (stepIndex <= 2) return 'completed';
      if (stepIndex === 3) return 'active';
      return 'pending';
    }

    if (normalized === 'extracting') {
      if (stepIndex === 1) return 'completed';
      if (stepIndex === 2) return 'active';
      return 'pending';
    }

    // Pending
    if (stepIndex === 1) return 'completed';
    return 'pending';
  };

  const steps = [
    {
      id: 1,
      title: 'Uploaded',
      subtitle: uploadTimeStr,
      icon: UploadCloud,
    },
    {
      id: 2,
      title: 'Extracting Text',
      subtitle: getStepStatus(2) === 'active' ? 'In progress' : getStepStatus(2) === 'completed' ? 'Text extracted' : 'Pending',
      icon: FileSearch,
    },
    {
      id: 3,
      title: 'Analyzing with AI',
      subtitle: getStepStatus(3) === 'active' ? 'Groq AI analysis' : getStepStatus(3) === 'completed' ? 'Analyzed' : 'Pending',
      icon: Sparkles,
    },
    {
      id: 4,
      title: 'Completed',
      subtitle: processedTimeStr || (getStepStatus(4) === 'completed' ? 'Ready' : 'Pending'),
      icon: CheckCircle2,
    },
  ];

  return (
    <section
      className="processing-timeline-container"
      aria-label="Document Processing Stages Timeline"
    >
      <div className="timeline-steps-track">
        {steps.map((step, idx) => {
          const stepState = getStepStatus(step.id);
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`timeline-step-node step-${stepState}`}
                aria-current={stepState === 'active' ? 'step' : undefined}
              >
                <div className="step-indicator-wrapper">
                  <div className="step-circle" aria-hidden="true">
                    {stepState === 'completed' ? (
                      <Check size={16} className="step-check-icon" strokeWidth={2.8} />
                    ) : stepState === 'active' ? (
                      <Loader2 size={16} className="step-spinner animate-spin" />
                    ) : stepState === 'failed' ? (
                      <AlertCircle size={16} className="step-failed-icon" />
                    ) : (
                      <span className="step-number">{step.id}</span>
                    )}
                  </div>
                </div>

                <div className="step-text-content">
                  <div className="step-title-text">{step.title}</div>
                  <div className="step-sub-text">{step.subtitle}</div>
                </div>
              </div>

              {!isLast && (
                <div
                  className={`timeline-connector-line ${
                    getStepStatus(step.id + 1) === 'completed' || getStepStatus(step.id + 1) === 'active'
                      ? 'line-filled'
                      : 'line-empty'
                  }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
