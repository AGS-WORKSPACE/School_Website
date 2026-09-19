import test from "node:test";
import assert from "node:assert/strict";
import { curriculumStore } from "./store";
import { approveAssessmentConfiguration, saveAssessmentConfiguration } from "./assessment-mutations";

test.beforeEach(() => curriculumStore.reset());

test("blocks assessment configuration without an existing curriculum permission", () => {
  const result = saveAssessmentConfiguration({
    configurationId: "assessment-mth101-2026-1-v1",
    components: curriculumStore.getSnapshot().assessmentConfigurations[1].components,
    effectiveDate: "2026-09-21",
    permissions: [],
    actor: { personId: "person-1", name: "Unauthorised user" },
  });
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /permission/i);
});

test("requires a version proposal when marks already exist", () => {
  const current = curriculumStore.getSnapshot().assessmentConfigurations[0];
  const withoutSummary = saveAssessmentConfiguration({
    configurationId: current.id,
    components: current.components.map((component) => component.type === "Examination" ? { ...component, weight: 45 } : component.type === "Practical" ? { ...component, weight: 25 } : component),
    effectiveDate: "2027-01-15",
    permissions: ["academics:curriculum:review"],
    actor: { personId: "person-2", name: "Academic planner" },
  });
  assert.equal(withoutSummary.ok, false);
  assert.equal(withoutSummary.requiresVersioning, true);

  const proposal = saveAssessmentConfiguration({
    configurationId: current.id,
    components: current.components.map((component) => component.type === "Examination" ? { ...component, weight: 45 } : component.type === "Practical" ? { ...component, weight: 25 } : component),
    effectiveDate: "2027-01-15",
    changeSummary: "Practical assessment rebalanced after approved course review.",
    permissions: ["academics:curriculum:review"],
    actor: { personId: "person-2", name: "Academic planner" },
  });
  assert.equal(proposal.ok, true);
  assert.equal(proposal.requiresVersioning, true);
  assert.equal(proposal.data?.version, "v2.0");
  assert.equal(proposal.data?.status, "In Review");
  assert.equal(proposal.data?.previousVersionId, current.id);
  assert.equal(curriculumStore.getSnapshot().assessmentConfigurations[0].version, "v1.0");
});

test("requires the existing curriculum approval permission", () => {
  const result = approveAssessmentConfiguration({ configurationId: "assessment-csc201-2026-1-v1", permissions: [] });
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /permission/i);
});
