# Student Dashboard: Epics and User Stories

**Status:** Product backlog for refinement  
**Workspace:** Student Portal / Student Dashboard  
**Primary user:** Authenticated student  
**Purpose:** Define a unified student dashboard without changing the platform's existing business logic, domain ownership, approval workflows, or route structure.

## 1. Product outcome

The Student Dashboard gives each student one secure, accessible place to understand what requires attention and to open the existing student services for registration, timetable, LMS learning, live online classes, assignments, online CBT/examinations, released results, grades, finance, records, support, and graduation-related activity.

The dashboard is an experience and orchestration layer. It does not become a new source of truth and does not bypass an existing workflow.

## 2. Existing business boundaries to preserve

| Information or action | Authoritative owner | Dashboard responsibility |
|---|---|---|
| Identity, roles and session access | Identity and Access (EP-01) | Authenticate the student and show only services allowed by the current role and status. |
| Student identity, lifecycle, standing and holds | SIS / Student Records (EP-08) | Display releasable information and link to existing correction, request and appeal journeys. |
| Curriculum and degree requirements | Curriculum / Academic Planning (EP-09) | Display the approved curriculum version and degree-progress information. |
| Course registration | Registration and Advising (EP-10) | Surface registration status, deadlines and actions; never alter registration outside its workflow. |
| Calendar and timetable | Calendar and Timetable (EP-11) | Aggregate approved events and display published changes. |
| Marks, GPA/CGPA, standing and published results | Assessment and Result Governance (EP-12) | Display only results released for the student; never calculate or publish an alternative result. |
| Examination eligibility and operations | Examination Operations (EP-13) | Show approved examination schedules, eligibility, accommodations and candidate-facing notices. |
| Course content, learning activity and coursework | LMS (EP-14) | Provide entry points into rostered course shells and display LMS-owned activity. |
| Online learner support and assessment integrity | Online Learning (EP-15) | Surface readiness, human-reviewed alerts, assessment notices and support paths. |
| Bills, payments, receipts and financial holds | Finance (EP-16/17) | Display governed balances and payment status and link to existing payment/dispute journeys. |
| Clearance, graduation and transcripts | Graduation and Records (EP-18) | Display case status and link to the existing request, payment and appeal workflows. |
| Student support and accommodations | Student Affairs (EP-19) | Provide a neutral front door without exposing restricted case or medical details. |

## 3. Priorities

- **M — Must:** Required for a safe and useful dashboard release.
- **S — Should:** Important after the core journey is stable.
- **C — Could:** Valuable enhancement that may follow later.

## 4. Epics and user stories

### SD-01 — Secure dashboard access and student context

**Outcome:** A student enters the dashboard securely and sees information belonging only to their current identity and authorised student context.

| ID | User story | Acceptance criteria | Pri |
|---|---|---|---|
| SD-AUTH-01 | As a student, I want to sign in with my existing university identity so that I can use all authorised student services without separate accounts. | The dashboard uses the existing identity/session mechanism; a disabled identity cannot open protected student information. | M |
| SD-AUTH-02 | As a person with more than one university role or student record, I want the active context to be clear so that I do not act against the wrong profile. | The active role, student identity, programme and session are visible; context switching is limited to identities and roles already authorised. | M |
| SD-AUTH-03 | As a student, I want a safe recovery path when I cannot sign in. | Recovery uses the existing identity process, does not disclose whether unrelated accounts exist, and records security-relevant events. | M |
| SD-AUTH-04 | As a student, I want private information hidden when my session expires or I sign out. | Protected pages reject expired sessions, cached sensitive views are not shown to the next user, and sign-out ends the active session according to current identity policy. | M |
| SD-AUTH-05 | As a student, I want the dashboard to work on mobile and with assistive technology. | Core journeys are keyboard operable, responsive, readable at supported zoom, and meet the platform's WCAG 2.2 AA target. | M |

### SD-02 — Dashboard home, alerts and next actions

**Outcome:** The student can quickly understand today's schedule, urgent obligations, upcoming academic work, and where to go next.

| ID | User story | Acceptance criteria | Pri |
|---|---|---|---|
| SD-HOME-01 | As a student, I want a personalised summary so that I can see my programme, level, session and current enrolment context. | Values come from the authoritative student record; the dashboard does not provide direct editing of protected or derived fields. | M |
| SD-HOME-02 | As a student, I want to see my next classes, live sessions, assessments and examinations in time order. | Items come from approved timetable, LMS and examination sources; each item identifies its source, date/time, delivery mode and relevant action. | M |
| SD-HOME-03 | As a student, I want a prioritised task list so that I know what needs action. | Registration, payment, coursework, examination and support items show a plain-language state, deadline and destination; the dashboard does not invent or change their underlying states. | M |
| SD-HOME-04 | As a student, I want important changes highlighted so that I do not miss a moved class, new deadline or released result. | A notice describes what changed and, where supplied by the source, the former value, new value and effective date. | M |
| SD-HOME-05 | As a student, I want completed or irrelevant notices to stop distracting me. | Dismissal affects only the student's dashboard view and does not acknowledge, approve, resolve or delete the source record. | S |
| SD-HOME-06 | As a student, I want dashboard data freshness to be understandable. | Delayed or unavailable source data is labelled; stale values are not presented as newly confirmed information. | S |

### SD-03 — Academic profile, registration and degree progress

**Outcome:** The student understands their academic record and can enter existing registration and record-management journeys.

| ID | User story | Acceptance criteria | Pri |
|---|---|---|---|
| SD-ACAD-01 | As a student, I want to view my releasable personal and academic details so that I can identify errors. | The view uses SIS data and excludes internal reasons, restricted evidence and unapproved changes. | M |
| SD-ACAD-02 | As a student, I want to request a correction to eligible identity details. | The dashboard links to the existing evidence-based correction workflow; it does not directly overwrite the student record. | M |
| SD-ACAD-03 | As a student, I want to see registration dates, status and holds so that I understand whether I can register. | Dates come from configured academic periods; each applicable hold shows a student-facing reason, owner, affected service and appeal or next action. | M |
| SD-ACAD-04 | As a student, I want to review proposed required, outstanding and eligible elective courses. | The proposal comes from EP-10 rules for curriculum version, prerequisites, repeats, exclusions and credit limits. | M |
| SD-ACAD-05 | As a student, I want to add or drop courses through the approved process. | The action enters the existing registration workflow; successful changes update dependent fee, timetable and LMS projections idempotently. | M |
| SD-ACAD-06 | As a student, I want to retrieve my approved registration statement. | The exact frozen version is available and later approved changes appear as amendments rather than rewriting history. | M |
| SD-ACAD-07 | As a student, I want a degree-progress view so that I can see satisfied, in-progress and missing requirements. | Progress is derived from the student's approved curriculum version, results and substitutions, with no dashboard-only rules. | S |

### SD-04 — Timetable and online class attendance

**Outcome:** The student can find and attend physical, blended and live online classes from the same schedule.

| ID | User story | Acceptance criteria | Pri |
|---|---|---|---|
| SD-CLASS-01 | As a student, I want a daily, weekly and course-based timetable so that I can plan my studies. | Only published events for the student's approved/active course context are shown, with date, time, location or delivery mode. | M |
| SD-CLASS-02 | As a student, I want to join a live online class from the timetable or course so that I do not have to search for the meeting link. | The join action is available only for a rostered course and follows the configured availability window and external-tool launch rules. | M |
| SD-CLASS-03 | As a student, I want the session time shown in my understood time zone so that I join at the correct time. | The institution's event time and displayed time zone are explicit; conversion never changes the authoritative schedule. | M |
| SD-CLASS-04 | As a student, I want to know whether a live class will be recorded and captioned. | Recording, caption and transcript arrangements supplied by the LMS are visible before joining; missing arrangements are not falsely claimed. | M |
| SD-CLASS-05 | As a student with limited connectivity, I want an alternative when I cannot remain in a live class. | Where provided, the course shows a recording, transcript, notes or asynchronous alternative; the dashboard does not mark an unavailable alternative as complete. | M |
| SD-CLASS-06 | As a student, I want timetable changes and cancellations clearly communicated. | The notice identifies the affected event and published change; calendar and dashboard views agree with the authoritative timetable. | M |
| SD-CLASS-07 | As a student, I want to see attendance information released to me and query an apparent error. | Only student-releasable attendance is displayed and any query enters the existing review process without editing the attendance record directly. | S |

### SD-05 — LMS courses, materials and engagement

**Outcome:** The student can access rostered LMS courses, continue learning, and participate using accessible, low-bandwidth options.

| ID | User story | Acceptance criteria | Pri |
|---|---|---|---|
| SD-LMS-01 | As a student, I want to see all course shells for my active registrations. | LMS access follows the SIS roster projection; replayed registration events do not create duplicate courses or enrolments. | M |
| SD-LMS-02 | As a student, I want each course to show orientation, outcomes, activities, assessment and support information. | Content comes from the approved course shell/template and retains its current structure. | M |
| SD-LMS-03 | As a student, I want materials labelled by format and download size so that I can manage my data usage. | Each resource shows the available format/size and, where supplied, its lightest usable alternative. | M |
| SD-LMS-04 | As a student, I want reading and activity progress to recover after an interrupted connection. | Progress sync follows existing LMS merge rules, does not move completed progress backwards, and safely ignores replayed updates. | M |
| SD-LMS-05 | As a student, I want captions, transcripts and accessible documents so that I can use course content. | Available alternatives are exposed consistently and missing required accessibility support is clearly reportable. | M |
| SD-LMS-06 | As a student, I want course announcements, discussions, groups and office hours in context. | Participation and moderation rules are visible; hidden, late or restricted activity is handled by existing LMS policy. | M |
| SD-LMS-07 | As a student, I want external learning tools to open without another unmanaged account where supported. | Launch uses an approved integration and passes only data allowed by its active data contract. | S |

### SD-06 — Assignments, quizzes and coursework feedback

**Outcome:** The student understands coursework requirements, submits work reliably, and receives feedback only when released.

| ID | User story | Acceptance criteria | Pri |
|---|---|---|---|
| SD-WORK-01 | As a student, I want all upcoming coursework deadlines in one view. | Items retain the course, component, due date, weight and source status defined in the LMS; final examinations remain owned by Exams and Records. | M |
| SD-WORK-02 | As a student, I want clear instructions, rubric and permitted submission formats before I begin. | The current assessment version and rules are visible; changes after activity has begun follow existing versioning controls. | M |
| SD-WORK-03 | As a student, I want to save or upload my work and receive reliable submission evidence. | The final state shows the submitted version and authoritative receipt/time; retry does not create an unintended duplicate submission. | M |
| SD-WORK-04 | As a student, I want late, grace-period, extension and cut-off rules explained. | The dashboard displays the rules and approved extension currently held by the LMS and does not calculate a conflicting deadline. | M |
| SD-WORK-05 | As a student, I want to see released marks and feedback. | Draft or moderator-only grades are never shown; released feedback is distinguished from the final result passed into result governance. | M |
| SD-WORK-06 | As a student, I want to know when a resubmission is allowed. | The opportunity, attempt count, deadline and effect on grading come from the configured assessment; unavailable attempts cannot be created through the dashboard. | S |

### SD-07 — Online CBT, quizzes and examinations

**Outcome:** An eligible student can prepare for, enter, complete and evidence an online CBT or examination under the institution's configured assessment and integrity rules.

| ID | User story | Acceptance criteria | Pri |
|---|---|---|---|
| SD-CBT-01 | As a student, I want to see my online CBT/examination schedule and eligibility so that I know what I may take. | The dashboard shows the approved course, date/time, duration, delivery method, candidate-facing eligibility state and next action from examination operations. | M |
| SD-CBT-02 | As a student, I want a practice or readiness check before a high-stakes online examination. | Where configured, the check validates supported device/browser, connection, identity step and assessment navigation without consuming a real attempt or becoming an unreviewed academic barrier. | M |
| SD-CBT-03 | As a student, I want examination rules and integrity/privacy notices before starting. | Required notices, permitted materials, conduct rules, data collection, support and appeal paths are presented before consent/acknowledgement where policy requires it. | M |
| SD-CBT-04 | As an eligible student, I want to launch the correct CBT during its permitted window. | Launch checks the authoritative candidate list, current window, attempt state and applicable holds; denial gives a safe student-facing reason and support route. | M |
| SD-CBT-05 | As a student, I want my approved examination accommodation applied. | Extra time, alternative format or other approved arrangement comes from the existing accommodation process; the assessment view does not expose diagnosis or unrelated evidence. | M |
| SD-CBT-06 | As a student, I want answers saved during the examination so that a brief connection interruption does not automatically lose my work. | Save state and connection state are visible; retry/reconnect follows the configured examination policy and does not create a second attempt. | M |
| SD-CBT-07 | As a student, I want unanswered and flagged questions clearly indicated so that I can review my work before submission. | Navigation status is accurate for the active attempt and does not reveal answers or restricted item metadata. | M |
| SD-CBT-08 | As a student, I want a clear warning before final submission. | The confirmation shows unanswered-item count where permitted; final submission is idempotent and cannot silently reopen or duplicate the attempt. | M |
| SD-CBT-09 | As a student, I want proof that my CBT/examination was submitted. | A candidate-facing receipt shows assessment, submission state and authoritative time without exposing protected answers or scoring keys. | M |
| SD-CBT-10 | As a student affected by a technical incident, I want a documented support and review route. | The incident can be linked to the attempt and relevant telemetry; academic remedy remains a human decision under existing examination policy. | M |
| SD-CBT-11 | As a student, I want proportionate identity and integrity controls. | Controls follow the assessment risk configuration; invasive proctoring is used only when approved, disclosed and supported by the required privacy assessment and accommodation path. | M |
| SD-CBT-12 | As a student, I want CBT scores shown only when formally releasable. | An immediate practice/quiz score appears only when configured; formal examination marks remain hidden until released through EP-12 result governance. | M |

### SD-08 — Results, grades and academic standing

**Outcome:** The student sees an accurate, understandable view of formally released academic outcomes.

| ID | User story | Acceptance criteria | Pri |
|---|---|---|---|
| SD-RES-01 | As a student, I want to view released results by session and semester. | Only the final approved/published result version is displayed; draft, entered-for-moderation and internal review states are excluded. | M |
| SD-RES-02 | As a student, I want each course result to show the released score, grade and credit information allowed by policy. | Values are read from the governed result record and agree with the approved grading policy/version. | M |
| SD-RES-03 | As a student, I want GPA and CGPA explained so that I understand how they were derived. | The displayed calculation is reproducible from the same approved results, credits and effective grading rule used by EP-12. | M |
| SD-RES-04 | As a student, I want my academic standing explained in plain language. | The current releasable standing and next action are shown; the dashboard does not infer or impose a new progression decision. | M |
| SD-RES-05 | As a student, I want withheld, pending or unavailable items explained safely. | The view supplies an appropriate student-facing state, owner and next action without revealing sensitive internal reasons. | M |
| SD-RES-06 | As a student, I want to request a result review or appeal. | The request enters the controlled correction/appeal workflow with its deadline and evidence requirements; the original result remains unchanged unless approved. | M |
| SD-RES-07 | As a student, I want notification when an approved result or correction is published. | The notice links to the governed result version and does not disclose grades in an unsafe notification channel. | S |
| SD-RES-08 | As a student, I want to download or print a result statement when the institution permits it. | The output is clearly identified as official or unofficial according to current Records policy and contains only released data. | S |

### SD-09 — Finance, services and student requests

**Outcome:** The student can understand obligations and enter existing finance, records and support workflows without duplicating them.

| ID | User story | Acceptance criteria | Pri |
|---|---|---|---|
| SD-SVC-01 | As a student, I want to see my itemised bill, balance and payment status. | Amounts distinguish assessed, paid, allocated, sponsored, waived, refunded and disputed sums using Finance data. | M |
| SD-SVC-02 | As a student, I want to pay an eligible charge and retrieve a receipt. | Payment uses the approved provider flow; only verified/reconciled payment changes the authoritative status, and receipts remain reprintable. | M |
| SD-SVC-03 | As a student, I want to raise and track a missing-payment or charge dispute. | The case links evidence and shows its SLA/status; the dashboard does not mark a payment successful by itself. | M |
| SD-SVC-04 | As a student, I want one front door for academic, welfare, disability, counselling and career support. | Requests route to the existing owner; sensitive categories use neutral labels/notifications and restricted details. | M |
| SD-SVC-05 | As a student, I want to track my open requests and appeals. | Each item shows its releasable status, action owner, SLA and next action without exposing internal notes. | M |
| SD-SVC-06 | As a graduand, I want to see clearance checkpoints and appeal a block. | Status derives from the existing multi-unit clearance case; each unit controls only its own checkpoint. | S |
| SD-SVC-07 | As a graduate, I want to request and track a transcript. | Identity, consent, recipient, fee, production, dispatch and delivery remain governed by the EP-18 workflow. | S |

### SD-10 — Notifications, accessibility and resilience

**Outcome:** Students receive useful communications and can complete essential journeys across devices, abilities and variable network conditions.

| ID | User story | Acceptance criteria | Pri |
|---|---|---|---|
| SD-NFR-01 | As a student, I want notification preferences by channel so that routine messages reach me appropriately. | Preferences apply to configurable messages; critical notices still use the mandatory channels defined by current policy. | M |
| SD-NFR-02 | As a student, I want all dashboard notifications to lead to the relevant source item. | Each actionable notice deep-links to an authorised page and does not expose protected information in the notification preview. | M |
| SD-NFR-03 | As a student using a slow or unstable connection, I want essential pages to remain useful. | Core summaries are lightweight, download sizes are visible, retry is safe, and interrupted non-exam work can resume where the owning workflow supports it. | M |
| SD-NFR-04 | As a student using assistive technology, I want clear focus order, labels, status messages and alternatives. | Representative dashboard, LMS, CBT, result and request journeys pass automated and manual accessibility review against the platform target. | M |
| SD-NFR-05 | As a student, I want dates, deadlines and states expressed consistently. | The dashboard uses the platform's configured terminology and formats and does not rename a source state in a misleading way. | M |
| SD-NFR-06 | As a student, I want a visible support path when a service is unavailable. | The page identifies the affected service, preserves safe retry behaviour, and provides the current help route without fabricating data. | M |

## 5. Cross-epic acceptance rules

These conditions apply to every story above:

1. **No new source of truth:** the dashboard reads from or launches the existing owning module. It must not maintain a competing balance, grade, registration, standing, eligibility or clearance state.
2. **No approval bypass:** student actions enter the current workflow and respect its validation, maker-checker, role, hold, deadline and appeal rules.
3. **Student-safe disclosure:** only releasable wording and fields are shown. Internal notes, restricted evidence, medical diagnoses, misconduct investigation details, question keys and draft results remain protected.
4. **Scoped access:** list, detail, download, notification and external-tool launch checks all apply the signed-in student's identity and authorised context.
5. **State labels remain faithful:** the dashboard may simplify presentation but must preserve the meaning of source states and identify pending, stale or unavailable data.
6. **Idempotent actions:** refresh, retry or double selection must not create duplicate registration changes, payments, submissions, examination attempts, requests or appeals.
7. **Auditability:** security-sensitive and consequential actions retain the actor, source, time, outcome and relevant reference in the owning module.
8. **Accessibility and low bandwidth:** essential journeys are keyboard operable, usable on supported mobile layouts and do not require video or high bandwidth as the only path.
9. **Human decisions remain human:** dashboard indicators, alerts and checks may inform a student but cannot independently change academic standing, examination remedy, result, disciplinary outcome or support decision.

## 6. Suggested dashboard information architecture

This groups existing capabilities for navigation; it does not require changing current routes or domain structure.

| Dashboard area | Existing capability surfaced |
|---|---|
| Home | Summary, next class, upcoming work/exams, alerts and open actions |
| My Record | Existing `/student-portal/my-record` student record and request timeline |
| Registration | Existing `/student-portal/registration` registration journey |
| Degree Progress | Existing `/student-portal/degree-audit` progress view |
| Learning | Existing `/student-portal/learning` LMS course experience |
| Online Classes | LMS live sessions and published timetable events |
| CBT & Examinations | Examination schedule, readiness, approved CBT launch, submission evidence and incident support |
| Results | EP-12 released results, grading explanation, GPA/CGPA, standing and appeal entry |
| Finance | EP-16/17 bill, payment, receipt, dispute and refund status |
| Support & Requests | Student record, academic, welfare, accessibility and service requests |
| Clearance & Transcripts | EP-18 student-facing clearance and transcript workflows |

## 7. Release slices

| Slice | Included scope | Exit condition |
|---|---|---|
| **1 — Dashboard foundation** | Secure access, student context, home summary, navigation, alerts and responsive/accessibility baseline | A student can sign in and reach existing record, registration, degree-progress and learning routes with correctly scoped summary data. |
| **2 — Learning and classes** | Timetable, LMS courses/materials, online-class launch, announcements, coursework and low-bandwidth behaviour | A rostered student can find a course, join or use an alternative to a live class, submit coursework and see released feedback. |
| **3 — CBT and examinations** | Exam schedule/eligibility, readiness, notices, accommodations, controlled attempt, autosave/reconnect, submission receipt and incident support | An eligible student can complete a configured practice and production assessment without duplicate attempts or loss of governed state. |
| **4 — Results and wider services** | Released results, grade/GPA explanation, appeals, finance, support, clearance and transcript status | The dashboard reconciles with authoritative modules and completes denial, stale-data, accessibility and low-bandwidth acceptance tests. |

## 8. Definition of Done for a student-dashboard story

A story is complete when:

- its owning source and source-state mapping are documented;
- authorised and denied student scenarios pass at page, download and action levels;
- normal, duplicate/retry, expired-session, stale-data and unavailable-service cases pass;
- mobile, keyboard, screen-reader and low-bandwidth checks pass in proportion to the journey;
- notifications expose no restricted information;
- audit and telemetry are available without recording protected answers, credentials or unnecessary sensitive data;
- the relevant business owner confirms that the dashboard has not changed the underlying policy or approval workflow.

