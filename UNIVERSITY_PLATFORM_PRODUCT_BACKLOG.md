# University Digital Platform: Research, Product Scope, Epics and User Stories

**Status:** Discovery baseline  
**Research date:** 10 September 2026  
**Primary context:** A Nigerian university offering conventional undergraduate and postgraduate programmes, JUPEB/foundation programmes, and online or blended learning.  
**Purpose:** A product and delivery backlog for stakeholder validation—not a substitute for the university's statutes, Senate regulations, financial policy, conditions of service, or legal advice.

## 1. Executive recommendation

Build one university platform made of interoperable modules around a **single authoritative person, programme, course, enrolment and finance record**. Present those modules through role-based workspaces rather than building a separate application and database for every office.

The recommended product shape is:

1. **Public Experience:** website, programme catalogue, CMS, news, events, enquiries and SEO.
2. **Admissions and Applicant CRM:** enquiries, applications, screening, JAMB/CAPS-assisted processing, JUPEB, postgraduate and other admission routes, offers and onboarding.
3. **Student Information and Records (SIS/SRMS):** the student lifecycle from matriculation through progression, graduation and alumni transition.
4. **Academic Planning:** curriculum, CCMAS mapping, academic calendar, teaching allocation, timetables, rooms and accreditation evidence.
5. **Assessment, Exams and Records:** continuous assessment, examination operations, moderated results, transcripts, certificates and graduation clearance.
6. **Learning Platform (LMS):** conventional, blended and online delivery, content, interaction, assessments, learner support and learning analytics.
7. **Finance and Bursary:** fee policy, billing, payments, receipts, scholarships, sponsorship, refunds, reconciliation and financial holds.
8. **People and HR:** recruitment, establishment, staff records, appointments, leave, appraisal, promotion, development and payroll integration.
9. **Student Success and Campus Life:** advising, counselling, disability support, conduct, clubs/SUG, accommodation, clinic referrals, careers and NYSC preparation.
10. **Quality, Research and Library:** accreditation, course evaluation, institutional quality, library integration, research profiles and grants.
11. **Digital Operations:** identity, workflow, documents, notifications, service desk, integrations, data governance, security, audit, reporting and resilience.

Do **not** make “Admin Workspace” a single super-user area. Give each unit a least-privilege workspace and use controlled approval workflows for cross-unit processes.

## 2. Corrections and enhancements to the original idea

| Original grouping | Recommended ownership | Reason |
|---|---|---|
| Registry handles all admission | Admissions Unit operates the process; Registrar/authorised head approves; JAMB CAPS remains authoritative where applicable | Separates data entry, recommendation and approval; mirrors the roles described by JAMB CAPS |
| Registry handles staff employment | HR/Establishment owns recruitment and employment; Registry may retain governance records | Student registry and staff establishment are different domains and need different confidentiality controls |
| Registry handles media/blog | Communications/PR owns publishing; Registry can submit notices | Publishing permissions and editorial approval should not grant access to confidential records |
| Bursary owns student clearance | Clearance is an orchestrated workflow with checkpoints from Bursary, Library, Department, Student Affairs/Hostel, ICT and Registry | No single office can truthfully clear every obligation |
| Exams and Records owns certificates and transcript | Correct; place it within the Registry family but give it a dedicated controlled workspace | Academic records need maker-checker approval, version history and restricted access |
| DAP owns NUC course contents | DAP and Quality Assurance own the curriculum catalogue and CCMAS/accreditation mapping; Senate approves curriculum changes | NUC publishes standards; the university must manage its approved local curriculum and evidence |
| “Bursary DAP / Student Affairs” | Create a distinct Student Affairs/Student Success workspace | Welfare, counselling, SUG, discipline, careers and NYSC are not finance or academic-planning functions |
| ICT owns student management | Registry, academic units and Bursary own their business data; ICT administers platforms, integrations, access and support | Preserves accountability and prevents ICT from silently changing authoritative records |
| LMS only for online students | Use one LMS for conventional, blended and online cohorts, with delivery mode and access rules | NUC's e-learning guidance applies to face-to-face, blended, online and distance contexts |
| HRMS “API and our own” | Start with a canonical staff record and HR integration layer; build university-specific workflows; integrate rather than duplicate mature payroll/biometric/accounting tools where sensible | Payroll and statutory deductions are high-risk; an adapter-first approach avoids locking the platform to one vendor |

## 3. Research findings that affect scope

### 3.1 Nigerian regulatory and operational drivers

- **JAMB/CAPS:** CAPS is the clearing house for applicable tertiary admissions and includes distinct institutional roles such as Admissions Officer, Head of Institution and Desk Officer. The platform should support the university's screening, ranking, evidence and approval work, but must not represent itself as replacing CAPS. Published admission should be tied to the CAPS-approved outcome for routes governed by JAMB. See [JAMB CAPS](https://jamb.gov.ng/caps) and the [JAMB admission guidelines](https://caps.jamb.gov.ng/2021%20Admission%20Guidelinesv1.pdf).
- **NUC curriculum and accreditation:** the curriculum catalogue must version programmes, courses, learning outcomes, credit loads and evidence against applicable Core Curriculum Minimum Academic Standards (CCMAS). Accreditation readiness needs more than storing course titles: it needs staffing, facilities, enrolment, results, course files and evidence snapshots. See [NUC CCMAS](https://www.nuc.edu.ng/ccmas/) and [NUC Accreditation](https://www.nuc.edu.ng/project/accreditation/).
- **E-learning:** NUC's guidance covers governance, staff and learner support, course design, assessment, infrastructure, accessibility, privacy, quality assurance and learner tracking. It says online provision should be subject to the same rigour as face-to-face provision. See [NUC Guidelines for e-Learning in Nigerian Universities](https://www.nuc.edu.ng/wp-content/uploads/2024/06/Guidelines-for-e-Learning-in-Nigerian-Universities-April-2023-Revised-FINAL.pdf).
- **JUPEB:** only approved university centres may advertise and register candidates; the official service exposes centre, candidate, result, syllabus and calendar functions. Treat JUPEB as a distinct admission/programme route with its own subject combinations and external registration evidence. See [official JUPEB](https://jupeb.edu.ng/index.php) and [JUPEB subjects](https://jupeb.edu.ng/about/examination_subjects).
- **NYSC:** locally trained graduates require correct matriculation data and inclusion in a Senate/Academic Board-approved result list submitted by their institution. The platform therefore needs an approved graduation dataset, exception checking and an auditable mobilisation export. See [NYSC mobilisation requirements](https://nysc.gov.ng/mobreg.html).
- **Student loans and national education data:** NELFUND's flow verifies education/student status and references JAMB; the institution-facing Student Verification System processes enrolment and academic/contact data. National initiatives are moving toward linked, centralised education records. Build explicit, consent-aware verification exports/APIs instead of ad-hoc spreadsheets. See [NELFUND applicant verification](https://portal.nelf.gov.ng/auth/register), [NELFUND Student Verification System](https://svs.nelf.gov.ng/) and [Nigerian Education Data Initiative](https://nedi.education.gov.ng/).
- **Data protection:** student, applicant, staff, health, disability, disciplinary and financial records are personal data, some of them highly sensitive. The Nigeria Data Protection Act requires lawful, fair and accountable processing; the GAID 2025 implementation framework adds operational requirements such as DPIAs, compliance returns and cross-border-transfer controls. See the [Nigeria Data Protection Act 2023](https://ndpc.gov.ng/wp-content/uploads/2024/03/Nigeria_Data_Protection_Act_2023.pdf), [NDPC's overview of GAID 2025](https://ndpc.gov.ng/wp-content/uploads/2026/02/NDPC-Journal-2026-1.pdf) and [NDPC FAQs](https://www.ndpc.gov.ng/faqs/).
- **Pensions/payroll:** employer pension handling has statutory timing and evidence requirements. Keep payroll calculations configurable and reviewed by HR/Bursary; do not hard-code current rates or rules. See [Pension Reform Act 2014](https://www.pencom.gov.ng/wp-content/uploads/2018/01/PRA_2014.pdf) and [PenCom employer compliance circular](https://www.pencom.gov.ng/wp-content/uploads/2025/05/CIRCULAR-ON-COMPLIANCE-WITH-PROVISIONS-OF-PRA-APPROVED.docx.pdf).

### 3.2 Product and technical standards

- Target **WCAG 2.2 Level AA** for public, applicant, student, staff and LMS experiences. It covers keyboard access, alternatives for non-text content, contrast, reflow, predictable help and accessible authentication. See [W3C WCAG 2.2](https://www.w3.org/TR/wcag/).
- Prefer education interoperability standards where connected products support them: **OneRoster 1.2** for roster/grade exchange, **LTI Advantage** for learning-tool launch, **QTI** for portable assessment items, and **Edu-API** where appropriate for administrative-learning exchange. See [1EdTech standards](https://www.1edtech.org/standards/details) and [OneRoster](https://www.1edtech.org/standards/oneroster).
- Use a security programme spanning **Govern, Identify, Protect, Detect, Respond and Recover**, not only login controls. See [NIST Cybersecurity Framework 2.0](https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20).

## 4. Product principles and scope boundaries

1. **One person, one durable identity:** an applicant who becomes a student, employee or alumnus keeps linked roles without duplicated personal records.
2. **One source per fact:** SIS owns enrolment and academic standing; Finance owns posted financial transactions; LMS owns learning activity; HR owns employment; the analytics layer reads but does not silently rewrite them.
3. **Effective-dated configuration:** programmes, fees, curricula, grading rules, approval chains and organisational units change by session; never overwrite history.
4. **Maker-checker controls:** no person should create and finally approve their own admission batch, result change, refund, payroll run, transcript or certificate.
5. **API-first, event-aware integration:** modules exchange stable IDs and business events; spreadsheet import/export is a controlled fallback with validation and audit.
6. **Low-bandwidth and mobile-first:** resumable forms, compressed media, asynchronous LMS activities, drafts, queued notifications and useful pages on modest devices/connections.
7. **Privacy by design:** collect the minimum, record purpose and lawful basis, restrict sensitive attributes, retain by policy and provide auditable disclosure/export workflows.
8. **Configuration before custom code:** session structures, terminology, routes, approval thresholds and policies must be configurable.
9. **Human decisions remain human:** the system may rank, flag and recommend, but consequential admission, result, disciplinary and employment decisions require authorised review and reasons.
10. **No premature microservices:** begin with a modular architecture and clear bounded contexts; separate services only when scale, team ownership or risk justifies the operational cost.

### Out of scope until separately approved

- Replacing JAMB CAPS, JUPEB, NYSC, NELFUND, NIMC or government portals.
- Building a banking ledger, pension administrator, full hospital EMR, physical access-control hardware or video-conferencing network from scratch.
- Fully automated high-stakes decisions with no human review.
- Blockchain credentials solely for novelty; use verifiable signed records and a public verification service first.

## 5. Workspaces and access model

| Workspace | Primary users | Main capabilities | Explicit restriction |
|---|---|---|---|
| Public | Visitors, parents, prospects, media | Search programmes, read news/events, enquire, verify published credentials | No internal records |
| Applicant | Prospects, referees, sponsors | Apply, upload evidence, pay, schedule screening, track decisions, accept offer | Cannot see internal scores/notes unless released |
| Student | Active students | Profile, registration, timetable, LMS, finance, requests, results, support, clearance | Cannot alter authoritative identity or results |
| Lecturer/Adviser | Academic staff | Classes, attendance, assessments, advising, course files, research profile | Only assigned cohorts and permitted advisees |
| Department/Faculty | HODs, officers, deans | Curriculum proposals, workload, registration approval, result review, dashboards | Scoped to organisational unit |
| Admissions | Admissions officers, Registrar approvers | Screening, ranking, batches, route checks, decisions, onboarding | Final approval separated from preparation |
| Exams and Records | Exams officers, records staff, Senate secretariat | Exam planning, result governance, transcripts, certificates, graduation | Immutable audit and maker-checker required |
| DAP/Quality Assurance | Planners, QA officers | Calendar, catalogue, CCMAS mapping, statistics, accreditation evidence | Proposes curriculum; Senate authority is recorded |
| Bursary | Cashiers, accountants, bursar | Billing, receipting, allocations, reconciliation, refunds, holds, reporting | Cannot alter academic results or admission decisions |
| HR/Establishment | HR officers, panels, approving officers | Recruitment, staff records, appointments, leave, appraisal, promotion | Sensitive cases partitioned and audited |
| Student Affairs | Advisers, counsellors, disability/career/hostel staff | Welfare cases, accommodations, conduct, clubs, careers, NYSC readiness | Counselling/health notes have additional isolation |
| Communications | Editors, approvers | Pages, news, events, emergency notices, media library | No Registry privileges merely to publish |
| Library/Research | Librarians, research officers | Patron sync, repository, grants, publications, ethics tracking | Borrowing/research controls scoped by role |
| ICT Operations | Service desk, identity admins, platform/integration admins | Provisioning, monitoring, tickets, access administration, integration operations | Break-glass access is temporary, justified and audited |
| Executive/Governance | VC, principal officers, Council/Senate delegates | Approved dashboards, agenda/decision records, exceptions | Aggregated access by default; drill-down is authorised |
| Alumni/Employer Verifier | Graduates, alumni office, authorised third parties | Alumni profile, requests, events, credential verification | Verification reveals only approved fields |

## 6. End-to-end lifecycle

`Prospect → Applicant → Screened candidate → CAPS/route-approved admit → Accepted offer → Matriculated student → Registered learner → Assessed student → Progression decision → Graduand → Cleared graduate → Alumnus`

Every transition must record actor, time, reason, source, evidence and previous state. A status label must never substitute for the underlying evidence.

## 7. Prioritised delivery roadmap

| Phase | Objective | Included capabilities | Exit condition |
|---|---|---|---|
| 0 — Foundation | Establish trusted shared services and governance | Identity/RBAC, organisation and academic-session master data, workflow, documents, notifications, audit, API gateway, data migration rules, baseline security/observability | Roles approved; IDs and data owners agreed; restore and access tests pass |
| 1 — Recruit and admit | Publish the university and convert applicants safely | Public site/CMS, programme catalogue, enquiry CRM, applications, screening, payments, JAMB/JUPEB/PG route handling, offers and onboarding | A complete admission cycle is traceable from enquiry to student creation |
| 2 — Run the academic core | Make SIS the reliable system of record | Curriculum, calendar, course registration, advising, timetable, fees, results, progression and core reports | One cohort completes registration and approved results without shadow spreadsheets |
| 3 — Teach and graduate | Complete learning and records workflows | LMS, online assessment, exams operations, multi-unit clearance, transcripts, certificates, graduation and NYSC dataset | One cohort is taught, assessed, cleared and graduated with reconciled records |
| 4 — Operate the institution | Add staff, student-success and assurance capabilities | HR, payroll integration, student affairs, library/research, accreditation, service management, executive analytics, alumni | Operational KPIs and compliance evidence are generated from governed source data |
| 5 — Optimise | Improve outcomes and ecosystem interoperability | Early-alert models with human review, mobile/offline enhancements, external standards, advanced planning and verified credentials | Benefits and risk metrics demonstrate improvement over baseline |

**MVP recommendation:** Phases 0–2, plus basic LMS access and transcript/request foundations. Attempting all modules in the first release will create inconsistent rules and migrations before the academic core is stable.

## 8. Epics and user stories

Priority: **M** = Must, **S** = Should, **C** = Could. “Acceptance” is the minimum observable outcome; detailed test cases follow during refinement.

### EP-01 — Identity, access and delegated authority

**Outcome:** Every person has one identity and only the access needed for current duties.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| IAM-01 | As a user, I want one account across authorised modules so that I do not manage separate passwords. | A linked role change does not create a duplicate person; disabled identity blocks all sessions. | M |
| IAM-02 | As an identity administrator, I want roles scoped by campus, faculty, department and cohort so that access follows responsibility. | Scope boundaries are enforced in UI, export and API tests. | M |
| IAM-03 | As a privileged user, I want multi-factor authentication so that sensitive operations are protected. | MFA is mandatory for privileged and configurable high-risk roles; recovery is audited. | M |
| IAM-04 | As a manager, I want time-bounded delegation so work continues during absence. | Delegation has start/end time, permitted actions, reason and visible audit; it cannot exceed delegator authority. | S |
| IAM-05 | As an auditor, I want segregation-of-duties rules so no user prepares and approves the same high-risk item. | Conflicts block submission or require a documented exception approved by a separate authority. | M |
| IAM-06 | As ICT, I want controlled break-glass access so emergencies can be resolved without hidden access. | Access is time-limited, reasoned, alerted and reviewed after use. | M |

### EP-02 — Organisation, academic master data and configuration

**Outcome:** All modules use the same effective-dated institutional structure and academic vocabulary.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| CFG-01 | As DAP, I want to model campuses, colleges/faculties, schools, departments, units and reporting lines. | Units have stable IDs, effective dates and history; inactive units remain in historical records. | M |
| CFG-02 | As DAP, I want sessions, semesters/terms, teaching weeks and deadlines configured. | Rules can vary by programme/delivery mode without editing past sessions. | M |
| CFG-03 | As an administrator, I want controlled reference data for states, LGAs, countries, qualification types and document types. | Changes are versioned, validated and reused by every module. | M |
| CFG-04 | As a policy owner, I want grading, credit, progression and approval rules configured by effective date. | A simulation shows impacted cohorts before publication; published rules are immutable for that version. | M |
| CFG-05 | As a platform administrator, I want feature flags and configuration promotion across environments. | Changes are reviewed, tested, reversible and logged without direct production database edits. | S |

### EP-03 — Workflow, documents, communications and audit

**Outcome:** Cross-unit work is traceable, measurable and recoverable.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| OPS-01 | As a process owner, I want configurable steps, SLAs, escalation and substitution. | Each case displays current owner, due date, complete history and next valid actions. | M |
| OPS-02 | As a records officer, I want documents classified, versioned and retained by policy. | Checksums, uploader, source, access, version and retention/disposal state are recorded. | M |
| OPS-03 | As a user, I want email, SMS, in-app and optional push notifications with preferences. | Critical messages retain required channels; delivery/failure and template version are visible. | M |
| OPS-04 | As an approver, I want a common inbox with bulk actions where safe. | Bulk action previews every item, rejects mixed/invalid states and records a reason. | S |
| OPS-05 | As an auditor, I want tamper-evident logs for viewing and changing sensitive records. | Logs include actor, action, subject, time, channel, before/after or event reference, and cannot be altered by ordinary admins. | M |
| OPS-06 | As a records manager, I want legal hold and defensible disposal. | Held records cannot be purged; approved disposal produces an evidence report without retaining disposed content. | S |

### EP-04 — Public website, programme discovery and SEO

**Outcome:** Prospective users can discover accurate, accessible information and move into an enquiry or application.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| WEB-01 | As a visitor, I want fast, mobile-friendly pages for the university, leadership, campuses, facilities and contacts. | Core pages meet performance budgets and WCAG 2.2 AA checks on representative devices. | M |
| WEB-02 | As a prospect, I want to filter programmes by level, faculty, subject interest, mode and entry route. | Results expose current requirements, duration, fees guidance, accreditation status and application action. | M |
| WEB-03 | As an editor, I want draft, preview, scheduled publishing, approval and rollback. | Only authorised approvers publish; public pages show owner and review/expiry status internally. | M |
| WEB-04 | As Communications, I want news, announcements, events, categories and emergency banners. | Expired items archive automatically; urgent banners require expiry and approval. | M |
| WEB-05 | As a search engine, I need canonical URLs, metadata, sitemaps and structured data. | Programme, article and event pages emit valid metadata; redirects preserve changed URLs. | S |
| WEB-06 | As a visitor, I want site search and enquiry forms. | Search covers approved public content; enquiry consent, routing, acknowledgement and spam controls work. | M |
| WEB-07 | As an analyst, I want privacy-aware acquisition and conversion measures. | Metrics exclude sensitive form content and report consented source → enquiry → application conversion. | S |

### EP-05 — Applicant CRM and applications

**Outcome:** All approved admission routes share a configurable, low-friction applicant journey.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| ADM-01 | As a prospect, I want to create an account, verify contact details and resume a draft application. | Duplicate detection warns safely; draft survives interruption and displays deadline/status. | M |
| ADM-02 | As Admissions, I want forms and requirements configured by route, programme and cycle. | Undergraduate, Direct Entry, JUPEB/foundation, postgraduate, transfer and international routes can vary without code changes. | M |
| ADM-03 | As an applicant, I want to upload and replace required evidence before submission. | File type/size/security checks run; completeness and replacement history are visible. | M |
| ADM-04 | As an assisted-intake officer, I want to capture a walk-in/offline application with applicant acknowledgement. | Record shows assisting officer/source; applicant receives access and confirms submitted data. | M |
| ADM-05 | As an applicant, I want to pay the correct application charge and receive evidence. | Submission status follows verified provider callback/reconciliation, not a browser success page alone. | M |
| ADM-06 | As Admissions, I want deduplication and identity discrepancy cases. | Possible matches are queued for authorised review; records are never merged automatically on name alone. | M |
| ADM-07 | As a referee, I want a secure single-use route to submit a recommendation. | Applicant cannot read confidential content; expiry, submission and access are logged. | S |

### EP-06 — Screening, ranking and external admission routes

**Outcome:** Eligible candidates are evaluated consistently with evidence and human approval.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| SCR-01 | As Admissions, I want validated CAPS data import/association for applicable candidates. | Source, cycle and import report are retained; discrepancies block recommendation until resolved. | M |
| SCR-02 | As an officer, I want configurable eligibility and scoring rules. | Rule version, inputs, calculation and decision explanation are reproducible for every candidate. | M |
| SCR-03 | As Admissions, I want screening appointment, attendance, score and accommodation management. | Capacity/conflicts are controlled; approved disability arrangements do not expose diagnoses to scorers. | S |
| SCR-04 | As Admissions, I want ranked lists constrained by programme capacity and approved policy. | Ties, quotas and overrides are explicit; every override requires authority and reason. | M |
| SCR-05 | As an authorised head, I want to review and approve batches separately from their preparer. | Approval freezes a version and produces a CAPS processing/export checklist; rejection returns reasons. | M |
| SCR-06 | As a JUPEB officer, I want subject combinations, centre-registration evidence and result status tracked. | Only configured approved-centre processes are advertised; external identifiers/evidence are retained. | S |
| SCR-07 | As a postgraduate school officer, I want qualifications, transcripts, referee reports, tests/interviews and supervisor capacity reviewed. | Departmental and school recommendations are separate; final decision records conditions and authority. | S |
| SCR-08 | As a compliance officer, I want protected attributes excluded from scoring unless an approved policy requires them. | Model/rule input inventory and decision logs demonstrate permitted use and human review. | M |

### EP-07 — Offers, acceptance and matriculation onboarding

**Outcome:** Approved candidates become valid student records without re-keying.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| ONB-01 | As Admissions, I want conditional or final offers generated from approved templates. | Offer contains programme, route, conditions, expiry and verification; only approved candidates receive one. | M |
| ONB-02 | As an admitted candidate, I want to accept/decline and satisfy conditions. | Acceptance is time-stamped; route-specific CAPS acceptance/approval is checked where applicable. | M |
| ONB-03 | As Bursary, I want acceptance charges assessed and reconciled. | Waiver/sponsorship/refund rules are explicit; payment alone cannot override unmet admission conditions. | M |
| ONB-04 | As Registry, I want matriculation numbers allocated from a controlled scheme. | Numbers are unique, non-reused and issued only after configured conditions; reservations/voids are audited. | M |
| ONB-05 | As a new student, I want onboarding tasks for identity verification, policies, medical/consent forms, orientation and account activation. | Required tasks and exceptions are visible; sensitive forms use restricted access. | M |
| ONB-06 | As ICT, I want approved student creation to trigger downstream provisioning. | SIS creation emits an idempotent event; retries do not create duplicate LMS, email or library accounts. | M |

### EP-08 — Core student record and lifecycle

**Outcome:** Registry maintains a complete, historically accurate student record.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| SIS-01 | As Registry, I want biographical, contact, sponsor and prior-education data with provenance. | Authoritative fields identify source, verification, effective date and change approval. | M |
| SIS-02 | As a student, I want to request corrections to protected identity fields. | Request needs evidence and approval; prior value remains in restricted history. | M |
| SIS-03 | As Registry, I want programme, level, mode, cohort, adviser and standing history. | Transfers, deferrals, suspensions, withdrawals, reinstatements and deaths use reasoned effective-dated events. | M |
| SIS-04 | As an officer, I want transfer/change-of-programme workflows with credit decisions. | Eligibility, approvals and course mappings are recorded; old programme history remains intact. | S |
| SIS-05 | As Registry, I want student status holds separate from lifecycle status. | Each hold has owner, reason, effect, start/release and appeal route; modules honour only relevant hold types. | M |
| SIS-06 | As a student, I want a timeline of my requests and status changes in plain language. | Only releasable reasons are shown; action owner, SLA and appeal information are visible. | S |

### EP-09 — Curriculum catalogue and academic planning

**Outcome:** The approved curriculum is versioned, teachable and defensible during accreditation.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| CUR-01 | As DAP, I want programmes, awards, duration, admission routes and accreditation history maintained. | Each programme version has approvals, effective cohorts and documentary evidence. | M |
| CUR-02 | As DAP, I want courses with credits, level, semester, prerequisites, outcomes and ownership. | Codes are unique by policy; changes create versions and do not rewrite completed records. | M |
| CUR-03 | As QA, I want curriculum elements mapped to applicable CCMAS requirements and local content. | Gaps, evidence and responsible owner are reportable per programme/version. | M |
| CUR-04 | As a department, I want curriculum changes proposed through Faculty and Senate approval. | Impact analysis lists cohorts, prerequisites, staffing and transition plan before approval. | M |
| CUR-05 | As DAP, I want programme capacity, staff/course ratios and projected demand modelled. | Assumptions are versioned and variance against actual enrolment can be reported. | S |
| CUR-06 | As an officer, I want equivalent/substitute courses and teach-out rules. | Registration and graduation audit consistently apply the rule valid for the student's curriculum version. | S |

### EP-10 — Course offering, registration and advising

**Outcome:** Students register only for valid courses and receive timely academic guidance.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| REG-01 | As a department, I want to create semester course offerings with lecturer, capacity and delivery mode. | Offering references an approved course version and cannot exceed validated room/online/staff constraints without exception. | M |
| REG-02 | As a student, I want the system to propose required, outstanding and eligible elective courses. | Proposal respects curriculum version, prerequisites, repeats, exclusions and credit limits. | M |
| REG-03 | As a student, I want to add/drop courses within configured dates. | Fees, timetable and LMS roster update idempotently; late change needs a reasoned approval. | M |
| REG-04 | As an adviser, I want to review exceptions and academic risk before approval. | Adviser sees relevant progress/holds but not unrelated counselling, health or disciplinary notes. | M |
| REG-05 | As Registry, I want a frozen registration statement for each term. | Student and approver can retrieve the exact approved version; later changes append amendments. | M |
| REG-06 | As a student, I want a degree-progress audit. | Audit explains satisfied, in-progress and missing requirements using the student's curriculum and approved substitutions. | S |

### EP-11 — Calendar, timetable, rooms and workload

**Outcome:** Teaching and examinations are scheduled without avoidable clashes and with visible ownership.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| TTB-01 | As DAP, I want an approved academic calendar with milestones and revision history. | Publication identifies version/authority; affected users are notified of approved changes. | M |
| TTB-02 | As a scheduler, I want room, lab, capacity, equipment and accessibility constraints. | Invalid assignments are blocked or explicitly overridden with reason. | M |
| TTB-03 | As a scheduler, I want clash detection across students, staff, rooms and campuses. | Conflicts are listed before publication and unresolved hard conflicts prevent release. | M |
| TTB-04 | As a lecturer/student, I want a personal timetable and change alerts. | Calendar/feed and portal agree; change notice names old/new time and effective date. | M |
| TTB-05 | As a HOD, I want teaching and supervision workload visible. | Workload derives from approved assignments and configurable rules; exceptions are explainable. | S |
| TTB-06 | As Facilities, I want utilisation and maintenance blocks. | Booking respects closures; utilisation reports distinguish reserved, used and cancelled periods. | C |

### EP-12 — Assessment, grading and result governance

**Outcome:** Marks progress through controlled entry, moderation, approval and publication.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| RES-01 | As a lecturer, I want assessment components and weights validated against policy. | Weights total correctly; changes after marks exist require authorised versioning. | M |
| RES-02 | As a lecturer, I want secure mark entry/import with validation and autosave. | Range, missing, duplicate and registration checks run; import returns row-level errors. | M |
| RES-03 | As a moderator/HOD, I want distributions, anomalies and evidence before recommendation. | Review records comments, resolution and exact result version. | M |
| RES-04 | As Faculty/Senate authority, I want staged approval and locked result batches. | Separation of duties is enforced; publication uses only the final approved batch. | M |
| RES-05 | As a student, I want released results, GPA/CGPA and standing explained. | Calculation is reproducible from policy/version; withheld items show an appropriate next action, not sensitive reasons. | M |
| RES-06 | As Exams and Records, I want controlled result correction and appeal. | Original remains immutable; request, evidence, approvals, recalculation and notification are audited. | M |
| RES-07 | As an auditor, I want to compare SIS, LMS and approved result totals. | Reconciliation identifies missing/mismatched records without silently overwriting the approved source. | S |

### EP-13 — Examination operations and academic integrity

**Outcome:** The institution can plan, conduct and evidence fair examinations.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| EXM-01 | As Exams, I want eligible candidate and course lists generated from frozen registration and holds. | List has version and cut-off time; approved late changes are appended and traceable. | M |
| EXM-02 | As a scheduler, I want examination clash and capacity optimisation. | Student, invigilator, room and accommodation conflicts are reported before publication. | M |
| EXM-03 | As Exams, I want question-paper submission, moderation and release controlled. | Files are encrypted/restricted; access and final release are logged; superseded versions cannot be printed accidentally. | S |
| EXM-04 | As an invigilator, I want attendance, incident and script-count capture. | Candidate identity, start/end, incident evidence and custody hand-offs reconcile. | M |
| EXM-05 | As a student with an approved accommodation, I want it applied without disclosing unnecessary medical information. | Scheduler/invigilator sees the arrangement, not the diagnosis; fulfilment is recorded. | M |
| EXM-06 | As an integrity officer, I want suspected misconduct referred to a fair case workflow. | Allegation, evidence, notice, response, panel decision, sanction and appeal are separated and access-controlled. | S |

### EP-14 — LMS course delivery and engagement

**Outcome:** Staff can deliver accessible, engaging conventional, blended and online courses.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| LMS-01 | As a lecturer, I want an offering shell automatically rostered from SIS. | Adds/drops sync within the agreed SLA and do not create duplicate users or courses. | M |
| LMS-02 | As an instructional designer, I want reusable templates aligned to outcomes and delivery mode. | Template includes orientation, outcomes, activities, assessment, support and accessibility checklist. | M |
| LMS-03 | As a learner, I want low-bandwidth asynchronous materials and clearly labelled download sizes. | Essential content remains usable without video; progress sync recovers after interruption. | M |
| LMS-04 | As a lecturer, I want announcements, discussions, groups, live-session links and office hours. | Participation rules, moderation and retention are clear; notifications honour preferences. | M |
| LMS-05 | As a learner, I want accessible captions/transcripts, document formats and keyboard navigation. | Sample courses pass WCAG 2.2 AA and manual assistive-technology review. | M |
| LMS-06 | As a lecturer, I want assignments, rubrics, feedback and grade passback. | Late/extension rules are explicit; only approved final outcomes enter the SIS result workflow. | M |
| LMS-07 | As an LMS administrator, I want LTI/OneRoster/QTI-compatible integrations where vendors conform. | Security review and data contract precede activation; launch/roster/grade failures are observable. | S |

### EP-15 — Online learner support, analytics and assessment integrity

**Outcome:** Online learners receive equivalent support and credible assessment.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| ODL-01 | As an online learner, I want orientation and a readiness check. | Gaps link to support resources; results do not become an unreviewed admission barrier. | M |
| ODL-02 | As learner support, I want engagement alerts based on transparent rules. | Alert explains trigger, routes to a human and never changes academic standing automatically. | M |
| ODL-03 | As a tutor, I want a caseload view of participation, submissions and contact attempts. | Data is limited to assigned learners and relevant course activity; export is controlled. | M |
| ODL-04 | As an assessor, I want configurable identity and integrity controls proportionate to assessment risk. | Student receives notice, practice path, accommodation and appeal; invasive proctoring requires DPIA/approval. | M |
| ODL-05 | As QA, I want course evaluation and outcome/engagement reports by delivery mode. | Reports suppress unsafe small groups and compare cohorts without implying causation. | S |
| ODL-06 | As an accreditation reviewer, I want time-bounded read-only evidence access. | Access is scoped, expiring and audited; private learner communications are excluded unless specifically justified. | S |

### EP-16 — Student billing, payments and sponsorship

**Outcome:** Students and Bursary share a reconciled, explainable account.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| FIN-01 | As Bursary, I want effective-dated fee schedules by cohort, programme, level, residency/mode and service. | Assessment shows rule/version; retroactive change requires approval and impact report. | M |
| FIN-02 | As a student, I want an itemised bill, balance and permitted instalment plan. | Amount due distinguishes assessed, paid, allocated, sponsored, waived, refunded and disputed sums. | M |
| FIN-03 | As a payer, I want secure provider checkout and a verifiable receipt. | Server-to-server verification and reconciliation establish payment; receipt number is unique and reprintable. | M |
| FIN-04 | As a cashier, I want controlled capture of bank/POS/approved offline payments. | Maker-checker, supporting evidence and bank reconciliation are required; no back-dated hidden edits. | M |
| FIN-05 | As Bursary, I want scholarships, waivers and sponsor commitments. | Award has authority, limit, eligible charges, period and unused-balance treatment. | S |
| FIN-06 | As a student, I want to raise a missing-payment or charge dispute. | Case links transaction/evidence, pauses only applicable enforcement and shows SLA/resolution. | M |
| FIN-07 | As a system owner, I want financial holds emitted from policy, not hard-coded screens. | Hold creation/release is idempotent, explainable and does not alter academic data. | M |

### EP-17 — Reconciliation, refunds and financial control

**Outcome:** Bursary can close periods and evidence all student-money movements.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| CTL-01 | As an accountant, I want gateway, bank and platform transactions automatically matched. | Exact/proposed/unmatched states and matching rule are visible; manual match needs reason. | M |
| CTL-02 | As Bursary, I want receipts allocated to charges with reversible journals. | Corrections use authorised reversal/repost; posted history is never overwritten. | M |
| CTL-03 | As a student, I want a refund request with status and approved destination verification. | Approval thresholds and name/account checks apply; payment and rejection evidence are retained. | M |
| CTL-04 | As a bursar, I want daily collection, ageing, outstanding, waiver, refund and reconciliation reports. | Totals drill to governed transactions and reconcile to the period close. | M |
| CTL-05 | As Finance, I want a controlled export/API to the institution's accounting/ERP system. | Chart/account mapping is versioned; rejected entries retry safely and are visible. | S |
| CTL-06 | As an auditor, I want close/reopen controls. | Closed periods reject posting; reopening requires elevated separate approval and produces an exception report. | M |

### EP-18 — Clearance, graduation, transcripts and credentials

**Outcome:** Graduands are cleared across units and receive trustworthy records promptly.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| GRD-01 | As Registry, I want a graduation audit using approved curriculum and results. | Missing credits, required courses, standing and exceptions are explained; manual override is separately approved. | M |
| GRD-02 | As a graduand, I want one clearance case with parallel unit checkpoints. | Each unit clears only its obligations; overall status derives from required checkpoints and records reasons/appeals. | M |
| GRD-03 | As Senate secretariat, I want graduand lists versioned and approved. | Programme/award/classification totals reconcile; approval freezes the exact list and exceptions. | M |
| GRD-04 | As a graduate, I want to request, pay for and track transcript delivery. | Identity, consent, recipient, fee, production, dispatch and delivery evidence are auditable. | M |
| GRD-05 | As Records, I want transcripts generated from the approved academic record. | Template/version, authorised signatory/seal and verification code are present; staff cannot hand-edit grades in output. | M |
| GRD-06 | As Records, I want certificate inventory, production, custody and collection. | Serial numbers reconcile from blank/printed/void/issued; collector identity and authority are recorded. | S |
| GRD-07 | As an authorised verifier, I want to validate a credential without seeing excess data. | Signed link/code returns validity and approved minimal fields; queries are rate-limited and logged. | S |

### EP-19 — Student affairs, wellbeing and inclusive support

**Outcome:** Students can access coordinated support while sensitive cases remain private.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| SAF-01 | As a student, I want to request academic, welfare, disability, counselling or career support from one front door. | Request routes by type/urgency; sensitive categories use restricted queues and neutral notifications. | M |
| SAF-02 | As a counsellor, I want confidential case notes isolated from general student records. | Only the care team has access; summary/referral sharing requires defined authority and is audited. | M |
| SAF-03 | As disability support, I want approved reasonable accommodations recorded once and applied to relevant services. | Implementers see arrangements and duration, not unnecessary diagnosis; student can request review. | M |
| SAF-04 | As Student Affairs, I want conduct cases with notice, response, panel decision, sanction and appeal. | Roles and deadlines follow policy; allegation is not presented as a finding. | S |
| SAF-05 | As SUG/club officers, I want registration, officers, events, budgets and handover records. | Staff oversight and tenure controls exist; membership disclosure is limited. | C |
| SAF-06 | As an adviser, I want consent-aware referrals and follow-up. | Referral records urgency, recipient, consent/lawful exception, outcome and closure without exposing clinical notes. | S |

### EP-20 — Accommodation, campus services and safety

**Outcome:** Optional campus services integrate with student status without contaminating the academic record.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| CAM-01 | As a student, I want to apply for accommodation and state relevant accessibility needs. | Allocation rules and priority version are visible; sensitive evidence is separately protected. | S |
| CAM-02 | As a hostel officer, I want rooms, beds, gender/eligibility policy, occupancy and maintenance blocks. | No double allocation; check-in/out and inventory condition are recorded. | S |
| CAM-03 | As Bursary, I want accommodation charges and refunds posted through Finance. | Hostel staff do not edit receipts; occupancy and charges reconcile. | S |
| CAM-04 | As the clinic, I want appointment/referral administration without exposing clinical records platform-wide. | General users see only operational status; clinical detail remains in an approved health system/restricted store. | C |
| CAM-05 | As Security/Student Affairs, I want emergency notices and welfare check workflows. | Initiation authority, audience, expiry, delivery and closure are audited; tests are clearly labelled. | S |

### EP-21 — Careers, NYSC and alumni

**Outcome:** The university supports transition to service/employment and maintains a consented alumni relationship.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| CAR-01 | As a student, I want a career profile, appointments, opportunities and placement log. | Student controls employer-visible fields; discriminatory fields are excluded by default. | S |
| CAR-02 | As Student Affairs/Records, I want an NYSC readiness checker. | It flags matriculation/name/date/programme/result issues against the approved graduation dataset and routes corrections. | M |
| CAR-03 | As an authorised officer, I want an auditable Senate-approved mobilisation export. | Only approved eligible graduates are included; schema/version, preparer, approver and submission evidence are retained. | M |
| CAR-04 | As a graduate, I want my account transitioned to alumni without losing requests or credentials. | Student-only permissions end; alumni identity retains verified linkage and appropriate services. | S |
| CAR-05 | As Alumni Relations, I want consented segmentation, events, mentoring and giving integrations. | Consent/preferences and communication history are enforced; donations reconcile through Finance. | C |
| CAR-06 | As leadership, I want graduate outcome surveys. | Reporting states response rate, cohort and limitations and suppresses identifying small groups. | S |

### EP-22 — Recruitment and core HR

**Outcome:** The institution maintains an authorised staff establishment and employment lifecycle.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| HRM-01 | As HR, I want approved positions tied to establishment, grade, unit and funding. | Recruitment cannot exceed authorised headcount without recorded exception approval. | M |
| HRM-02 | As an applicant, I want accessible vacancies, applications, evidence and status. | Criteria/version and consent are clear; panel-only notes are protected. | S |
| HRM-03 | As a panel member, I want conflict declarations, scoring and recommendations. | Independent scores, quorum and reasons are recorded; final approval is separate. | S |
| HRM-04 | As HR, I want an employment record for appointment, confirmation, posting, transfer, secondment and separation. | Every event is effective-dated and backed by approved documentation. | M |
| HRM-05 | As a staff member, I want to view and request correction of my profile and qualifications. | Protected changes require verification; credential history and source remain auditable. | M |
| HRM-06 | As ICT, I want joiner/mover/leaver events to drive access. | Provisioning follows approved effective dates; leaver access ends promptly while records are retained by policy. | M |

### EP-23 — Staff service, performance, promotion and payroll integration

**Outcome:** Staff processes are consistent while payroll remains financially controlled.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| HRS-01 | As staff, I want leave entitlement, request, approval and balance. | Policy/grade/effective date determine balance; delegated approval and audit are enforced. | S |
| HRS-02 | As a manager, I want objectives, review, feedback and development plans. | Review cycle and visibility are explicit; disputes and acknowledgement are supported. | S |
| HRS-03 | As HR, I want promotion eligibility and dossier workflows for academic and non-academic staff. | Criteria version, publications/evidence, external assessment, committee recommendation and decision are traceable. | S |
| HRS-04 | As an academic, I want a portfolio of teaching, supervision, publications, service and development. | Items have provenance/verification and can feed workload, promotion and accreditation with role-specific visibility. | S |
| HRS-05 | As HR/Bursary, I want approved staff/pay changes exported to payroll and payroll results returned. | Interface is effective-dated, encrypted, reconciled and rejects duplicates; preparer cannot approve payroll. | M |
| HRS-06 | As staff, I want a secure payslip and deduction history. | Payslip requires strong authentication and hides from delegated/general support access. | S |
| HRS-07 | As Bursary, I want pension/tax/other statutory outputs configurable and evidenced. | Rates/rules are never hard-coded; authority, effective date, remittance status and exception report are retained. | M |

### EP-24 — Quality assurance, accreditation and institutional planning

**Outcome:** Evidence is continuously assembled rather than recreated before reviews.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| QUA-01 | As QA, I want standards, criteria, evidence owners, review cycles and actions registered. | Every requirement has status, source, evidence, gap, owner and due date. | M |
| QUA-02 | As a programme, I want course files containing outline, attendance, assessment, moderation, samples and evaluation evidence. | Completeness is measured per offering; access/retention follow policy. | S |
| QUA-03 | As QA, I want anonymous course and service evaluations. | Eligibility prevents duplicate response; reporting threshold protects anonymity. | S |
| QUA-04 | As DAP, I want NUC/statutory reports generated from governed definitions. | Each metric has data owner, definition, cut-off and reconciliation; manual adjustments are labelled. | M |
| QUA-05 | As an accreditation coordinator, I want a frozen review evidence pack and reviewer portal. | Snapshot cannot drift as live data changes; reviewer access is scoped, expiring and logged. | M |
| QUA-06 | As leadership, I want action plans from reviews tracked to closure. | Owner, due date, evidence, validation and overdue escalation are visible. | S |

### EP-25 — Library, research and innovation integration

**Outcome:** Learning resources and scholarly activity connect to the academic and staff record without rebuilding specialist systems.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| LIB-01 | As a librarian, I want active patron and entitlement sync from SIS/HR. | Join/move/leave events update access within SLA; borrowing history is not exposed to unrelated units. | S |
| LIB-02 | As a learner, I want library discovery links embedded in course and programme contexts. | Access respects licensing and remote authentication; broken links can be reported. | S |
| LIB-03 | As Records, I want library obligations included in clearance. | Library clears only its checkpoint and sends a reason/release event; it cannot alter finance/academic status. | M |
| RSH-01 | As a researcher, I want publications, identifiers, projects and collaborators in my profile. | Duplicate/imported outputs can be claimed and verified; visibility and affiliation dates are preserved. | C |
| RSH-02 | As Research Office, I want proposals, ethics status, awards, milestones and outputs tracked. | Restricted proposal/ethics documents are segregated; funder deadlines and decisions are auditable. | C |
| RSH-03 | As leadership, I want research and innovation dashboards. | Metrics expose definitions and provenance and do not conflate submissions, awards and cash received. | C |

### EP-26 — Service desk, knowledge and digital operations

**Outcome:** Users receive accountable support and ICT can operate services safely.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| ITSM-01 | As a user, I want to report an issue, attach evidence and track progress. | Ticket number, category, priority, owner, SLA and communication history are visible. | M |
| ITSM-02 | As service desk, I want identity-aware routing and a knowledge base. | Suggestions avoid exposing private cases; articles have owners, approval and review dates. | M |
| ITSM-03 | As support, I want safe impersonation/session assistance. | User consent or approved emergency basis, duration and actions are recorded; passwords are never requested. | M |
| ITSM-04 | As an operator, I want incident, problem, change and release records. | High-risk changes include approval, test, rollback and post-change review; incidents link root cause/actions. | S |
| ITSM-05 | As a service owner, I want availability, latency, queue and error dashboards with alerting. | Alerts have thresholds/runbooks; synthetic checks cover critical applicant/student/payment journeys. | M |
| ITSM-06 | As leadership, I want SLA, recurring issue and satisfaction reporting. | Metrics exclude paused time correctly and distinguish volume from service quality. | S |

### EP-27 — Integrations, APIs and data exchange

**Outcome:** External systems exchange trustworthy data without brittle database access.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| INT-01 | As an integration owner, I want versioned APIs/events with an owner and data contract. | Authentication, scopes, schema, purpose, SLA, errors and deprecation policy are documented. | M |
| INT-02 | As ICT, I want an integration queue with retry, idempotency and dead-letter handling. | A replay cannot duplicate money, people, registrations or marks; failed messages alert an owner. | M |
| INT-03 | As an officer, I want controlled CSV import/export when no API exists. | Template/schema version, validation preview, row-level errors, approval and checksum are retained. | M |
| INT-04 | As privacy/security, I want each integration assessed before production. | Data fields, purpose, lawful basis, processor/recipient, location, retention and security review are recorded. | M |
| INT-05 | As a data steward, I want source-system and identifier mapping. | Crosswalks are unique, historical and merge-safe; no downstream system guesses identity from name. | M |
| INT-06 | As a regulator-facing officer, I want JAMB, JUPEB, NYSC, NELFUND/NEDI and other exchanges isolated behind adapters. | Format changes affect the adapter, not core records; submission/receipt and reconciliation evidence are stored. | S |

### EP-28 — Reporting, analytics and data governance

**Outcome:** Decisions use defined, reconciled metrics rather than conflicting spreadsheets.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| DAT-01 | As a data governance council, I want data owners, stewards, definitions, classifications and quality rules. | Critical elements have approved definitions and accountable owners. | M |
| DAT-02 | As an analyst, I want a reporting model separated from transactional workloads. | Refresh time and lineage are shown; dashboards cannot update source records. | M |
| DAT-03 | As leadership, I want funnel, enrolment, retention, progression, finance, staffing and service dashboards. | Metrics reconcile to source totals and allow authorised drill-down only. | M |
| DAT-04 | As a planner, I want cohort and trend comparisons with frozen definitions. | Restated metrics are versioned; reports disclose filters, cut-off, missing data and definition. | S |
| DAT-05 | As a data steward, I want duplicates, invalid values and reconciliation exceptions routed to owners. | Correction occurs in the source system and propagates; analytics does not patch around bad data invisibly. | M |
| DAT-06 | As privacy, I want de-identification, minimum-cell suppression and governed research extracts. | Re-identification risk is assessed; approval, recipient, fields, expiry and deletion evidence are recorded. | S |

### EP-29 — Privacy, cybersecurity and resilience

**Outcome:** The platform protects confidentiality, integrity and availability throughout its lifecycle.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| SEC-01 | As the DPO, I want a processing register with purpose, lawful basis, fields, recipients, retention and location. | Every module/integration maps to an owner and current privacy notice; gaps block release of high-risk processing. | M |
| SEC-02 | As the DPO, I want data-subject request and grievance workflows. | Identity, scope, search, redaction, decision, delivery and deadline are audited. | M |
| SEC-03 | As a product owner, I want DPIA gates for high-risk features. | Biometric/proctoring/AI/health/large-scale monitoring features cannot launch without recorded assessment and approval. | M |
| SEC-04 | As Security, I want encryption, secrets management, secure sessions and vulnerability management. | Sensitive data is encrypted in transit/at rest; secrets are rotated; critical findings meet remediation SLA. | M |
| SEC-05 | As Security, I want central detection, alert triage and incident/breach response. | Runbooks, evidence preservation, breach register, decision timeline and notification workflow are tested. | M |
| SEC-06 | As Operations, I want tested backups, restore, disaster recovery and continuity. | RPO/RTO are approved per service; restore and failover exercises produce evidence and corrective actions. | M |
| SEC-07 | As a vendor manager, I want third-party risk and exit plans. | Contract records processing/security/availability/return-deletion duties and a tested data-export path. | M |
| SEC-08 | As a user, I want accessible security and authentication. | MFA/recovery do not rely solely on inaccessible puzzles or a single lost device; suspicious recovery alerts the user. | M |

### EP-30 — Governance, policy and decision records

**Outcome:** Platform configuration and institutional decisions remain aligned with authorised policy.

| ID | User story | Acceptance | Pri |
|---|---|---|---|
| GOV-01 | As Senate/Council secretariat, I want approved policies and decisions linked to implementing rules. | Rule/configuration shows authority, minute/reference, effective date and superseded version. | M |
| GOV-02 | As a committee secretary, I want agenda packs, declarations, quorum, minutes, actions and restricted decisions. | Access and publication reflect classification; final minutes are immutable with controlled corrections. | S |
| GOV-03 | As a policy owner, I want review dates and expiry alerts. | Expired policy does not silently disappear; responsible authority decides extension/replacement. | S |
| GOV-04 | As Internal Audit, I want sampled case trails across admissions, results, finance, HR and credentials. | Evidence can be exported read-only with integrity metadata and redaction. | M |
| GOV-05 | As leadership, I want risk, control and benefit registers for the transformation programme. | Each item has owner, measure, target, review and decision; benefit claims link to baseline data. | S |

## 9. Cross-epic acceptance scenarios

These scenarios should become programme-level integration tests:

1. **Applicant-to-student:** a candidate submits once, pays, is screened, passes the relevant external-route checkpoint, receives/accepts an offer, becomes one student identity and is provisioned downstream without duplicate accounts.
2. **Registration-to-learning:** an approved course registration updates fee impact, timetable and LMS roster; an approved drop reverses each effect exactly once.
3. **Assessment-to-record:** LMS/lecturer marks move through moderation and Faculty/Senate approval; SIS publishes only the approved version; correction preserves the original.
4. **Payment-to-clearance:** a verified payment is allocated and reconciled; the related Bursary hold releases; Bursary clearance alone does not complete overall clearance.
5. **Graduation-to-NYSC:** degree audit, Senate approval and multi-unit clearance create a reconciled graduate record; mobilisation export uses only the approved dataset and logs corrections.
6. **Staff joiner-to-teacher:** an approved appointment provisions staff access; teaching assignment creates appropriate LMS access; separation removes current access without erasing historical authorship.
7. **Privacy incident:** suspicious access is detected, contained and investigated; breach risk, notification decision, affected records, communications and recovery evidence are logged.
8. **Disaster recovery:** the latest approved results and reconciled payments are restored within the agreed RPO/RTO and cryptographically/financially reconciled.

## 10. Core data domains and ownership

| Domain | Authoritative owner | Key records |
|---|---|---|
| Person and identity | Identity service with Registry/HR stewardship | Person, identifiers, contacts, roles, identity evidence, preferences |
| Organisation and academic time | DAP/Registry | Campus, faculty, department, unit, session, term, calendar |
| Programme and curriculum | DAP/QA with Senate authority | Programme version, course version, rules, outcomes, CCMAS mapping |
| Application and decision | Admissions | Applicant case, route, evidence, screening, recommendation, decision |
| Student and enrolment | Registry/SIS | Student programme, status, standing, registration, credits, holds |
| Teaching and learning | Academic unit/LMS | Offering, roster, activities, submissions, feedback, engagement |
| Results and awards | Exams and Records | Assessment result, approved course result, progression, award, transcript |
| Finance | Bursary | Charge, invoice, receipt, allocation, sponsor, refund, reconciliation |
| Employment | HR/Establishment | Position, appointment, posting, leave, review, promotion, separation |
| Support cases | Owning service unit | Ticket/case, consent, action, outcome; sensitive notes segregated |
| Compliance and evidence | QA/DPO/Audit/Records Management | Standard, control, evidence, retention, audit, DPIA, incident |

## 11. Integration register

| Integration | Direction | Minimum approach | Important caution |
|---|---|---|---|
| JAMB/CAPS/IBASS | Import/export or assisted exchange subject to available official interface | Adapter, controlled import, candidate/programme mapping, batch evidence and reconciliation | Do not claim the local portal replaces CAPS; confirm current interface/authorisation with JAMB |
| JUPEB | Exchange/assisted portal workflow | Approved-centre configuration, candidate/exam IDs, subject/result evidence | Advertise/register only under the university's approved status |
| NYSC | Export/assisted submission | Senate-approved graduand dataset, validation, maker-checker and submission receipt | Exact schema/process must be confirmed each mobilisation cycle |
| NELFUND SVS | Institution verification exchange | Minimal status/fees/enrolment fields, consent/lawful basis, reconciliation | Confirm current onboarding, API/file schema and data-sharing terms |
| NIMC/NIN verification | Verification only if authorised | Provider adapter and minimal response storage | NIN is not a safe public identifier; obtain lawful access and DPIA |
| WAEC/NECO/other credentials | Verification where officially supported | Evidence/status adapter and manual exception path | Do not scrape portals or store verification secrets in application records |
| Payment gateways/banks | Two-way | Hosted checkout, signed callback, transaction query, settlement file/API | Never trust redirect success alone; avoid card-data storage |
| Accounting/ERP | Two-way | Versioned chart mapping, journals, receipts/refunds and period reconciliation | Finance is source of posted transaction; define which system owns the general ledger |
| LMS | Two-way | SIS roster/event sync; OneRoster/LTI/QTI where supported | SIS owns registration and approved results; LMS activity is not the final academic record |
| Email/SMS/push | Outbound plus delivery status | Template/version, queue, provider failover, consent/preferences | Sensitive content should not be placed in insecure notification bodies |
| Library | Two-way | Patron/entitlement and clearance adapter | Borrowing history remains library-confidential |
| HR/payroll/biometric | Two-way | Canonical staff IDs, approved change events and reconciled payroll output | Biometric use needs necessity/proportionality review and DPIA |
| Identity/email directory | Two-way lifecycle | SSO, SCIM/event adapter or equivalent, joiner/mover/leaver workflow | Do not make directory attributes the only historical HR/SIS record |

## 12. Non-functional requirements and measurable targets

Targets must be confirmed against enrolment, campuses, peak registration/payment traffic, connectivity and budget.

| Area | Initial target for validation |
|---|---|
| Availability | Define per service; public/applicant/student core suggested ≥99.9% monthly excluding announced maintenance; publish status and maintenance notices |
| Peak performance | p95 server response ≤2 seconds for common read actions under agreed peak load; long reports/jobs asynchronous with progress |
| Registration/payment integrity | Idempotent operations; no duplicate charge/receipt/registration under retry, refresh or delayed callback |
| Accessibility | WCAG 2.2 AA automated plus manual keyboard/screen-reader testing for critical journeys |
| Low bandwidth | Essential applicant/student/LMS tasks usable on representative low-end Android device and constrained network; resumable uploads/drafts |
| Recovery | Business-approved RPO/RTO by domain; results and finance receive stricter targets; restore tests at least twice yearly |
| Audit | Privileged, financial, admission, result, credential and sensitive-record access retained per policy and searchable by authorised audit staff |
| Security | MFA for privileged users; risk-based remediation SLAs; independent test before major launch and after material changes |
| Privacy | Processing register, notices, retention schedule, request workflow and DPIA gate operational before live personal data |
| Data quality | Critical-element completeness/validity/uniqueness thresholds; reconciliation exceptions owned and time-bound |
| Observability | Correlation ID across web/API/queue; dashboards and alerts for error rate, latency, queues, integrations and critical journeys |
| Browser/device | Current supported matrix agreed from user analytics; progressive enhancement rather than desktop-only workflows |
| Localisation | Internationalised formats and content architecture; English baseline, with future local-language content support |

## 13. Discovery decisions still required

Resolve these before estimating releases:

1. University ownership/model: federal, state or private; single or multi-campus; governing statute and approval hierarchy.
2. Current student/staff/applicant counts, annual intake, peak concurrent users and projected five-year growth.
3. Exact programme portfolio and modes: conventional, blended, fully online/ODL, postgraduate, JUPEB, part-time, sandwich, professional/short courses.
4. Existing systems, vendors, contracts, data exports, database access, data quality and authoritative-system decisions.
5. JAMB, JUPEB, NYSC, NELFUND, NIMC, results-verification and payment integration access actually granted to the institution.
6. Academic regulations: credit system, grading, repeats, probation/withdrawal, transfer, deferment, classification and Senate workflow.
7. Finance policy: fee dimensions, instalments, waivers, sponsors, refund rules, chart of accounts, bank/gateway settlement and general-ledger owner.
8. HR conditions of service, establishment structure, payroll owner, pension/tax obligations and biometric policy.
9. Records retention schedule, legal holds, transcript/certificate signing and verification policy.
10. Identity strategy: institutional email, SSO, MFA, alumni access, applicant conversion and account recovery.
11. Hosting/data-location requirements, approved cloud/processors, network/power realities, RPO/RTO and continuity arrangements.
12. Accessibility, disability-support and exam-accommodation policy plus representative user testing panel.
13. Data governance council, DPO, information-security owner, product owners and named data stewards.
14. Migration scope and archival approach for paper files, spreadsheets and legacy systems.
15. Whether the first launch follows a new cohort only or must serve all continuing students immediately.

## 14. Recommended delivery governance

- Create a product council chaired by an accountable executive, with product owners from Registry/Admissions, DAP/QA, Exams and Records, Bursary, HR, Student Affairs, Library, Communications and ICT, plus student and academic representatives.
- Give each epic one business owner and one technical owner. ICT owns service reliability and technical controls; it does not invent academic or financial policy.
- Run policy mapping and data cleansing ahead of software delivery. Digitising contradictory spreadsheets only creates faster contradictions.
- Pilot with one admission route and one or two faculties while keeping rules configurable; do not hard-code the pilot's exceptions as university-wide policy.
- Use synthetic or properly de-identified data outside production. Restrict production copies and log privileged support access.
- Measure outcomes: application completion, decision turnaround, registration completion, unreconciled payments, result approval time, transcript turnaround, support resolution, retention and accessibility failures—not merely number of features shipped.

## 15. Definition of Ready and Definition of Done

### A story is Ready when

- business owner, users, policy authority and source of truth are named;
- workflow, states, failure/appeal paths and segregation of duties are agreed;
- data classification, lawful basis, retention and external recipients are assessed;
- acceptance examples include normal, duplicate/retry, permission, accessibility and low-bandwidth cases;
- dependencies, migration, reporting and operational ownership are known.

### A story is Done when

- acceptance tests and cross-module contract tests pass;
- role/scope denial tests, audit events and maker-checker controls pass;
- accessibility and representative-device tests pass for changed journeys;
- telemetry, alerts, runbook, backup/restore impact and support article are complete;
- data migration/reconciliation is evidenced where applicable;
- privacy/security review is closed, documentation is current and the business owner accepts the outcome.

## 16. Risks to manage from the beginning

| Risk | Early mitigation |
|---|---|
| Scope becomes “build every university system at once” | Phase-gated roadmap, thin end-to-end slices and explicit out-of-scope register |
| Conflicting records across modules | Canonical IDs, named sources of truth, event contracts and reconciliation dashboards |
| Policy is embedded in code | Effective-dated rule configuration linked to approving authority |
| External portal/process changes | Adapter layer, cycle-specific validation and manual controlled fallback |
| Payment or result duplication | Idempotency, immutable journals/result versions and cross-system reconciliation |
| Super-admin abuse | Least privilege, scope, MFA, segregation of duties, break-glass and access review |
| Sensitive student-support leakage | Separate case stores, neutral notifications and field-level access |
| Online education becomes a file dump | Course-design templates, interaction, feedback, learner support and QA evidence |
| Poor legacy data undermines launch | Profiling, cleansing, deduplication, reconciliation and signed migration acceptance |
| Vendor lock-in | Export rights, open contracts/standards, canonical data model and tested exit plan |
| Registration-week outage | Load tests, queues, capacity plan, graceful degradation, communications and recovery rehearsal |
| Analytics causes unfair automated decisions | Transparent rules, bias/quality review, human decision and appeal |

## 17. Suggested next artefacts

1. Stakeholder/RACI map and approval-authority matrix.
2. Current-state process maps for admissions, registration, results, payment reconciliation, clearance and payroll.
3. Canonical domain model and data dictionary.
4. Permission matrix including segregation-of-duty conflicts.
5. Architecture decision record covering modular boundaries, identity, integration, hosting and tenancy/campus model.
6. Legacy-system and data-migration assessment.
7. Clickable prototypes for applicant, student, lecturer and administrative workspaces.
8. Release 1 refined backlog with estimates, dependencies and test examples.
9. DPIA and threat model for the Release 1 data flows.
10. Benefits baseline and operational readiness plan.

---

This backlog deliberately treats external Nigerian platforms and policies as dependencies to validate with the relevant authority for each cycle. It avoids encoding a transient portal screen, fee, score, pension rate or file format as permanent product truth.