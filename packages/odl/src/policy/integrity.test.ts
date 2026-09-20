import assert from "node:assert/strict";
import test from "node:test";
import { validateIntegrityConfig, needsDpia, minimumControlsFor } from "./integrity";

test("a Low-risk assessment may never use an invasive control", () => {
  const result = validateIntegrityConfig({ riskLevel: "Low", controls: ["Live_Proctoring"], status: "Draft" });
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /Low-risk/);
});

test("an invasive control needs a recorded DPIA approval before it can go Active", () => {
  const draft = validateIntegrityConfig({ riskLevel: "High", controls: ["ID_Verification", "Live_Proctoring"], status: "Draft" });
  assert.equal(draft.ok, true);
  const activeWithoutDpia = validateIntegrityConfig({ riskLevel: "High", controls: ["ID_Verification", "Live_Proctoring"], status: "Active" });
  assert.equal(activeWithoutDpia.ok, false);
  const activeWithDpia = validateIntegrityConfig({ riskLevel: "High", controls: ["ID_Verification", "Live_Proctoring"], status: "Active", dpiaApprovedBy: "person-1" });
  assert.equal(activeWithDpia.ok, true);
});

test("High risk needs at least identity verification before activation", () => {
  const result = validateIntegrityConfig({ riskLevel: "High", controls: ["Timed_Window"], status: "Active" });
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /High-risk/);
});

test("needsDpia is true only when an invasive control is present", () => {
  assert.equal(needsDpia(["Timed_Window", "Similarity_Check"]), false);
  assert.equal(needsDpia(["Browser_Lockdown"]), true);
});

test("minimum controls scale with risk", () => {
  assert.deepEqual(minimumControlsFor("Low"), []);
  assert.deepEqual(minimumControlsFor("Medium"), ["Timed_Window"]);
  assert.deepEqual(minimumControlsFor("High"), ["ID_Verification"]);
});
