/**
 * End-to-end checks over the service surface the console actually calls.
 *
 * Where `policy.test.ts` proves the rules, this proves the journeys: that a
 * disabled account really does lose its sessions, that an overreaching delegation
 * is refused at the API rather than only in the form, and that nobody can approve
 * their own exception, their own emergency access or their own standing access.
 *
 * These run in order against one shared store, so the audit check at the end is
 * verifying a chain every mutation above has appended to.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { verifyAuditChain } from "../domain/audit";
import { identityReads as reads } from "./api";
import { identityAuth } from "./auth";
import { identityMutations as mutations } from "./mutations";
import { getStore } from "./store";

const hour = 60 * 60 * 1000;
const day = 24 * hour;

describe("sign-in journeys", () => {
  it("refuses a disabled account before roles are considered", async () => {
    const result = await identityAuth.signIn({ username: "l.danjuma" });
    assert.equal(result.outcome, "blocked");
  });

  it("stops a privileged account that has no method enrolled", async () => {
    const result = await identityAuth.signIn({ username: "n.okafor" });
    assert.equal(result.outcome, "mfa-not-enrolled");
  });

  it("lets an officer with no high-risk access in on one factor", async () => {
    const result = await identityAuth.signIn({ username: "c.nwankwo" });
    assert.equal(result.outcome, "signed-in");
    assert.ok(result.sessionId);
  });

  it("challenges a privileged account and opens the session once satisfied", async () => {
    const challenge = await identityAuth.signIn({ username: "g.eze" });
    assert.equal(challenge.outcome, "mfa-required");
    assert.ok(challenge.mfaReason);

    const rejected = await identityAuth.completeMfa({
      accountId: challenge.accountId!,
      code: "12",
      method: "totp",
    });
    assert.equal(rejected.ok, false);

    const accepted = await identityAuth.completeMfa({
      accountId: challenge.accountId!,
      code: "123456",
      method: "totp",
    });
    assert.equal(accepted.ok, true);
    assert.ok(accepted.sessionId);
  });

  it("accepts a recovery code and consumes it", async () => {
    const challenge = await identityAuth.signIn({ username: "g.eze" });
    const store = await getStore();
    const account = store.accounts.find((candidate) => candidate.id === challenge.accountId)!;
    const before = account.recoveryCodes!.codes.filter((code) => !code.usedAt).length;

    const result = await identityAuth.completeMfa({
      accountId: challenge.accountId!,
      code: "AB12-CD34",
      method: "recovery",
    });

    assert.equal(result.ok, true);
    const remaining = account.recoveryCodes!.codes.filter((code) => !code.usedAt).length;
    assert.equal(remaining, before - 1);
  });
});

describe("IAM-01 — disabling an identity ends access everywhere", () => {
  it("revokes every live session and blocks the next sign-in", async () => {
    const before = await reads.getPerson("per-chidi");
    assert.ok(before!.sessions.some((session) => session.live));

    const result = await mutations.setAccountStatus({
      accountId: "acc-chidi",
      status: "disabled",
      reason: "Offboarding — end of contract",
      actorPersonId: "per-tunde",
    });
    assert.equal(result.ok, true);

    const after = await reads.getPerson("per-chidi");
    assert.equal(
      after!.sessions.filter((session) => session.live).length,
      0,
      "no session may survive the account being disabled",
    );

    const blocked = await identityAuth.signIn({ username: "c.nwankwo" });
    assert.equal(blocked.outcome, "blocked");
  });

  it("refuses a status change with no reason to record", async () => {
    const result = await mutations.setAccountStatus({
      accountId: "acc-chidi",
      status: "active",
      reason: "x",
      actorPersonId: "per-tunde",
    });
    assert.equal(result.ok, false);
  });
});

describe("IAM-04 — delegation at the API, not only in the form", () => {
  it("refuses a delegation the delegator could not make", async () => {
    const result = await mutations.createDelegation({
      draft: {
        delegatorPersonId: "per-samuel",
        delegatePersonId: "per-hauwa",
        sourceAssignmentId: "asg-samuel-hod",
        permissionIds: ["records:result:approve"],
        scope: { dimension: "department", unitId: "dept-computer" },
        reason: "Attempting to hand over more than is held",
        startsAt: new Date(Date.now() + hour).toISOString(),
        endsAt: new Date(Date.now() + day).toISOString(),
      },
      actorPersonId: "per-samuel",
    });
    assert.equal(result.ok, false);
    assert.match(result.errors!.join(" "), /cannot exceed the delegator/);
  });

  it("grants and then withdraws the action the moment it is revoked", async () => {
    const created = await mutations.createDelegation({
      draft: {
        delegatorPersonId: "per-samuel",
        delegatePersonId: "per-hauwa",
        sourceAssignmentId: "asg-samuel-hod",
        permissionIds: ["academics:timetable:publish"],
        scope: { dimension: "department", unitId: "dept-computer" },
        reason: "Conference cover for timetable publication",
        startsAt: new Date(Date.now() - hour).toISOString(),
        endsAt: new Date(Date.now() + day).toISOString(),
      },
      actorPersonId: "per-samuel",
    });
    assert.equal(created.ok, true);

    const during = await reads.getPerson("per-hauwa");
    assert.ok(during!.permissionIds.includes("academics:timetable:publish"));

    const revoked = await mutations.revokeDelegation({
      delegationId: created.data!.id,
      reason: "Returned from the conference",
      actorPersonId: "per-samuel",
    });
    assert.equal(revoked.ok, true);

    const afterwards = await reads.getPerson("per-hauwa");
    assert.ok(!afterwards!.grants.some((grant) => grant.source.id === created.data!.id));
  });
});

describe("IAM-05 — an exception needs a separate authority", () => {
  it("refuses the subject and the requester, then accepts an independent approver", async () => {
    const bySubject = await mutations.decideSodException({
      exceptionId: "exc-results-kemi",
      decision: "approve",
      note: "",
      actorPersonId: "per-kemi",
    });
    assert.equal(bySubject.ok, false);

    const byRequester = await mutations.decideSodException({
      exceptionId: "exc-results-kemi",
      decision: "approve",
      note: "",
      actorPersonId: "per-tunde",
    });
    assert.equal(byRequester.ok, false);

    const before = await reads.getPerson("per-kemi");
    assert.ok(
      before!.conflicts.some(
        (view) => view.conflict.rule.id === "sod-result-release" && view.blocking,
      ),
    );

    const approved = await mutations.decideSodException({
      exceptionId: "exc-results-kemi",
      decision: "approve",
      note: "Approved with line-by-line re-check by the Faculty Officer",
      actorPersonId: "per-grace",
    });
    assert.equal(approved.ok, true);

    const after = await reads.getPerson("per-kemi");
    assert.ok(
      !after!.conflicts.some(
        (view) => view.conflict.rule.id === "sod-result-release" && view.blocking,
      ),
      "an approved exception must stop the conflict blocking",
    );
  });

  it("refuses an exception with no real compensating control", async () => {
    const result = await mutations.requestSodException({
      ruleId: "sod-admission-batch",
      personId: "per-fatima",
      scope: { dimension: "faculty", unitId: "fac-eng" },
      reason: "We are short staffed for this admission cycle",
      compensatingControl: "none",
      validUntil: new Date(Date.now() + 30 * day).toISOString(),
      actorPersonId: "per-tunde",
    });
    assert.equal(result.ok, false);
  });
});

describe("IAM-06 — emergency access is bounded at every step", () => {
  const incident = {
    roleId: "emergency-platform-administrator",
    scope: { dimension: "institution" as const, unitId: "inst-tau" },
    incidentRef: "INC-2026-0931",
    reason: "Fees reconciliation job wedged; receipts must be unblocked before midnight",
    actorPersonId: "per-emeka",
  };

  it("refuses an ordinary role and a request with no incident", async () => {
    const ordinary = await mutations.requestBreakGlass({ ...incident, roleId: "admissions-officer" });
    assert.equal(ordinary.ok, false);

    const noIncident = await mutations.requestBreakGlass({ ...incident, incidentRef: "urgent" });
    assert.equal(noIncident.ok, false);
  });

  it("runs the full request → approve → use → review cycle", async () => {
    const requested = await mutations.requestBreakGlass(incident);
    assert.equal(requested.ok, true);
    const grantId = requested.data!.id;

    const selfApproved = await mutations.decideBreakGlass({
      grantId,
      decision: "approve",
      minutes: 60,
      note: "",
      actorPersonId: "per-emeka",
    });
    assert.equal(selfApproved.ok, false, "the requester must not be able to approve");

    const approved = await mutations.decideBreakGlass({
      grantId,
      decision: "approve",
      minutes: 10_000,
      note: "",
      actorPersonId: "per-grace",
    });
    assert.equal(approved.ok, true);
    assert.match(approved.message, /240 minutes/, "the window must be capped");

    const person = await reads.getPerson("per-emeka");
    const view = person!.breakGlass.find((candidate) => candidate.grant.id === grantId)!;
    assert.ok(view.grant.notified.length > 0, "activation must alert the watch list");

    const ended = await mutations.revokeBreakGlass({
      grantId,
      reason: "Incident resolved early",
      actorPersonId: "per-emeka",
    });
    assert.equal(ended.ok, true);

    const selfReviewed = await mutations.reviewBreakGlass({
      grantId,
      outcome: "appropriate",
      notes: "I checked my own work and it was fine",
      actorPersonId: "per-emeka",
    });
    assert.equal(selfReviewed.ok, false, "the user must not be able to review themselves");

    const reviewed = await mutations.reviewBreakGlass({
      grantId,
      outcome: "appropriate",
      notes: "Two reconciliation jobs restarted; proportionate to the incident",
      actorPersonId: "per-grace",
    });
    assert.equal(reviewed.ok, true);
  });
});

describe("IAM-02 — access review", () => {
  it("refuses self-review and removes access when withdrawn", async () => {
    const bySelf = await mutations.reviewAssignment({
      assignmentId: "asg-david-approver",
      decision: "confirm",
      note: "",
      actorPersonId: "per-david",
    });
    assert.equal(bySelf.ok, false);

    const withdrawn = await mutations.reviewAssignment({
      assignmentId: "asg-david-approver",
      decision: "withdraw",
      note: "Publishing cover is no longer needed",
      actorPersonId: "per-grace",
    });
    assert.equal(withdrawn.ok, true);

    const david = await reads.getPerson("per-david");
    assert.ok(!david!.permissionIds.includes("content:page:publish"));
  });
});

describe("OPS-05 — the trail survives everything above", () => {
  it("still verifies, and records refusals as well as successes", async () => {
    const store = await getStore();
    const chain = await verifyAuditChain(store.auditEvents);
    assert.equal(chain.valid, true, chain.message);

    const denied = store.auditEvents.filter((event) => event.outcome === "denied");
    assert.ok(denied.length > 0, "refused privileged actions must be recorded");
  });
});
