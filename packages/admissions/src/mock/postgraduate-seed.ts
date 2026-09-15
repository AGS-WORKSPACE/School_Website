import type { PostgraduateReviewRecord } from "../domain/postgraduate";

export const initialPostgraduateReviews: PostgraduateReviewRecord[] = [
  {
    id: "pg-review-001", applicationId: "app-2026-004", screeningRecordId: "screen-2026-002", candidateName: "Fatima Aliyu", applicationNumber: "TAU/2026/PG/0021", programmeName: "M.Sc. Computer Science",
    qualificationReviews: [{ id: "pg-qual-001", qualification: "B.Sc. Computer Science", institution: "University of Lagos", field: "Computer Science", classification: "Second Class Upper", completionYear: 2023, verificationStatus: "Verified", evidenceStatus: "Verified" }],
    transcripts: [{ id: "pg-transcript-001", label: "Official undergraduate transcript", status: "Pending", evidenceStatus: "Submitted", documentId: "doc-005", note: "Institution verification is outstanding." }],
    referees: [{ id: "pg-ref-001", refereeName: "Prof. Kayode Alabi", institution: "University of Lagos", requestStatus: "Submitted", submissionStatus: "Submitted", verificationStatus: "Verified", privateContentAvailable: true }, { id: "pg-ref-002", refereeName: "Dr. Ngozi Madu", institution: "Directorate of Academic Planning", requestStatus: "Pending", submissionStatus: "Not_Submitted", verificationStatus: "Pending", privateContentAvailable: false }],
    assessments: { testStatus: "Completed", testScore: 76, interviewStatus: "Completed", interviewScore: 82, reviewer: "Dr. Ngozi Madu", assessmentDate: "2026-09-09" },
    supervisorCapacity: { supervisor: "Dr. Chuka Obi", department: "Computer Science", availableCapacity: 3, currentAllocation: 2, capacityStatus: "Available" },
    departmentalRecommendation: { status: "Recommended", authority: "Department of Computer Science", reviewer: "Dr. Chuka Obi", decidedAt: "2026-09-10T10:00:00Z", rationale: "Strong academic preparation and research fit." },
    schoolRecommendation: { status: "Not_Started" },
    finalDecision: { status: "Not_Decided", conditions: [{ id: "pg-condition-transcript", label: "Official transcript verification", status: "Outstanding" }, { id: "pg-condition-supervisor", label: "Supervisor confirmation", status: "Outstanding" }] },
  },
];