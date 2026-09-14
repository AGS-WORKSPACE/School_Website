import type { StudentFieldKey } from "./record";

export interface CorrectionEvidence {
  id: string;
  documentType: string;
  fileName: string;
  checksum: string;
  uploadedAt: string;
}

export type CorrectionStatus = "Submitted" | "Approved" | "Rejected" | "Withdrawn";

/**
 * A request to change a recorded field (SIS-02). Students raise corrections to
 * their own protected identity fields; Registry raises them on a student's behalf.
 */
export interface CorrectionRequest {
  id: string;
  studentId: string;
  field: StudentFieldKey;
  currentValue: string;
  requestedValue: string;
  justification: string;
  evidence: CorrectionEvidence[];
  origin: "Student" | "Registry";
  status: CorrectionStatus;
  submittedAt: string;
  submittedBy: string;
  submittedByName: string;
  decidedAt?: string;
  decidedBy?: string;
  decidedByName?: string;
  /** Internal decision note for Registry. */
  decisionReason?: string;
  /** Plain-language outcome shown to the student. */
  releasableReason?: string;
}
