export type ResultBatchStatus =
  | "Draft" | "Prepared" | "Pending moderation" | "Recommended"
  | "Pending Faculty approval" | "Faculty approved" | "Pending Senate approval"
  | "Senate approved" | "Locked" | "Published" | "Rejected" | "Returned for correction";

export interface ResultBatchHistoryEntry {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  timestamp: string;
  resultVersion: string;
  detail?: string;
}

export interface ResultBatch {
  id: string;
  name: string;
  academicSession: string;
  semester: number;
  facultyName: string;
  departmentName: string;
  programmeName: string;
  courseScope: string;
  studentCount: number;
  resultVersion: string;
  preparerId: string;
  preparerName: string;
  reviewerId?: string;
  reviewerName?: string;
  approverId?: string;
  approverName?: string;
  status: ResultBatchStatus;
  preparedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  lockedAt?: string;
  publishedAt?: string;
  lockedBy?: string;
  publishedBy?: string;
  reason?: string;
  history: ResultBatchHistoryEntry[];
}
