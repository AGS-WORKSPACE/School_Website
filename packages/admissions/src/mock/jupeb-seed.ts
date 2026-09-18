import type { JupebApprovedCentre, JupebCandidateRecord, JupebSubjectCombination } from "../domain/jupeb";

export const initialJupebCombinations: JupebSubjectCombination[] = [
  { id: "jupeb-comb-sci", code: "SCI-A", label: "Science and technology", subjects: ["Mathematics", "Physics", "Chemistry"], approvedForProgrammes: ["B.Sc. Computer Science"], active: true, policyReference: "JUPEB approved subject combination catalogue 2026/2027" },
  { id: "jupeb-comb-social", code: "SOC-A", label: "Social science", subjects: ["Mathematics", "Economics", "Government"], approvedForProgrammes: ["B.Sc. Computer Science"], active: true, policyReference: "JUPEB approved subject combination catalogue 2026/2027" },
];

export const initialJupebCentres: JupebApprovedCentre[] = [
  { id: "centre-tau-main", name: "TAU Main Campus JUPEB Centre", location: "Umuchukwu", approvalReference: "JUPEB/CENTRE/TAU/2026/014", approvedUntil: "2027-08-31", active: true },
  { id: "centre-tau-annex", name: "TAU City Learning Centre", location: "Awka", approvalReference: "JUPEB/CENTRE/TAU/2026/021", approvedUntil: "2027-08-31", active: true },
];

export const initialJupebCandidates: JupebCandidateRecord[] = [
  { id: "jupeb-candidate-001", screeningRecordId: "screen-2026-003", applicationId: "app-2026-006", candidateName: "Ifeoma Eze", applicationNumber: "TAU/2026/JUPEB/0007", programmeName: "B.Sc. Computer Science", combinationId: "jupeb-comb-sci", selectedSubjects: ["Mathematics", "Physics", "Chemistry"], combinationEligible: true, eligibilityStatus: "Needs_Review", centreId: "centre-tau-main", centreEvidenceStatus: "Pending_Verification", centreEvidence: [{ id: "jupeb-evidence-001", label: "Centre registration evidence", status: "Pending_Verification", documentId: "doc-jupeb-centre-001" }], resultStatus: "Pending", externalCandidateReference: "JUPEB-TAU-2026-0007", externalCentreReference: "JUPEB-CENTRE-TAU-2026-014" },
];