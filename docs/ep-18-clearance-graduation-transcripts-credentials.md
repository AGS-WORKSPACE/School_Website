# EP-18: Clearance, graduation, transcripts and credentials

> **Outcome:** Graduands are cleared across units and receive trustworthy records promptly.

EP-18 adds a new `@tau/graduation` package (domain contracts, pure policy functions, a demonstration store and React bindings), a **Graduation** area in the admin console, and two public pages: credential verification and alumni transcript requests. Like earlier epics, it adds no API, server action, database or external integration.

## How it connects to the rest of the platform

Graduation keeps no copy of anyone else's data. It reads these modules live:

| Source | Used for |
|---|---|
| `@tau/curriculum` — EP-09 catalogue | Required courses and total credits come from the graduand's programme version. Substitutions use the Senate-approved equivalency rules, honouring rule direction (one-way or exact), curriculum version and minimum grade. |
| `@tau/curriculum` — EP-12 results | A result counts only when its batch is Locked or Published (`isResultBatchLocked`). Grades are derived with EP-12's undergraduate scale. The seed adds one pending batch, "CSC 499 · Final year project (late marks)"; approving it in the result workflow clears Grace Akpan's gap with no change to graduation data. |
| `@tau/students` — EP-08 student record | A clearance unit cannot clear while its own hold restricting graduation is active; transcript signing is refused while a hold restricting transcripts is active. The seed adds a library hold for Aisha Bello (`student-2022-088`), who is an EP-08 student. The Library must release that hold on the student record's Holds screen before its checkpoint can clear. Enrolment status comes from the student record for students who exist there. |
| `@tau/identity` — EP-01 | Every permission check in the graduation service layer goes through `rolesPermit`. |

## Delivered workflows

| Story | What was built |
|---|---|
| **GRD-01** Graduation audit | Checks required courses (met directly or by a cited substitution), credits, the minimum CGPA, enrolment status and unapproved results, and explains each gap in plain words. CGPA is on the 5-point scale; classification comes from a versioned rule (First Class ≥ 4.50 … Pass ≥ 1.00). An override targets exactly one gap and needs a reason, an authority reference and a records approver who did not request it. Unapproved results and enrolment status cannot be overridden: they must be fixed at source. |
| **GRD-02** Clearance | One case per graduand, with parallel checkpoints for Registry, Bursary, Library, Department, Student Affairs, Hostel (residents only) and ICT. Each unit decides only its own checkpoint and must give a reason to block; overall status is derived from the required checkpoints. Graduands can appeal a block. A records approver who did not make the block decides the appeal, and upholding it is refused while the unit's hold is still active. |
| **GRD-03** Graduand lists | A list is versioned and built only from eligible, cleared graduands, with every exclusion explained. Totals by programme, award and classification must reconcile before submission and approval. Approval needs a different person and a Senate minute, and stores a fingerprint of the exact entries, so any later change shows as "Changed since approval". |
| **GRD-04** Transcript requests | Each request records the recipient, delivery method, identity verification and consent to release. The fee is set by delivery method. Payment counts only on the provider's verified callback for the exact amount. Dispatch and delivery each need evidence, such as a waybill, an email message ID or proof of delivery. |
| **GRD-05** Transcript generation | Transcript lines are computed from approved results only, and there is no way to type a grade. A transcript records its template version and approved batch IDs, and carries a content fingerprint that detects edits. The preparer cannot sign it. The signatory needs `records:transcript:issue`, and signing applies the seal and a verification code. Results still awaiting approval block preparation. |
| **GRD-06** Certificate custody | Stock received as serial ranges is reconciled as blank, printed, void or issued, with missing, duplicate and unexpected serials reported. Printing needs the graduate on an approved, unaltered graduand list, and a replacement needs the original voided. Release needs completed clearance and the collector's identity; a proxy also needs written authority. |
| **GRD-07** Verification | `/verify` accepts a code or a signed link. It returns only holder, credential type, award, programme, classification, graduation session and issue date, never grades, CGPA, matriculation number or date of birth. Tampered links, revoked credentials and unknown codes are distinguished. Each organisation gets 5 checks per 10 minutes, and every check is logged. Revocation needs a records approver. |

## Access rules (`packages/identity/src/policy`)

- **New permissions:** `records:graduation:audit`, `records:graduation:approve` (high risk, MFA), `records:clearance:decide`, `records:transcript:prepare` and `records:certificate:manage`. The existing `records:transcript:issue` remains the signing permission.
- **New roles:** `graduation-officer` and `clearance-officer`. `records-approver` gains `records:graduation:approve`.
- **Blocking segregation-of-duties rules:**
  - `sod-graduation-list`: the same person cannot audit and approve.
  - `sod-transcript-production`: the same person cannot prepare and sign a transcript.

## Routes

Admin console (`npm run dev:admin`), **Graduation** navigation group:

- `/graduation`: graduands by session with audit and clearance status, and overrides awaiting approval.
- `/graduation/[studentId]`: the audit with gaps, overrides and required courses (including how each was met), plus the clearance case.
- `/graduation/clearance`: open cases and appeals. The acting unit's own checkpoints are outlined.
- `/graduation/lists`: who qualifies today, list versions, reconciliation, submit, approve and freeze, return.
- `/graduation/transcripts`: requests through payment, generation, signing and delivery; a read-only transcript view; the verification log; revocation.
- `/graduation/certificates`: stock reconciliation, print, void, and release to a collector.

Each graduation screen has an **Acting as (demo)** switcher covering the graduation officer, records approvers, the Senate secretary and each unit's clearance officer.

Public website (`npm run dev:web`):

- `/verify`: credential verification (code or signed link).
- `/alumni/transcripts`: request, pay for and track a transcript.

## Demonstration data

Graduands for 2025/2026 on the B.Sc. Computer Science 2019 curriculum (148 credits):

| Graduand | Scenario |
|---|---|
| Aisha Bello (EP-08 record) | First Class (4.81). COS 201 met by legacy CSC 203 through the Senate exact equivalence. Library checkpoint blocked by her student-record hold. |
| Chiamaka Obi | Second Class Upper, fully cleared, qualifies immediately. |
| Olumide Balogun | Failed CSC 202 and missed a course: 142/148 credits, so not eligible. |
| Grace Akpan | GST 112 exemption override awaiting approval; final project still with Senate (EP-12). |
| Yusuf Danladi | Second Class Lower. Bursary block under an open appeal. |

The 2024/2025 alumni, Oluwatobi Adewale (4.49, just below First Class) and Halima Sani, have an approved and frozen list, issued certificates (one voided after a misprint and revoked), and a delivered transcript. Their seeded list and transcript are built through the same policies at seed time, so their fingerprints are real.

## Verification

```bash
npm test          # @tau/graduation: 21 tests; @tau/identity: 45 (3 new for EP-18)
npm run typecheck
npm run lint
npm run build --workspace @tau/admin && npm run build --workspace @tau/web
```

## Known limitations

- Fingerprints and link signatures use a deterministic 64-bit hash. That's enough to detect changes in a demonstration, but it isn't a cryptographic signature; production should sign server-side (HMAC or Ed25519) with a managed key.
- The admin console and public website keep separate browser-local demonstration stores, as in earlier epics. A transcript requested on the website does not appear in the console.
- EP-12's result batch store mutates its state in place. Its snapshot object doesn't change identity, so an open graduation page may not re-render when a batch is approved; revisiting the page shows the new status.
- The NYSC mobilisation export (EP-21 CAR-03) will read the approved, frozen graduand list; it is not part of this epic.
