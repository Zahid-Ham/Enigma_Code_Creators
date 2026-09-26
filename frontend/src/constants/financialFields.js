/**
 * Financial Semantic Field Definitions and Mappings
 * FINCLOSURE Document Intelligence & Estate Twin
 */

export const ENTITY_FIELD_LABELS = {
  bank_account: {
    holder: 'Account Holder',
    reference: 'Account Number / Reference',
  },

  insurance: {
    holder: 'Life Assured / Policy Holder',
    reference: 'Policy Number / Account Reference',
  },

  investment: {
    holder: 'Investor / Holder',
    reference: 'Investment Reference',
  },

  fixed_deposit: {
    holder: 'Account Holder',
    reference: 'FD Number / Reference',
  },

  epf: {
    holder: 'Account Holder',
    reference: 'UAN / Account Reference',
  },

  ppf: {
    holder: 'Account Holder',
    reference: 'PPF Account Reference',
  },

  loan: {
    holder: 'Borrower',
    reference: 'Loan Account / Reference',
  },

  credit_card: {
    holder: 'Cardholder',
    reference: 'Card / Account Reference',
  },

  subscription: {
    holder: 'Subscriber',
    reference: 'Subscription Reference',
  },

  utility: {
    holder: 'Customer / Account Holder',
    reference: 'Customer / Account Reference',
  },

  tax: {
    holder: 'Taxpayer',
    reference: 'Tax Reference',
  },

  other: {
    holder: 'Holder',
    reference: 'Reference',
  },
};

export const SEMANTIC_AMOUNT_LABELS = {
  premium_amount: 'Premium / Installment',
  sum_assured: 'Sum Assured',
  emi_amount: 'EMI Amount',
  outstanding_amount: 'Outstanding Balance',
  investment_value: 'Current Portfolio Value',
  account_balance: 'Account Balance',
  transaction_amount: 'Observed Transaction Amount',
  subscription_amount: 'Subscription / Recurring Fee',
  maturity_amount: 'Maturity Amount',
  tax_amount: 'Tax Deducted / Paid',
  amount: 'Valuation / Amount',
};

/**
 * Normalizes an entity_type string or display name into a standardized key.
 */
export function normalizeEntityType(entityType) {
  if (!entityType) return 'other';
  const lower = entityType.toLowerCase().trim();
  if (ENTITY_FIELD_LABELS[lower]) return lower;

  if (lower.includes('insurance') || lower.includes('policy')) return 'insurance';
  if (lower.includes('fixed_deposit') || lower.includes('fd')) return 'fixed_deposit';
  if (lower.includes('epf') || lower.includes('provident')) return 'epf';
  if (lower.includes('ppf')) return 'ppf';
  if (lower.includes('bank') || lower.includes('savings') || lower.includes('current')) return 'bank_account';
  if (
    lower.includes('loan') ||
    lower.includes('mortgage') ||
    lower.includes('housing') ||
    lower.includes('debt') ||
    lower.includes('emi')
  )
    return 'loan';
  if (lower.includes('credit_card') || lower.includes('credit card') || lower.includes('card')) return 'credit_card';
  if (lower.includes('subscription') || lower.includes('recurring') || lower.includes('streamflix') || lower.includes('ott'))
    return 'subscription';
  if (lower.includes('utility') || lower.includes('bill') || lower.includes('electricity') || lower.includes('water'))
    return 'utility';
  if (
    lower.includes('investment') ||
    lower.includes('mutual') ||
    lower.includes('stock') ||
    lower.includes('equity') ||
    lower.includes('demat') ||
    lower.includes('folio')
  )
    return 'investment';
  if (lower.includes('tax') || lower.includes('income_tax') || lower.includes('tds')) return 'tax';

  return 'other';
}

/**
 * Returns the semantic field labels (holder, reference) for a given entity type.
 */
export function getEntityLabels(entityType) {
  const norm = normalizeEntityType(entityType);
  return ENTITY_FIELD_LABELS[norm] || ENTITY_FIELD_LABELS.other;
}

/**
 * Resolves the primary and secondary amounts for an entity with strict semantic correctness.
 * Prevents conflating recurring premiums or transactions with total valuation / sum assured.
 */
export function getEntitySemanticAmounts(entity) {
  if (!entity) return [];

  const amounts = [];
  const curr = entity.currency || 'INR';

  // 1. Insurance specific
  if (entity.sum_assured !== null && entity.sum_assured !== undefined) {
    amounts.push({
      label: 'Sum Assured',
      value: entity.sum_assured,
      currency: curr,
      highlight: true,
    });
  }

  if (entity.premium_amount !== null && entity.premium_amount !== undefined) {
    amounts.push({
      label: 'Premium Amount',
      value: entity.premium_amount,
      currency: curr,
      highlight: false,
    });
  }

  // 2. Loans / Liabilities
  if (entity.outstanding_amount !== null && entity.outstanding_amount !== undefined) {
    amounts.push({
      label: 'Outstanding Amount',
      value: entity.outstanding_amount,
      currency: curr,
      highlight: true,
    });
  }

  if (entity.emi_amount !== null && entity.emi_amount !== undefined) {
    amounts.push({
      label: 'EMI Amount',
      value: entity.emi_amount,
      currency: curr,
      highlight: false,
    });
  }

  // 3. Investments / Deposits
  if (entity.investment_value !== null && entity.investment_value !== undefined) {
    amounts.push({
      label: 'Investment Value',
      value: entity.investment_value,
      currency: curr,
      highlight: true,
    });
  }

  if (entity.maturity_amount !== null && entity.maturity_amount !== undefined) {
    amounts.push({
      label: 'Maturity Amount',
      value: entity.maturity_amount,
      currency: curr,
      highlight: false,
    });
  }

  // 4. Banking / Balances
  if (entity.account_balance !== null && entity.account_balance !== undefined) {
    amounts.push({
      label: 'Account Balance',
      value: entity.account_balance,
      currency: curr,
      highlight: true,
    });
  }

  // 5. Transactions / Subscriptions / Tax
  if (entity.transaction_amount !== null && entity.transaction_amount !== undefined) {
    amounts.push({
      label: 'Transaction Amount',
      value: entity.transaction_amount,
      currency: curr,
      highlight: false,
    });
  }

  if (entity.subscription_amount !== null && entity.subscription_amount !== undefined) {
    amounts.push({
      label: 'Subscription Amount',
      value: entity.subscription_amount,
      currency: curr,
      highlight: false,
    });
  }

  if (entity.tax_amount !== null && entity.tax_amount !== undefined) {
    amounts.push({
      label: 'Tax Amount',
      value: entity.tax_amount,
      currency: curr,
      highlight: false,
    });
  }

  // Fallback to generic amount only if no specific semantic amounts are present
  if (amounts.length === 0 && entity.amount !== null && entity.amount !== undefined) {
    const type = normalizeEntityType(entity.entity_type);
    let label = 'Valuation / Amount';
    if (type === 'loan') {
      label = 'EMI Amount';
    } else if (type === 'subscription') {
      label = 'Subscription Amount';
    } else if (type === 'bank_account') {
      label = 'Account Balance';
    } else if (type === 'insurance') {
      label = 'Premium Amount';
    }

    amounts.push({
      label,
      value: entity.amount,
      currency: curr,
      highlight: type === 'bank_account' || type === 'investment',
    });
  }

  return amounts;
}

/**
 * Resolves all key-value rows to render inside an entity breakdown card.
 * Respects strict semantic correctness and hides non-applicable fields.
 */
export function getEntityCardFields(entity, evidence = [], formatCurrency = (v) => v) {
  if (!entity) return [];

  const normType = normalizeEntityType(entity.entity_type || entity.display_name);
  const labels = getEntityLabels(normType);

  // Helper to extract evidence value by field keywords
  const findEvidenceVal = (keywords) => {
    if (!evidence || evidence.length === 0) return null;
    const match = evidence.find((ev) => {
      const f = (ev.field || '').toLowerCase();
      return keywords.some((k) => f.includes(k));
    });
    return match ? match.value : null;
  };

  // Holder resolution
  const holderVal =
    entity.holder_name ||
    entity.holder ||
    findEvidenceVal(['assured', 'holder', 'insured', 'borrower', 'subscriber', 'client', 'taxpayer', 'name']) ||
    'Not detected';

  // Maturity resolution
  const maturityVal =
    entity.maturity_date ||
    findEvidenceVal(['maturity', 'expiry', 'validity', 'end_date']) ||
    'Not detected';

  // Nominee resolution
  let nomineeVal = null;
  const nomEvidence = findEvidenceVal(['nominee', 'beneficiary']);
  if (nomEvidence) {
    nomineeVal = nomEvidence;
  } else if (entity.nominees && entity.nominees.length > 0) {
    nomineeVal = entity.nominees.map((n) => n.name || n.nominee_name).filter(Boolean).join(', ');
  } else if (entity.nominee_status && entity.nominee_status !== 'unverified' && entity.nominee_status !== 'none') {
    nomineeVal = `${entity.nominee_status}`;
  }

  const fields = [];

  // 1. Institution Name (applicable to all)
  const instLabel = normType === 'tax' ? 'Institution / Authority' : 'Institution Name';
  fields.push({
    label: instLabel,
    value: entity.institution_name || 'Not detected',
    isEmpty: !entity.institution_name,
  });

  // 2. Account / Policy / Loan / Subscription Reference (applicable to all)
  fields.push({
    label: labels.reference,
    value: entity.account_reference || 'Not detected',
    isEmpty: !entity.account_reference,
  });

  // 3. Holder / Borrower / Subscriber / Life Assured (applicable to all)
  fields.push({
    label: labels.holder,
    value: holderVal,
    isEmpty: holderVal === 'Not detected',
  });

  // 4. Entity-specific amounts and attributes
  switch (normType) {
    case 'insurance': {
      // Premium Amount
      const premVal =
        entity.premium_amount !== null && entity.premium_amount !== undefined
          ? formatCurrency(entity.premium_amount, entity.currency)
          : entity.amount !== null && entity.amount !== undefined && !entity.sum_assured
          ? formatCurrency(entity.amount, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'Premium Amount',
        value: premVal,
        isEmpty: premVal === 'Not detected',
      });

      // Sum Assured
      const sumVal =
        entity.sum_assured !== null && entity.sum_assured !== undefined
          ? formatCurrency(entity.sum_assured, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'Sum Assured',
        value: sumVal,
        isEmpty: sumVal === 'Not detected',
        highlight: sumVal !== 'Not detected',
      });

      // Payment Frequency
      fields.push({
        label: 'Payment Frequency',
        value: entity.frequency || 'Not detected',
        isEmpty: !entity.frequency,
      });

      // Maturity Date
      fields.push({
        label: 'Maturity Date',
        value: maturityVal,
        isEmpty: maturityVal === 'Not detected',
      });

      // Nominee
      fields.push({
        label: 'Nominee',
        value: nomineeVal || 'No nominee information is present',
        isEmpty: !nomineeVal,
      });
      break;
    }

    case 'loan': {
      // EMI Amount
      const emiVal =
        entity.emi_amount !== null && entity.emi_amount !== undefined
          ? formatCurrency(entity.emi_amount, entity.currency)
          : entity.amount !== null && entity.amount !== undefined && !entity.outstanding_amount
          ? formatCurrency(entity.amount, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'EMI Amount',
        value: emiVal,
        isEmpty: emiVal === 'Not detected',
      });

      // Payment Frequency
      fields.push({
        label: 'Payment Frequency',
        value: entity.frequency || 'Monthly',
        isEmpty: !entity.frequency,
      });

      // Outstanding Amount
      const outVal =
        entity.outstanding_amount !== null && entity.outstanding_amount !== undefined
          ? formatCurrency(entity.outstanding_amount, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'Outstanding Amount',
        value: outVal,
        isEmpty: outVal === 'Not detected',
        highlight: outVal !== 'Not detected',
      });
      break;
    }

    case 'subscription': {
      // Subscription Amount
      const subVal =
        entity.subscription_amount !== null && entity.subscription_amount !== undefined
          ? formatCurrency(entity.subscription_amount, entity.currency)
          : entity.amount !== null && entity.amount !== undefined
          ? formatCurrency(entity.amount, entity.currency)
          : entity.transaction_amount !== null && entity.transaction_amount !== undefined
          ? formatCurrency(entity.transaction_amount, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'Subscription Amount',
        value: subVal,
        isEmpty: subVal === 'Not detected',
      });

      // Payment Frequency
      fields.push({
        label: 'Payment Frequency',
        value: entity.frequency || 'Monthly',
        isEmpty: !entity.frequency,
      });
      break;
    }

    case 'bank_account': {
      // Account Balance
      const balVal =
        entity.account_balance !== null && entity.account_balance !== undefined
          ? formatCurrency(entity.account_balance, entity.currency)
          : entity.amount !== null && entity.amount !== undefined
          ? formatCurrency(entity.amount, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'Account Balance',
        value: balVal,
        isEmpty: balVal === 'Not detected',
        highlight: balVal !== 'Not detected',
      });

      if (entity.frequency) {
        fields.push({
          label: 'Frequency',
          value: entity.frequency,
          isEmpty: false,
        });
      }
      break;
    }

    case 'fixed_deposit': {
      // Deposit Amount
      const depVal =
        entity.amount !== null && entity.amount !== undefined
          ? formatCurrency(entity.amount, entity.currency)
          : entity.investment_value !== null && entity.investment_value !== undefined
          ? formatCurrency(entity.investment_value, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'Deposit Amount',
        value: depVal,
        isEmpty: depVal === 'Not detected',
      });

      // Maturity Amount
      const matAmtVal =
        entity.maturity_amount !== null && entity.maturity_amount !== undefined
          ? formatCurrency(entity.maturity_amount, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'Maturity Amount',
        value: matAmtVal,
        isEmpty: matAmtVal === 'Not detected',
        highlight: matAmtVal !== 'Not detected',
      });

      // Maturity Date
      fields.push({
        label: 'Maturity Date',
        value: maturityVal,
        isEmpty: maturityVal === 'Not detected',
      });

      if (nomineeVal) {
        fields.push({
          label: 'Nominee',
          value: nomineeVal,
          isEmpty: false,
        });
      }
      break;
    }

    case 'epf': {
      // Balance / Value
      const epfVal =
        entity.account_balance !== null && entity.account_balance !== undefined
          ? formatCurrency(entity.account_balance, entity.currency)
          : entity.investment_value !== null && entity.investment_value !== undefined
          ? formatCurrency(entity.investment_value, entity.currency)
          : entity.amount !== null && entity.amount !== undefined
          ? formatCurrency(entity.amount, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'Balance / Value',
        value: epfVal,
        isEmpty: epfVal === 'Not detected',
        highlight: epfVal !== 'Not detected',
      });

      if (nomineeVal) {
        fields.push({
          label: 'Nominee',
          value: nomineeVal,
          isEmpty: false,
        });
      }
      break;
    }

    case 'ppf': {
      // Account Balance
      const ppfVal =
        entity.account_balance !== null && entity.account_balance !== undefined
          ? formatCurrency(entity.account_balance, entity.currency)
          : entity.amount !== null && entity.amount !== undefined
          ? formatCurrency(entity.amount, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'Account Balance',
        value: ppfVal,
        isEmpty: ppfVal === 'Not detected',
        highlight: ppfVal !== 'Not detected',
      });

      // Maturity Date
      fields.push({
        label: 'Maturity Date',
        value: maturityVal,
        isEmpty: maturityVal === 'Not detected',
      });

      if (nomineeVal) {
        fields.push({
          label: 'Nominee',
          value: nomineeVal,
          isEmpty: false,
        });
      }
      break;
    }

    case 'credit_card': {
      // Outstanding Amount
      const ccOut =
        entity.outstanding_amount !== null && entity.outstanding_amount !== undefined
          ? formatCurrency(entity.outstanding_amount, entity.currency)
          : entity.amount !== null && entity.amount !== undefined
          ? formatCurrency(entity.amount, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'Outstanding Amount',
        value: ccOut,
        isEmpty: ccOut === 'Not detected',
        highlight: ccOut !== 'Not detected',
      });

      if (entity.transaction_amount !== null && entity.transaction_amount !== undefined) {
        fields.push({
          label: 'Payment Amount',
          value: formatCurrency(entity.transaction_amount, entity.currency),
          isEmpty: false,
        });
      }

      fields.push({
        label: 'Payment Frequency',
        value: entity.frequency || 'Monthly',
        isEmpty: false,
      });
      break;
    }

    case 'utility': {
      // Recurring Amount
      const utilVal =
        entity.subscription_amount !== null && entity.subscription_amount !== undefined
          ? formatCurrency(entity.subscription_amount, entity.currency)
          : entity.transaction_amount !== null && entity.transaction_amount !== undefined
          ? formatCurrency(entity.transaction_amount, entity.currency)
          : entity.amount !== null && entity.amount !== undefined
          ? formatCurrency(entity.amount, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'Recurring Amount',
        value: utilVal,
        isEmpty: utilVal === 'Not detected',
      });

      fields.push({
        label: 'Payment Frequency',
        value: entity.frequency || 'Monthly',
        isEmpty: false,
      });
      break;
    }

    case 'investment': {
      // Investment Value
      const invVal =
        entity.investment_value !== null && entity.investment_value !== undefined
          ? formatCurrency(entity.investment_value, entity.currency)
          : entity.amount !== null && entity.amount !== undefined
          ? formatCurrency(entity.amount, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'Investment Value',
        value: invVal,
        isEmpty: invVal === 'Not detected',
        highlight: invVal !== 'Not detected',
      });

      if (entity.transaction_amount !== null && entity.transaction_amount !== undefined) {
        fields.push({
          label: 'Transaction / SIP Amount',
          value: formatCurrency(entity.transaction_amount, entity.currency),
          isEmpty: false,
        });
      }

      if (entity.frequency) {
        fields.push({
          label: 'Frequency',
          value: entity.frequency,
          isEmpty: false,
        });
      }

      if (nomineeVal) {
        fields.push({
          label: 'Nominee',
          value: nomineeVal,
          isEmpty: false,
        });
      }
      break;
    }

    case 'tax': {
      // Tax Amount
      const taxVal =
        entity.tax_amount !== null && entity.tax_amount !== undefined
          ? formatCurrency(entity.tax_amount, entity.currency)
          : entity.amount !== null && entity.amount !== undefined
          ? formatCurrency(entity.amount, entity.currency)
          : 'Not detected';
      fields.push({
        label: 'Tax Amount',
        value: taxVal,
        isEmpty: taxVal === 'Not detected',
      });

      if (entity.tax_year || entity.frequency) {
        fields.push({
          label: 'Tax Year',
          value: entity.tax_year || entity.frequency,
          isEmpty: false,
        });
      }
      break;
    }

    default: {
      if (entity.amount !== null && entity.amount !== undefined) {
        fields.push({
          label: 'Valuation / Amount',
          value: formatCurrency(entity.amount, entity.currency),
          isEmpty: false,
          highlight: true,
        });
      }
      if (entity.frequency) {
        fields.push({
          label: 'Payment Frequency',
          value: entity.frequency,
          isEmpty: false,
        });
      }
      break;
    }
  }

  return fields;
}
