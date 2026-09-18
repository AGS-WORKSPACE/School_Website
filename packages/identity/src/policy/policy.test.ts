/**
 * Acceptance checks for EP-01.
 *
 * Each block corresponds to one user story's acceptance column, run against the
 * same seeded data the console shows, so a change that quietly widens access
 * fails here rather than in a review six months later.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { verifyAuditChain } from "../domain/audit";
import { isConflictBlocking } from "../domain/sod";
import { getStore } from "../mock/store";
import { can, computeEffectiveGrants, filterByScope } from "./access";
import { validateDelegation } from "./delegation";
import { indexUnits, scopeCovers } from "./scope";
import { rolesPermit } from "./roles";
import { detectConflicts } from "./sod";

const store = await getStore();
const now = new Date();
const units = indexUnits(store.units);

const grantsFor = (personId: string) =>
  computeEffectiveGrants({
    personId,
    now,
    units: store.units,
    assignments: store.assignments,
    delegations: store.delegations,
    breakGlassGrants: store.breakGlassGrants,
  });

const conflictsFor = (personId: string) =>
  detectConflicts({
    personId,
    grants: grantsFor(personId),
    units: store.units,
    exceptions: store.sodExceptions.filter((exception) => exception.personId === personId),
    now,
  });

const decide = (personId: string, permissionId: string, unitId: string, mfaSatisfied = false) =>
  can({
    grants: grantsFor(personId),
    permissionId,
    targetScope: { dimension: "faculty", unitId },
    units: store.units,
    mfaSatisfied,
    now,
  });

describe("IAM-01 — one identity across modules", () => {
  it("keeps a single person record across applicant, student, alumnus and staff", () => {
    const amina = store.persons.filter((person) => person.lastName === "Bello");
    assert.equal(amina.length, 1, "a changed relationship must not create a second person");
    assert.equal(amina[0].affiliations.length, 4);
  });

  it("leaves no live session on a disabled account", () => {
    const disabled = store.accounts.filter((account) => account.status === "disabled");
    assert.ok(disabled.length > 0);
    for (const account of disabled) {
      const live = store.sessions.filter(
        (session) => session.accountId === account.id && !session.revokedAt,
      );
      assert.equal(live.length, 0, `${account.username} still has live sessions`);
    }
  });
});

describe("IAM-02 — scope follows responsibility", () => {
  it("covers descendants but never siblings", () => {
    assert.ok(
      scopeCovers(
        units,
        { dimension: "institution", unitId: "inst-tau" },
        { dimension: "department", unitId: "dept-nursing" },
      ),
    );
    assert.ok(
      scopeCovers(
        units,
        { dimension: "faculty", unitId: "fac-health" },
        { dimension: "cohort", unitId: "cohort-nursing-2026" },
      ),
    );
    assert.ok(
      !scopeCovers(
        units,
        { dimension: "faculty", unitId: "fac-health" },
        { dimension: "department", unitId: "dept-computer" },
      ),
    );
  });

  it("allows an officer their own faculty and refuses another", () => {
    assert.ok(decide("per-chidi", "admissions:application:read", "fac-health").allowed);

    const refused = decide("per-chidi", "admissions:application:read", "fac-eng");
    assert.equal(refused.allowed, false);
    assert.match(refused.reason, /does not cover/);
  });

  it("filters exports through the same rule as the screen", () => {
    const rows = [
      { id: "a1", scope: { dimension: "faculty" as const, unitId: "fac-health" } },
      { id: "a2", scope: { dimension: "faculty" as const, unitId: "fac-eng" } },
      { id: "a3", scope: { dimension: "department" as const, unitId: "dept-nursing" } },
    ];
    const visible = filterByScope(
      rows,
      store.units,
      grantsFor("per-chidi"),
      "admissions:application:read",
      (row) => row.scope,
    );
    assert.deepEqual(
      visible.map((row) => row.id),
      ["a1", "a3"],
    );
  });
});

describe("IAM-03 — MFA on privileged and high-risk actions", () => {
  it("refuses a high-risk action until the session is stepped up", () => {
    const before = decide("per-grace", "identity:break-glass:approve", "inst-tau", false);
    assert.equal(before.allowed, false);
    assert.equal(before.mfaRequired, true);

    const after = decide("per-grace", "identity:break-glass:approve", "inst-tau", true);
    assert.equal(after.allowed, true);
  });
});

describe("IAM-04 — delegation cannot exceed the delegator", () => {
  const window = {
    startsAt: new Date(now.getTime() + 3_600_000).toISOString(),
    endsAt: new Date(now.getTime() + 10 * 86_400_000).toISOString(),
  };
  const draft = (over: Partial<Parameters<typeof validateDelegation>[0]["draft"]>) => ({
    delegatorPersonId: "per-samuel",
    delegatePersonId: "per-hauwa",
    sourceAssignmentId: "asg-samuel-hod",
    permissionIds: ["lms:enrolment:read"],
    scope: { dimension: "department" as const, unitId: "dept-computer" },
    reason: "Covering class lists during a conference",
    ...window,
    ...over,
  });

  const validate = (over: Parameters<typeof draft>[0] = {}) =>
    validateDelegation({
      draft: draft(over),
      assignments: store.assignments,
      units: store.units,
      now,
    });

  it("accepts a delegation within the delegator's authority", () => {
    assert.equal(validate().valid, true);
  });

  it("refuses a permission the delegator does not hold", () => {
    const result = validate({ permissionIds: ["records:result:approve"] });
    assert.equal(result.valid, false);
    assert.match(result.errors.join(" "), /cannot exceed the delegator/);
  });

  it("refuses a wider scope than the delegator holds", () => {
    const result = validate({ scope: { dimension: "department", unitId: "dept-nursing" } });
    assert.equal(result.valid, false);
  });

  it("refuses an open-ended delegation", () => {
    const result = validate({ endsAt: new Date(now.getTime() + 200 * 86_400_000).toISOString() });
    assert.equal(result.valid, false);
    assert.match(result.errors.join(" "), /may not run longer/);
  });

  it("applies a delegation only inside its window", () => {
    assert.ok(
      grantsFor("per-ibrahim").some(
        (grant) =>
          grant.permissionId === "finance:refund:authorise" && grant.source.kind === "delegation",
      ),
      "an active delegation must grant its permissions",
    );
    assert.ok(
      !grantsFor("per-hauwa").some((grant) => grant.source.id === "del-hod-earlier"),
      "an expired delegation must grant nothing",
    );
    assert.ok(
      !grantsFor("per-amina").some((grant) => grant.source.id === "del-results-cover"),
      "a scheduled delegation must not apply early",
    );
  });
});

describe("IAM-05 — segregation of duties", () => {
  it("detects a conflict created by a delegation, not just by a role", () => {
    const conflict = conflictsFor("per-ibrahim").find(
      (candidate) => candidate.rule.id === "sod-refund-release",
    );
    assert.ok(conflict, "preparing and authorising refunds must conflict");
    assert.equal(isConflictBlocking(conflict, now), true);
  });

  it("stops blocking once an approved exception covers it", () => {
    const conflict = conflictsFor("per-ibrahim").find(
      (candidate) => candidate.rule.id === "sod-billing-receipt",
    );
    assert.ok(conflict?.exception);
    assert.equal(isConflictBlocking(conflict, now), false);
  });

  it("does not treat a merely requested exception as approval", () => {
    const conflict = conflictsFor("per-kemi").find(
      (candidate) => candidate.rule.id === "sod-result-release",
    );
    assert.ok(conflict);
    assert.equal(conflict.exception, null);
    assert.equal(isConflictBlocking(conflict, now), true);
  });

  it("raises nothing for someone holding only one side of a rule", () => {
    assert.equal(conflictsFor("per-fatima").length, 0);
    assert.ok(
      !conflictsFor("per-amina").some((candidate) => candidate.rule.id === "sod-result-release"),
    );
  });

  it("blocks proposing and approving curriculum changes together (CUR-04)", () => {
    const grants = [
      {
        permissionId: "academics:curriculum:propose",
        scope: { dimension: "faculty", unitId: "fac-health" },
        source: { kind: "assignment", id: "asg-test-1", roleId: "head-of-department" },
      },
      {
        permissionId: "academics:curriculum:approve",
        scope: { dimension: "institution", unitId: "inst-tau" },
        source: { kind: "assignment", id: "asg-test-2", roleId: "dap-director" },
      },
    ] as any;

    const conflicts = detectConflicts({
      personId: "per-test",
      grants,
      units: store.units,
      exceptions: [],
      now,
    });

    const curriculumConflict = conflicts.find(
      (candidate) => candidate.rule.id === "sod-curriculum-approval",
    );
    assert.ok(curriculumConflict, "proposing and approving curriculum must conflict");
    assert.equal(isConflictBlocking(curriculumConflict, now), true);
  });

  it("blocks amending and approving student record changes together (SIS-02, SIS-03)", () => {
    const grants = [
      {
        permissionId: "records:student-record:amend",
        scope: { dimension: "institution", unitId: "inst-tau" },
        source: { kind: "assignment", id: "asg-sis-1", roleId: "registry-officer" },
      },
      {
        permissionId: "records:student-record:approve",
        scope: { dimension: "institution", unitId: "inst-tau" },
        source: { kind: "assignment", id: "asg-sis-2", roleId: "records-approver" },
      },
    ] as any;

    const conflict = detectConflicts({ personId: "per-test", grants, units: store.units, exceptions: [], now }).find(
      (candidate) => candidate.rule.id === "sod-student-record-change",
    );
    assert.ok(conflict, "amending and approving student record changes must conflict");
    assert.equal(isConflictBlocking(conflict, now), true);
  });

  it("blocks requesting and activating a learning-tool integration together (LMS-07)", () => {
    const grants = [
      {
        permissionId: "lms:integration:request",
        scope: { dimension: "institution", unitId: "inst-tau" },
        source: { kind: "assignment", id: "asg-lms-1", roleId: "lms-administrator" },
      },
      {
        permissionId: "lms:integration:approve",
        scope: { dimension: "institution", unitId: "inst-tau" },
        source: { kind: "assignment", id: "asg-lms-2", roleId: "lms-integration-approver" },
      },
    ] as any;

    const conflict = detectConflicts({ personId: "per-test", grants, units: store.units, exceptions: [], now }).find(
      (candidate) => candidate.rule.id === "sod-lms-integration",
    );
    assert.ok(conflict, "requesting and activating an integration must conflict");
    assert.equal(isConflictBlocking(conflict, now), true);
  });

  it("flags teaching and finalising coursework grades as reviewable, not blocking (LMS-06)", () => {
    const grants = [
      {
        permissionId: "lms:course:teach",
        scope: { dimension: "institution", unitId: "inst-tau" },
        source: { kind: "assignment", id: "asg-lms-3", roleId: "lecturer" },
      },
      {
        permissionId: "lms:grade:finalise",
        scope: { dimension: "institution", unitId: "inst-tau" },
        source: { kind: "assignment", id: "asg-lms-4", roleId: "course-moderator" },
      },
    ] as any;

    const conflict = detectConflicts({ personId: "per-test", grants, units: store.units, exceptions: [], now }).find(
      (candidate) => candidate.rule.id === "sod-lms-grade-finalise",
    );
    assert.ok(conflict);
    assert.equal(isConflictBlocking(conflict, now), false);
  });

  it("blocks capturing assisted intake and resolving deduplication cases together (ADM-04, ADM-06)", () => {
    const grants = [
      {
        permissionId: "admissions:assisted:intake",
        scope: { dimension: "campus", unitId: "campus-main" },
        source: { kind: "assignment", id: "asg-adm-1", roleId: "admissions-officer" },
      },
      {
        permissionId: "admissions:case:resolve",
        scope: { dimension: "institution", unitId: "inst-tau" },
        source: { kind: "assignment", id: "asg-adm-2", roleId: "admissions-approver" },
      },
    ] as any;

    const conflicts = detectConflicts({
      personId: "per-test-admissions",
      grants,
      units: store.units,
      exceptions: [],
      now,
    });

    const admissionsConflict = conflicts.find(
      (candidate) => candidate.rule.id === "sod-assisted-intake-resolve",
    );
    assert.ok(admissionsConflict, "assisted intake and resolving cases must conflict");
    assert.equal(isConflictBlocking(admissionsConflict, now), true);
  });
});

describe("IAM-06 — break-glass is time-limited and gated", () => {
  it("grants its role only while live, and always behind MFA", () => {
    const emergency = grantsFor("per-emeka").filter((grant) => grant.source.kind === "break-glass");
    assert.ok(emergency.length > 0);
    assert.ok(emergency.every((grant) => grant.requiresMfa));
    assert.ok(emergency.every((grant) => grant.expiresAt !== null));
  });

  it("grants nothing once expired", () => {
    assert.ok(!grantsFor("per-tunde").some((grant) => grant.source.kind === "break-glass"));
  });
});

describe("OPS-05 — the audit trail is tamper-evident", () => {
  it("verifies as written", async () => {
    const result = await verifyAuditChain(store.auditEvents);
    assert.equal(result.valid, true, result.message);
  });

  it("detects an edited entry and names where the trail broke", async () => {
    const tampered = structuredClone(store.auditEvents);
    tampered[5].reason = "nothing to see here";
    const result = await verifyAuditChain(tampered);
    assert.equal(result.valid, false);
    assert.equal(result.brokenAtSeq, tampered[5].seq);
  });

  it("detects a removed entry", async () => {
    const result = await verifyAuditChain(store.auditEvents.filter((_, index) => index !== 4));
    assert.equal(result.valid, false);
  });
});

describe("Role permission lookup for module service layers", () => {
  it("answers from the role catalogue", () => {
    assert.equal(rolesPermit(["course-moderator"], "lms:grade:finalise"), true);
    assert.equal(rolesPermit(["lecturer"], "lms:grade:finalise"), false);
    assert.equal(rolesPermit(["lecturer", "course-moderator"], "lms:course:teach"), true);
    assert.equal(rolesPermit(["lms-administrator"], "lms:integration:approve"), false);
  });

  it("denies unknown roles and empty role lists", () => {
    assert.equal(rolesPermit([], "lms:course:teach"), false);
    assert.equal(rolesPermit(["no-such-role"], "lms:course:teach"), false);
  });
});
