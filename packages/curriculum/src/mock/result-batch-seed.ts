import type { ResultBatch } from "../domain/result-batch";

const common = {
  academicSession: "2026/2027", semester: 1, facultyName: "Faculty of Computing and Applied Sciences",
  departmentName: "Department of Computer Science", programmeName: "B.Sc. Computer Science",
  courseScope: "CSC 201 · Computer Programming I · All assessment components", studentCount: 3,
};

function batch(id: string, name: string, status: ResultBatch["status"], version: string, preparerId: string, preparerName: string, extra: Partial<ResultBatch> = {}): ResultBatch {
  return { ...common, id, name, status, resultVersion: version, preparerId, preparerName, history: [{ id: `${id}-created`, action: "Batch created", actorId: preparerId, actorName: preparerName, timestamp: "2026-09-21T09:00:00Z", resultVersion: version, detail: "Frontend demonstration batch." }], ...extra };
}

export const initialResultBatches: ResultBatch[] = [
  batch("result-batch-draft", "CSC 201 · Semester 1 draft", "Draft", "v1.0", "person-exams", "Amina Yusuf"),
  batch("result-batch-moderation", "CSC 201 · Ready for moderation", "Pending moderation", "v1.0", "person-exams", "Amina Yusuf", { preparedAt: "2026-09-22T10:15:00Z" }),
  batch("result-batch-faculty", "CSC 201 · Faculty review", "Pending Faculty approval", "v1.0", "person-exams", "Amina Yusuf", { reviewerId: "person-hod", reviewerName: "Dr. Kemi Adeyemi", reviewedAt: "2026-09-23T13:00:00Z" }),
  batch("result-batch-senate", "CSC 201 · Senate review", "Pending Senate approval", "v1.0", "person-exams", "Amina Yusuf", { reviewerId: "person-dean", reviewerName: "Prof. Chidi Okafor", reviewedAt: "2026-09-24T13:00:00Z" }),
  batch("result-batch-locked", "CSC 201 · Approved and locked", "Locked", "v1.0", "person-exams", "Amina Yusuf", { reviewerId: "person-dean", reviewerName: "Prof. Chidi Okafor", approverId: "person-senate", approverName: "Senate Secretariat", lockedAt: "2026-09-25T15:00:00Z", lockedBy: "Senate Secretariat" }),
  batch("result-batch-published", "CSC 201 · Published results", "Published", "v1.0", "person-exams", "Amina Yusuf", { reviewerId: "person-dean", reviewerName: "Prof. Chidi Okafor", approverId: "person-senate", approverName: "Senate Secretariat", lockedAt: "2026-09-25T15:00:00Z", lockedBy: "Senate Secretariat", publishedAt: "2026-09-26T09:00:00Z", publishedBy: "Records Office" }),
  batch("result-batch-returned", "CSC 201 · Returned for correction", "Returned for correction", "v1.1", "person-exams", "Amina Yusuf", { reason: "Resolve the missing practical mark before resubmission." }),
  // Read by EP-18: a graduand's final-year project cannot count towards graduation until Senate approves this batch.
  batch("result-batch-final-project", "CSC 499 · Final year project (late marks)", "Pending Senate approval", "v1.0", "person-exams", "Amina Yusuf", { academicSession: "2025/2026", semester: 2, courseScope: "CSC 499 · Final Year Project", studentCount: 1, reviewerId: "person-dean", reviewerName: "Prof. Chidi Okafor", reviewedAt: "2026-09-15T13:00:00Z" }),
];
