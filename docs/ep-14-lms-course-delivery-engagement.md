# EP-14: LMS course delivery and engagement

> **Outcome:** Staff can deliver accessible, engaging conventional, blended and online courses.

EP-14 adds a new `@tau/lms` package (domain contracts, pure policy functions, a demonstration store and React bindings), a **Learning** area in the admin console, and a learner page on the public website. Like earlier epics, it adds no API, server action, database or external integration.

## How it connects to the rest of the platform

| Source | Used for |
|---|---|
| `@tau/curriculum` (EP-09) | A course shell is built only from a **published** course version. Its learning outcomes and assessment scheme are copied into the offering at creation, so later catalogue changes never rewrite a running course. |
| SIS registration (EP-08/EP-10) | The class list is a projection of SIS add/drop events (`RegistrationEvent`), the inbound contract until course registration (EP-10) exists. Learner ids reuse the EP-08 student record where the student exists there. |
| `@tau/identity` (EP-01) | Every permission check in the LMS service layer goes through `rolesPermit`, backed by the identity role catalogue. The LMS package holds no role names of its own. |
| SIS result workflow (EP-12) | Coursework passes back as `Entered_For_Moderation`; publication happens in the result workflow, never in the LMS. |

## Delivered workflows

| Story | What was built |
|---|---|
| **LMS-01** SIS-rostered shells | `applyRegistrationEvents` applies each event once, keyed by event id, so redeliveries and replays change nothing. There is one enrolment row per student per offering: re-registration reactivates it, and an out-of-order older event is counted as stale and never undoes a newer one. Each sync run records adds, drops, repeats, stale events and lag against a 30-minute target. |
| **LMS-02** Outcome-aligned templates | Templates must contain all six sections: orientation, outcomes, activities, assessment, support and an accessibility checklist. A shell uses the newest approved template for its delivery mode. The outcome-alignment view shows, for each approved outcome, the activities that teach it and the rubric criteria that assess it. |
| **LMS-03** Low-bandwidth delivery | Every item carries its download size and the size of its lightest usable version (transcript, text summary, audio-only or low-resolution video). Essential video must have a text alternative, and an essential item over 20 MB needs a lighter version. Learner progress merges safely after a lost connection: it never goes backwards, completion is sticky, and replayed queues are ignored. |
| **LMS-04** Community | Announcements follow each learner's channel preferences, and critical ones always add in-app and email. Discussions are post-moderated or pre-moderated, with participation rules (hidden and late posts don't count) and a retention date. Moderators need `lms:discussion:moderate` and a reason to hide a post. Groups flag unassigned learners, members in several groups and members who are no longer registered. Live sessions state their recording and caption arrangements, and office hours are listed alongside. |
| **LMS-05** Accessibility | Video needs captions and a transcript, audio needs a transcript, scanned PDFs are flagged, and slides and documents need alternative text. The learner page is built from native, keyboard-operable controls. |
| **LMS-06** Assignments and passback | Coursework weights must match the approved scheme; the examination share stays with Exams and Records. Late rules are explicit: grace period, daily penalty and a cut-off, with extensions honoured. Rubric marks are validated. Grades move Draft → Released (feedback to the student) → Final. Only a course moderator who did not mark the work can finalise, and the teaching lecturer submits the passback. Only students with every component finalised pass back; the rest are listed with the reason. Resubmitting an identical batch is refused. |
| **LMS-07** Standards-based integrations | LTI 1.3, OneRoster 1.2 and QTI 3.0 tools need a complete data contract (fields, purpose, lawful basis, retention, data location) and a recorded 1EdTech conformance reference. They also need a passed security review before activation, all decided by someone other than the requester. Health is tracked per event kind: launch, roster sync, grade return and item import. Three consecutive failures, or a failure rate above 10% over at least five calls, raises an alert. |

## Access rules (`packages/identity/src/policy`)

- **New permissions:** `lms:course:design`, `lms:discussion:moderate`, `lms:grade:finalise`, `lms:integration:request` and `lms:integration:approve` (high risk, MFA).
- **New roles:** `course-moderator`, `instructional-designer`, `lms-administrator` and `lms-integration-approver`. `lecturer` gains discussion moderation.
- **Segregation-of-duties rules:**
  - `sod-lms-integration` (blocking): the same person cannot request and approve an integration.
  - `sod-lms-grade-finalise` (reviewable): teaching and finalising in the same scope is flagged for review. The grade workflow still refuses self-finalisation outright.
- **New helper:** `rolesPermit(roleIds, permissionId)` lets module service layers check permissions against the role catalogue.

## Routes

Admin console (`npm run dev:admin`, port 3001), **Learning** navigation group:

- `/lms`: course shells with roster, outcome, content and coursework status; the shell builder; recent activity.
- `/lms/[offeringId]`: roster, outcomes & template, content, community and assessment tabs.
- `/lms/templates`: the template library, with validation and the template used for each delivery mode.
- `/lms/integrations`: data contracts, security review, activation and health.

Each LMS screen has an **Acting as (demo)** switcher (lecturer, moderator, instructional designer, LMS administrator, integration approver) so reviewers can try each rule as the right and the wrong person.

Public website (`npm run dev:web`, port 3000):

- `/student-portal/learning`: course materials with size labels and a low-bandwidth mode, a simulated lost connection with progress sync, discussions, announcements, coursework deadlines with late rules and released feedback, live sessions and office hours, and notification preferences.

## Shared console pieces

EP-08 and EP-14 now share `components/console/persona-switcher.tsx` (the demo "acting as" factory), `components/console/notice.tsx` (mutation outcome banner) and `lib/format.ts` (label and date formatting).

## Verification

```bash
npm test          # @tau/lms: 21 tests; @tau/identity: 42 (4 new for EP-14)
npm run typecheck
npm run lint
npm run build --workspace @tau/admin && npm run build --workspace @tau/web
```

## Known limitations

- The admin console and public website keep separate browser-local demonstration stores, as in earlier epics. Progress or posts made on the website do not appear in the console.
- "Receive SIS changes (demo)" stands in for the SIS registration event stream until EP-10 course registration exists.
- The final examination component, result moderation and publication belong to EP-12/EP-13. The LMS stops at `Entered_For_Moderation`.
