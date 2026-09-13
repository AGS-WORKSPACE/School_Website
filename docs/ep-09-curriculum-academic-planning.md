# EP-09 — Curriculum Catalogue and Academic Planning

> **Outcome:** An authoritative, version-controlled curriculum catalogue and governance engine that enforces NUC CCMAS benchmarks, guards prerequisite integrity, models institutional carrying capacity, and executes change proposals with strict segregation of duties and teach-out safeguards.

This document maps each user story to its implementation, details the policy engine architecture, provides interactive console verification steps, and summarizes automated test evidence.

---

## Architecture and Repository Layout

EP-09 is implemented following the monorepo architecture rules:

- **`packages/curriculum`** (`@tau/curriculum`):
  - **`src/domain/`**: Pure domain contracts for programmes, courses, CCMAS benchmarks, proposals, carrying capacity, and equivalencies.
  - **`src/policy/`**: Pure, deterministic domain rule engine:
    - `code-policy.ts`: Course code normalization, catalogue uniqueness, and versioning criteria.
    - `prerequisite.ts`: Directed Acyclic Graph (DAG) cycle detection and student prerequisite clearance evaluation.
    - `ccmas-engine.ts`: Statutory NUC 70% Core / 30% Local credit ratio calculation, minimum benchmark mapping, and knowledge area gap analysis.
    - `impact-analyzer.ts`: Comprehensive four-pillar impact evaluation (cohort impact, prerequisite ripple effect, staffing load, and teach-out schedules).
    - `capacity-model.ts`: NUC staff-to-student discipline ratios, academic rank mix pyramid (20:35:45), and scenario simulation.
    - `equivalency-resolver.ts`: Course substitution resolution and historical graduation requirement satisfaction.
  - **`src/mock/`**: In-memory state manager (`store.ts`), controlled mutations (`mutations.ts`) enforcing maker-checker constraints, and realistic Nigerian university seed data (`seed.ts`).
  - **`src/react/`**: `use-curriculum.ts` React hook with reactive subscription and localStorage persistence.
- **`packages/identity`** (`@tau/identity`):
  - `src/policy/permissions.ts`: `academics:curriculum:review`, `academics:curriculum:approve`.
  - `src/policy/sod.ts`: `sod-curriculum-approval` rule prohibiting the same identity from proposing and approving curriculum changes.
  - `src/policy/roles.ts`: `dap-director` role and updated `head-of-department`.
- **`apps/admin`** (`@tau/admin`):
  - `/curriculum`: Executive academic planning dashboard.
  - `/curriculum/programmes` & `[id]`: Programme catalogue, version history, NUC/professional accreditation records, and semester curriculum view.
  - `/curriculum/courses` & `[id]`: Course registry, contact hours breakdown (LH/TH/PH/CU), Bloom's taxonomy CLOs, and prerequisite graph.
  - `/curriculum/ccmas`: NUC CCMAS 70/30 distribution analysis, gap audit, and automated accreditation evidence pack generator.
  - `/curriculum/proposals` & `[id]`: Staged Senate pipeline with multi-pillar impact analysis and maker-checker stage progression.
  - `/curriculum/capacity`: Carrying capacity modeling, rank mix pyramid checks, and interactive intake scenario simulator.
  - `/curriculum/equivalencies`: Equivalency matrix, legacy teach-out schedules, and graduation audit substitution solver.

---

## User Stories & Implementation Mapping

### CUR-01: Programme Catalogue & Versioning
- **Requirement:** Programmes, awards, duration, admission routes (UTME, Direct Entry, Transfer), version history, and accreditation records (NUC and professional bodies like COREN, MDCN, CPN).
- **Implementation:**
  - Types: `Programme`, `ProgrammeVersion`, `AdmissionRoute`, `AccreditationRecord` in `packages/curriculum/src/domain/programme.ts`.
  - Console: `apps/admin/src/app/(console)/curriculum/programmes/` and `[id]/page.tsx`.
  - Seed: B.Sc. Computer Science (BMAS 2019 & CCMAS 2023 versions, NUC Full Accreditation), B.Eng. Software Engineering (COREN Full), MBBS Medicine & Surgery (MDCN Full, 6-year duration).
- **Policy Guarantee:** Completed student cohorts remain pinned to their matriculated programme version; updates generate a new immutable version without mutating historical structures.

### CUR-02: Course Registry, Credits & Prerequisite Cycles
- **Requirement:** Contact hours (LH, TH, PH, CU), levels (100–600), semesters (Harmattan/Rain), Bloom's taxonomy CLOs, code uniqueness, and DAG cycle detection for prerequisites.
- **Implementation:**
  - Logic: `validateCourseCode` and `detectPrerequisiteCycles` in `packages/curriculum/src/policy/`.
  - Credit Formula: $CU = LH + \lfloor TH / 2 \rfloor + \lfloor PH / 3 \rfloor$ in accordance with NUC guidelines.
  - Test: 4 tests for code policy and 3 tests for prerequisite cycle detection in `curriculum.test.ts`.
  - Console: `apps/admin/src/app/(console)/curriculum/courses/` and `[id]/page.tsx`.

### CUR-03: NUC CCMAS 70/30 Compliance & Gap Audit
- **Requirement:** Enforce statutory 70% Core Minimum Academic Standard vs 30% Local institutional innovation, knowledge area mapping, gap identification, and evidence pack generation.
- **Implementation:**
  - Engine: `calculateCCMASDistribution` and `auditCCMASCompliance` in `packages/curriculum/src/policy/ccmas-engine.ts`.
  - Evidence Pack: Generates verified accreditation dossiers containing credit crosswalks, Bloom's learning outcome matrices, and local content justifications.
  - Console: `apps/admin/src/app/(console)/curriculum/ccmas/page.tsx`.

### CUR-04: Multi-Stage Change Governance & Maker-Checker SoD
- **Requirement:** Department Board $\rightarrow$ Faculty Board $\rightarrow$ DAP Technical Review $\rightarrow$ Senate Approval pipeline with mandatory impact analysis and Segregation of Duties.
- **Implementation:**
  - Policy: `generateCurriculumImpactAnalysis` in `packages/curriculum/src/policy/impact-analyzer.ts`.
  - SoD Rule: `sod-curriculum-approval` in `packages/identity/src/policy/sod.ts` prevents any user who proposed or sponsored a curriculum revision from signing off as the approver.
  - Console: `apps/admin/src/app/(console)/curriculum/proposals/` and `[id]/page.tsx`.

### CUR-05: Carrying Capacity & Academic Staffing Models
- **Requirement:** NUC discipline staff-to-student ratios (1:15 Science/Tech, 1:10 Medicine, 1:30 Administration), rank mix pyramid (20% Professorial, 35% Senior Lecturer, 45% Lecturer I & below), and physical facility bounds.
- **Implementation:**
  - Policy: `evaluateAcademicStaffRankMix` and `simulateCapacityScenario` in `packages/curriculum/src/policy/capacity-model.ts`.
  - Console: `apps/admin/src/app/(console)/curriculum/capacity/page.tsx` with interactive parameter sliders and real-time bottleneck alerts.

### CUR-06: Course Equivalencies & Legacy Teach-Out
- **Requirement:** Formal course equivalencies and substitutions (Exact, One-Way, Conditional) with Senate reference numbers, teach-out schedules for legacy cohorts, and graduation audit resolution.
- **Implementation:**
  - Policy: `resolveCourseSubstitution` and `checkDegreeRequirementSatisfaction` in `packages/curriculum/src/policy/equivalency-resolver.ts`.
  - Console: `apps/admin/src/app/(console)/curriculum/equivalencies/page.tsx` featuring an interactive audit simulator.

---

## Verification & Automated Test Evidence

All 59 unit tests across monorepo workspaces pass cleanly:

```bash
npm test
```

### Test Suite Breakdown:

#### 1. `@tau/curriculum` (23 passing tests)
- **CUR-02 Course Code Policy & Normalization:**
  - `normalizes course codes correctly`
  - `rejects invalid course code formats`
  - `enforces course code uniqueness across catalogue`
  - `detects breaking credit changes requiring a new course version`
- **CUR-02 Prerequisite Cycles & Satisfaction:**
  - `passes when prerequisite chain is acyclic`
  - `detects circular prerequisite loops`
  - `evaluates student prerequisite clearance correctly`
- **CUR-03 CCMAS 70/30 Distribution & Gap Audit:**
  - `calculates core vs local percentage accurately`
  - `flags deficiency if core credits drop below statutory threshold`
  - `audits knowledge area gaps and expected competencies`
- **CUR-04 Curriculum Change Impact Analyzer:**
  - `identifies downstream ripple effect when prerequisite course is phased out`
- **CUR-05 Carrying Capacity & Staff Ratios:**
  - `provides NUC discipline ratio benchmarks`
  - `evaluates academic staff rank pyramid`
  - `simulates carrying capacity scenario bottlenecks`
- **CUR-06 Course Equivalencies & Teach-Out:**
  - `matches equivalent course for legacy student version`
  - `warns when replacement course results in credit deficit`
  - `confirms degree requirement satisfaction via substitution`

#### 2. `@tau/identity` (36 passing tests)
- Includes the `IAM-05` Segregation of Duties test verifying that proposing and approving curriculum changes together is blocked by the policy engine (`sod-curriculum-approval`).

#### 3. Typecheck and Linting
```bash
npm run typecheck   # 0 errors across @tau/admin, @tau/web, @tau/curriculum, @tau/identity, @tau/ui
npm run lint        # 0 errors, 0 warnings across all workspaces
npm run build --workspace=@tau/admin # Next.js static and dynamic route compilation successful
```

---

## Reviewer Guide: How to Test Interactively

1. Start the admin console:
   ```bash
   npm run dev:admin
   ```
2. Navigate to `http://localhost:3001` and sign in.
3. Use the **Academic Planning** group in the console navigation:
   - **Overview (`/curriculum`)**: Review KPIs (programmes, courses, pending proposals, CCMAS status).
   - **Programmes (`/curriculum/programmes`)**: Filter programmes, open B.Sc. Computer Science, switch between BMAS 2019 and CCMAS 2023 version matrices, view NUC accreditation history.
   - **Courses (`/curriculum/courses`)**: Add a new course to test credit breakdown math ($CU = LH + \lfloor TH / 2 \rfloor + \lfloor PH / 3 \rfloor$), search courses, view syllabus CLOs.
   - **CCMAS 70/30 Audit (`/curriculum/ccmas`)**: Review core vs local distribution metrics, inspect knowledge area gaps, click **Generate NUC evidence dossier**.
   - **Proposals & Impact (`/curriculum/proposals`)**: Open `PROP-2026-001` to view multi-pillar impact analysis (cohort impact, prerequisite ripple, teach-out notice). Advance the stage through maker-checker controls.
   - **Carrying Capacity (`/curriculum/capacity`)**: Test the scenario simulator by adjusting intake numbers and inspect rank pyramid alerts.
   - **Equivalencies & Teach-Out (`/curriculum/equivalencies`)**: Test the graduation audit solver with legacy courses (`CSC 203` $\rightarrow$ `COS 201`) to verify substitution resolution.
