import React from 'react';
import { Check } from 'lucide-react';

/**
 * ProcessingStepper Component
 * Displays the 5-step global processing stepper with context information.
 */
export default function ProcessingStepper({
  currentDocIndex = 0,
  totalDocs = 1,
  currentStage = 'idle', // 'uploading' | 'extracting' | 'analyzing' | 'recurring' | 'saving' | 'completed' | 'failed'
  isAllCompleted = false,
  completedCount = 0,
  timeString = '',
}) {
  const steps = [
    {
      id: 'uploading',
      number: 1,
      title: 'Uploading',
      subtitle: timeString || '02:52 PM',
    },
    {
      id: 'extracting',
      number: 2,
      title: 'Extracting Text',
      subtitle: 'Payment data, transactions...',
    },
    {
      id: 'analyzing',
      number: 3,
      title: 'Analyzing with AI',
      subtitle: 'Identifying financial entities...',
    },
    {
      id: 'recurring',
      number: 4,
      title: 'Analyzing Recurring Patterns',
      subtitle: 'Detecting recurring relationships...',
    },
    {
      id: 'saving',
      number: 5,
      title: 'Saving Results',
      subtitle: 'Persisting to Firestore...',
    },
    {
      id: 'completed',
      number: 6,
      title: 'Completed',
      subtitle: '',
      isFinal: true,
    },
  ];

  const stageOrder = {
    idle: 0,
    uploading: 1,
    extracting: 2,
    analyzing: 3,
    recurring: 4,
    saving: 5,
    completed: 6,
  };

  const currentLevel = isAllCompleted ? 6 : (stageOrder[currentStage] || 0);

  return (
    <div className="processing-stepper-card" aria-label="Document Processing Pipeline Tracker">
      <div className="stepper-header">
        <h4 className="stepper-title">
          {isAllCompleted
            ? `All Documents Processed (${totalDocs} of ${totalDocs})`
            : `Processing Progress (${Math.min(currentDocIndex + 1, totalDocs)} of ${totalDocs})`}
        </h4>
        {totalDocs > 1 && !isAllCompleted && (
          <span className="stepper-batch-meta">
            {completedCount} completed • {totalDocs - completedCount} remaining
          </span>
        )}
      </div>

      <div className="stepper-track-wrap">
        <div className="stepper-nodes-row">
          {steps.map((step, idx) => {
            const isPassed = currentLevel > step.number || (step.isFinal && isAllCompleted);
            const isCurrent = currentLevel === step.number && !isAllCompleted;
            const isPending = currentLevel < step.number && !isAllCompleted;

            return (
              <React.Fragment key={step.id}>
                {/* Step Node */}
                <div
                  className={`stepper-node ${isPassed ? 'node-passed' : ''} ${isCurrent ? 'node-current' : ''} ${isPending ? 'node-pending' : ''}`}
                >
                  <div className="stepper-circle">
                    {isPassed ? (
                      <Check size={14} strokeWidth={3} />
                    ) : isCurrent ? (
                      <span className="current-step-num">{step.number}</span>
                    ) : (
                      <span className="pending-step-num">{step.isFinal ? <Check size={12} /> : step.number}</span>
                    )}
                  </div>
                  <div className="stepper-label-group">
                    <span className="stepper-label-title">{step.title}</span>
                    {step.subtitle && (
                      <span className="stepper-label-sub">{step.subtitle}</span>
                    )}
                  </div>
                </div>

                {/* Connector Line between nodes */}
                {idx < steps.length - 1 && (
                  <div
                    className={`stepper-connector ${currentLevel > idx + 1 ? 'connector-passed' : ''}`}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
