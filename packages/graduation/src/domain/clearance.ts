/**
 * One clearance case per graduand with parallel unit checkpoints (GRD-02).
 * Each unit clears only its own obligations; overall status is derived.
 */

export type ClearanceUnit = "Registry" | "Bursary" | "Library" | "Department" | "Student Affairs" | "Hostel" | "ICT";

export type CheckpointStatus = "Pending" | "Cleared" | "Blocked" | "Not_Applicable";

export interface CheckpointAppeal {
  lodgedAt: string;
  grounds: string;
  status: "Open" | "Upheld" | "Dismissed";
  decidedBy?: string;
  decidedByName?: string;
  decidedAt?: string;
  decisionNote?: string;
}

export interface ClearanceCheckpoint {
  unit: ClearanceUnit;
  required: boolean;
  status: CheckpointStatus;
  /** Plain-language reason the graduand sees. */
  reason?: string;
  decidedBy?: string;
  decidedByName?: string;
  decidedAt?: string;
  appeal?: CheckpointAppeal;
}

export interface ClearanceCase {
  id: string;
  studentId: string;
  graduationSession: string;
  openedAt: string;
  checkpoints: ClearanceCheckpoint[];
}

export type ClearanceStatus = "Cleared" | "Blocked" | "In_Progress";
