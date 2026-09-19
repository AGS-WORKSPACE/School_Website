import type { DocumentaryEvidence } from "./programme";

export type ModerationReviewStatus =
  | "Pending review"
  | "Under review"
  | "Changes requested"
  | "Recommended"
  | "Not recommended"
  | "Resolved";

export type ModerationRecommendation = "Recommended" | "Not recommended" | "Changes requested";
export type ModerationAnomalySeverity = "Info" | "Warning" | "Error";

export interface GradeDistributionBand {
  label: string;
  minimum: number;
  maximum: number;
  count: number;
  percentage: number;
}

export interface ModerationAnomaly {
  id: string;
  type: "Unusual distribution" | "High failure rate" | "Grade concentration" | "Missing marks" | "Out-of-range values" | "Version change";
  severity: ModerationAnomalySeverity;
  message: string;
  isEvidenceOfWrongdoing: false;
}

export interface ModerationSummary {
  classSize: number;
  submittedMarks: number;
  average: number | null;
  minimum: number | null;
  maximum: number | null;
  median: number | null;
  passCount: number;
  failCount: number;
  missingMarks: number;
  outOfRangeCount: number;
  gradeDistribution: GradeDistributionBand[];
}

export interface ModerationReviewAuditEntry {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  timestamp: string;
  detail: string;
}

export interface ModerationReview {
  id: string;
  resultVersion: string;
  courseCode: string;
  componentId: string;
  status: ModerationReviewStatus;
  comments: string;
  recommendation?: ModerationRecommendation;
  resolution?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  evidence: DocumentaryEvidence[];
  history: ModerationReviewAuditEntry[];
}
