import type { RecommendationStatus, RankingOverrideAudit } from "./ranking";
import type { RuleEvaluationResult, EligibilityScoringRule } from "./scoring";

export type ComplianceCheckStatus = "Complete" | "Pending" | "Blocked" | "Not_Applicable";

export interface PolicyInputInventoryItem {
  key: string;
  name: string;
  source: string;
  permittedUse: "Permitted_Scoring_Input" | "Non_Scoring_Information" | "Restricted_Input";
  scoringUsage: string;
  ruleId: string;
  ruleVersion: string;
  status: "Active" | "Excluded";
}

export interface HumanReviewEvent {
  stage: "Automated_Eligibility" | "Officer_Reviewed" | "Head_Approved";
  actor?: string;
  at?: string;
  status: "Complete" | "Pending";
}

export interface AdmissionDecisionHistory {
  id: string;
  candidateName: string;
  applicationNumber: string;
  applicationId: string;
  decision: RecommendationStatus | "Eligible" | "Needs_Review";
  ruleVersion: string;
  score: number | null;
  inputsUsed: string[];
  reviewer: string;
  timestamp: string;
  reason: string;
  override?: Pick<RankingOverrideAudit, "originalResult" | "overriddenResult" | "reason" | "authority" | "actor" | "timestamp">;
  approval?: { authority: string; at: string; status: "Approved" | "Pending" };
  humanReview: HumanReviewEvent[];
  compliance: ComplianceCheck[];
}

export interface ComplianceCheck {
  id: string;
  label: string;
  status: ComplianceCheckStatus;
  detail: string;
}

export function inventoryForRule(rule: EligibilityScoringRule): PolicyInputInventoryItem[] {
  return rule.inputs.map((input) => ({
    key: input.key,
    name: input.label,
    source: input.source,
    permittedUse: input.protectedAttribute ? "Restricted_Input" : input.permittedByPolicy ? "Permitted_Scoring_Input" : "Non_Scoring_Information",
    scoringUsage: input.protectedAttribute ? "Restricted from scoring" : input.permittedByPolicy ? "Used by configured rule conditions" : "Displayed for context only",
    ruleId: rule.id,
    ruleVersion: rule.version,
    status: input.protectedAttribute || !input.permittedByPolicy ? "Excluded" : "Active",
  }));
}

export function decisionFromEvaluation(input: { candidateName: string; applicationNumber: string; applicationId: string; evaluation: RuleEvaluationResult; reviewer: string; decision: AdmissionDecisionHistory["decision"]; reason: string }): AdmissionDecisionHistory {
  const inputsUsed = input.evaluation.inputs.filter((item) => item.used && !item.protectedAttribute).map((item) => item.label);
  const evidenceVerified = input.evaluation.inputs.some((item) => item.key === "evidenceReady" && item.value === true);
  return {
    id: `decision-${input.evaluation.screeningRecordId}`,
    candidateName: input.candidateName,
    applicationNumber: input.applicationNumber,
    applicationId: input.applicationId,
    decision: input.decision,
    ruleVersion: input.evaluation.ruleVersion,
    score: input.evaluation.totalScore,
    inputsUsed,
    reviewer: input.reviewer,
    timestamp: input.evaluation.evaluatedAt,
    reason: input.reason,
    humanReview: [{ stage: "Automated_Eligibility", at: input.evaluation.evaluatedAt, status: "Complete" }, { stage: "Officer_Reviewed", actor: input.reviewer, at: input.evaluation.evaluatedAt, status: "Complete" }, { stage: "Head_Approved", status: "Pending" }],
    compliance: [{ id: "rule-version", label: "Approved rule version used", status: input.evaluation.ruleVersion ? "Complete" : "Blocked", detail: input.evaluation.ruleVersion }, { id: "restricted-inputs", label: "Restricted inputs excluded", status: input.evaluation.inputs.filter((item) => item.protectedAttribute).every((item) => !item.used && item.value === null) ? "Complete" : "Blocked", detail: "Protected values are not available in the scoring view." }, { id: "evidence", label: "Required evidence verified", status: evidenceVerified ? "Complete" : "Pending", detail: evidenceVerified ? "Required evidence is verified." : "Evidence verification remains outstanding." }, { id: "human-review", label: "Human review completed", status: "Complete", detail: `Reviewed by ${input.reviewer}.` }, { id: "override", label: "Override authorised", status: "Not_Applicable", detail: "No override is attached to this decision." }],
  };
}