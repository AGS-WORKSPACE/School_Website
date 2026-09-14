# EP-08: Core student record and lifecycle

> **Outcome:** Registry maintains a complete, historically accurate student record.

EP-08 adds a new `@tau/students` package (domain contracts, pure policy functions, a demonstration store and React bindings), a **Student Records** workspace in the admin console, and a student self-service page on the public website. Like EP-07, it adds no API, server action, database or external integration.

## Delivered workflows

| Story | What was built |
|---|---|
| **SIS-01** Provenance | Every recorded field (biographical, contact, sponsor) and every prior qualification carries its source, source reference, verification state, verifier, effective date, recorder and — where required — approver. Fields are verified by someone other than the person who recorded them. |
| **SIS-02** Identity corrections | Protected identity fields (names, date of birth, sex, nationality, state/LGA, NIN) change only through a correction request with accepted evidence. A records approver who is not the requester decides it. Approval replaces the value and moves the prior value, with its original provenance, into restricted history that only records approvers can read. Rejection needs an internal reason and a plain-language reason for the student. |
| **SIS-03** Lifecycle history | Programme, level, mode, cohort, adviser, standing and enrolment status are never stored as editable fields. They are derived by replaying approved, effective-dated lifecycle events: matriculation, progression, mode change, adviser assignment, standing change, deferral, suspension, withdrawal, reinstatement and death. Each event records a reason, a releasable reason and, where the rules require it, an authority reference. Transitions are validated (for example, a deceased record is terminal and reinstatement needs a deferred, suspended or withdrawn student). Back-dating behind recorded history is refused, and the proposer cannot approve. |
| **SIS-04** Transfers | Transfer cases record eligibility (active status, current programme, CGPA threshold, receiving capacity, no registration hold, complete credit decisions), per-course credit decisions (transfer, map to a course, or no credit, each with a rationale) and four ordered approvals: releasing department, receiving department, faculty and Registry. The preparer cannot approve any stage, and nobody can decide two stages. Final approval appends a single `Programme_Transfer` event, so the old programme's history stays intact. |
| **SIS-05** Holds | Holds are a separate record from lifecycle status. Each has an owning unit, internal reason, student-facing reason, restricted services, start/release and an appeal route. Hold types limit which services they may restrict (a library hold cannot block registration), and only the owning unit can place or release them. Consuming modules call `holdsBlocking(holds, studentId, effect, at)`, so each honours only the hold types that affect it. |
| **SIS-06** Student timeline | `buildStudentTimeline` builds the student's view from releasable wording only. Proposed and rejected lifecycle events, internal reasons and restricted evidence never appear. Each item shows the action owner, an SLA due date with an overdue flag for open requests, and the appeal route where one applies. |

## Routes

Admin console (`npm run dev:admin`, port 3001), **Student Records** navigation group:

- `/students`: register with derived programme/level/status, active holds, open items and data-quality KPIs.
- `/students/[id]`: record and provenance, lifecycle (with an "as of" date), holds, requests, student view and audit tabs.
- `/students/approvals`: maker-checker queue for identity corrections and lifecycle changes.
- `/students/transfers`: transfer cases with the stage pipeline, eligibility and credit decisions.
- `/students/holds`: hold register and a per-service check showing who is blocked.

Every student screen has an **Acting as (demo)** switcher so reviewers can exercise the maker-checker, approver-role and unit-ownership rules as different staff.

Public website (`npm run dev:web`, port 3000):

- `/student-portal/my-record`: the student timeline, identity correction requests with evidence, and withdrawal of open requests.

## Identity integration

`@tau/identity` gains `records:student-record:amend`, `records:student-record:approve` (high risk, MFA) and `records:hold:manage`. It also gains a new `registry-officer` role, adds the approve permission to `records-approver`, and adds a blocking SoD rule, `sod-student-record-change`, which stops one person holding both amend and approve.

## Invariants

- Policy functions in `packages/students/src/policy/` are deterministic and UI-independent. Every mutation in `packages/students/src/mock/mutations.ts` runs a policy check and writes an attributable audit entry.
- Records are replaced immutably; nothing is edited in place. Superseded field values and lifecycle history are append-only.
- Continuity with EP-07: Fatima Aliyu (`student-2026-004`) is seeded with the same matriculation number, application and offer as the onboarding seed, and her fields' provenance points at application `TAU/2026/PG/0002`.

## Verification

```bash
npm test          # @tau/students: 18 tests; @tau/identity: 38 (includes sod-student-record-change)
npm run typecheck
npm run lint
npm run build --workspace @tau/admin && npm run build --workspace @tau/web
```

## Known limitations

- The admin console and public website run on different origins, so each keeps its own browser-local demonstration store. A correction submitted on the website does not appear in the console's queue. This is the same limitation as the EP-07 offer page, and a shared API removes it.
- The "acting as" switcher stands in for the signed-in session's roles until the student store sits behind the identity service.
