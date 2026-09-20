import assert from "node:assert/strict";
import { it } from "node:test";
import { getStore, resetStore } from "../mock/store";
import { identityMutations } from "../mock/mutations";
import { validateAssignmentDraft } from "./assignment";

it("limits role assignments to a permitted scope and keeps preparation separate from approval", async () => {
  resetStore();
  const store = await getStore();
  const today = new Date().toISOString().slice(0, 10);
  const draft = { personId: "per-emeka", roleId: "content-editor",
    scope: { dimension: "institution" as const, unitId: "inst-tau" },
    reason: "Public website editing duties", validFrom: today, validUntil: null };
  const wrongScope = validateAssignmentDraft({ draft: { ...draft, scope: { dimension: "department", unitId: "dept-nursing" } },
    units: store.units, personIds: store.persons.map((person) => person.id), assignments: store.assignments, now: new Date() });
  assert.ok(wrongScope.length > 0);

  function sessionFor(personId: string) {
    const account = store.accounts.find((entry) => entry.personId === personId)!;
    const id = `test-${personId}`;
    store.sessions.push({ id, accountId: account.id, personId, module: "identity", device: "Test",
      ipAddress: "127.0.0.1", startedAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600_000).toISOString(), mfaSatisfiedAt: new Date().toISOString(),
      revokedAt: null, revokedReason: null });
    return id;
  }
  const preparer = sessionFor("per-tunde");
  const approver = sessionFor("per-grace");
  const unauthorized = approver;

  const refused = await identityMutations.prepareAssignment({ draft, sessionId: unauthorized });
  assert.equal(refused.ok, false);
  const prepared = await identityMutations.prepareAssignment({ draft, sessionId: preparer });
  assert.equal(prepared.ok, true);
  const duplicate = await identityMutations.prepareAssignment({ draft, sessionId: preparer });
  assert.equal(duplicate.ok, false);
  assert.equal(store.assignments.some((entry) => entry.id === prepared.data?.assignmentId), false);
  const selfDecision = await identityMutations.decideAssignment({ requestId: prepared.data!.id,
    decision: "approve", reason: "", sessionId: preparer });
  assert.equal(selfDecision.ok, false);
  const approved = await identityMutations.decideAssignment({ requestId: prepared.data!.id,
    decision: "approve", reason: "Reviewed job duties", sessionId: approver });
  assert.equal(approved.ok, true);
  assert.ok(store.assignments.some((entry) => entry.id === approved.data?.assignmentId));
  const repeated = await identityMutations.decideAssignment({ requestId: prepared.data!.id,
    decision: "approve", reason: "", sessionId: approver });
  assert.equal(repeated.ok, false);

  const selfRequest = await identityMutations.prepareAssignment({
    draft: { ...draft, personId: "per-grace" }, sessionId: preparer });
  assert.equal(selfRequest.ok, true);
  const selfApproval = await identityMutations.decideAssignment({ requestId: selfRequest.data!.id,
    decision: "approve", reason: "", sessionId: approver });
  assert.equal(selfApproval.ok, false);

  const conflicting = await identityMutations.prepareAssignment({
    draft: { ...draft, personId: "per-tunde", roleId: "access-approver" }, sessionId: preparer });
  assert.equal(conflicting.ok, true);
  const conflictApproval = await identityMutations.decideAssignment({ requestId: conflicting.data!.id,
    decision: "approve", reason: "", sessionId: approver });
  assert.equal(conflictApproval.ok, false);
  assert.ok(conflictApproval.errors?.some((error) => error.includes("separation-of-duties")));
});
