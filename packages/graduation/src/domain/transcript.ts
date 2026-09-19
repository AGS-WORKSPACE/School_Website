/**
 * Transcript requests and transcripts generated from the approved record
 * (GRD-04, GRD-05).
 */

export type TranscriptDelivery = "Electronic" | "Courier_Nigeria" | "Courier_International" | "Collection";

export type TranscriptRequestStatus = "Awaiting_Payment" | "Paid" | "Prepared" | "Issued" | "Dispatched" | "Delivered" | "Rejected";

export interface TranscriptRecipient {
  kind: "Self" | "Institution" | "Employer" | "Embassy";
  name: string;
  email?: string;
  address?: string;
}

export interface TranscriptRequestEvent {
  at: string;
  status: TranscriptRequestStatus;
  actorName: string;
  evidence?: string;
}

export interface TranscriptRequest {
  id: string;
  studentId: string;
  requestedAt: string;
  recipient: TranscriptRecipient;
  delivery: TranscriptDelivery;
  /** Identity check that authorised the request. */
  identityVerification: string;
  consentToReleaseAt: string;
  fee: { amount: number; currency: "NGN"; paymentReference?: string; paidAt?: string };
  status: TranscriptRequestStatus;
  transcriptId?: string;
  events: TranscriptRequestEvent[];
}

export interface TranscriptTemplate {
  id: string;
  version: number;
  title: string;
  footer: string;
}

export interface TranscriptLine {
  session: string;
  semester: 1 | 2;
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  grade: string;
  gradePoint: number;
}

export interface Transcript {
  id: string;
  serial: string;
  studentId: string;
  requestId: string;
  templateId: string;
  templateVersion: number;
  lines: TranscriptLine[];
  cgpa: number;
  classification: string | null;
  resultBatchIds: string[];
  /** Fingerprint of the generated lines; hand edits would not match. */
  contentFingerprint: string;
  preparedBy: string;
  preparedByName: string;
  preparedAt: string;
  signatory?: { personId: string; name: string; title: string };
  sealed: boolean;
  issuedAt?: string;
  verificationCode?: string;
}
