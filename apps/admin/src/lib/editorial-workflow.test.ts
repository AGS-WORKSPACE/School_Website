import assert from "node:assert/strict";
import test from "node:test";
import { getEditorialContent, editorialWorkflow } from "./editorial-workflow";

test("editorial workflow exposes internal states without making non-published content public", async () => {
  const content = await getEditorialContent();
  assert.ok(content.some((item) => item.status === "draft"));
  assert.ok(content.some((item) => item.status === "pending-approval"));
  assert.ok(content.some((item) => item.status === "scheduled"));
  assert.ok(content.some((item) => item.status === "expired"));
  assert.ok(content.some((item) => item.status === "rolled-back"));
  assert.equal(content.find((item) => item.status === "draft")?.isPublic, false);
  assert.equal(content.find((item) => item.status === "pending-approval")?.isPublic, false);
});

test("content mutations re-check the existing identity permission policy", async () => {
  const draft = (await getEditorialContent()).find((item) => item.status === "draft");
  assert.ok(draft);

  const denied = await editorialWorkflow.submitForApproval(draft.id, "per-ibrahim");
  assert.equal(denied.ok, false);

  const allowed = await editorialWorkflow.submitForApproval(draft.id, "per-david");
  assert.equal(allowed.ok, true);
  assert.equal(allowed.data?.status, "pending-approval");
  assert.equal(allowed.data?.isPublic, false);
});
