# TAU University Platform

A monorepo for the university digital platform described in
[UNIVERSITY_PLATFORM_PRODUCT_BACKLOG.md](./UNIVERSITY_PLATFORM_PRODUCT_BACKLOG.md).

Each product module is its own workspace over a shared set of domain packages, so
that adding the LMS, bursary or admissions module later means adding an app — not
copying an identity model into a second codebase.

```
apps/
  web/        Public website: programme discovery, news, events, enquiries (EP-04)
  admin/      Identity, access and delegated authority console (EP-01)
packages/
  identity/   EP-01 domain contracts, policy engine, demo data and React bindings
  ui/         Shared design system: TAU theme tokens and component primitives
```

## Getting started

```bash
npm install          # installs every workspace
npm run dev          # public website on http://localhost:3000
npm run dev:admin    # identity console on http://localhost:3001
```

## Checks

```bash
npm run build        # builds every app
npm run lint         # eslint across every workspace
npm run typecheck    # tsc --noEmit across every workspace
npm test             # EP-01 policy and flow suites
```

## Where the rules live

`@tau/identity` is deliberately layered so that the parts that decide who may do
what are pure functions, testable without a browser or a database:

| Layer | Contains | Depends on |
|---|---|---|
| `domain/` | Types and small state helpers — person, account, role, scope, delegation, duties, break-glass, audit | nothing |
| `policy/` | The permission and role catalogues, scope containment, access evaluation, duties detection, delegation validation | `domain/` |
| `mock/` | Demonstration store, seeded data, the service surface the UI calls | `domain/`, `policy/` |
| `react/` | React Query bindings | `mock/` |

Screens call `mock/` and never reimplement a rule. Swapping the demonstration
store for a real database is a change inside `mock/` alone.

## What is real, and what is not

This branch was built to the scope agreed for EP-01: **flows and contracts, not
credential handling**. That distinction matters when reading the code.

Real:

- The access model — scoped RBAC, effective-grant resolution, MFA gating,
  delegation ceilings, segregation-of-duties detection, break-glass lifecycle.
- The audit trail — a SHA-256 hash chain that detects edited or removed entries.
- Every rule is enforced in the service layer, not only in the forms, and is
  covered by [tests](./packages/identity/src/).

Not real, and clearly marked in the code:

- **Passwords are not verified.** Any value is accepted at sign-in.
- **MFA codes are not verified.** Any six-digit code passes.
- Sessions are held in `sessionStorage` rather than an httpOnly cookie.
- The store is in memory, so a full page reload resets the demonstration data.

See [docs/ep-01-identity-access.md](./docs/ep-01-identity-access.md) for how each
EP-01 user story is implemented and where to see it working.
