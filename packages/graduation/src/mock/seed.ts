/**
 * Demonstration graduation data.
 *
 * Marks are graded through the EP-12 undergraduate scale, every result points
 * at the result batch it was approved in, and required courses come from the
 * EP-09 curriculum catalogue, so the audit exercises the real rules. Aisha
 * Bello is the EP-08 student record (student-2022-088); her library hold lives
 * there. The others are snapshots of SIS placement at the list cut-off.
 */

import type { ResultBatch } from "@tau/curriculum/domain";
import { gradeForMark } from "@tau/curriculum/policy";
import { initialCourses, undergraduateGradingPolicy } from "@tau/curriculum/mock";
import type { AuditOverride } from "../domain/audit";
import type { CertificateStock, StockReceipt } from "../domain/certificate";
import type { ClearanceCase, ClearanceCheckpoint } from "../domain/clearance";
import type { GraduandList } from "../domain/graduand-list";
import type { ApprovedResult, ClassificationRule, Graduand } from "../domain/record";
import type { Transcript, TranscriptRequest, TranscriptTemplate } from "../domain/transcript";
import type { VerificationQuery, VerificationRecord } from "../domain/verification";
import type { GraduationActor } from "../policy/check";

export const graduationActors: GraduationActor[] = [
  { personId: "usr-grad-01", name: "Mrs. Funmi Oladipo", title: "Graduation Officer", unit: "Registry", roleIds: ["graduation-officer", "clearance-officer"] },
  { personId: "usr-registry-02", name: "Mr. Bayo Adekunle", title: "Deputy Registrar (Records)", unit: "Registry", roleIds: ["records-approver"] },
  { personId: "usr-senate-01", name: "Mrs. Rukayat Bello", title: "Secretary to Senate", unit: "Registry", roleIds: ["records-approver"] },
  { personId: "usr-bursary-01", name: "Mrs. Kemi Lawal", title: "Bursary Officer", unit: "Bursary", roleIds: ["clearance-officer"] },
  { personId: "usr-library-01", name: "Mr. Sani Garba", title: "Circulation Librarian", unit: "Library", roleIds: ["clearance-officer"] },
  { personId: "usr-hod-csc", name: "Dr. Musa Ibrahim", title: "Head, Computer Science", unit: "Department", roleIds: ["head-of-department", "clearance-officer"] },
  { personId: "usr-affairs-01", name: "Dr. Joy Etim", title: "Dean of Student Affairs", unit: "Student Affairs", roleIds: ["clearance-officer"] },
  { personId: "usr-hostel-01", name: "Mr. Peter Ekong", title: "Hall Warden", unit: "Hostel", roleIds: ["clearance-officer"] },
  { personId: "usr-ict-01", name: "Ms. Ngozi Umeh", title: "ICT Service Desk Lead", unit: "ICT", roleIds: ["clearance-officer"] },
];

export const classificationRule: ClassificationRule = {
  id: "classification-ug-5pt",
  version: "2019.1",
  effectiveFrom: "2019/2020",
  authority: "Senate SEN/RES/2019/031",
  minimumCgpaToGraduate: 1.0,
  bands: [
    { minimumCgpa: 4.5, label: "First Class Honours" },
    { minimumCgpa: 3.5, label: "Second Class Honours (Upper Division)" },
    { minimumCgpa: 2.4, label: "Second Class Honours (Lower Division)" },
    { minimumCgpa: 1.5, label: "Third Class Honours" },
    { minimumCgpa: 1.0, label: "Pass" },
  ],
};

export const transcriptTemplate: TranscriptTemplate = {
  id: "tpl-transcript-ug",
  version: 4,
  title: "Official Academic Transcript",
  footer: "Issued under the authority of Senate. Verify at /verify using the code below. Any alteration invalidates this document.",
};

const programme = { programmeId: "prog-csc", programmeName: "B.Sc. Computer Science", programmeVersionId: "ver-csc-2019", award: "Bachelor of Science (Honours)" };

export const initialGraduands: Graduand[] = [
  { studentId: "student-2022-088", matriculationNumber: "TAU/22/SCI/0088", name: "Aisha Oyiza Bello", ...programme, entrySession: "2022/2023", graduationSession: "2025/2026" },
  { studentId: "student-2022-091", matriculationNumber: "TAU/22/SCI/0091", name: "Chiamaka Grace Obi", ...programme, entrySession: "2022/2023", graduationSession: "2025/2026" },
  { studentId: "student-2022-102", matriculationNumber: "TAU/22/SCI/0102", name: "Olumide Tunde Balogun", ...programme, entrySession: "2022/2023", graduationSession: "2025/2026" },
  { studentId: "student-2022-110", matriculationNumber: "TAU/22/SCI/0110", name: "Grace Ekaete Akpan", ...programme, entrySession: "2022/2023", graduationSession: "2025/2026" },
  { studentId: "student-2022-117", matriculationNumber: "TAU/22/SCI/0117", name: "Yusuf Danladi", ...programme, entrySession: "2022/2023", graduationSession: "2025/2026" },
  { studentId: "student-2021-044", matriculationNumber: "TAU/21/SCI/0044", name: "Oluwatobi Adewale", ...programme, entrySession: "2021/2022", graduationSession: "2024/2025" },
  { studentId: "student-2021-051", matriculationNumber: "TAU/21/SCI/0051", name: "Halima Sani", ...programme, entrySession: "2021/2022", graduationSession: "2024/2025" },
];

// --- Academic record -----------------------------------------------------------

type Offered = { code: string; title: string; credits: number; level: 1 | 2 | 3 | 4; semester: 1 | 2 };

/** The 2019 curriculum's required courses, read from the catalogue. */
const required: Offered[] = ["c-mth101", "c-gst111", "c-cos101", "c-gst112", "c-cos102", "c-csc201", "c-cos201", "c-tau201", "c-csc202"].map((id) => {
  const course = initialCourses.find((item) => item.id === id)!;
  const version = course.versions.find((item) => item.id === course.activeVersionId)!;
  return { code: course.code, title: course.title, credits: version.credits.creditUnits, level: (course.level / 100) as Offered["level"], semester: course.semester as 1 | 2 };
});

const o = (code: string, title: string, credits: number, level: Offered["level"], semester: 1 | 2): Offered => ({ code, title, credits, level, semester });

/** Programme courses completing the 148-credit B.Sc. Computer Science (2019) degree. */
const programmeCourses: Offered[] = [
  o("PHY 101", "General Physics I", 3, 1, 1), o("CHM 101", "General Chemistry I", 3, 1, 1), o("STA 111", "Descriptive Statistics", 3, 1, 1),
  o("PHY 102", "General Physics II", 3, 1, 2), o("MTH 102", "Elementary Mathematics II", 3, 1, 2), o("CSC 104", "Computing Laboratory", 2, 1, 2), o("CSC 106", "Introduction to Web Technologies", 3, 1, 2),
  o("MTH 201", "Mathematical Methods I", 3, 2, 1), o("STA 211", "Probability I", 3, 2, 1), o("CSC 205", "Computer Architecture", 3, 2, 1), o("ENT 211", "Entrepreneurship", 2, 2, 1), o("GST 211", "Philosophy and Logic", 2, 2, 1),
  o("MTH 202", "Linear Algebra", 3, 2, 2), o("CSC 206", "Digital Logic Design", 3, 2, 2), o("CSC 207", "Web Application Development", 3, 2, 2), o("CSC 208", "Database Fundamentals", 3, 2, 2), o("CSC 209", "Programming Laboratory", 3, 2, 2),
  o("CSC 301", "Data Structures and Algorithms", 3, 3, 1), o("CSC 303", "Operating Systems", 3, 3, 1), o("CSC 309", "Human–Computer Interaction", 3, 3, 1), o("CSC 311", "Numerical Methods", 3, 3, 1), o("CSC 313", "Systems Analysis and Design", 3, 3, 1), o("CSC 315", "Algorithms Laboratory", 3, 3, 1),
  o("CSC 302", "Object-Oriented Design", 3, 3, 2), o("CSC 304", "Computer Networks", 3, 3, 2), o("CSC 305", "Software Engineering", 3, 3, 2), o("CSC 306", "Theory of Computation", 3, 3, 2), o("CSC 308", "Compiler Construction", 3, 3, 2), o("CSC 399", "SIWES Industrial Training", 6, 3, 2),
  o("CSC 401", "Artificial Intelligence", 3, 4, 1), o("CSC 403", "Distributed Systems", 3, 4, 1), o("CSC 405", "Computer Security", 3, 4, 1), o("CSC 407", "Computer Graphics", 3, 4, 1), o("CSC 409", "Research Methodology", 3, 4, 1), o("CSC 411", "Cloud Computing", 3, 4, 1),
  o("CSC 402", "Machine Learning", 3, 4, 2), o("CSC 404", "Data Mining", 3, 4, 2), o("CSC 406", "Mobile Computing", 3, 4, 2), o("CSC 410", "Professional Practice and Ethics", 2, 4, 2), o("CSC 499", "Final Year Project", 6, 4, 2), o("GST 212", "Peace and Conflict Resolution", 2, 4, 2),
];

function sessionFor(entrySession: string, level: number): string {
  const start = Number(entrySession.slice(0, 4)) + level - 1;
  return `${start}/${start + 1}`;
}

export const archiveBatchId = (session: string) => `rb-archive-${session.replace("/", "-")}`;

interface RecordSpec {
  base: number;
  spread: number;
  /** Required course replaced by the legacy course actually taken. */
  takenAs?: Record<string, Offered>;
  marks?: Record<string, number>;
  omit?: string[];
  extra?: Offered[];
  batchFor?: Record<string, string>;
}

function recordFor(graduand: Graduand, spec: RecordSpec): ApprovedResult[] {
  const offered = [...required, ...programmeCourses, ...(spec.extra ?? [])].filter((course) => !spec.omit?.includes(course.code));
  return offered.map((planned, index) => {
    const course = spec.takenAs?.[planned.code] ?? planned;
    const mark = spec.marks?.[planned.code] ?? spec.base + ((index * 7) % spec.spread) - Math.floor(spec.spread / 2);
    const band = gradeForMark(mark, undergraduateGradingPolicy);
    const session = sessionFor(graduand.entrySession, planned.level);
    return {
      id: `res-${graduand.studentId}-${course.code.replace(" ", "")}`,
      studentId: graduand.studentId,
      courseCode: course.code,
      courseTitle: course.title,
      creditUnits: course.credits,
      session,
      semester: planned.semester,
      mark,
      grade: band.grade,
      gradePoint: band.gradePoint,
      resultBatchId: spec.batchFor?.[planned.code] ?? archiveBatchId(session),
      resultVersion: "v1.0",
    };
  });
}

const graduand = (id: string) => initialGraduands.find((item) => item.studentId === id)!;

export const initialResults: ApprovedResult[] = [
  // Legacy Discrete Structures satisfies COS 201 through the Senate-approved exact equivalence.
  ...recordFor(graduand("student-2022-088"), { base: 74, spread: 12, takenAs: { "COS 201": o("CSC 203", "Discrete Structures", 3, 2, 1) } }),
  ...recordFor(graduand("student-2022-091"), { base: 66, spread: 16 }),
  // Failed CSC 202 with no resit, and never took the algorithms laboratory.
  ...recordFor(graduand("student-2022-102"), { base: 55, spread: 16, marks: { "CSC 202": 38 }, omit: ["CSC 315"] }),
  // GST 112 exempted on transfer (override requested); final-year project still with Senate.
  ...recordFor(graduand("student-2022-110"), { base: 64, spread: 12, omit: ["GST 112"], extra: [o("CSC 412", "Blockchain Systems", 3, 4, 1)], batchFor: { "CSC 499": "result-batch-final-project" } }),
  ...recordFor(graduand("student-2022-117"), { base: 58, spread: 14 }),
  ...recordFor(graduand("student-2021-044"), { base: 76, spread: 14 }),
  ...recordFor(graduand("student-2021-051"), { base: 67, spread: 12 }),
];

/** Historic, approved result batches (one per session) for the records above. */
export const archivedResultBatches: ResultBatch[] = ["2021/2022", "2022/2023", "2023/2024", "2024/2025", "2025/2026"].map((session) => ({
  id: archiveBatchId(session),
  name: `B.Sc. Computer Science · ${session} sessional results`,
  academicSession: session,
  semester: 2,
  facultyName: "Faculty of Computing and Applied Sciences",
  departmentName: "Department of Computer Science",
  programmeName: "B.Sc. Computer Science",
  courseScope: "All courses, both semesters",
  studentCount: 0,
  resultVersion: "v1.0",
  preparerId: "person-exams",
  preparerName: "Amina Yusuf",
  approverId: "person-senate",
  approverName: "Senate Secretariat",
  status: "Published",
  lockedAt: `${session.slice(5)}-08-20T12:00:00Z`,
  lockedBy: "Senate Secretariat",
  publishedAt: `${session.slice(5)}-08-25T09:00:00Z`,
  publishedBy: "Records Office",
  history: [],
}));

// --- Overrides and clearance ---------------------------------------------------

export const initialOverrides: AuditOverride[] = [
  { id: "ovr-2026-004", studentId: "student-2022-110", gapKey: "Required_Course:GST 112", reason: "Exempted from GST 112 on the basis of equivalent credit earned at the University of Uyo before transfer (transcript verified 2023).", authorityReference: "Senate SEN/2023/10/047 transfer credit schedule", status: "Requested", requestedBy: "usr-grad-01", requestedByName: "Mrs. Funmi Oladipo", requestedAt: "2026-09-12T10:00:00Z" },
];

const cleared = (unit: ClearanceCheckpoint["unit"], by: string, at: string): ClearanceCheckpoint => ({ unit, required: true, status: "Cleared", decidedBy: by, decidedByName: by, decidedAt: at });

function caseFor(studentId: string, session: string, checkpoints: ClearanceCheckpoint[]): ClearanceCase {
  return { id: `clr-${studentId}`, studentId, graduationSession: session, openedAt: session === "2025/2026" ? "2026-09-01T08:00:00Z" : "2025-09-01T08:00:00Z", checkpoints };
}

const allCleared = (at: string) => [
  cleared("Registry", "Mrs. Funmi Oladipo", at), cleared("Bursary", "Mrs. Kemi Lawal", at), cleared("Library", "Mr. Sani Garba", at), cleared("Department", "Dr. Musa Ibrahim", at),
  cleared("Student Affairs", "Dr. Joy Etim", at), cleared("Hostel", "Mr. Peter Ekong", at), cleared("ICT", "Ms. Ngozi Umeh", at),
];

export const initialClearances: ClearanceCase[] = [
  caseFor("student-2022-088", "2025/2026", [
    cleared("Registry", "Mrs. Funmi Oladipo", "2026-09-03T10:00:00Z"), cleared("Bursary", "Mrs. Kemi Lawal", "2026-09-04T11:00:00Z"),
    { unit: "Library", required: true, status: "Blocked", reason: "Return two overdue library books and pay the ₦4,500 fine.", decidedBy: "usr-library-01", decidedByName: "Mr. Sani Garba", decidedAt: "2026-09-04T12:00:00Z" },
    cleared("Department", "Dr. Musa Ibrahim", "2026-09-05T09:00:00Z"), cleared("Student Affairs", "Dr. Joy Etim", "2026-09-05T10:00:00Z"),
    cleared("Hostel", "Mr. Peter Ekong", "2026-09-06T10:00:00Z"), { unit: "ICT", required: true, status: "Pending" },
  ]),
  caseFor("student-2022-091", "2025/2026", allCleared("2026-09-08T10:00:00Z")),
  caseFor("student-2022-102", "2025/2026", [
    cleared("Registry", "Mrs. Funmi Oladipo", "2026-09-03T10:00:00Z"), cleared("Bursary", "Mrs. Kemi Lawal", "2026-09-04T11:00:00Z"), cleared("Library", "Mr. Sani Garba", "2026-09-04T12:00:00Z"),
    { unit: "Department", required: true, status: "Blocked", reason: "CSC 202 is outstanding; register for the resit in 2026/2027.", decidedBy: "usr-hod-csc", decidedByName: "Dr. Musa Ibrahim", decidedAt: "2026-09-05T09:00:00Z" },
    { unit: "Student Affairs", required: true, status: "Pending" }, { unit: "Hostel", required: false, status: "Not_Applicable" }, { unit: "ICT", required: true, status: "Pending" },
  ]),
  caseFor("student-2022-110", "2025/2026", allCleared("2026-09-09T10:00:00Z")),
  caseFor("student-2022-117", "2025/2026", [
    cleared("Registry", "Mrs. Funmi Oladipo", "2026-09-03T10:00:00Z"),
    { unit: "Bursary", required: true, status: "Blocked", reason: "Outstanding 2025/2026 accommodation charge of ₦85,000.", decidedBy: "usr-bursary-01", decidedByName: "Mrs. Kemi Lawal", decidedAt: "2026-09-04T11:00:00Z", appeal: { lodgedAt: "2026-09-10T09:00:00Z", grounds: "I paid the accommodation charge on 2 September (Remita RRR 3107-5521-8840); the payment has not been applied to my account.", status: "Open" } },
    cleared("Library", "Mr. Sani Garba", "2026-09-04T12:00:00Z"), cleared("Department", "Dr. Musa Ibrahim", "2026-09-05T09:00:00Z"), cleared("Student Affairs", "Dr. Joy Etim", "2026-09-05T10:00:00Z"),
    cleared("Hostel", "Mr. Peter Ekong", "2026-09-06T10:00:00Z"), cleared("ICT", "Ms. Ngozi Umeh", "2026-09-06T11:00:00Z"),
  ]),
  caseFor("student-2021-044", "2024/2025", allCleared("2025-09-10T10:00:00Z")),
  caseFor("student-2021-051", "2024/2025", allCleared("2025-09-10T10:00:00Z")),
];

// --- Previous cycle: approved list, transcripts, certificates, verification ------

/** Built through the list policy in the store so the fingerprint matches the entries. */
export const previousListMeta = { id: "gl-2024-2025-v1", graduationSession: "2024/2025", version: 1, senateReference: "SEN/2025/10/118", approvedAt: "2025-10-16T12:00:00Z" };
export const initialLists: GraduandList[] = [];

export const initialTranscriptRequests: TranscriptRequest[] = [
  { id: "trq-2026-0107", studentId: "student-2021-051", requestedAt: "2026-08-02T09:00:00Z", recipient: { kind: "Embassy", name: "Embassy of Canada, Abuja — Immigration Section", address: "15 Bobo Street, Maitama, Abuja" }, delivery: "Courier_Nigeria", identityVerification: "Alumni portal sign-in with two-factor code", consentToReleaseAt: "2026-08-02T09:00:00Z", fee: { amount: 25_000, currency: "NGN", paymentReference: "RRR-2608-0271-5520", paidAt: "2026-08-02T09:06:00Z" }, status: "Delivered", transcriptId: "trn-2026-0107",
    events: [
      { at: "2026-08-02T09:00:00Z", status: "Awaiting_Payment", actorName: "Halima Sani" },
      { at: "2026-08-02T09:06:00Z", status: "Paid", actorName: "Payment provider callback", evidence: "RRR-2608-0271-5520" },
      { at: "2026-08-04T10:00:00Z", status: "Prepared", actorName: "Mrs. Funmi Oladipo" },
      { at: "2026-08-05T14:00:00Z", status: "Issued", actorName: "Mr. Bayo Adekunle" },
      { at: "2026-08-06T09:30:00Z", status: "Dispatched", actorName: "Mrs. Funmi Oladipo", evidence: "GIG Logistics waybill GIG-ABJ-5530182" },
      { at: "2026-08-07T15:10:00Z", status: "Delivered", actorName: "Mrs. Funmi Oladipo", evidence: "Signed proof of delivery: R. Okafor, Immigration Section" },
    ] },
  { id: "trq-2026-0141", studentId: "student-2021-044", requestedAt: "2026-09-15T11:00:00Z", recipient: { kind: "Employer", name: "Andela Nigeria — Talent Operations", email: "verification@andela.com" }, delivery: "Electronic", identityVerification: "Alumni portal sign-in with two-factor code", consentToReleaseAt: "2026-09-15T11:00:00Z", fee: { amount: 10_000, currency: "NGN", paymentReference: "RRR-2609-1142-7718", paidAt: "2026-09-15T11:04:00Z" }, status: "Paid",
    events: [
      { at: "2026-09-15T11:00:00Z", status: "Awaiting_Payment", actorName: "Oluwatobi Adewale" },
      { at: "2026-09-15T11:04:00Z", status: "Paid", actorName: "Payment provider callback", evidence: "RRR-2609-1142-7718" },
    ] },
  { id: "trq-2026-0152", studentId: "student-2022-088", requestedAt: "2026-09-17T08:00:00Z", recipient: { kind: "Institution", name: "University of Edinburgh — Postgraduate Admissions", email: "pgadmissions@ed.ac.uk" }, delivery: "Electronic", identityVerification: "Student portal sign-in with two-factor code", consentToReleaseAt: "2026-09-17T08:00:00Z", fee: { amount: 10_000, currency: "NGN" }, status: "Awaiting_Payment",
    events: [{ at: "2026-09-17T08:00:00Z", status: "Awaiting_Payment", actorName: "Aisha Oyiza Bello" }] },
];

/** Issued before this demo: generated in the store through the transcript policy. */
export const previousTranscriptMeta = { id: "trn-2026-0107", serial: "TR-2026-000107", requestId: "trq-2026-0107", preparedBy: "usr-grad-01", preparedByName: "Mrs. Funmi Oladipo", preparedAt: "2026-08-04T10:00:00Z", issuedAt: "2026-08-05T14:00:00Z", verificationCode: "TR7H-Q2KD-5M" };
export const initialTranscripts: Transcript[] = [];

export const initialStockReceipts: StockReceipt[] = [
  { id: "stk-2025-a", firstSerial: 250001, lastSerial: 250020, receivedAt: "2025-09-20T10:00:00Z", receivedByName: "Mrs. Funmi Oladipo", supplier: "Nigerian Security Printing and Minting Plc" },
];

export const initialCertificateStock: CertificateStock[] = Array.from({ length: 20 }, (_, index) => ({ serial: 250001 + index, receiptId: "stk-2025-a", state: "Blank" as const })).map((item) => {
  if (item.serial === 250001) return { ...item, state: "Issued" as const, studentId: "student-2021-044", printedAt: "2025-11-02T10:00:00Z", printedByName: "Mrs. Funmi Oladipo", issuedAt: "2025-11-20T12:00:00Z", issuedByName: "Mrs. Funmi Oladipo", collector: { name: "Oluwatobi Adewale", idType: "NIN" as const, idNumber: "4471•••••82", relationship: "Self" as const }, verificationCode: "CT4P-9WZA-7E" };
  if (item.serial === 250002) return { ...item, state: "Void" as const, studentId: "student-2021-051", printedAt: "2025-11-02T10:05:00Z", printedByName: "Mrs. Funmi Oladipo", voidReason: "Misprint: middle initial printed in the surname field.", voidedByName: "Mrs. Funmi Oladipo" };
  if (item.serial === 250003) return { ...item, state: "Issued" as const, studentId: "student-2021-051", printedAt: "2025-11-03T09:00:00Z", printedByName: "Mrs. Funmi Oladipo", issuedAt: "2025-11-21T11:00:00Z", issuedByName: "Mrs. Funmi Oladipo", collector: { name: "Aminu Sani", idType: "International_Passport" as const, idNumber: "A0•••••61", relationship: "Proxy" as const, authorityDocument: "Sworn authority letter from Halima Sani dated 18 Nov 2025 (FHC/ABJ/AFF/2025/3310)" }, verificationCode: "CT8M-3RHX-2B" };
  return item;
});

export const initialVerificationRecords: VerificationRecord[] = [
  { code: "CT4P-9WZA-7E", credentialType: "Certificate", studentId: "student-2021-044", issuedAt: "2025-11-20T12:00:00Z", status: "Valid" },
  { code: "CT8M-3RHX-2B", credentialType: "Certificate", studentId: "student-2021-051", issuedAt: "2025-11-21T11:00:00Z", status: "Valid" },
  { code: "CT2V-6JNB-9Q", credentialType: "Certificate", studentId: "student-2021-051", issuedAt: "2025-11-02T10:05:00Z", status: "Revoked", revokedReason: "Replaced by certificate 250003 after a misprint." },
  { code: "TR7H-Q2KD-5M", credentialType: "Transcript", studentId: "student-2021-051", issuedAt: "2026-08-05T14:00:00Z", status: "Valid" },
];

export const initialVerificationLog: VerificationQuery[] = [
  { id: "vq-1", code: "TR7H-Q2KD-5M", requester: "Embassy of Canada, Abuja", at: "2026-08-08T10:00:00Z", outcome: "Valid" },
  { id: "vq-2", code: "CT4P-9WZA-7E", requester: "Andela Nigeria", at: "2026-09-16T09:00:00Z", outcome: "Valid" },
  { id: "vq-3", code: "CT0X-0000-00", requester: "Unknown agency", at: "2026-09-16T09:05:00Z", outcome: "Not_Found" },
];
