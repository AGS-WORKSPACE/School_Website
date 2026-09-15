import type { EligibilityScoringRule } from "../domain/scoring";

export const initialScoringRules: EligibilityScoringRule[] = [
  {
    id: "rule-ug-2026", name: "Undergraduate screening and eligibility", type: "Eligibility_And_Scoring", description: "Published undergraduate rule for evidence readiness, CAPS result and programme screening review.", programmeIds: ["prog-csc"], programmeNames: ["B.Sc. Computer Science"], routeCodes: ["UTME", "DIRECT_ENTRY"], version: "UG-2026-v3", effectiveDate: "2026-09-01", status: "Published", owner: "Admissions Policy Office", approvalStatus: "Approved",
    inputs: [
      { key: "capsScore", label: "CAPS/JAMB result", description: "Validated external result score.", source: "CAPS", protectedAttribute: false, permittedByPolicy: true },
      { key: "evidenceReady", label: "Academic evidence verified", description: "Required academic evidence has passed verification.", source: "Evidence", protectedAttribute: false, permittedByPolicy: true },
      { key: "screeningScore", label: "Screening review score", description: "Recorded review score from the screening process.", source: "Manual", protectedAttribute: false, permittedByPolicy: true },
      { key: "stateOfOrigin", label: "State of origin", description: "Protected attribute excluded from this rule.", source: "Application", protectedAttribute: true, permittedByPolicy: false },
    ],
    conditions: [
      { id: "ug-condition-1", label: "Academic requirement", inputKey: "evidenceReady", operator: "equals", expectedValue: true, weight: 30, scoreRange: { minimum: 0, maximum: 30 } },
      { id: "ug-condition-2", label: "Required subject combination", inputKey: "evidenceReady", operator: "equals", expectedValue: true, weight: 10, scoreRange: { minimum: 0, maximum: 10 } },
      { id: "ug-condition-3", label: "Minimum CAPS score", inputKey: "capsScore", operator: "greater_than_or_equal", expectedValue: 40, weight: 60, scoreRange: { minimum: 0, maximum: 60 } },
    ],
    versions: [{ version: "UG-2026-v3", status: "Published", effectiveDate: "2026-09-01", changedAt: "2026-08-25T12:00:00Z", changedBy: "Admissions Policy Office", reason: "Approved 2026/2027 undergraduate screening revision" }, { version: "UG-2026-v2", status: "Superseded", effectiveDate: "2026-05-01", changedAt: "2026-08-25T11:00:00Z", changedBy: "Admissions Policy Office", reason: "Replaced after programme review" }],
  },
  {
    id: "rule-pg-2026", name: "Postgraduate qualification review", type: "Eligibility_And_Scoring", description: "Postgraduate review rule using qualification, referee and interview inputs.", programmeIds: ["prog-msc-csc"], programmeNames: ["M.Sc. Computer Science"], routeCodes: ["POSTGRADUATE"], version: "PG-2026-v2", effectiveDate: "2026-09-01", status: "In_Review", owner: "Postgraduate School", approvalStatus: "Pending",
    inputs: [{ key: "qualificationScore", label: "Prior qualification", description: "Verified degree qualification score.", source: "Evidence", protectedAttribute: false, permittedByPolicy: true }, { key: "refereeScore", label: "Referee assessment", description: "Verified referee report score.", source: "Evidence", protectedAttribute: false, permittedByPolicy: true }, { key: "interviewScore", label: "Interview readiness", description: "Interview assessment score.", source: "Interview", protectedAttribute: false, permittedByPolicy: true }],
    conditions: [{ id: "pg-condition-1", label: "Qualification requirement", inputKey: "qualificationScore", operator: "greater_than_or_equal", expectedValue: 24, weight: 40, scoreRange: { minimum: 0, maximum: 40 } }, { id: "pg-condition-2", label: "Referee requirement", inputKey: "refereeScore", operator: "greater_than_or_equal", expectedValue: 18, weight: 30, scoreRange: { minimum: 0, maximum: 30 } }, { id: "pg-condition-3", label: "Interview requirement", inputKey: "interviewScore", operator: "greater_than_or_equal", expectedValue: 18, weight: 30, scoreRange: { minimum: 0, maximum: 30 } }],
    versions: [{ version: "PG-2026-v2", status: "In_Review", effectiveDate: "2026-09-01", changedAt: "2026-09-05T09:00:00Z", changedBy: "Postgraduate School", reason: "Added interview threshold" }, { version: "PG-2026-v1", status: "Superseded", effectiveDate: "2026-05-01", changedAt: "2026-09-05T08:00:00Z", changedBy: "Postgraduate School", reason: "Previous cycle version" }],
  },
];