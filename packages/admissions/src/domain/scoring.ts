import type { AdmissionRouteCode } from "./route";
import type { EligibilityStatus, ScreeningRecord } from "./screening";

export type ScoringRuleStatus = "Draft" | "In_Review" | "Approved" | "Published" | "Superseded";
export type ScoringRuleType = "Eligibility" | "Weighted_Scoring" | "Eligibility_And_Scoring";

export interface ScoringRuleInput {
  key: string;
  label: string;
  description: string;
  source: "CAPS" | "Application" | "Evidence" | "Interview" | "Manual";
  protectedAttribute: boolean;
  permittedByPolicy: boolean;
}

export interface ScoringRuleCondition {
  id: string;
  label: string;
  inputKey: string;
  operator: "exists" | "equals" | "greater_than_or_equal" | "all_verified";
  expectedValue: string | number | boolean;
  weight: number;
  scoreRange: { minimum: number; maximum: number };
}

export interface ScoringRuleVersion {
  version: string;
  status: ScoringRuleStatus;
  effectiveDate: string;
  changedAt: string;
  changedBy: string;
  reason: string;
}

export interface EligibilityScoringRule {
  id: string;
  name: string;
  type: ScoringRuleType;
  description: string;
  programmeIds: string[];
  programmeNames: string[];
  routeCodes: AdmissionRouteCode[];
  conditions: ScoringRuleCondition[];
  inputs: ScoringRuleInput[];
  version: string;
  effectiveDate: string;
  status: ScoringRuleStatus;
  owner: string;
  approvalStatus: "Pending" | "Approved";
  versions: ScoringRuleVersion[];
}

export interface ScoringInputValue {
  key: string;
  label: string;
  value: string | number | boolean | null;
  source: ScoringRuleInput["source"];
  used: boolean;
  protectedAttribute: boolean;
}

export interface RuleEvaluationResult {
  screeningRecordId: string;
  ruleId: string;
  ruleVersion: string;
  evaluatedAt: string;
  evaluatedBy: string;
  inputs: ScoringInputValue[];
  conditionResults: Array<{ conditionId: string; label: string; passed: boolean; score: number; maximum: number; explanation: string }>;
  totalScore: number | null;
  maximumScore: number;
  eligibility: EligibilityStatus;
  blocked: boolean;
  blockingReasons: string[];
  explanation: string;
  authoritative: false;
}

export interface ScoringRuleAdapter {
  evaluate(record: ScreeningRecord, rule: EligibilityScoringRule, actor: string): RuleEvaluationResult;
}