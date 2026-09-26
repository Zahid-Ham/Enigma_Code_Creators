# FINCLOSURE

## AI-Powered Financial Estate Discovery & Closure Platform

> **Don't just tell families what they have. Help them discover what they may have missed — and guide them until it is closed.**

---

## Team

**Team Name:** Code_Creators

| Role | Team Member |
|---|---|
| Team Leader | **Zahid Hamdule** |
| Team Member | **Mohammed Saad Ansari** |
| Team Member | **Abdul Rehman Khan** |
| Team Member | **Haroon Mahableshwarwala** |

---

## Problem Statement

### ENIGMA 5.0 — GENESIS

**Problem Statement 1: Digital Estate & Financial Closure Assistant for Grieving Families**

When a person passes away, their family may inherit a fragmented financial life consisting of forgotten insurance policies, unclaimed deposits, EPF/PPF balances, active loan EMIs, subscriptions, and financial accounts with missing or outdated nominee information.

The family may also have to deal with separate, paperwork-heavy processes across banks, insurers, investment platforms, and other financial institutions.

The core challenge is therefore not only paperwork.

### The deeper problem

**The family may not even know what financial assets or liabilities existed.**

A conventional checklist-based application would ask:

> "Which bank accounts did the person have?"  
> "Which insurance policies did they have?"

But this assumes the family already knows the answer.

**FINCLOSURE takes the opposite approach.**

It starts with whatever fragments the family has — such as bank statements, insurance documents, loan documents, emails, salary slips, and other financial records — and uses AI to reconstruct the person's financial footprint.

---

# Solution

## FINCLOSURE

FINCLOSURE is an AI-powered **Financial Estate Discovery and Closure Platform**.

It transforms fragmented financial evidence into a structured, understandable, and actionable financial estate.

### Core transformation

```text
Financial Fragments
        ↓
AI Document Intelligence
        ↓
Financial Entity Extraction
        ↓
Cross-Document Linking
        ↓
Financial Estate Twin
        ↓
Estate Radar
        ↓
Verification
        ↓
Claim / Closure Guidance
        ↓
Tracking & Blocker Detection
        ↓
Closure
```

---

# Key Features

## 1. AI Financial Document Intelligence

Users can upload relevant financial documents such as:

- Bank statements
- Insurance policies
- Loan statements
- Investment statements
- Payslips
- Tax-related financial documents
- Scanned financial documents
- Relevant document/email exports

The system extracts useful financial information such as:

- Institution
- Account/policy references
- Financial product type
- Amounts
- Recurring transactions
- EMIs
- Insurance premiums
- Nominee information
- Relevant dates
- Evidence and source location

Large documents are processed in stages instead of blindly sending an entire document to an LLM.

```text
PDF / Image
    ↓
Text / Table Extraction
    ↓
Relevant Page Detection
    ↓
Chunking
    ↓
Groq-powered Structured Extraction
    ↓
Validation
    ↓
Financial Estate
```

---

## 2. Estate Radar

### Our primary differentiator

FINCLOSURE does not assume that the family already knows every financial relationship.

It looks for evidence of potential financial assets and liabilities.

### Example

A bank statement contains:

```text
ABC LIFE INSURANCE    ₹4,250
ABC LIFE INSURANCE    ₹4,250
ABC LIFE INSURANCE    ₹4,250
```

But the family has not uploaded any corresponding insurance policy.

FINCLOSURE can identify:

```text
Potential Missing Financial Asset

Evidence:
Recurring insurance premium

Source:
Bank Statement — Page 12

Matching Policy:
Not found

Status:
Verification Required
```

The application does not present an AI inference as a confirmed fact.

Every inferred finding is associated with its evidence, source, and confidence.

---

## 3. Financial Estate Twin

The platform converts scattered documents into one connected representation of a person's financial life.

```text
                    PERSON
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      ASSETS       LIABILITIES     SERVICES
        │              │              │
     ┌──┼──┐        ┌──┼──┐        ┌──┼──┐
     ↓  ↓  ↓        ↓  ↓  ↓        ↓  ↓  ↓
   Bank LIC EPF   Home Car CC     OTT ISP ...
```

Each item can have a transparent state:

- Verified
- Inferred
- Missing
- Unverified
- In Progress
- Blocked
- Completed

This gives the family one clear view of the financial estate instead of a collection of disconnected documents.

---

## 4. Claim Readiness Engine

Once an item is discovered, FINCLOSURE determines what is needed to move it forward.

For example:

```text
Life Insurance

✓ Policy identified
✓ Policy document available
✓ Nominee identified
✓ Death certificate available
⚠ Claim form missing

NEXT ACTION:
Complete the claim form
```

The system can connect the financial item to the appropriate institution or official process.

FINCLOSURE is an orchestration and guidance layer. It does not falsely claim universal direct access to private institutional systems.

---

## 5. Closure Autopilot

FINCLOSURE goes beyond generating a checklist.

It determines:

- What has been discovered?
- What has been verified?
- What documents are missing?
- What is blocking progress?
- What should happen next?
- Who needs to act?
- What is still unresolved?

Example:

```text
TODAY'S PRIORITIES

1. Verify suspected insurance policy
2. Initiate bank claim
3. Verify nominee information
4. Review outstanding loan
5. Review recurring financial obligations
```

The objective is to move the estate from:

**Unknown → Discovered → Actionable → Closed**

---

## 6. Closure Tracking & Timeline

Every financial item becomes a trackable workflow.

### Example: Insurance

```text
Discovered
    ↓
Verified
    ↓
Documents Ready
    ↓
Claim Prepared
    ↓
Claim Submitted
    ↓
Additional Document Requested
    ↓
Under Review
    ↓
Settled
```

The user can update statuses and upload evidence such as:

- Claim acknowledgements
- Institution emails
- Request letters
- Status documents

Where appropriate, AI can extract status, dates, reference numbers, and requested documents from uploaded evidence.

---

## 7. Blocker Detection

Instead of showing only:

> "Claim Pending"

FINCLOSURE explains why.

Example:

```text
Insurance Claim
STATUS: BLOCKED

Missing:
Legal-heir document

Already available:
✓ Death certificate
✓ Policy document
✓ KYC
```

The user immediately knows what prevents closure.

---

## 8. Estate Closure Score

The platform calculates overall progress using the actual state of the estate.

Example:

```text
ESTATE CLOSURE
74%

Asset Discovery       91%
Documentation         76%
Nominee Readiness     82%
Claim Readiness       61%
Liability Closure     54%
```

The score is derived from the real workflow state rather than hardcoded demo values.

---

## 9. Estate Preparation Mode

FINCLOSURE is not limited to post-death situations.

A person can proactively organize their own financial estate while alive.

### Preparation flow

```text
Create Financial Estate
        ↓
Upload Financial Documents
        ↓
AI Organization
        ↓
Review & Confirm
        ↓
Nominee Health Check
        ↓
Documentation Readiness
        ↓
Prepared Financial Estate
```

This allows an individual to leave behind an organized financial record that can later help authorized family members, subject to applicable access and legal requirements.

---

# India-Specific Financial Ecosystem

FINCLOSURE is designed around the reality that financial information and claim processes are fragmented across different institutions and official systems.

Examples include:

### RBI UDGAM

A centralized search facility for unclaimed deposits/accounts across participating banks.

FINCLOSURE can guide users toward the appropriate search and claim pathway instead of pretending it directly settles claims.

### EPFO

Provides facilities and workflows related to death claims by nominees/family members.

FINCLOSURE can identify an EPF relationship and guide the user toward the relevant claim process.

### IEPF

Provides formal processes for eligible unpaid amounts and shares transferred to the Investor Education and Protection Fund.

FINCLOSURE can identify investment-related evidence and guide the user toward the relevant recovery process.

### Insurance / IRDAI Ecosystem

Insurance claims and unclaimed amounts involve insurer-level processes and IRDAI-supported mechanisms.

FINCLOSURE acts as an orchestration layer that helps users understand which pathway is relevant.

> **Important:** FINCLOSURE does not claim universal access to private bank, insurer, EPFO, investment, or government databases. Where public APIs are unavailable, the hackathon prototype uses guided workflows and clearly labeled simulated/demo data.

---

# Two Product Modes

## A. Prepare My Estate

For individuals who want to organize their financial life proactively.

```text
User
 ↓
Upload Financial Information
 ↓
AI Organizes Estate
 ↓
Nominee & Document Checks
 ↓
Estate Readiness
```

## B. Handle an Estate

For authorized family members/representatives handling a deceased person's financial affairs.

```text
Family Fragments
 ↓
AI Reconstruction
 ↓
Estate Radar
 ↓
Potential Missing Assets
 ↓
Verification
 ↓
Claim / Closure Guidance
 ↓
Tracking
 ↓
Closure
```

Both modes use the same underlying **Financial Estate** model.

---

# Technology Stack

## Frontend

- **React**
- **JavaScript**
- Responsive UI
- Accessible component-based architecture

## Backend

- **Python**
- **FastAPI**
- REST API architecture
- Pydantic validation

## Database & Storage

- **Firebase Firestore** — structured application data
- **Firebase Storage** — uploaded documents
- **Firebase Authentication** — optional for the MVP / later integration

## AI

- **Groq API**
- LLM-powered structured document extraction
- Financial entity interpretation
- Evidence-based discovery
- Action generation

## Document Processing

- PDF text/table extraction
- OCR fallback for scanned documents
- Relevance detection
- Chunked processing
- Structured output validation

---

# System Architecture

```text
                    REACT + JAVASCRIPT
                          │
                          │ REST API
                          ↓
                    FASTAPI / PYTHON
                          │
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
 Document Processing  Estate Engine    Tracking Engine
        │                 │                 │
        ↓                 ↓                 ↓
       Groq          Financial Estate   Workflow State
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ↓
                 FIREBASE FIRESTORE
                          │
                          ↓
                 FIREBASE STORAGE
```

---

# Example End-to-End Flow

```text
1. Family uploads a bank statement
                ↓
2. FINCLOSURE extracts transactions
                ↓
3. Recurring financial relationships detected
                ↓
4. Insurance premium detected
                ↓
5. No matching policy document found
                ↓
6. Estate Radar raises a potential missing asset
                ↓
7. Evidence and confidence are shown
                ↓
8. User verifies the finding
                ↓
9. FINCLOSURE recommends the relevant official/institutional route
                ↓
10. Required action/documents are generated
                ↓
11. User tracks the claim/closure workflow
                ↓
12. Blockers are surfaced
                ↓
13. Item is marked settled/closed
```

---

# Design Philosophy

FINCLOSURE is intentionally designed to feel like a real product rather than a generic AI/vibe-coded dashboard.

### UI principles

- Calm
- Trustworthy
- Accessible
- Clear information hierarchy
- Strong typography
- Consistent spacing
- Purposeful interactions
- Visual restraint
- Responsive
- Production-oriented

### We intentionally avoid

- Neon color schemes
- Excessive gradients
- Glassmorphism
- Glowing effects
- Dark-mode-by-default aesthetics
- Excessive rounded cards
- Decorative blobs
- Emoji-based interfaces
- Excessive animation
- Visual clutter
- Generic AI SaaS patterns
- Components that exist only for decoration

The interface should prioritize clarity, empathy, usability, typography, whitespace, and meaningful information visualization.

---

# Project Setup

## Prerequisites

Install:

- Node.js
- npm
- Python 3.10+
- Git

Create a Firebase project and configure:

- Firestore
- Firebase Storage
- Firebase Authentication if enabled

Create a Groq API key and store it securely in environment variables.

---

## Clone the Repository

```bash
git clone <repository-url>
cd <repository-folder>
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Backend Setup

```bash
cd backend

python -m venv .venv
```

### Windows PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI:

```bash
uvicorn main:app --reload
```

---

# Environment Variables

Never commit API keys or secrets to GitHub.

Example backend `.env`:

```env
GROQ_API_KEY=your_groq_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
```

Use environment variables or secure credential files for Firebase configuration.

---

# Repository Structure

The implementation will follow a modular structure similar to:

```text
FINCLOSURE/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── api/
│   ├── services/
│   ├── models/
│   ├── utils/
│   ├── tests/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── context.md
├── README.md
└── .gitignore
```

---

# Development Rules

This project follows the official hackathon repository and development rules.

1. Repository name must start with:

```text
Enigma_TeamName
```

For this project, the final repository name should follow the required convention using the official team name.

2. All team members should add:

```text
csisiesgst
```

as a collaborator.

3. The repository should be created only after **9:00 AM on the hackathon start time**, as required by the event rules.

4. **No pre-developed websites/projects are allowed.** The implementation must be created freshly during the hackathon.

5. **All commits must be pushed to GitHub before submission time.**

6. README must contain:
- Team Name & Members
- Problem Statement
- Tech Stack
- Setup Instructions
- Development Rules

7. Only **open-source libraries and frameworks** may be used. No paid templates or paid plugins.

8. **AI-generated code/tools are allowed only if acknowledged in the README.**

9. Plagiarism from GitHub or other hackathons is strictly prohibited.

10. UI assets such as icons and images must be free-to-use or properly licensed.

---

# AI Assistance Acknowledgment

This project uses AI-assisted development tools during the hackathon.

AI tools may be used for:
- code generation assistance
- debugging assistance
- documentation assistance
- brainstorming and architectural discussion
- UI ideation
- development guidance

The final architecture, implementation decisions, testing, integration, and project submission are performed and reviewed by the team.

The team acknowledges the use of AI-assisted development tools in accordance with the hackathon rules.

---

# Hackathon Development Philosophy

Because the prototype is being developed within a limited hackathon timeframe, the focus is on a strong end-to-end vertical slice rather than attempting every possible integration.

### Priority

```text
Document Intelligence
        ↓
Estate Radar
        ↓
Financial Estate Twin
        ↓
Claim / Closure Workflow
        ↓
Tracking
        ↓
Polished User Experience
```

### Scope intentionally excluded from the MVP

- Universal real-bank integration
- Universal government API integration
- Automatic claim settlement
- Automatic service cancellation
- Complex blockchain infrastructure
- Complex cryptography
- Enterprise-scale distributed infrastructure
- Unsupported claims of complete financial-account discovery

---

# Data Integrity & Responsible AI

FINCLOSURE distinguishes between:

- **Verified information**
- **User-provided information**
- **AI-derived inference**
- **Potential financial lead**
- **Unverified information**

The system should always preserve the source evidence behind an AI-derived discovery wherever possible.

Example:

```text
Potential Missing Insurance

Evidence:
Bank Statement — Page 12

Detected:
Recurring ABC Life premium

Matching policy:
Not found

Confidence:
87%

Recommended action:
Verify policy existence
```

FINCLOSURE should never present an inference as a confirmed financial fact without supporting evidence.

---

# Future Scope

Future versions can explore:

- More authorized institutional integrations
- Secure document sharing with legal/financial professionals
- Advanced entity resolution
- Better OCR/document understanding
- Multi-family-member collaboration
- Institution-specific workflow templates
- More sophisticated financial-asset discovery
- Notifications and deadline reminders
- Consent-based integrations with additional financial services
- Secure export of a complete financial estate package

---

# Vision

FINCLOSURE aims to transform financial estate management from a fragmented, paperwork-heavy experience into a structured, evidence-driven and actionable journey.

### The goal is simple:

> **Discover what may exist. Understand what it means. Act on what matters. Track what remains. Close the estate.**

---

## Team

**Zahid Hamdule** — Team Leader  
**Mohammed Saad Ansari**  
**Abdul Rehman Khan**  
**Haroon Mahableshwarwala**

---

Built for **ENIGMA 5.0 — GENESIS: BEYOND THE FUTURE**
