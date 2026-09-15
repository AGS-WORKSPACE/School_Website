import type { AdmissionRouteCode } from "./route";

export type CapsImportStatus = "Not_Started" | "Validated" | "Partially_Imported" | "Rejected";
export type CapsValidationStatus = "Not_Validated" | "Valid" | "Invalid" | "Needs_Review";
export type CapsDiscrepancyType =
  | "Candidate_Not_Found"
  | "Duplicate_Candidate"
  | "Mismatched_Identifier"
  | "Mismatched_Programme"
  | "Mismatched_Cycle"
  | "Missing_Required_Field"
  | "Invalid_Result_Status";
export type CapsAssociationStatus = "Unassociated" | "Associated" | "Blocked";

export interface CapsImportRecord {
  id: string;
  externalReference: string;
  candidateName: string;
  applicationNumber?: string;
  cycleId: string;
  programmeName: string;
  routeCode: AdmissionRouteCode;
  resultStatus: "Pending" | "Eligible" | "Not_Eligible" | "Recommended";
  associationStatus: CapsAssociationStatus;
}

export interface CapsDiscrepancy {
  id: string;
  importRecordId: string;
  type: CapsDiscrepancyType;
  severity: "Blocking" | "Warning";
  message: string;
  blocksRecommendation: boolean;
  resolved: boolean;
}

export interface CapsImportReport {
  id: string;
  source: string;
  fileName: string;
  cycleId: string;
  importedAt: string;
  totalRecords: number;
  acceptedRecords: number;
  rejectedRecords: number;
  discrepancyCount: number;
  importStatus: CapsImportStatus;
  validationStatus: CapsValidationStatus;
  records: CapsImportRecord[];
  discrepancies: CapsDiscrepancy[];
}

export interface CapsCandidateAssociation {
  id: string;
  importRecordId: string;
  applicationId: string;
  applicationNumber: string;
  candidateName: string;
  externalReference: string;
  cycleId: string;
  programmeName: string;
  status: CapsAssociationStatus;
  discrepancyStatus: "Clear" | "Blocked" | "Resolved";
  associatedAt: string;
  associatedBy: string;
}