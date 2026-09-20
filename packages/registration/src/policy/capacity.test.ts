import assert from "node:assert/strict";
import test from "node:test";
import { canPublishOffering, validateApprovedCapacity } from "./capacity";

const constraint = { roomOrPlatformCapacity: 100, staffMaxLoad: 100 };

test("blocks approved capacity above the room/staff constraint without an exception", () => {
  assert.equal(validateApprovedCapacity(120, constraint, false).valid, false);
  assert.equal(validateApprovedCapacity(120, constraint, true).valid, true);
  assert.equal(validateApprovedCapacity(90, constraint, false).valid, true);
});

test("publication requires an assigned lecturer and a valid capacity", () => {
  const base = { lecturerId: "", approvedCapacity: 90, constraint, capacityException: undefined, status: "Draft" as const };
  assert.match(canPublishOffering(base).reason ?? "", /lecturer/);
  assert.equal(canPublishOffering({ ...base, lecturerId: "stf-1" }).valid, true);
  assert.equal(canPublishOffering({ ...base, lecturerId: "stf-1", approvedCapacity: 150 }).valid, false);
});
