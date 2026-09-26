/**
 * Document Intake Constants & Configuration
 */

export const MAX_DOCUMENT_SIZE_MB = 20;
export const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

export const SUPPORTED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

export const SUPPORTED_DOCUMENT_TYPES = [
  {
    ext: 'PDF',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    label: 'Statements, policies, tax docs',
  },
  {
    ext: 'JPG / JPEG',
    color: '#16A34A',
    bgColor: '#DCFCE7',
    label: 'Scanned documents, images',
  },
  {
    ext: 'PNG',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    label: 'Receipts, certificates, statements',
  },
];

export const GOOD_DOCUMENTS_LIST = [
  'Bank statements',
  'Insurance policies',
  'Investment statements',
  'Tax documents (ITR, Form 16, etc.)',
  'Loan statements',
  'Utility bills and important correspondence',
];

export const DEMO_ESTATE = {
  id: 'demo-estate-001',
  name: 'Demo Estate',
  description: 'Demo estate for prototype development',
};
