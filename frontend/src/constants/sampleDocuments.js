/**
 * Sample Financial Documents for Demo Estate
 * Provides realistic adaptive data across Bank Statements, Insurance Policies, and Loan Statements.
 */

export const INITIAL_SAMPLE_DOCUMENTS = [
  {
    id: 'doc-demo-001',
    name: '01_HDFC_Bank_Statement_Apr-Jun_2026.pdf',
    type: 'bank_statement',
    typeLabel: 'Bank Statement',
    size: 1.2 * 1024 * 1024,
    sizeFormatted: '1.2 MB',
    timestamp: '26 Sept 2026, 02:52 PM',
    status: 'completed',
    statusLabel: 'Processed',
    confidence: 0.99,
    summary: {
      accountCount: 1,
      transactionCount: 12,
      entityCount: 5,
    },
    entities: [
      {
        id: 'ent-01',
        institution: 'HDFC Bank',
        category: 'Bank Account',
        role: 'Primary Institution',
        accountReference: 'Account • ****3456',
        balance: '₹ 3,54,415',
        amountLabel: 'Account Balance',
        isPrimary: true,
      },
      {
        id: 'ent-02',
        institution: 'ABC Life Insurance',
        category: 'Insurance',
        role: 'Inferred',
        accountReference: 'Recurring Payment',
        balance: '₹ 4,250',
        amountLabel: 'Monthly Premium',
        isPrimary: false,
      },
      {
        id: 'ent-03',
        institution: 'Streamflix Digital Services',
        category: 'Subscription',
        role: 'Inferred',
        accountReference: 'Subscription',
        balance: '₹ 699',
        amountLabel: 'Monthly Payment',
        isPrimary: false,
      },
      {
        id: 'ent-04',
        institution: 'Greenwood Asset Management',
        category: 'Investment',
        role: 'Inferred',
        accountReference: 'Investment (SIP)',
        balance: '₹ 10,000',
        amountLabel: 'Monthly SIP',
        isPrimary: false,
      },
      {
        id: 'ent-05',
        institution: 'City Power',
        category: 'Utility',
        role: 'Inferred',
        accountReference: 'Utility',
        balance: '₹ 2,410',
        amountLabel: 'Monthly Payment',
        isPrimary: false,
      },
    ],
    transactions: [
      { id: 'tx-1', date: '2026-04-04', description: 'ACH DEBIT ABC LIFE INS PREM', amount: 4250, category: 'Insurance', direction: 'debit' },
      { id: 'tx-2', date: '2026-04-10', description: 'ECS NHB HOME LOAN EMI', amount: 28600, category: 'Loan', direction: 'debit' },
      { id: 'tx-3', date: '2026-04-15', description: 'SIP GREENWOOD BALANCED FUND', amount: 10000, category: 'Investment', direction: 'debit' },
      { id: 'tx-4', date: '2026-04-18', description: 'STREAMFLIX MONTHLY SUB', amount: 699, category: 'Subscription', direction: 'debit' },
      { id: 'tx-5', date: '2026-04-25', description: 'CITY POWER ELEC BILL', amount: 2410, category: 'Utility', direction: 'debit' },
      { id: 'tx-6', date: '2026-05-04', description: 'ACH DEBIT ABC LIFE INS PREM', amount: 4250, category: 'Insurance', direction: 'debit' },
      { id: 'tx-7', date: '2026-05-10', description: 'ECS NHB HOME LOAN EMI', amount: 28600, category: 'Loan', direction: 'debit' },
      { id: 'tx-8', date: '2026-05-15', description: 'SIP GREENWOOD BALANCED FUND', amount: 10000, category: 'Investment', direction: 'debit' },
      { id: 'tx-9', date: '2026-05-18', description: 'STREAMFLIX MONTHLY SUB', amount: 699, category: 'Subscription', direction: 'debit' },
      { id: 'tx-10', date: '2026-05-26', description: 'CITY POWER ELEC BILL', amount: 2430, category: 'Utility', direction: 'debit' },
      { id: 'tx-11', date: '2026-06-04', description: 'ACH DEBIT ABC LIFE INS PREM', amount: 4250, category: 'Insurance', direction: 'debit' },
      { id: 'tx-12', date: '2026-06-10', description: 'ECS NHB HOME LOAN EMI', amount: 28600, category: 'Loan', direction: 'debit' },
    ],
    details: {
      accountNumber: '••••••••3456',
      ifsc: 'HDFC0001248',
      branch: 'Bandra West, Mumbai',
      statementPeriod: '01 Apr 2026 – 30 Jun 2026',
      closingBalance: '₹ 3,54,415',
    },
    rawText: `HDFC BANK STATEMENT
Account Number: 50100492833456
IFSC: HDFC0001248
Customer Name: Zahid Hamdule
Statement Period: 01/04/2026 to 30/06/2026

Transactions:
04/04/2026  ACH DEBIT ABC LIFE INS PREM        -4,250.00
10/04/2026  ECS NHB HOME LOAN EMI             -28,600.00
15/04/2026  SIP GREENWOOD BALANCED FUND       -10,000.00
18/04/2026  STREAMFLIX MONTHLY SUB               -699.00
25/04/2026  CITY POWER ELEC BILL               -2,410.00
04/05/2026  ACH DEBIT ABC LIFE INS PREM        -4,250.00
10/05/2026  ECS NHB HOME LOAN EMI             -28,600.00
15/05/2026  SIP GREENWOOD BALANCED FUND       -10,000.00
18/05/2026  STREAMFLIX MONTHLY SUB               -699.00
26/05/2026  CITY POWER ELEC BILL               -2,430.00
04/06/2026  ACH DEBIT ABC LIFE INS PREM        -4,250.00
10/06/2026  ECS NHB HOME LOAN EMI             -28,600.00

Closing Balance as of 30/06/2026: INR 3,54,415.00`,
  },
  {
    id: 'doc-demo-002',
    name: '02_HDFC_Bank_Statement_Jul-Sep_2026.pdf',
    type: 'bank_statement',
    typeLabel: 'Bank Statement',
    size: 1.1 * 1024 * 1024,
    sizeFormatted: '1.1 MB',
    timestamp: '26 Sept 2026, 02:52 PM',
    status: 'completed',
    statusLabel: 'Processed',
    confidence: 0.98,
    summary: {
      accountCount: 1,
      transactionCount: 14,
      entityCount: 6,
    },
    entities: [
      {
        id: 'ent-201',
        institution: 'HDFC Bank',
        category: 'Bank Account',
        role: 'Primary Institution',
        accountReference: 'Account • ****3456',
        balance: '₹ 4,12,800',
        amountLabel: 'Account Balance',
        isPrimary: true,
      },
      {
        id: 'ent-202',
        institution: 'ABC Life Insurance',
        category: 'Insurance',
        role: 'Inferred',
        accountReference: 'Recurring Payment',
        balance: '₹ 4,250',
        amountLabel: 'Monthly Premium',
        isPrimary: false,
      },
      {
        id: 'ent-203',
        institution: 'National Housing Bank',
        category: 'Loan',
        role: 'Inferred',
        accountReference: 'Home Loan EMI',
        balance: '₹ 28,600',
        amountLabel: 'Monthly EMI',
        isPrimary: false,
      },
      {
        id: 'ent-204',
        institution: 'Greenwood Asset Management',
        category: 'Investment',
        role: 'Inferred',
        accountReference: 'Investment (SIP)',
        balance: '₹ 10,000',
        amountLabel: 'Monthly SIP',
        isPrimary: false,
      },
      {
        id: 'ent-205',
        institution: 'Streamflix Digital Services',
        category: 'Subscription',
        role: 'Inferred',
        accountReference: 'Subscription',
        balance: '₹ 699',
        amountLabel: 'Monthly Payment',
        isPrimary: false,
      },
      {
        id: 'ent-206',
        institution: 'SecureHealth Insurance',
        category: 'Insurance',
        role: 'Inferred',
        accountReference: 'Annual Policy',
        balance: '₹ 12,500',
        amountLabel: 'Annual Premium',
        isPrimary: false,
      },
    ],
    transactions: [
      { id: 'tx-201', date: '2026-07-04', description: 'ACH DEBIT ABC LIFE INS PREM', amount: 4250, category: 'Insurance', direction: 'debit' },
      { id: 'tx-202', date: '2026-07-10', description: 'ECS NHB HOME LOAN EMI', amount: 28600, category: 'Loan', direction: 'debit' },
      { id: 'tx-203', date: '2026-07-15', description: 'SIP GREENWOOD BALANCED FUND', amount: 10000, category: 'Investment', direction: 'debit' },
      { id: 'tx-204', date: '2026-07-18', description: 'STREAMFLIX MONTHLY SUB', amount: 699, category: 'Subscription', direction: 'debit' },
      { id: 'tx-205', date: '2026-07-22', description: 'SECUREHEALTH ANNUAL PREM', amount: 12500, category: 'Insurance', direction: 'debit' },
      { id: 'tx-206', date: '2026-07-25', description: 'CITY POWER ELEC BILL', amount: 2390, category: 'Utility', direction: 'debit' },
      { id: 'tx-207', date: '2026-08-04', description: 'ACH DEBIT ABC LIFE INS PREM', amount: 4250, category: 'Insurance', direction: 'debit' },
      { id: 'tx-208', date: '2026-08-10', description: 'ECS NHB HOME LOAN EMI', amount: 28600, category: 'Loan', direction: 'debit' },
      { id: 'tx-209', date: '2026-08-15', description: 'SIP GREENWOOD BALANCED FUND', amount: 10000, category: 'Investment', direction: 'debit' },
      { id: 'tx-210', date: '2026-08-18', description: 'STREAMFLIX MONTHLY SUB', amount: 699, category: 'Subscription', direction: 'debit' },
      { id: 'tx-211', date: '2026-08-25', description: 'CITY POWER ELEC BILL', amount: 2420, category: 'Utility', direction: 'debit' },
      { id: 'tx-212', date: '2026-09-04', description: 'ACH DEBIT ABC LIFE INS PREM', amount: 4250, category: 'Insurance', direction: 'debit' },
      { id: 'tx-213', date: '2026-09-10', description: 'ECS NHB HOME LOAN EMI', amount: 28600, category: 'Loan', direction: 'debit' },
      { id: 'tx-214', date: '2026-09-15', description: 'SIP GREENWOOD BALANCED FUND', amount: 10000, category: 'Investment', direction: 'debit' },
    ],
    details: {
      accountNumber: '••••••••3456',
      ifsc: 'HDFC0001248',
      branch: 'Bandra West, Mumbai',
      statementPeriod: '01 Jul 2026 – 30 Sep 2026',
      closingBalance: '₹ 4,12,800',
    },
    rawText: `HDFC BANK STATEMENT Q2
Account Number: 50100492833456
Customer: Zahid Hamdule
Period: 01/07/2026 to 30/09/2026
...`,
  },
  {
    id: 'doc-demo-003',
    name: '03_ABC_Life_Insurance_Policy.pdf',
    type: 'insurance_policy',
    typeLabel: 'Insurance Policy',
    size: 3.4 * 1024 * 1024,
    sizeFormatted: '3.4 MB',
    timestamp: '26 Sept 2026, 02:52 PM',
    status: 'completed',
    statusLabel: 'Processed',
    confidence: 0.99,
    summary: {
      accountCount: 1,
      transactionCount: 0,
      entityCount: 3,
    },
    policyDetails: {
      institution: 'ABC Life Insurance Co.',
      planName: 'ABC Term Advantage Protection Plus',
      policyNumber: 'POL-8892147',
      policyHolder: 'Zahid Hamdule',
      nominee: 'Fatima Hamdule (Wife - 100% Share)',
      sumAssured: '₹ 50,00,000',
      premium: '₹ 4,250',
      frequency: 'Monthly (ECS / Auto-debit)',
      commencementDate: '04 Apr 2021',
      maturityDate: '04 Apr 2046',
      status: 'Active / In Force',
      benefits: ['Accidental Death Benefit: ₹ 25,00,000', 'Terminal Illness Accelerator Rider', 'Tax Benefit u/s 80C'],
    },
    entities: [
      {
        id: 'ent-301',
        institution: 'ABC Life Insurance Co.',
        category: 'Insurance Policy',
        role: 'Issuing Insurer',
        accountReference: 'Policy # POL-8892147',
        balance: '₹ 50,00,000',
        amountLabel: 'Sum Assured',
        isPrimary: true,
      },
      {
        id: 'ent-302',
        institution: 'Zahid Hamdule',
        category: 'Life Assured',
        role: 'Policyholder',
        accountReference: 'Primary Insured',
        balance: '₹ 4,250 / mo',
        amountLabel: 'Monthly Premium',
        isPrimary: false,
      },
      {
        id: 'ent-303',
        institution: 'Fatima Hamdule',
        category: 'Nominee',
        role: 'Beneficiary (100%)',
        accountReference: 'Relationship: Spouse',
        balance: '100% Share',
        amountLabel: 'Nomination',
        isPrimary: false,
      },
    ],
    transactions: [],
    details: {
      policyNumber: 'POL-8892147',
      policyHolder: 'Zahid Hamdule',
      sumAssured: '₹ 50,00,000',
      premium: '₹ 4,250 (Monthly)',
      nominee: 'Fatima Hamdule',
    },
    rawText: `ABC LIFE INSURANCE COMPANY LIMITED
Policy Schedule & Certificate
Policy Number: POL-8892147
Life Assured: Zahid Hamdule
Sum Assured: INR 50,00,000
Monthly Premium: INR 4,250.00
Nominee: Fatima Hamdule (Spouse, 100%)
Commencement: 04/04/2021`,
  },
  {
    id: 'doc-demo-004',
    name: '04_NHB_Home_Loan_Statement.pdf',
    type: 'loan_statement',
    typeLabel: 'Loan Statement',
    size: 1.8 * 1024 * 1024,
    sizeFormatted: '1.8 MB',
    timestamp: '26 Sept 2026, 02:52 PM',
    status: 'completed',
    statusLabel: 'Processed',
    confidence: 0.97,
    summary: {
      accountCount: 1,
      transactionCount: 6,
      entityCount: 3,
    },
    loanDetails: {
      institution: 'National Housing Bank (Summit Branch)',
      loanAccount: 'HL-49920199',
      borrower: 'Zahid Hamdule',
      coBorrower: 'Fatima Hamdule',
      sanctionedPrincipal: '₹ 40,00,000',
      outstandingPrincipal: '₹ 32,45,000',
      emiAmount: '₹ 28,600',
      interestRate: '8.45% p.a. (Floating)',
      tenureMonths: '240 Months (168 remaining)',
      nextDueDate: '10 Oct 2026',
    },
    entities: [
      {
        id: 'ent-401',
        institution: 'National Housing Bank',
        category: 'Home Loan',
        role: 'Lending Institution',
        accountReference: 'Loan A/c • HL-49920199',
        balance: '₹ 32,45,000',
        amountLabel: 'Outstanding Balance',
        isPrimary: true,
      },
      {
        id: 'ent-402',
        institution: 'Monthly EMI Repayment',
        category: 'Loan EMI',
        role: 'Auto-Debit HDFC Bank',
        accountReference: 'Due 10th of every month',
        balance: '₹ 28,600',
        amountLabel: 'Monthly EMI',
        isPrimary: false,
      },
      {
        id: 'ent-403',
        institution: 'Property Collateral',
        category: 'Collateral / Asset',
        role: 'Primary Mortgage',
        accountReference: 'Flat 402, Palm View Heights, Mumbai',
        balance: 'Sanctioned ₹ 40,00,000',
        amountLabel: 'Original Sanction',
        isPrimary: false,
      },
    ],
    transactions: [
      { id: 'tx-401', date: '2026-04-10', description: 'EMI PAYMENT RECEIVED ECS', amount: 28600, category: 'Loan', direction: 'credit' },
      { id: 'tx-402', date: '2026-05-10', description: 'EMI PAYMENT RECEIVED ECS', amount: 28600, category: 'Loan', direction: 'credit' },
      { id: 'tx-403', date: '2026-06-10', description: 'EMI PAYMENT RECEIVED ECS', amount: 28600, category: 'Loan', direction: 'credit' },
      { id: 'tx-404', date: '2026-07-10', description: 'EMI PAYMENT RECEIVED ECS', amount: 28600, category: 'Loan', direction: 'credit' },
      { id: 'tx-405', date: '2026-08-10', description: 'EMI PAYMENT RECEIVED ECS', amount: 28600, category: 'Loan', direction: 'credit' },
      { id: 'tx-406', date: '2026-09-10', description: 'EMI PAYMENT RECEIVED ECS', amount: 28600, category: 'Loan', direction: 'credit' },
    ],
    details: {
      loanAccount: 'HL-49920199',
      borrower: 'Zahid Hamdule',
      outstanding: '₹ 32,45,000',
      emi: '₹ 28,600',
      interestRate: '8.45%',
    },
    rawText: `NATIONAL HOUSING BANK
Annual Loan Statement
Loan Account: HL-49920199
Borrower: Zahid Hamdule
Sanctioned Amount: INR 40,00,000
Outstanding Principal as of 10/09/2026: INR 32,45,000
Monthly EMI: INR 28,600 (Rate: 8.45% Floating)`,
  },
];
