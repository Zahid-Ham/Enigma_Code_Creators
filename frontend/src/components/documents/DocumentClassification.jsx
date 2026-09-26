/**
 * Document Classification Component
 * Displays the AI-determined document type, extraction confidence, and descriptive summary.
 */

import React from 'react';
import {
  Shield,
  FileCheck,
  Building2,
  Landmark,
  PiggyBank,
  Receipt,
  FileText,
  Briefcase,
  Home,
  HelpCircle,
} from 'lucide-react';

const DOCUMENT_TYPE_CONFIG = {
  insurance_policy: {
    label: 'Insurance Policy',
    icon: Shield,
    defaultDescription:
      'This appears to be an insurance policy document containing policy terms, premium schedule, sum assured, and nominee details.',
  },
  bank_statement: {
    label: 'Bank Statement',
    icon: Landmark,
    defaultDescription:
      'This document contains recurring banking transactions, account balances, and banking institution credentials.',
  },
  mutual_fund_statement: {
    label: 'Mutual Fund Statement',
    icon: PiggyBank,
    defaultDescription:
      'This document reflects mutual fund folios, unit holdings, NAV valuations, and asset management company details.',
  },
  tax_document: {
    label: 'Tax Document / Form 16 / 26AS',
    icon: Receipt,
    defaultDescription:
      'This document contains tax records, assessment year filings, PAN references, and gross taxable disclosures.',
  },
  fixed_deposit_receipt: {
    label: 'Fixed Deposit Receipt',
    icon: Building2,
    defaultDescription:
      'This document provides fixed deposit certificate information, maturity valuations, interest rates, and lien status.',
  },
  property_deed: {
    label: 'Property Deed / Sale Agreement',
    icon: Home,
    defaultDescription:
      'This document registers real estate ownership, parcel descriptions, registration identifiers, and title chains.',
  },
  employment_pf_record: {
    label: 'Employment / Provident Fund Record',
    icon: Briefcase,
    defaultDescription:
      'This document details provident fund (EPF/UAN) accounts, employer contributions, and gratuity entitlements.',
  },
  pension_document: {
    label: 'Pension Document / PPO',
    icon: FileText,
    defaultDescription:
      'This document details pension payment orders, disbursing bank branches, annuity plans, and family pension options.',
  },
  loan_agreement: {
    label: 'Loan / Liability Agreement',
    icon: Receipt,
    defaultDescription:
      'This document registers debt agreements, loan disbursement terms, collateral details, and repayment schedules.',
  },
  unknown: {
    label: 'Unclassified Document',
    icon: HelpCircle,
    defaultDescription: 'Document type could not be determined confidently.',
  },
};

export default function DocumentClassification({
  documentType = 'unknown',
  confidence = 0.0,
  entities = [],
  warnings = [],
}) {
  const normType = (documentType || 'unknown').toLowerCase().replace(/\s+/g, '_');
  const config = DOCUMENT_TYPE_CONFIG[normType] || DOCUMENT_TYPE_CONFIG.unknown;

  const IconComponent = config.icon;
  const confidencePercent = Math.round((confidence || 0) * 100);

  // Derive dynamic description if we have richer entities
  const getDynamicDescription = () => {
    if (normType === 'unknown') {
      return 'Document type could not be determined confidently.';
    }

    if (entities && entities.length > 0) {
      const first = entities[0];
      const inst = first.institution_name ? ` issued by ${first.institution_name}` : '';
      const nom = first.nominee_status && first.nominee_status !== 'none' ? ', and nominee details' : '';
      return `This appears to be a ${config.label.toLowerCase()} document${inst} containing financial terms, account identifiers${nom}.`;
    }

    return config.defaultDescription;
  };

  return (
    <section className="intel-card classification-card" aria-labelledby="classification-heading">
      <div className="classification-layout">
        <div className="classification-icon-box" aria-hidden="true">
          <IconComponent size={28} className="classification-icon" />
        </div>

        <div className="classification-content">
          <div className="classification-top-row">
            <h3 id="classification-heading" className="classification-type-title">
              {config.label}
            </h3>

            {confidence > 0 && (
              <span
                className={`confidence-badge ${
                  confidencePercent >= 80
                    ? 'confidence-high'
                    : confidencePercent >= 50
                    ? 'confidence-med'
                    : 'confidence-low'
                }`}
                title={`Extraction confidence score: ${(confidence * 100).toFixed(1)}%`}
              >
                {confidencePercent}% confidence
              </span>
            )}
          </div>

          <p className="classification-description">{getDynamicDescription()}</p>

          {warnings && warnings.length > 0 && (
            <div className="classification-warning-pill">
              <span className="warning-dot" aria-hidden="true">•</span>
              <span>{warnings[0]}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
