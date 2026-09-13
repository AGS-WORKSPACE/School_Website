/**
 * Curriculum change proposal and Senate governance contracts (CUR-04).
 *
 * All curriculum modifications follow a strict maker-checker workflow:
 * Department Board proposes -> Faculty Board approves -> DAP reviews -> Senate authorizes.
 * Proposer cannot approve their own submission (enforced via SoD).
 */

export type ProposalType =
  | "New Programme"
  | "Programme Revision"
  | "New Course"
  | "Course Revision"
  | "Credit Adjustment"
  | "Course Archival";

export type ProposalStage =
  | "Draft"
  | "Department Board Recommended"
  | "Faculty Board Approved"
  | "DAP Technical Review"
  | "Senate Approved"
  | "Rejected"
  | "Implemented";

export interface ImpactAnalysis {
  impactedCohorts: {
    cohortName: string; // e.g. "2026/2027 Freshmen" vs "2024/2025 Continuing"
    effectDescription: string;
    actionRequired: string;
  }[];
  prerequisiteRipple: {
    affectedCourseCode: string;
    affectedCourseTitle: string;
    natureOfImpact: string;
    recommendedRemedy: string;
  }[];
  staffingImpact: {
    specialisationRequired: string;
    currentQualifiedStaffCount: number;
    additionalStaffNeeded: number;
    projectedWeeklyTeachingHours: number;
    isStaffingAdequate: boolean;
  };
  resourceRequirements: {
    labEquipmentNeeded: string[];
    softwareLicensesNeeded: string[];
    estimatedBudgetNaira: number;
    facilitiesReadiness: "Ready" | "Upgrade Required" | "Critical Shortage";
  };
  transitionPlan: {
    carryoverHandling: string;
    teachOutPeriodYears: number;
    substitutionRulesProposed: string[];
  };
}

export interface ProposalReviewStep {
  stage: ProposalStage;
  decidedAt: string;
  decidedByPersonId: string;
  decidedByName: string;
  decision: "Approved" | "Recommended" | "Returned for Revision" | "Rejected";
  comments: string;
  minuteReference?: string;
}

export interface CurriculumProposal {
  id: string;
  proposalNumber: string; // e.g. "CCP-2026-003"
  title: string;
  type: ProposalType;
  programmeId: string;
  programmeName: string;
  departmentId: string;
  departmentName: string;
  facultyId: string;
  facultyName: string;
  targetEffectiveSession: string; // e.g. "2026/2027"
  rationale: string;
  summaryOfChanges: string[];
  stage: ProposalStage;
  proposedByPersonId: string;
  proposedByName: string;
  proposedAt: string;
  impactAnalysis: ImpactAnalysis;
  reviewHistory: ProposalReviewStep[];
  senateResolutionRef?: string;
  senateApprovalDate?: string;
}
