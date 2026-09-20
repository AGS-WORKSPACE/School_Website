import assert from "node:assert/strict";
import test from "node:test";
import { scoreReadiness } from "./readiness";
import type { ReadinessQuestion } from "../domain/readiness";

const questions: ReadinessQuestion[] = [
  { id: "q1", category: "Device", prompt: "Device?", supportResourceTitle: "Device help", supportResourceUrl: "/device" },
  { id: "q2", category: "Connectivity", prompt: "Connectivity?", supportResourceTitle: "Connectivity help", supportResourceUrl: "/connectivity" },
];

test("confident answers produce no gaps and a full score", () => {
  const { gaps, readinessScore } = scoreReadiness(questions, [{ questionId: "q1", answer: "Confident" }, { questionId: "q2", answer: "Confident" }]);
  assert.equal(gaps.length, 0);
  assert.equal(readinessScore, 100);
});

test("a not-confident answer produces a gap with its support resource", () => {
  const { gaps, readinessScore } = scoreReadiness(questions, [{ questionId: "q1", answer: "Not_Confident" }, { questionId: "q2", answer: "Confident" }]);
  assert.equal(gaps.length, 1);
  assert.equal(gaps[0].supportResourceUrl, "/device");
  assert.equal(readinessScore, 50);
});

test("an unanswered question contributes zero score but no gap of its own", () => {
  const { gaps, readinessScore } = scoreReadiness(questions, [{ questionId: "q1", answer: "Confident" }]);
  assert.equal(gaps.length, 0);
  assert.equal(readinessScore, 50);
});
