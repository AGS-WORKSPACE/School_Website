# EP-01 — Identity, access and delegated authority

> **Outcome:** Every person has one identity and only the access needed for
> current duties.

This document maps each user story to where it is implemented, how to see it
working, and what a reviewer should push on.

## How to see it

```bash
npm install
npm run dev:admin     # http://localhost:3001
```

Sign in as one of the seeded accounts. Passwords are not checked; the account you
pick decides what the console lets you do.

### The accounts

Sixteen people are seeded. State is per-browser and held in memory, so two
developers never see each other's changes and a page reload resets everything.

**Start here**

| Username | Role | Why you'd use it |
|---|---|---|
| `t.alabi` | Identity administrator | The usual starting point. Prepares access, disables accounts, enrols MFA — but cannot approve its own preparations |
| `g.eze` | Access approver | The other half of maker–checker. Approves grants, duties exceptions and emergency access |
| `z.mohammed` | Auditor | Read-only across the institution; holds nothing that changes a record |
| `e.obi` | ICT service desk | Signs in with a live break-glass grant running, so the emergency banner and countdown are visible |

**Accounts that demonstrate a refusal**

| Username | What happens |
|---|---|
| `n.okafor` | Privileged with no MFA enrolled — sign-in stops before a session starts |
| `l.danjuma` | Disabled account — refused before roles are even considered |
| `k.balogun` | Signs in, but holds a blocking duties conflict: enters *and* approves results |
| `i.sani` | Blocking conflict created by a **delegation** rather than a role — the clearest case for detecting over effective access |
| `d.ojo` | Drafts *and* publishes content: a reviewable conflict, not a blocking one |

**Scope isolation**

| Username | Role | Scope |
|---|---|---|
| `c.nwankwo` | Admissions officer | Health Sciences, plus JUPEB cover |
| `f.yusuf` | Admissions officer | Engineering |

Same role, different faculties, and neither sees the other's work. Sign in as
either and use **My access → Check a specific action** against the other's
faculty to see the refusal and its explanation.

**The rest**

| Username | Role | Notes |
|---|---|---|
| `o.adeyemi` | Access approver | Vice-Chancellor; second approval authority |
| `a.bello` | Lecturer, Exams officer | One identity across applicant → student → alumna → staff |
| `s.okonkwo` | Head of department | Has delegated cover out while on research leave |
| `h.abdullahi` | Lecturer | Holds that delegated authority |
| `b.adeyinka` | Bursar | Delegated refund authorisation to `i.sani` |

One timing note: `e.obi`'s emergency grant expires about 16 minutes after the
data is seeded, then moves to *awaiting review*. That is deliberate — it lets
both states be seen in one session — but it does mean dashboard counts change
while a tab is open.

## Story by story

### IAM-01 — One account across authorised modules · **Must**

*Acceptance: a linked role change does not create a duplicate person; disabled
identity blocks all sessions.*

A `Person` holds a list of `Affiliation`s — applicant, student, staff, alumnus —
each owned by the module that is authoritative for it. Amina Bello carries four
relationships spanning seven years on one record.

Disabling an account revokes every live session in the same operation rather than
letting them expire, and sign-in checks account status before it looks at roles,
scopes or MFA.

- Contracts: [`domain/person.ts`](../packages/identity/src/domain/person.ts), [`domain/account.ts`](../packages/identity/src/domain/account.ts)
- Behaviour: [`mock/mutations.ts`](../packages/identity/src/mock/mutations.ts) (`setAccountStatus`), [`mock/auth.ts`](../packages/identity/src/mock/auth.ts)
- Screen: **People and accounts** → any person → *Identity*
- Tests: `IAM-01` in [`policy.test.ts`](../packages/identity/src/policy/policy.test.ts) and [`flows.test.ts`](../packages/identity/src/mock/flows.test.ts)

### IAM-02 — Roles scoped by campus, faculty, department and cohort · **Must**

*Acceptance: scope boundaries are enforced in UI, export and API tests.*

A role carries no scope. Scope is attached when the role is assigned, and every
check reduces to one question — does the granting unit sit at or above the unit
being acted on? `scopeCovers` answers it, and list rendering, export filtering
and access decisions all call it, so the three cannot drift apart.

Chidi Nwankwo and Fatima Yusuf hold the same admissions role in different
faculties and see nothing of each other's work.

- Engine: [`policy/scope.ts`](../packages/identity/src/policy/scope.ts), [`policy/access.ts`](../packages/identity/src/policy/access.ts)
- Screens: **Roles and permissions** (matrix), **My access** (decision simulator), **Access review**
- Tests: `IAM-02` in `policy.test.ts` — including that a CSV-style export filter returns the same rows the screen does

### IAM-03 — Multi-factor authentication for privileged users · **Must**

*Acceptance: MFA is mandatory for privileged and configurable high-risk roles;
recovery is audited.*

The requirement is derived from what the person can do, not from which page they
opened: any privileged role, or any high-risk permission from any source
— including one that arrived by delegation or break-glass — forces the step-up.
A privileged account with no enrolled method cannot start a session at all.

Recovery is treated as its own privileged event: the code is consumed, the holder
is notified, and reissuing invalidates the previous set.

- Behaviour: [`mock/auth.ts`](../packages/identity/src/mock/auth.ts) (`mfaRequirement`), `enrolMfa` / `issueRecoveryCodes` in `mutations.ts`
- Screen: any person → *Sign-in and MFA*; the sign-in flow itself
- Tests: `IAM-03` in `policy.test.ts`, sign-in journeys in `flows.test.ts`

### IAM-04 — Time-bounded delegation · **Should**

*Acceptance: delegation has start/end time, permitted actions, reason and visible
audit; it cannot exceed delegator authority.*

A delegation names one assignment the delegator already holds, a subset of its
permissions, a unit at or below its scope, and a window with both ends fixed and
capped at 90 days. `validateDelegation` enforces all of it at the service layer,
so the narrowing form is a convenience rather than the control.

- Engine: [`policy/delegation.ts`](../packages/identity/src/policy/delegation.ts)
- Screen: **Delegation**
- Tests: `IAM-04` in `policy.test.ts` (over-reach, widened scope, open-ended) and `flows.test.ts`

### IAM-05 — Segregation-of-duties rules · **Must**

*Acceptance: conflicts block submission or require a documented exception
approved by a separate authority.*

Detection runs over *effective* grants, not role assignments — which matters,
because the usual way a conflict appears in practice is somebody covering for a
colleague on leave. Ibrahim Sani's blocking refund conflict in the seed data is
created by a delegation, not by a role.

Two grants only conflict where their scopes overlap; preparing batches for one
faculty and approving them for another is not a conflict, and flagging it would
teach people to ignore the warnings. An exception requires a compensating
control, and cannot be approved by the person it covers or by whoever requested
it.

- Engine: [`policy/sod.ts`](../packages/identity/src/policy/sod.ts) — eight rules, six blocking
- Screen: **Segregation of duties**
- Tests: `IAM-05` in `policy.test.ts` and `flows.test.ts`

### IAM-06 — Controlled break-glass access · **Must**

*Acceptance: access is time-limited, reasoned, alerted and reviewed after use.*

Emergency roles are marked `breakGlassOnly` and cannot be assigned or delegated —
only granted through a request that carries an incident reference, is approved by
somebody other than the requester, runs on a clock capped at four hours that
cannot be extended in place, alerts a watch list on activation, and stays open
until an independent reviewer has read what was done under it.

Actions taken under a grant are tagged with it in the audit trail, so the review
screen shows the reviewer exactly what to assess.

- Contracts: [`domain/break-glass.ts`](../packages/identity/src/domain/break-glass.ts); behaviour in `mutations.ts`
- Screen: **Emergency access**
- Tests: `IAM-06` in `policy.test.ts` and the full cycle in `flows.test.ts`

## Supporting: OPS-05 — tamper-evident audit

Each entry is sealed with the SHA-256 of its own canonical content plus the hash
of the entry before it, so editing or removing any entry breaks every hash after
it and `verifyAuditChain` reports where. Refused actions are recorded with the
same weight as successful ones.

This gives tamper *evidence*, not tamper proofing — the store itself must still
be append-only and held outside ordinary admin reach.

- [`domain/audit.ts`](../packages/identity/src/domain/audit.ts); screen: **Audit trail**

## Deliberately not built in this branch

Agreed scope was flows and contracts. The following are the next pieces of work,
and none of them should change a screen:

1. **Credential handling.** Password hashing (argon2id), real TOTP verification,
   hashed recovery codes, rate limiting and lockout. Replacing `mock/auth.ts`
   covers it.
2. **Server-side sessions.** httpOnly cookie sessions and a `proxy.ts` boundary,
   with checks moved next to the data in a data-access layer. The current guard
   is a client-side convenience and is commented as such.
3. **Persistence.** A real database behind the repository seam in `mock/store.ts`,
   with the audit log in an append-only store.
4. **Effective-dated policy (CFG-04).** Permission, role and duties catalogues are
   versioned by a constant today; they need effective dates and a simulation of
   impacted cohorts before publication.
5. **Notifications (OPS-03).** Break-glass alerts and recovery notices currently
   record that they were sent rather than sending them.
6. **Accessibility verification.** Built to WCAG 2.2 AA intent — semantic tables,
   labelled controls, visible focus, native selects, theme tokens with contrast —
   but not yet tested with a screen reader or an automated audit.
