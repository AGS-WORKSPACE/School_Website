import type { DocumentaryEvidence } from "../domain/programme";
import type { ModerationReview } from "../domain/moderation";

export const initialModerationEvidence: DocumentaryEvidence[] = [
  { id: "evidence-csc201-moderation-guide", title: "CSC 201 continuous assessment moderation guide", category: "Curriculum Document", referenceNumber: "CSC/MOD/2026/001", issuedDate: "2026-09-18", uploadedAt: "2026-09-19", fileUrl: "/evidence/csc201-moderation-guide.pdf", checksum: "sha256-csc201-guide", uploadedBy: "Department of Computer Science" },
  { id: "evidence-csc201-mark-sheet", title: "CSC 201 signed departmental mark sheet", category: "Industry Review", referenceNumber: "CSC/MARKS/2026/001", issuedDate: "2026-09-23", uploadedAt: "2026-09-24", fileUrl: "/evidence/csc201-mark-sheet.pdf", checksum: "sha256-csc201-marks", uploadedBy: "Exams Office" },
];

export const initialModerationReviews: ModerationReview[] = [
  {
    id: "moderation-csc201-ca-v1",
    resultVersion: "v1.0",
    courseCode: "CSC 201",
    componentId: "csc201-ca",
    status: "Pending review",
    comments: "",
    evidence: structuredClone(initialModerationEvidence),
    history: [{ id: "moderation-history-created", action: "Review created", actorId: "system", actorName: "Result workflow", timestamp: "2026-09-24T09:20:00.000Z", detail: "Result version v1.0 submitted for moderation." }],
  },
];
