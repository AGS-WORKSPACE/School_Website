# SD-01 and SD-02: Student dashboard foundation

> **SD-01 — Secure dashboard access and student context:** a student enters the dashboard securely and sees information belonging only to their current identity and authorised student context.
>
> **SD-02 — Dashboard home, alerts and next actions:** the student can quickly understand today's schedule, urgent obligations, upcoming academic work, and where to go next.

This is slice 1 of `StudentEpic.md`. It adds a new `@tau/student-dashboard` package and a signed-in dashboard in **`apps/lms`**, the app students already sign in to (port 3002). Later slices (SD-03 onwards) are not included.

## The dashboard owns almost nothing

Cross-epic rule 1 says the dashboard must not become a second source of truth. It holds exactly one piece of state: which alerts this student has hidden from their own view. Everything else is read at request time from the module that owns it and labelled with that module's name.

| Shown on the dashboard | Read from | Written by the dashboard |
|---|---|---|
| Account, session, second factor | Identity (EP-01) | Never — sign-in and sign-out call identity |
| Programme, level, mode, session, standing, holds, open requests | Student record (EP-08) | Never — requests link to the record's own journeys |
| Classes, rooms, published timetable changes | Timetable (EP-11) | Never |
| Rostered courses, live sessions, office hours, coursework, announcements | LMS (EP-14) | Never |
| Readiness check | Online learning (EP-15) | Never |
| Hidden alerts | The dashboard | Hidden for this student's view only |

## Delivered stories

| Story | What was built |
|---|---|
| **SD-AUTH-01** | Sign-in runs through `identityAuth`, so the account and its status decide the outcome. A disabled account is refused before any student information is read. |
| **SD-AUTH-02** | A context bar on every dashboard page names the person, matriculation number, programme, level, mode, session, enrolment status and standing. The identifier crosswalk (`StudentLink`) is the only place identity, SIS, registration and timetable ids are tied together, and context switching is limited to records the person is actually linked to. |
| **SD-AUTH-03** | Refusals are deliberately vague: the same wording for an unknown identifier and a disabled account, with a route to the ICT service desk. Identity still records the precise reason in its audit trail. |
| **SD-AUTH-04** | The session lives in `sessionStorage` and is idle-limited (45 minutes). An expired, revoked or missing session shows a refusal card with no student data on the page. Sign-out calls identity and clears the session, and a new tab starts signed out. |
| **SD-AUTH-05** | One `h1`, labelled regions for each panel, keyboard-operable controls with visible focus, an accessible name on every icon-only button, and a single-column layout at 400px with no horizontal scrolling. |
| **SD-HOME-01** | A summary of programme, level, mode, session, rostered courses and standing, read from the student record. The dashboard offers no direct editing of those fields. |
| **SD-HOME-02** | One agenda for the next seven days: timetable classes, LMS live sessions, office hours and coursework deadlines, in time order. Each item names its source, delivery mode, room or join link, and the arrangements the module recorded (recording, captions, step-free access). Times are labelled as the institution's `Africa/Lagos` timetable. |
| **SD-HOME-03** | A prioritised task list: blocking holds first, then dated work, then requests already in progress. Each task restates the owning module's own state (including its student-facing hold wording), names the unit holding it, and opens that module's journey. |
| **SD-HOME-04** | Alerts repeat published changes, with the previous value, new value and effective date where the source recorded them — a moved class shows both times and rooms. |
| **SD-HOME-05** | Hiding an alert affects this student's dashboard only; the source notice is untouched and hidden items can be restored. |
| **SD-HOME-06** | Every module reports its own state: up to date, delayed, unavailable, or no record. Examinations and finance are not connected in this build, so the dashboard says so instead of showing an empty, healthy-looking page. |

## Routes

- `apps/lms` `/login/student` — sign-in through identity, with the second-factor step where a role requires it.
- `apps/lms` `/dashboard` — the dashboard home. The header's student button becomes "My Dashboard" once signed in.
- Everything else links out to the existing journeys in `apps/web` (`/student-portal/my-record`, `/registration`, `/degree-audit`, `/learning`, `/readiness`), configurable with `NEXT_PUBLIC_STUDENT_PORTAL_URL`.

## Demonstration accounts

Students sign in with their matriculation number; any password is accepted in this build, as in the rest of the demo.
The student login page lists these accounts under **Accounts in this demonstration** — pick one to fill the form — the way
the admin console does. The names and statuses shown there are read from identity, so the list cannot drift. It is
demonstration scaffolding: a real deployment names nobody, which is why the refusals themselves still disclose nothing.

| Sign in as | Shows |
|---|---|
| `TAU/25/SCI/0150` (Ngozi Eze) | The full dashboard: COS 101 classes and live clinic, a moved-laboratory alert, an open change-of-programme request past its service target, and the readiness check not yet done. |
| `TAU/23/ENG/0117` (Chinedu Okonkwo) | A blocking financial hold from the Bursary, restricting course registration and transcripts. |
| `TAU/24/ENG/0061` (Ibrahim Musa) | A disabled account: refused with no reason disclosed. |

## Seed additions in other modules

Three small, faithful additions so the cross-module view is real:

- **Identity:** student persons and accounts whose `personId` matches `Student.personId` in the SIS, one of them disabled.
- **Timetable (EP-11):** a Computing 100L cohort with COS 101 and GST 111, plus a published change notice. The weekly `weeks` recurrence already in the domain is what the agenda expands.
- **LMS (EP-14):** live sessions dated relative to seeding rather than fixed in the past, so "next week" stays next week.

## Verification

```bash
npm test          # @tau/student-dashboard: 11 tests
npm run typecheck
npm run lint
npm run build --workspace @tau/lms-app
```

A browser pass over the running app covers 27 checks: refusals for unknown, disabled, expired and signed-out sessions; the context bar; agenda, task, alert and source panels; dismissal and restore; a new tab starting signed out; headings, labelled regions, keyboard focus and the 400px layout.

## Known limitations

- **Not connected yet:** examinations (EP-13) and finance (EP-16/17) exist as console screens without a shared package, so the dashboard reports them as unavailable rather than guessing. Registration (EP-10) and released results (EP-12) key students by matriculation number and hold no record for these students, which the dashboard reports as "no record". Both become real by filling in `StudentLink` and adding a reading in `home-policy.ts`.
- **Sign-in is still the demonstration one:** identity accepts any password and any six-digit code. Account status, required second factors and the audit trail are real.
- **Cross-origin links:** the dashboard runs on port 3002 and the existing journeys on 3000, so those links leave the app. They share no browser storage, which is why demo data set in one is not visible in the other.
- **Slices 2 to 4** of `StudentEpic.md` (timetable detail, LMS depth, CBT and examinations, results, finance and wider services) are not started.
