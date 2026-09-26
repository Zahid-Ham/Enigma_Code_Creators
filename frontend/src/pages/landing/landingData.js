/**
 * FINCLOSURE Landing Page Content Data
 */

export const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Why It Matters', href: '#why-it-matters' },
  { label: 'FAQs', href: '#faqs' },
];

export const TRUSTED_SOURCES = [
  {
    id: 'udgam',
    name: 'UDGAM',
    fullName: 'RBI Unclaimed Deposits Gateway',
    tag: 'Unclaimed Deposits',
    type: 'Official Portal Guidance',
  },
  {
    id: 'epfo',
    name: 'EPFO',
    fullName: "Employees' Provident Fund Organisation",
    tag: 'Provident Fund & EDLI',
    type: 'Official Portal Guidance',
  },
  {
    id: 'iepf',
    name: 'IEPF',
    fullName: 'Investor Education and Protection Fund',
    tag: 'Unclaimed Dividends & Shares',
    type: 'Official Portal Guidance',
  },
];

export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Collect',
    desc: 'Upload statements, policies, tax documents, emails and available financial evidence.',
    iconName: 'FileText',
  },
  {
    step: '02',
    title: 'Discover',
    desc: 'FINCLOSURE identifies known assets and flags potentially missing financial relationships.',
    iconName: 'Compass',
  },
  {
    step: '03',
    title: 'Verify',
    desc: 'Inspect exact document citations, confidence metrics, and official verification pathways.',
    iconName: 'ShieldCheck',
  },
  {
    step: '04',
    title: 'Act',
    desc: 'Follow institutional checklists and guided action steps to initiate claims or closures.',
    iconName: 'ArrowRightCircle',
  },
  {
    step: '05',
    title: 'Close',
    desc: 'Track timelines, resolve blockers, and monitor your overall Estate Closure Score until completion.',
    iconName: 'CheckCircle2',
  },
];

export const CORE_FEATURES = [
  {
    id: 'doc-intelligence',
    title: 'Document Intelligence',
    desc: 'Upload bank statements, salary slips, and policies. Our engine extracts institutions, account numbers, and recurring cash flows.',
    iconName: 'FileSearch',
    isSpotlight: false,
  },
  {
    id: 'estate-radar',
    title: 'Estate Radar',
    badge: 'Primary Differentiator',
    desc: 'Surfaces hidden and forgotten financial relationships from indirect transaction evidence that the family was never told about.',
    iconName: 'Radar',
    isSpotlight: true,
  },
  {
    id: 'guided-claim',
    title: 'Guided Claim Process',
    desc: 'Know exactly what documents are needed for banks, insurers, EPFO, and IEPF before visiting a branch or submitting a claim.',
    iconName: 'ClipboardList',
    isSpotlight: false,
  },
  {
    id: 'tracking-closure',
    title: 'Track Until Closure',
    desc: 'Monitor claim statuses with timeline milestones, automated blocker detection, and a calculated Estate Closure Score.',
    iconName: 'TrendingUp',
    isSpotlight: false,
  },
];

export const RADAR_EXAMPLE = {
  evidenceType: 'Bank Statement Analysis',
  transactionLine: 'ABC LIFE INSURANCE — ₹4,250 / month (Recurring Auto-Debit)',
  findingTitle: 'Potential Missing Life Insurance Asset',
  detectedInstitution: 'ABC Life Insurance Co.',
  sourceLocation: 'Bank Statement — Page 12, Line 18',
  confidenceScore: 87,
  status: 'Requires Verification',
  actionNote: 'No matching policy document found in uploaded estate records. Recommended to verify via insurer claim portal.',
};

export const ESTATE_TWIN_NODES = [
  {
    category: 'Bank Accounts',
    name: 'HDFC Savings Account (***4821)',
    amount: '₹ 2,84,500',
    status: 'Verified',
    statusType: 'active',
  },
  {
    category: 'Insurance Policy',
    name: 'ABC Life Term Insurance',
    amount: '₹ 50,00,000 (Sum Assured)',
    status: 'Inferred (Radar)',
    statusType: 'potential',
  },
  {
    category: 'Provident Fund',
    name: 'EPFO Member Balance',
    amount: '₹ 3,45,000',
    status: 'In Progress',
    statusType: 'progress',
  },
  {
    category: 'Unclaimed Investments',
    name: 'IEPF Dividends (RIL Shares)',
    amount: '₹ 12,400',
    status: 'Discovered',
    statusType: 'potential',
  },
  {
    category: 'Unclaimed Deposits',
    name: 'SBI Term Deposit (UDGAM)',
    amount: '₹ 82,300',
    status: 'Discovered',
    statusType: 'potential',
  },
  {
    category: 'Liabilities & Debt',
    name: 'ICICI Car Loan EMI',
    amount: '₹ 14,200 / month',
    status: 'Active Obligation',
    statusType: 'blocked',
  },
];

export const PRODUCT_MODES = [
  {
    id: 'mode-a',
    title: 'Prepare Ahead',
    eyebrow: 'MODE A — PROACTIVE PLANNING',
    target: 'For individuals organizing their estate while alive',
    desc: 'Build your structured Financial Estate Twin proactively so your family will never have to search blindly.',
    points: [
      'Organize bank accounts, FDs, and policies in one encrypted hub',
      'Perform Nominee Health Checks to detect missing nominees',
      'Receive an Estate Readiness Score to fix documentation gaps',
      'Generate a structured financial blueprint for authorized heirs',
    ],
    cta: 'Prepare My Estate',
    accentColor: '#25704D',
  },
  {
    id: 'mode-b',
    title: 'Recover & Close',
    eyebrow: 'MODE B — ESTATE RECOVERY',
    target: 'For authorized family members handling an estate',
    desc: 'Reconstruct a deceased person’s financial footprint from scattered paperwork and resolve every asset and liability.',
    points: [
      'Upload fragmented statements, emails, and tax slips',
      'Estate Radar surfaces unlisted insurance, deposits, and EPF',
      'Step-by-step guidance for official claims (UDGAM, EPFO, IEPF)',
      'Track blockers, claim acknowledgements, and closure score',
    ],
    cta: 'Handle an Estate',
    accentColor: '#163326',
  },
];

export const FAQS = [
  {
    question: 'What is FINCLOSURE?',
    answer:
      'FINCLOSURE is an AI-assisted financial estate discovery and closure platform. It helps families reconstruct a deceased person’s fragmented financial life, discover missing assets or liabilities from evidence, and navigate claim and closure pathways until everything is resolved.',
  },
  {
    question: 'Can FINCLOSURE discover assets I don’t know about?',
    answer:
      'Yes. Through our Estate Radar engine, FINCLOSURE analyzes financial records (such as bank statements or tax filings) to detect evidence of recurring premiums, investment debits, or dividends where no explicit policy document exists, flagging them as potential missing assets for verification.',
  },
  {
    question: 'What documents can I upload?',
    answer:
      'You can upload PDF bank statements, insurance policy schedules, payslips, loan account statements, Form 26AS/tax records, death certificates, and scanned financial receipts.',
  },
  {
    question: 'Does FINCLOSURE directly submit claims to banks or governments?',
    answer:
      'No. FINCLOSURE is a guidance, discovery, and orchestration platform. We provide the exact checklists, pre-filled documentation guides, and direct links to official portals (such as RBI UDGAM, EPFO, and IEPF) so authorized claimants can submit claims accurately.',
  },
  {
    question: 'How does Estate Radar work?',
    answer:
      'Estate Radar inspects line items and transaction patterns across documents to surface financial relationships without assuming you already know all accounts. Every finding comes with transparent source citations, page numbers, and a calculated confidence score.',
  },
  {
    question: 'Is my financial information secure and private?',
    answer:
      'Yes. Privacy and data security are core design tenets. FINCLOSURE isolates sensitive records and does not sell or share financial data. All evidence citations are strictly controlled within your private estate case.',
  },
  {
    question: 'Can I use FINCLOSURE to organize my finances before anything happens?',
    answer:
      'Absolutely. In "Prepare Ahead" mode, individuals can catalog their assets, run nominee health checks, verify document readiness, and ensure their loved ones will have a clear, organized roadmap when the time comes.',
  },
];
