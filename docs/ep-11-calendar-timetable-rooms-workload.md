# EP-11: Calendar, timetable, rooms and workload

EP-11 is an additive front-end scheduling module. It follows the existing monorepo pattern with TypeScript domain models, deterministic policy functions, a localStorage-backed mock store, a React hook, and admin-console pages. It adds no API route, server action, database, or external calendar integration.

## Delivered stories

- **TTB-01:** Approved academic-calendar publication records version and authority, retains revision rationale, and queues notifications for every affected milestone audience.
- **TTB-02:** Room assignment validates campus, capacity, equipment, accessibility, active status, and maintenance closures. Invalid assignments are blocked unless an attributable reason is supplied.
- **TTB-03:** Hard conflicts cover rooms, staff, student cohorts, cross-campus overlap, maintenance, capacity, equipment, and accessibility. Unresolved conflicts or draft activities prevent release.
- **TTB-04:** Personal lecturer/student timetable views derive from published assignments. Change notices retain old/new time, old/new room, effective date, and matching portal/feed status.
- **TTB-05:** Teaching and supervision workloads derive only from approved or published assignments and the effective configurable workload rule. Every total includes an explanation.
- **TTB-06:** Room dashboards expose maintenance ownership and report reserved, used, and cancelled hours separately.

## Front-end routes

- `/scheduling` — calendar publication, scheduling, conflict register, room/facilities controls, utilization, and workload.
- `/scheduling/my-timetable` — selectable lecturer/student timetable and change-alert experience.

The pre-existing `/configuration/academic-calendar` workflow remains unchanged and continues to manage draft calendar configuration.
