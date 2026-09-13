/**
 * Deduplication and identity discrepancy case models (ADM-06).
 *
 * Rules strictly forbid merging records automatically on name alone.
 * Suspicious matches are queued for human adjudication by authorized officers.
 */

export interface MatchFactor {
  attribute: "JAMB_REG_NUMBER" | "NIN" | "PHONE" | "EMAIL" | "NAME_DOB_SOUNDEX" | "BIOMETRIC_PORTRAIT";
  primaryValue: string;
  matchedValue: string;
  weight: number; // 0 - 100
  isExactMatch: boolean;
}

export type DiscrepancySeverity = "High" | "Medium" | "Low";

export type DiscrepancyStatus = "Open_Under_Review" | "Confirmed_Duplicate" | "Confirmed_Separate_Person" | "Resolved_Merged";

export interface DuplicateMatchCase {
  id: string; // "dup-case-001"
  primaryApplicationId: string;
  matchedApplicationId: string;
  primaryApplicantName: string;
  matchedApplicantName: string;
  compositeScore: number; // 0 - 100
  severity: DiscrepancySeverity;
  status: DiscrepancyStatus;
  detectedAt: string;
  matchFactors: MatchFactor[];
  investigationNotes?: string;
  resolvedAt?: string;
  resolvedBy?: {
    personId: string;
    name: string;
    role: string;
  };
  resolutionSummary?: string;
}
