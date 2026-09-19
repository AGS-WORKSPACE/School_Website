/**
 * Versioned graduand lists for Senate approval (GRD-03).
 */

export interface GraduandListEntry {
  studentId: string;
  matriculationNumber: string;
  name: string;
  programmeName: string;
  award: string;
  classification: string;
  cgpa: number;
  /** Override references that made the graduand eligible, if any. */
  exceptions: string[];
}

export interface GraduandListTotals {
  total: number;
  byProgramme: Record<string, number>;
  byAward: Record<string, number>;
  byClassification: Record<string, number>;
}

export interface GraduandList {
  id: string;
  graduationSession: string;
  version: number;
  status: "Draft" | "Submitted" | "Approved" | "Returned";
  entries: GraduandListEntry[];
  totals: GraduandListTotals;
  preparedBy: string;
  preparedByName: string;
  preparedAt: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  senateReference?: string;
  /** Fingerprint of the exact approved entries; any later change is detectable. */
  frozenFingerprint?: string;
  returnReason?: string;
}
