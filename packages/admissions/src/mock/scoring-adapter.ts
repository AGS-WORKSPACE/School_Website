import type { ScreeningRecord } from "../domain/screening";
import type { EligibilityScoringRule, RuleEvaluationResult, ScoringRuleAdapter } from "../domain/scoring";

function valuesFor(record: ScreeningRecord, rule: EligibilityScoringRule) {
  const scoreBySource = new Map(record.scores.map((item) => [item.source, item.score]));
  const evidenceReady = record.evidence.length > 0 && record.evidence.every((item) => item.status === "Verified");
  return rule.inputs.map((input) => ({
    key: input.key,
    label: input.label,
    value: input.protectedAttribute ? null : input.key === "capsScore" ? scoreBySource.get("CAPS") ?? null : input.key === "screeningScore" ? scoreBySource.get("Manual") ?? null : input.key === "evidenceReady" ? evidenceReady : input.key === "qualificationScore" ? record.scores.find((item) => item.criterion.toLowerCase().includes("qualification"))?.score ?? null : input.key === "refereeScore" ? record.scores.find((item) => item.criterion.toLowerCase().includes("referee"))?.score ?? null : input.key === "interviewScore" ? record.scores.find((item) => item.criterion.toLowerCase().includes("interview"))?.score ?? null : null,
    source: input.source,
    used: !input.protectedAttribute,
    protectedAttribute: input.protectedAttribute,
  }));
}

export const mockScoringRuleAdapter: ScoringRuleAdapter = {
  evaluate(record, rule, actor) {
    const inputs = valuesFor(record, rule);
    const byKey = new Map(inputs.map((input) => [input.key, input.value]));
    const blockingReasons: string[] = [];
    const conditionResults = rule.conditions.map((condition) => {
      const value = byKey.get(condition.inputKey);
      const missing = value === null || value === undefined;
      const passed = !missing && (condition.operator === "equals" ? value === condition.expectedValue : condition.operator === "greater_than_or_equal" ? Number(value) >= Number(condition.expectedValue) : Boolean(value));
      if (missing) blockingReasons.push(`${condition.label} is missing an input.`);
      if (!missing && !passed) blockingReasons.push(`${condition.label} did not meet the configured threshold.`);
      const score = passed ? typeof value === "number" ? Math.min(value, condition.weight) : condition.weight : 0;
      return { conditionId: condition.id, label: condition.label, passed, score, maximum: condition.weight, explanation: missing ? "Blocked: required input is missing." : passed ? `Pass: input met ${condition.expectedValue} under ${condition.operator}.` : `Fail: input did not meet ${condition.expectedValue} under ${condition.operator}.` };
    });
    const blocked = blockingReasons.length > 0;
    const totalScore = blocked ? null : conditionResults.reduce((sum, item) => sum + item.score, 0);
    const maximumScore = conditionResults.reduce((sum, item) => sum + item.maximum, 0);
    const eligibility = blocked ? "Needs_Review" : "Eligible";
    return {
      screeningRecordId: record.id,
      ruleId: rule.id,
      ruleVersion: rule.version,
      evaluatedAt: new Date().toISOString(),
      evaluatedBy: actor,
      inputs,
      conditionResults,
      totalScore,
      maximumScore,
      eligibility,
      blocked,
      blockingReasons,
      explanation: blocked ? `Evaluation blocked: ${blockingReasons.join(" ")}` : `Eligible with ${totalScore}/${maximumScore}. All configured conditions passed. Protected attributes were excluded.`,
      authoritative: false,
    } satisfies RuleEvaluationResult;
  },
};