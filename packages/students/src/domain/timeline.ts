/**
 * The student's plain-language timeline of requests and status changes (SIS-06).
 */

export interface StudentTimelineItem {
  id: string;
  occurredAt: string;
  category: "Status" | "Programme" | "Request" | "Hold";
  title: string;
  /** Only releasable wording; internal reasons never reach this type. */
  description: string;
  state: "Completed" | "In_Progress" | "Active" | "Declined";
  actionOwner: string;
  dueBy?: string;
  overdue?: boolean;
  appeal?: string;
}

export interface ServiceLevels {
  correctionDays: number;
  transferStageDays: number;
}
