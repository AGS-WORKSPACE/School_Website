import type { ScreeningRecord } from "../domain/screening";

export const initialScreeningRecords: ScreeningRecord[] = [
  {
    id: "screen-2026-001", applicationId: "app-2026-001", applicationNumber: "TAU/2026/UG/0014", applicantName: "Chidiebere Okonkwo", programmeId: "prog-csc", programmeName: "B.Sc. Computer Science", facultyName: "Faculty of Computing and Applied Sciences", routeCode: "UTME", applicationStage: "Payment_Verified", screeningStatus: "In_Review", eligibilityStatus: "Eligible", reviewStatus: "Assigned", evidenceStatus: "Pending_Verification", score: 78, maximumScore: 100, rank: 4, capacity: 60, reviewerName: "Mrs. Amina Yusuf",
    evidence: [
      { id: "evidence-001", label: "O-Level result", requirementCode: "O_LEVEL_RESULT", status: "Verified", documentId: "doc-001" },
      { id: "evidence-002", label: "JAMB result slip", requirementCode: "JAMB_RESULT_SLIP", status: "Pending_Verification", documentId: "doc-002", note: "Awaiting external result confirmation." },
      { id: "evidence-003", label: "Birth certificate", requirementCode: "BIRTH_CERTIFICATE", status: "Submitted", documentId: "doc-003" },
    ],
    scores: [{ criterion: "CAPS/JAMB result", score: 46, maximum: 60, source: "CAPS" }, { criterion: "Academic evidence", score: 24, maximum: 30, source: "Evidence" }, { criterion: "Screening review", score: 8, maximum: 10, source: "Manual" }],
    audit: [{ id: "screen-audit-001", action: "Assigned for screening", actor: "Mrs. Amina Yusuf", at: "2026-09-10T09:20:00Z", detail: "Assigned within Faculty of Computing scope." }, { id: "screen-audit-002", action: "Evidence marked pending", actor: "Mrs. Amina Yusuf", at: "2026-09-11T14:05:00Z", detail: "JAMB result requires external verification." }],
  },
  {
    id: "screen-2026-002", applicationId: "app-2026-004", applicationNumber: "TAU/2026/PG/0021", applicantName: "Fatima Aliyu", programmeId: "prog-msc-csc", programmeName: "M.Sc. Computer Science", facultyName: "Faculty of Computing and Applied Sciences", routeCode: "POSTGRADUATE", applicationStage: "Payment_Verified", screeningStatus: "Completed", eligibilityStatus: "Needs_Review", reviewStatus: "Ready_For_Decision", evidenceStatus: "Submitted", score: 84, maximumScore: 100, rank: 2, capacity: 20, reviewerName: "Dr. Ngozi Madu",
    evidence: [{ id: "evidence-004", label: "First degree certificate", requirementCode: "DEGREE_CERTIFICATE", status: "Verified", documentId: "doc-004" }, { id: "evidence-005", label: "Official transcript", requirementCode: "OFFICIAL_TRANSCRIPT", status: "Submitted", documentId: "doc-005", note: "School verification is still outstanding." }, { id: "evidence-006", label: "Referee reports", requirementCode: "REFEREE_REPORT", status: "Pending_Verification", note: "One of two referee reports submitted." }],
    scores: [{ criterion: "Prior qualification", score: 35, maximum: 40, source: "Evidence" }, { criterion: "Referee assessment", score: 26, maximum: 30, source: "Evidence" }, { criterion: "Interview readiness", score: 23, maximum: 30, source: "Manual" }],
    audit: [{ id: "screen-audit-003", action: "Screening completed", actor: "Dr. Ngozi Madu", at: "2026-09-09T11:40:00Z", detail: "All available criteria recorded; transcript remains conditional." }],
  },
  {
    id: "screen-2026-003", applicationId: "app-2026-006", applicationNumber: "TAU/2026/JUPEB/0007", applicantName: "Ifeoma Eze", programmeId: "prog-jupeb", programmeName: "JUPEB Foundation Programme", facultyName: "Faculty of Science", routeCode: "JUPEB_FOUNDATION", applicationStage: "Under_Screening", screeningStatus: "Not_Started", eligibilityStatus: "Not_Assessed", reviewStatus: "Unassigned", evidenceStatus: "Missing", score: null, maximumScore: 100, rank: null, capacity: 40,
    evidence: [{ id: "evidence-007", label: "O-Level result", requirementCode: "O_LEVEL_RESULT", status: "Missing", note: "Required before screening can begin." }, { id: "evidence-008", label: "Centre registration evidence", requirementCode: "JUPEB_CENTRE_REGISTRATION", status: "Required" }], scores: [], audit: [],
  },
];