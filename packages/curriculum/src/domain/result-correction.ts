import type { DocumentaryEvidence } from "./programme";

export type ResultCorrectionStatus = "Request submitted" | "Evidence submitted" | "Under review" | "Changes requested" | "Approved" | "Rejected" | "Recalculation pending" | "Recalculated" | "Notification pending" | "Completed";
export type ResultNotificationStatus = "Notification pending" | "Notification sent" | "Notification failed";

export interface ResultCorrectionResultSnapshot {
  mark: number;
  grade: string;
  gradePoint: number;
  weightedPoints: number;
}

export interface ResultCorrection {
  id: string;
  studentId: string;
  studentName: string;
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  originalResultVersion: string;
  originalResult: ResultCorrectionResultSnapshot;
  proposedResultVersion: string;
  correctedInput: ResultCorrectionResultSnapshot;
  recalculatedResult?: ResultCorrectionResultSnapshot;
  request: string;
  requestedChange: string;
  reason: string;
  status: ResultCorrectionStatus;
  requesterId: string;
  requesterName: string;
  reviewerId?: string;
  reviewerName?: string;
  approverId?: string;
  approverName?: string;
  authority?: string;
  decisionReason?: string;
  evidence: DocumentaryEvidence[];
  evidenceAccess: "Authorised result reviewers only" | "Restricted";
  notificationStatus: ResultNotificationStatus;
  notificationAt?: string;
  createdAt: string;
  updatedAt: string;
  history: ResultCorrectionHistoryEntry[];
}

export interface ResultCorrectionHistoryEntry {
  id: string;
  status: ResultCorrectionStatus;
  actorId: string;
  actorName: string;
  timestamp: string;
  resultVersion: string;
  detail: string;
}
