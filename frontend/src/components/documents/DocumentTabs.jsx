import React from 'react';
import { Layers, FileSpreadsheet, Eye, FileCode, Info } from 'lucide-react';

/**
 * DocumentTabs Component
 * Navigation tabs for the selected document's individual analysis.
 */
export default function DocumentTabs({ activeTab, onTabChange, transactionCount = 0 }) {
  const tabs = [
    {
      id: 'extracted',
      label: 'Extracted Information',
      icon: <Layers size={15} />,
    },
    {
      id: 'transactions',
      label: transactionCount > 0 ? `Transactions (${transactionCount})` : 'Transactions',
      icon: <FileSpreadsheet size={15} />,
    },
    {
      id: 'preview',
      label: 'Document Preview',
      icon: <Eye size={15} />,
    },
    {
      id: 'raw_text',
      label: 'Raw Text',
      icon: <FileCode size={15} />,
    },
    {
      id: 'processing',
      label: 'Processing Details',
      icon: <Info size={15} />,
    },
  ];

  return (
    <nav className="doc-analysis-tabs-bar" aria-label="Individual Document Tabs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`doc-analysis-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={isActive}
            id={`tab-doc-${tab.id}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
