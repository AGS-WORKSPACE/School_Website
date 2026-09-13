/**
 * NUC CCMAS (Core Curriculum Minimum Academic Standards) alignment and QA contracts (CUR-03).
 *
 * In Nigerian higher education, NUC mandates 70% Core benchmark content,
 * leaving 30% for University-specific innovative / local content.
 * QA and DAP require comprehensive mapping, gap detection and audit evidence.
 */

export interface CCMASKnowledgeArea {
  id: string;
  code: string; // e.g. "CCMAS-CS-FND"
  name: string; // e.g. "Foundations of Computing"
  description: string;
  minimumCoreCredits: number;
  expectedCompetencies: string[];
}

export interface CCMASBenchmark {
  id: string;
  disciplineCode: string; // e.g. "COMP-01"
  disciplineName: string; // e.g. "Computing / Computer Science"
  nucReleaseYear: number; // e.g. 2022 / 2023 CCMAS
  nucDocumentRef: string; // e.g. "NUC/CCMAS/SCI/COMP/2022"
  mandatedCoreCreditTotal: number;
  minimumDurationYears: number;
  knowledgeAreas: CCMASKnowledgeArea[];
}

export type ContentOrigin = "NUC_CCMAS_CORE" | "INSTITUTIONAL_LOCAL";

export interface CourseCCMASMapping {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  origin: ContentOrigin;
  benchmarkKnowledgeAreaId?: string;
  satisfiedCompetencies: string[];
  localContentRationale?: string;
}

export interface CCMASGap {
  knowledgeAreaId: string;
  knowledgeAreaName: string;
  requiredCredits: number;
  mappedCredits: number;
  deficitCredits: number;
  missingCompetencies: string[];
  severity: "Compliant" | "Minor Deficiency" | "Critical Non-Compliance";
  responsibleOfficer: string;
}

export interface CCMASProgramAudit {
  programmeId: string;
  programmeVersionId: string;
  benchmarkId: string;
  totalCredits: number;
  coreCredits: number;
  localCredits: number;
  corePercentage: number; // Must be ~70% (minimum 65-70%)
  localPercentage: number; // Must be ~30%
  isDistributionValid: boolean;
  mappings: CourseCCMASMapping[];
  gaps: CCMASGap[];
  lastAuditedAt: string;
  auditedBy: string;
  qaSignOffStatus: "Pending" | "Deficiencies Flagged" | "Accreditation Ready";
  evidenceReportUrl?: string;
}
