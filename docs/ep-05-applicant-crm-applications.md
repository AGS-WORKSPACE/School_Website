# EP-05: Applicant CRM and Applications

**Epic Code:** `EP-05`  
**Stories:** `ADM-01` through `ADM-07`  
**Package:** `@tau/admissions` (`packages/admissions`)  
**Shared Apps:** `@tau/admin` (`apps/admin`), `@tau/web` (`apps/web`)  
**Security Invariants:** Maker-checker segregation, strict SoD guard, no auto-merge on name alone, zero browser-redirect payment trust, single-use token referee confidentiality.

---

## 1. Architectural Overview & Domain Models

EP-05 establishes a unified, multi-route applicant CRM and application processing engine adhering to Nigerian higher education statutory standards (JAMB, NUC, NIN) and enterprise security patterns.

### Package Architecture

```
packages/admissions/
├── src/
│   ├── domain/                  # Pure TypeScript domain models
│   │   ├── applicant.ts         # Applicant identity, verification, contact details
│   │   ├── route.ts             # Route configs (UTME, DE, JUPEB, PG, Transfer, Intl)
│   │   ├── evidence.ts          # Uploaded documents, security scans, replacement logs
│   │   ├── payment.ts           # Fee invoices, provider callbacks, receipt tracking
│   │   ├── referee.ts           # Confidential referee requests, tokens, and submissions
│   │   ├── assisted-intake.ts   # Assisted walk-in provenance and consent tracking
│   │   ├── deduplication.ts     # Match factors, discrepancy cases, and severity
│   │   └── application.ts       # Unified application lifecycle state
│   ├── policy/                  # Pure deterministic policy and rule engines
│   │   ├── deduplication-engine.ts     # Multi-factor matching & anti-auto-merge guard
│   │   ├── requirement-validator.ts    # Route checklists, MIME/size & completeness
│   │   ├── payment-reconciler.ts       # Cryptographic webhook signature & idempotency
│   │   ├── referee-policy.ts           # Token verification & applicant redaction filter
│   │   ├── assisted-intake-policy.ts   # Desk officer provenance & consent validation
│   │   └── admissions.test.ts          # 26 automated unit tests
│   ├── mock/                    # Authoritative mock state and mutations
│   │   ├── seed.ts              # Authentic 2026/2027 cycle seed data
│   │   ├── store.ts             # Reactive store with localStorage persistence
│   │   └── mutations.ts         # Transactional mutation functions
│   ├── react/
│   │   └── use-admissions.ts    # React hook with external store subscription
│   └── index.ts                 # Public package exports
```

---

## 2. User Story Implementations & Invariant Guarantees

### ADM-01: Account Creation, Draft Resumption & Duplicate Warnings
- **Contact Verification:** Pre-submission contact verification via email/SMS OTP simulation.
- **Draft Autosave & Session Resumption:** Drafts are continuously saved into the reactive admissions store. Applicants can resume drafts across sessions using their application number (`TAU/2026/...`).
- **Duplicate Warnings:** On typing email or phone number, real-time scanning checks existing candidate records and provides non-blocking, actionable warnings.

### ADM-02: Configurable Route Requirements
- Six admission routes supported without code changes:
  1. `UTME`: Standard undergraduate 100L entry (JAMB reg number & score required).
  2. `DIRECT_ENTRY`: 200L entry requiring National Diploma or A-Level transcripts.
  3. `JUPEB_FOUNDATION`: Pre-degree foundation entry.
  4. `POSTGRADUATE`: Advanced degree entry requiring first degree, transcripts, and 2 confidential referees.
  5. `TRANSFER`: Inter-university transfer with CGPA $\ge 3.00$ and university transcript.
  6. `INTERNATIONAL`: Foreign credential evaluation and passport biodata.
- Managed dynamically via `/admissions/routes` in the Admin Console.

### ADM-03: Evidence Document Uploads & Completeness
- **Security Validation:** Strict MIME type validation (`application/pdf`, `image/jpeg`, `image/png`), 5MB file size limit, dangerous extension blocking (`.exe`, `.sh`, `.bat`, etc.).
- **Audit & Replacement History:** Replaced documents preserve previous filenames, checksums, replacement reasons, and actor timestamps.
- **Completeness Engine:** Deterministic scoring evaluating mandatory documents, contact verification, qualifications, and referee quotas.

### ADM-04: Assisted Walk-In Intake Capture
- Desk officers at physical admissions pavilions capture walk-in applications at `/admissions/assisted-intake`.
- **Provenance:** Mandatory capture of assisting officer ID, officer name, email, campus desk location, and timestamp.
- **Applicant Consent:** Requires applicant digital acknowledgement statement (`acknowledgedByApplicant: true`).
- **SoD Enforced:** `sod-assisted-intake-resolve` rule in `@tau/identity` strictly prohibits officers who capture assisted intake from adjudicating deduplication cases.

### ADM-05: Application Fee Payment & Reconciliation
- **Zero Browser-Redirect Trust:** Payments are only reconciled upon verified webhook callbacks from gateways (`Paystack`, `Flutterwave`, `Interswitch`, `BankBranch_Remita`).
- **Cryptographic Reconciliation:** `reconcilePaymentCallback` checks transaction reference match, exact amount in kobo/minor units, and HMAC SHA-512 signature.
- **Idempotency:** Re-delivered webhooks return existing receipt number without duplicating ledgers.

### ADM-06: Deduplication & Identity Discrepancy Engine
- **Multi-Factor Scanning:** Compares JAMB number (45 pts), NIN (45 pts), Email (25 pts), Phone (20 pts), and Name/DOB Soundex (30 pts).
- **CRITICAL INVARIANT:** Records are **never merged automatically on name alone or phonetic similarity**.
- All cases with composite score $\ge 40$ or exact identifier conflicts are queued at `/admissions/deduplication` for human adjudication (`Confirmed_Duplicate` vs `Confirmed_Separate_Person`).

### ADM-07: Confidential Referee Recommendation Portal
- Token-gated access at `/admissions/referee/[token]` using single-use cryptographic tokens with expiration timestamps.
- **Confidentiality Segregation:** `sanitizeRefereeRequestForApplicant` completely redacts ratings, narrative assessments, and security tokens from the applicant view. Full evaluations remain accessible only to authorized admissions officers in the Admin Console dossier.
- Single-use tokens are permanently invalidated upon submission.

---

## 3. UI Interfaces Delivered

### Admin Console (`apps/admin`)
1. `/admissions` — Executive overview, route pipeline progress, fee collection metrics, urgent alert banner.
2. `/admissions/applications` — Searchable and filterable case management table.
3. `/admissions/applications/[id]` — Detailed dossier view (Profile, Qualifications, Evidence with replacement history, Fee receipt, Confidential referees, Audit trail).
4. `/admissions/assisted-intake` — Assisted walk-in capture form with officer provenance and consent recording.
5. `/admissions/deduplication` — Flagged identity discrepancy cases workbench.
6. `/admissions/deduplication/[id]` — Side-by-side candidate comparison and human adjudication workbench.
7. `/admissions/routes` — Route fee and document configuration manager.
8. `/admissions/reconciliation` — Fee ledger, payment gateway reconciliation status, and webhook test harness.

### Public Website (`apps/web`)
1. `/admissions/apply` — Route-adaptive multi-step application form with contact OTP simulation, document upload checks, draft autosave/resume, and fee payment modal.
2. `/admissions/referee/[token]` — Confidential referee evaluation form with single-use token verification.

---

## 4. Verification & Automated Test Results

- **Unit Test Suite:** 26 automated tests in `@tau/admissions` covering all rules; 86 tests passing across monorepo (`@tau/admissions`, `@tau/curriculum`, `@tau/identity`).
- **Type Safety:** Zero TypeScript errors across all 6 workspaces (`tsc --noEmit`).
- **Linting:** Zero ESLint errors across all packages (`eslint`).
- **Production Builds:** Both `@tau/admin` and `@tau/web` successfully compiled and statically exported via Next.js Turbopack.
