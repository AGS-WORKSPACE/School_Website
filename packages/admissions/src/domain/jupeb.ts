import type { EvidenceStatus } from "./screening";

export type JupebResultStatus = "Pending" | "Received" | "Verified" | "Failed_Verification" | "Incomplete";
export type JupebCentreEvidenceStatus = "Not_Submitted" | "Submitted" | "Verified" | "Rejected" | "Pending_Verification";

export interface JupebSubjectCombination {
  id: string;
  code: string;
  label: string;
  subjects: string[];
  approvedForProgrammes: string[];
  active: boolean;
  policyReference: string;
}

export interface JupebApprovedCentre {
  id: string;
  name: string;
  location: string;
  approvalReference: string;
  approvedUntil: string;
  active: boolean;
}

export interface JupebCandidateRecord {
  id: string;
  screeningRecordId: string;
  applicationId: string;
  candidateName: string;
  applicationNumber: string;
  programmeName: string;
  combinationId: string;
  selectedSubjects: string[];
  combinationEligible: boolean;
  eligibilityStatus: "Eligible" | "Needs_Review" | "Ineligible";
  centreId: string;
  centreEvidenceStatus: JupebCentreEvidenceStatus;
  centreEvidence: { id: string; label: string; status: EvidenceStatus; documentId?: string }[];
  resultStatus: JupebResultStatus;
  externalCandidateReference?: string;
  externalCentreReference?: string;
}

export function validateJupebCombination(candidate: Pick<JupebCandidateRecord, "selectedSubjects" | "programmeName">, combinations: JupebSubjectCombination[]) {
  const selected = new Set(candidate.selectedSubjects);
  const match = combinations.find((combination) => combination.active && combination.approvedForProgrammes.includes(candidate.programmeName) && combination.subjects.length === selected.size && combination.subjects.every((subject) => selected.has(subject)));
  return { valid: Boolean(match), combination: match };
}