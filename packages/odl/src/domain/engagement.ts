/**
 * Transparent engagement alerts (ODL-02).
 *
 * Every alert names the rule that fired and explains the evidence in plain
 * language, and routes to a human. Nothing in this domain or its policy ever
 * writes to academic standing; that stays a decision for the receiving
 * person, not this rule engine.
 */

export type EngagementRuleId = "No_Recent_Activity" | "Missed_Submission" | "Low_Discussion_Participation";

export interface EngagementRule {
  id: EngagementRuleId;
  label: string;
  description: string;
  thresholdDays: number;
}

export type EngagementAlertStatus = "Open" | "Contacted" | "Resolved";

export interface EngagementAlert {
  id: string;
  offeringId: string;
  studentId: string;
  studentName: string;
  ruleId: EngagementRuleId;
  /** Plain-language evidence for the trigger, shown to the routed human. */
  triggerExplanation: string;
  raisedAt: string;
  routedToPersonId: string;
  routedToName: string;
  status: EngagementAlertStatus;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolutionNote?: string;
}
