/**
 * The academic record graduation reads from. Graduation never keeps its own
 * copy of a grade: each result points at the EP-12 result batch it was approved
 * in, and only locked or published batches count.
 */

export interface Graduand {
  studentId: string;
  matriculationNumber: string;
  name: string;
  programmeId: string;
  programmeName: string;
  /** Curriculum programme version the student is taught under (EP-09). */
  programmeVersionId: string;
  award: string;
  entrySession: string;
  /** Session in which the student completes and may graduate. */
  graduationSession: string;
}

export interface ApprovedResult {
  id: string;
  studentId: string;
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  session: string;
  semester: 1 | 2;
  mark: number;
  grade: string;
  gradePoint: number;
  /** EP-12 result batch this result was approved in. */
  resultBatchId: string;
  resultVersion: string;
}

export interface ClassificationBand {
  minimumCgpa: number;
  label: string;
}

/** Effective-dated degree classification rule (5-point scale). */
export interface ClassificationRule {
  id: string;
  version: string;
  effectiveFrom: string;
  authority: string;
  minimumCgpaToGraduate: number;
  bands: ClassificationBand[];
}

export interface GraduationAuditEntry {
  id: string;
  entity: "Audit" | "Override" | "Clearance" | "List" | "Transcript" | "Certificate" | "Verification";
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  at: string;
  detail: string;
}
