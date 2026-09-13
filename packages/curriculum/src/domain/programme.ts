/**
 * Programme and accreditation domain contracts (CUR-01).
 *
 * Program versions are effective-dated and tied to specific entering cohorts.
 * Historical records, completed transcripts and past graduations reference the
 * exact program version that was active for the student, and are never rewritten.
 */

export type AwardLevel =
  | "Undergraduate"
  | "Postgraduate Diploma"
  | "Masters"
  | "Doctoral"
  | "JUPEB/Foundation";

export type AdmissionRoute =
  | "UTME"
  | "Direct Entry"
  | "Transfer"
  | "Postgraduate"
  | "JUPEB"
  | "International";

export type DeliveryMode =
  | "Full-time"
  | "Part-time"
  | "Blended"
  | "Online/ODL"
  | "Clinical rotation";

export type AccreditationStatus =
  | "Full Accreditation"
  | "Interim Accreditation"
  | "Accreditation Due"
  | "Resource Verification"
  | "Denied";

export type AccreditationBody =
  | "NUC" // National Universities Commission
  | "MDCN" // Medical and Dental Council of Nigeria
  | "NMCN" // Nursing and Midwifery Council of Nigeria
  | "COREN" // Council for the Regulation of Engineering in Nigeria
  | "PCN" // Pharmacy Council of Nigeria
  | "ICAN" // Institute of Chartered Accountants of Nigeria
  | "CIBN"; // Chartered Institute of Bankers of Nigeria

export interface DocumentaryEvidence {
  id: string;
  title: string;
  category:
    | "Senate Minute"
    | "NUC Approval Letter"
    | "Accreditation Report"
    | "Curriculum Document"
    | "Industry Review";
  referenceNumber: string;
  issuedDate: string;
  uploadedAt: string;
  fileUrl: string;
  checksum: string;
  uploadedBy: string;
}

export interface AccreditationRecord {
  id: string;
  body: AccreditationBody;
  status: AccreditationStatus;
  validFrom: string;
  validTo: string;
  scorePercentage?: number;
  reportSummary: string;
  panelRecommendations: string[];
  evidenceDocId?: string;
}

export type ProgrammeVersionStatus =
  | "Draft"
  | "In Review"
  | "DAP Approved"
  | "Senate Approved"
  | "Published"
  | "Superseded"
  | "Phasing Out";

export interface ProgrammeVersion {
  id: string;
  programmeId: string;
  versionNumber: string; // e.g., "2023-CCMAS-v1.0"
  status: ProgrammeVersionStatus;
  effectiveCohortFrom: string; // e.g. "2023/2024"
  effectiveCohortTo?: string; // null if current
  senateApprovalRef: string; // e.g. "SEN/RES/2023/044"
  senateApprovalDate: string;
  minimumDurationYears: number;
  maximumDurationYears: number;
  totalRequiredCredits: number;
  coreCredits: number;
  electiveCredits: number;
  generalStudiesCredits: number;
  accreditationHistory: AccreditationRecord[];
  evidence: DocumentaryEvidence[];
  structure: {
    level: 100 | 200 | 300 | 400 | 500 | 600;
    semester: 1 | 2;
    courseIds: string[];
  }[];
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface Programme {
  id: string;
  code: string; // e.g. "CMP-CSC"
  name: string; // e.g. "Computer Science"
  degreeAward: string; // e.g. "B.Sc. (Hons) Computer Science"
  awardLevel: AwardLevel;
  facultyId: string;
  facultyName: string;
  departmentId: string;
  departmentName: string;
  deliveryModes: DeliveryMode[];
  admissionRoutes: AdmissionRoute[];
  currentVersionId: string;
  versions: ProgrammeVersion[];
  description: string;
  careerOutcomes: string[];
}
