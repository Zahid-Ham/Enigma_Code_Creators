# FINCLOSURE — Project Context

## 1. Project Identity

**Project Name:** FINCLOSURE  
**Working Description:** AI-Powered Financial Estate Discovery & Closure Platform

### Core Product Statement

FINCLOSURE is a privacy-conscious AI platform that helps individuals organize their financial estate while alive and helps authorized family members reconstruct, understand, and manage a deceased person's fragmented financial footprint.

The platform is designed around one central idea:

> Do not ask a family to already know what financial assets and liabilities existed. Start from the financial evidence they have, reconstruct the financial footprint, surface potential missing assets or liabilities, connect findings to the appropriate official/institutional pathway, and guide the user until the item is resolved.

The target problem is the ENIGMA 5.0 — GENESIS PS1:
**Digital Estate & Financial Closure Assistant for Grieving Families.**

The problem statement highlights forgotten insurance policies, unclaimed deposits/EPF/PPF, active loan EMIs, subscriptions, missing/outdated nominee details, and fragmented paperwork-heavy death-claim processes. The intended solution should bring clarity, organization, timely action, and support across different circumstances/stages.

---

## 2. Product Reframe

FINCLOSURE must NOT feel like:

- a generic checklist app
- a document management system
- a chatbot that gives generic financial advice
- a form where the family manually enters every account they already know about
- a fake government/bank integration
- a dashboard containing manually hardcoded AI-looking values

FINCLOSURE SHOULD feel like:

> A Financial Estate Discovery and Closure Engine.

The core transformation is:

**Evidence → Discovery → Verification → Action → Tracking → Closure**

---

## 3. Product Modes

FINCLOSURE has two connected modes using the same underlying financial-estate model.

### MODE A — Estate Preparation

For a person who is alive and wants to organize their financial estate proactively.

Purpose:
- organize financial assets and liabilities
- upload important financial documents
- record/verify nominee information
- identify documentation gaps
- identify estate-readiness issues
- create a structured financial estate that can later help authorized family members

Example:

A person uploads:
- bank statements
- insurance policies
- FD documents
- investment statements
- loan statements
- EPF/PPF information
- relevant financial documents

The system builds the person's Financial Estate Twin and gives an Estate Readiness view.

The user should be able to review and confirm extracted information.

### MODE B — Estate Recovery & Closure

For an authorized family member/representative handling a deceased person's financial affairs.

Purpose:
- upload whatever fragments the family has
- reconstruct financial relationships from those fragments
- detect possible missing financial assets/liabilities
- identify nominee/document gaps
- guide the user toward appropriate official/institutional pathways
- create claim/closure tasks
- track progress
- identify blockers and next actions
- show overall estate closure progress

Important:
The application must NOT claim that it can automatically access every bank, insurer, EPFO, IEPF, investment platform, or government database.

When an official system does not provide a suitable public API, FINCLOSURE should provide guided-assist functionality, deep links, required-information guidance, or a simulated/demo registry for the hackathon.

Never falsely claim a live integration.

---

## 4. Core Product Architecture

High-level:

React + JavaScript
        ↓
FastAPI + Python
        ↓
Firebase
 ├── Firestore
 └── Firebase Storage
        ↓
AI / Document Intelligence
        ↓
Financial Estate Engine
        ↓
Discovery + Closure + Tracking

### Frontend

- React
- JavaScript
- clean component architecture
- responsive design
- accessible UI
- production-quality visual system

Do NOT use TypeScript unless explicitly requested later.

### Backend

- Python
- FastAPI
- modular service architecture
- REST APIs
- Pydantic models
- asynchronous operations where appropriate

### Database / Storage

Use Firebase:

- Firestore for structured application data
- Firebase Storage for uploaded documents
- Firebase Authentication can be added later if needed, but is not required for the first vertical slice

### AI

Primary LLM:
- Groq API

The LLM should be used primarily for structured financial document understanding, extraction, classification, evidence interpretation, and action generation.

Do NOT rely on the LLM alone for deterministic financial calculations or state management.

---

## 5. Core Features

### 5.1 AI Financial Document Intelligence

Users can upload supported financial documents such as:

- PDF bank statements
- insurance documents
- loan documents
- investment/financial statements
- payslips
- tax-related financial documents
- scanned financial documents/images
- relevant email/document exports where practical

The pipeline should:

1. inspect the document
2. extract text and tables
3. use OCR when needed for scanned pages
4. identify financially relevant sections/pages/transactions
5. chunk large documents
6. send relevant chunks to the LLM
7. extract structured financial entities
8. preserve evidence/provenance
9. validate/normalize extracted data
10. store the result in the Financial Estate model

Never send an entire huge document blindly to the LLM if targeted extraction is practical.

---

## 6. Important Document-Processing Principle

Large documents must be handled efficiently.

Example:
A 120-page bank statement should not automatically become one giant LLM prompt.

Use a staged process:

PDF/Image
↓
Text/Table extraction
↓
Page or section relevance detection
↓
Relevant chunk extraction
↓
LLM structured extraction
↓
Validation
↓
Entity resolution
↓
Financial Estate

The LLM should return structured JSON-like data, not a prose summary.

Example entity:

{
  "institution": "ABC Life Insurance",
  "financial_product": "Life Insurance",
  "evidence_type": "recurring_premium",
  "amount": 4250,
  "frequency": "monthly",
  "policy_number": null,
  "nominee": null,
  "source_document": "bank_statement.pdf",
  "source_page": 12,
  "confidence": 0.87,
  "status": "potential_missing_asset"
}

The system should preserve:
- source document
- page number/section
- extracted value
- evidence
- confidence
- current status

This evidence chain is essential.

---

## 7. Financial Entity Types

The initial model should support:

### Assets
- bank account
- fixed deposit
- insurance policy
- EPF
- PPF
- shares/investments
- mutual funds
- other financial holdings

### Liabilities
- home loan
- car loan
- personal loan
- credit card
- other recurring debt obligations

### Recurring Financial Relationships
- insurance premium
- SIP/investment debit
- EMI
- subscription
- recurring utility or service payment

### People / Roles
- estate owner
- authorized family member
- nominee
- task assignee

---

## 8. USP 1 — Estate Radar

This is the primary differentiator.

The product should look for evidence of financial relationships that the family did not explicitly enter.

Example:

Bank statement:
“ABC LIFE INSURANCE — ₹4,250”

Repeated monthly.

No corresponding insurance policy document exists.

FINCLOSURE should surface:

**Potential Missing Financial Asset**
- Evidence: recurring insurance premium
- Source: bank statement, page N
- Matching policy document: not found
- Confidence: calculated from the actual extraction/rules/model
- Recommended next step: verify through the appropriate official/institutional pathway

Critical wording:
Use **potential / probable / requires verification**.

Never state an inferred asset as a confirmed fact unless supported by evidence.

---

## 9. USP 2 — Financial Estate Twin

The platform should convert scattered documents into a connected representation of the person's financial life.

Conceptually:

Person
├── Assets
│   ├── Bank
│   ├── Insurance
│   ├── FD
│   └── Investments
├── Liabilities
│   ├── Home Loan
│   ├── Credit Card
│   └── Personal Loan
└── Recurring Services
    ├── Insurance
    └── Subscriptions

The UI should allow users to understand:

- what is confirmed
- what is inferred
- what is missing
- what is unresolved
- what has been completed

Potential visual statuses:
- Verified
- Inferred
- Missing
- Unverified
- In Progress
- Blocked
- Completed

Use restrained visual treatment; do not make the interface look like a game.

---

## 10. USP 3 — Closure Autopilot

The system must go beyond discovering documents.

For each financial item, determine:

- current state
- missing information
- required documents
- suggested next action
- relevant official/institutional route
- whether the user has completed the action
- whether the item is blocked
- what should happen next

Example:

Insurance:
Discovered
→ Verified
→ Documents Ready
→ Claim Prepared
→ Claim Submitted
→ Additional Document Requested
→ Under Review
→ Settled

Loan:
Discovered
→ Verified
→ Outstanding Balance Confirmed
→ Closure Requested
→ Closure Confirmed

The user must be able to see the state clearly.

---

## 11. Closure Tracking System

Tracking is not meant to claim real-time institutional status unless the institution actually provides an integration.

For the hackathon MVP, use:

### User-driven updates
- Mark submitted
- Mark under review
- Mark documents requested
- Mark additional documents uploaded
- Mark approved/rejected
- Mark settled/closed

### Evidence-assisted updates
Allow the user to upload:
- acknowledgement
- claim receipt
- institution email
- request letter
- status document

The AI can extract:
- institution
- reference number
- date
- status
- requested documents
- remarks

Then update the internal timeline.

Each financial item should have a timeline:

Discovered
→ Verified
→ Documents Prepared
→ Submitted
→ Institution Response
→ Additional Documents
→ Settled/Closed

The system should show blockers.

Example:
“Insurance claim is blocked because legal-heir documentation has not been uploaded.”

---

## 12. Estate Closure Score

Create a calculated progress indicator based on actual estate state.

Possible dimensions:
- asset discovery
- documentation completeness
- nominee readiness
- claim readiness
- liability closure
- verification completeness

Example:

Estate Closure: 74%

The score must come from real application state, not hardcoded values.

---

## 13. Nominee Health Check

A financial-item-level nominee review.

Examples:
- Bank account — nominee verified
- Insurance — nominee verified
- FD — nominee unknown
- PPF — nominee information unavailable

Show:
- known
- unknown
- outdated/unverified where evidence supports that state

Do not infer legal validity without supporting information.

---

## 14. Liability Guard

The platform should not focus only on money the family may receive.

It should also surface recurring obligations or potential financial leakage.

Examples:
- EMIs
- credit-card obligations
- recurring subscriptions
- recurring insurance payments
- other recurring charges

The system should identify these and recommend review/closure.

It must NOT automatically cancel real services unless an actual authorized integration exists.

---

## 15. Evidence & Explainability

Every AI-derived discovery must have an evidence trail.

Example:

Potential Missing Insurance

Why was this detected?

Evidence:
Bank Statement — Page 12

Detected pattern:
Recurring ABC Life premium

Matching policy:
Not found

Confidence:
87%

Suggested action:
Verify policy existence

The user should be able to inspect the source.

This is a core trust feature.

---

## 16. India-Specific Ecosystem

FINCLOSURE should recognize that India's financial ecosystem is fragmented.

Important examples include:
- RBI UDGAM for unclaimed deposits at participating banks
- EPFO death-claim processes
- IEPF claim processes for eligible unpaid amounts/shares
- insurance/IRDAI-related processes and insurer-level claim procedures
- bank-specific deceased-account settlement procedures

The application should act as a discovery/orchestration layer, not pretend to replace these systems.

For hackathon demonstration:
- use real official routes as reference/links where possible
- use guided-assist flows when no public API is available
- use clearly labeled synthetic/demo registry data to demonstrate cross-registry discovery behavior

Never fabricate a government API.

---

## 17. Example End-to-End User Flow

### Preparation Mode

Home
↓
Prepare My Estate
↓
Create Financial Estate
↓
Upload documents
↓
AI extracts financial information
↓
User reviews and confirms
↓
Nominee Health Check
↓
Documentation/readiness analysis
↓
Estate Readiness View
↓
Saved Financial Estate

### Recovery/Closure Mode

Home
↓
Handle an Estate
↓
Create estate case / authorized-user workflow
↓
Upload available fragments
↓
AI document processing
↓
Financial Estate Reconstruction
↓
Estate Radar
↓
Known Assets
↓
Potential Missing Assets
↓
Unknown Liabilities
↓
Nominee/Document Gaps
↓
Official/institutional pathway guidance
↓
Claim/Closure Tasks
↓
Tracking Timeline
↓
Blocker Detection
↓
Next Best Action
↓
Closure Score
↓
Estate Closed

---

## 18. Hackathon Demo Scenario

Use a synthetic case for demonstration.

Example person:
Arjun Mehta

Available family fragments:
- one bank statement
- one insurance-related document/email
- one salary slip
- one tax document
- one loan statement

The family does NOT manually enter the complete financial estate.

The system should reconstruct:
- bank relationship
- insurance evidence
- loan
- recurring obligations
- possible investment/financial clues

Then show:
- verified items
- inferred items
- potential missing assets
- missing documentation
- nominee gaps
- claim/closure actions

The key WOW moment should be something like:

Bank Statement
→ recurring insurance payment detected
→ no matching policy document
→ “Potential Missing Insurance Asset”
→ evidence + confidence
→ official verification guidance

Then show Closure Autopilot:
- what must be done next
- which item is blocked
- what documents are needed
- current timeline

Finish with the Estate Closure Score.

---

## 19. Frontend Design Direction

The frontend must feel like a real premium fintech + life-admin product, not a generic AI dashboard.

Required design philosophy:
- senior product designer quality
- experienced frontend engineering quality
- calm
- trustworthy
- accessible
- clear hierarchy
- strong typography
- disciplined spacing
- intentional alignment
- visual restraint
- subtle interaction
- coherent design system
- production-ready feeling

Avoid:
- neon colors
- excessive gradients
- glassmorphism
- dark-mode-by-default
- glowing effects
- excessive rounded cards
- giant headings
- oversized statistics everywhere
- unnecessary badges
- decorative blobs
- emoji UI
- excessive animation
- random floating shapes
- generic AI SaaS templates
- fake complexity
- components that exist only to look impressive

Use:
- proper iconography
- typography and whitespace
- restrained color palette
- subtle status colors only where useful
- meaningful charts/graphs/timelines
- strong information architecture
- useful micro-interactions
- responsive layouts
- accessible contrast
- keyboard-friendly controls

Default visual direction:
**light theme first**, with calm financial/life-administration visual language.

The UI should communicate:
- trust
- clarity
- control
- empathy
- seriousness
- confidence

---

## 20. Frontend Development Method

The UI will be developed screen-by-screen.

For each new major screen:
1. generate a visual reference
2. use the visual reference together with a natural-language Antigravity command
3. implement the screen
4. review/refine
5. continue to the next screen

Do NOT generate the entire frontend blindly in one step.

Visual references should be intentional and tailored to FINCLOSURE.

---

## 21. Backend Development Method

Backend should be built before integrating the final frontend.

Build in sequence:
1. project setup
2. environment/configuration
3. Firebase integration
4. document upload/storage
5. PDF/text extraction
6. OCR fallback
7. relevance detection
8. Groq structured extraction
9. financial entity normalization
10. entity resolution/cross-document linking
11. estate data model
12. Estate Radar
13. claim/closure workflow engine
14. tracking/timeline
15. blocker detection
16. closure score
17. risk/validation checks
18. FastAPI endpoints
19. testing
20. frontend integration

The backend must be testable through API requests before the frontend is connected.

---

## 22. Engineering Principles

- write modular, readable code
- avoid unnecessary complexity
- avoid premature abstractions
- keep business logic out of React components
- keep LLM prompts versionable and isolated
- validate LLM output with schemas
- never trust raw LLM JSON without validation
- keep source evidence with extracted data
- use deterministic rules for calculations and workflow state
- use AI for interpretation and extraction, not everything
- make all state transitions explicit
- handle failures gracefully
- provide useful error messages
- keep secrets in environment variables
- never hardcode API keys
- never hardcode fake metrics as if they were real results
- label synthetic/demo data clearly
- keep the hackathon MVP focused

---

## 23. Hackathon Scope Constraints

Available build window is approximately 8 hours.

Prioritize:
- one compelling end-to-end flow
- strong document extraction
- evidence-backed discovery
- Financial Estate Twin
- Estate Radar
- Closure Autopilot
- tracking
- polished frontend

Avoid unless essential:
- real bank APIs
- complex authentication systems
- blockchain
- complex cryptography
- Kubernetes
- complex multi-tenant enterprise infrastructure
- full legal automation
- automatic claims submission
- automatic cancellation of financial services
- unsupported claims of universal financial-account discovery

---

## 24. Data & Demo Integrity

Use synthetic/demo financial data when real integration is unavailable.

Every demo-only feature must be clearly represented as:
- Demo
- Simulated
- Guided
- User-provided

Do not claim:
- universal account discovery
- automatic government verification
- direct access to private bank data
- automatic claim settlement
- real-time status from institutions without a real integration

The system should distinguish:
- Verified fact
- User-provided fact
- AI inference
- Potential lead
- Unverified information

---

## 25. Design Language / Product Voice

FINCLOSURE should speak calmly and respectfully.

Preferred language:
- “Potential financial asset detected”
- “Verification required”
- “Evidence found in Bank Statement — Page 12”
- “1 document is missing”
- “Next action”
- “This item is currently blocked”
- “Claim readiness”
- “Estate closure progress”

Avoid sensational or alarming wording.

Do not use:
- “We found hidden money!”
- “Your family lost ₹X!”
- “AI guarantees your claim”
- “100% accurate”
- “We will recover everything”

---

## 26. Project Success Criteria

A strong MVP should allow a judge to understand this in under one minute:

1. A family does not necessarily know the full financial footprint.
2. FINCLOSURE starts from fragments/evidence.
3. AI extracts and connects financial clues.
4. FINCLOSURE identifies potential missing assets/liabilities.
5. Each finding is backed by evidence.
6. The system guides the user toward the relevant official/institutional route.
7. Each case becomes a trackable workflow.
8. The user always knows what is blocking progress and what to do next.
9. The product can also be prepared proactively while the person is alive.
10. The final objective is closure, not merely document storage.

---

## 27. North Star

The entire application should always reinforce this sentence:

> **FINCLOSURE does not just organize financial documents. It reconstructs the financial footprint, surfaces what may have been missed, and guides the user from discovery to closure.**

All future implementation decisions should be checked against this product principle.
