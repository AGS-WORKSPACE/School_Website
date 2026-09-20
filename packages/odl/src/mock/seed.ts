/**
 * Demonstration data for EP-15. Reuses the online and blended course shells
 * seeded in @tau/lms (off-csc201-2026-1 is Online; off-cos101-2026-1 is
 * Blended) so engagement, caseload and evaluation figures are computed from
 * the same enrolments, submissions and content the LMS console shows.
 */

import type { ReadinessQuestion, ReadinessResult } from "../domain/readiness";
import type { EngagementAlert } from "../domain/engagement";
import type { ContactAttempt, TutorAssignment } from "../domain/caseload";
import type { AssessmentIntegrityConfig, IntegrityNotice } from "../domain/integrity";
import type { CourseEvaluationResponse } from "../domain/evaluation";
import type { EvidenceAccessGrant, EvidenceAccessLogEntry } from "../domain/accreditation";

export const CSC_ONLINE = "off-csc201-2026-1";
export const COS_BLENDED = "off-cos101-2026-1";

export const readinessQuestions: ReadinessQuestion[] = [
  { id: "q-device", category: "Device", prompt: "I have reliable access to a computer or tablet for coursework.", supportResourceTitle: "Campus computer lab and device-loan scheme", supportResourceUrl: "/student-life/device-loan" },
  { id: "q-connectivity", category: "Connectivity", prompt: "I have internet access that can handle video calls and uploads.", supportResourceTitle: "Low-bandwidth study centres and data bundle support", supportResourceUrl: "/student-life/connectivity-support" },
  { id: "q-digital-literacy", category: "Digital_Literacy", prompt: "I am comfortable using the learning platform: submitting work, joining a live session, checking my grades.", supportResourceTitle: "Platform orientation walkthrough", supportResourceUrl: "/student-portal/learning" },
  { id: "q-study-skills", category: "Study_Skills", prompt: "I can plan and keep to a study schedule without in-person reminders.", supportResourceTitle: "Online study-skills workshop", supportResourceUrl: "/student-life/study-skills" },
];

export const initialReadinessResults: ReadinessResult[] = [
  {
    id: "ready-160", studentId: "student-2025-160", offeringId: CSC_ONLINE, completedAt: "2026-09-06T09:00:00Z", readinessScore: 88,
    responses: [{ questionId: "q-device", answer: "Confident" }, { questionId: "q-connectivity", answer: "Confident" }, { questionId: "q-digital-literacy", answer: "Confident" }, { questionId: "q-study-skills", answer: "Somewhat_Confident" }],
    gaps: [{ questionId: "q-study-skills", category: "Study_Skills", supportResourceTitle: "Online study-skills workshop", supportResourceUrl: "/student-life/study-skills" }],
  },
  {
    id: "ready-161", studentId: "student-2025-161", offeringId: CSC_ONLINE, completedAt: "2026-09-06T09:10:00Z", readinessScore: 38,
    responses: [{ questionId: "q-device", answer: "Somewhat_Confident" }, { questionId: "q-connectivity", answer: "Not_Confident" }, { questionId: "q-digital-literacy", answer: "Not_Confident" }, { questionId: "q-study-skills", answer: "Somewhat_Confident" }],
    gaps: [
      { questionId: "q-device", category: "Device", supportResourceTitle: "Campus computer lab and device-loan scheme", supportResourceUrl: "/student-life/device-loan" },
      { questionId: "q-connectivity", category: "Connectivity", supportResourceTitle: "Low-bandwidth study centres and data bundle support", supportResourceUrl: "/student-life/connectivity-support" },
      { questionId: "q-digital-literacy", category: "Digital_Literacy", supportResourceTitle: "Platform orientation walkthrough", supportResourceUrl: "/student-portal/learning" },
      { questionId: "q-study-skills", category: "Study_Skills", supportResourceTitle: "Online study-skills workshop", supportResourceUrl: "/student-life/study-skills" },
    ],
  },
];

export const initialEngagementAlerts: EngagementAlert[] = [
  {
    id: "alert-204-missed", offeringId: COS_BLENDED, studentId: "student-2026-204", studentName: "Hauwa Garba",
    ruleId: "Missed_Submission", triggerExplanation: `"Lab report: binary arithmetic" was due 2026-09-14T23:59:00Z with no submission on record.`,
    raisedAt: "2026-09-15T06:00:00Z", routedToPersonId: "per-samuel", routedToName: "Dr. Samuel Okonkwo", status: "Open",
  },
  {
    id: "alert-162-idle", offeringId: CSC_ONLINE, studentId: "student-2025-162", studentName: "Maryam Lawal",
    ruleId: "No_Recent_Activity", triggerExplanation: "No content progress recorded since enrolling on 2026-09-07T10:04:00Z (14 days).",
    raisedAt: "2026-09-21T06:00:00Z", routedToPersonId: "per-hauwa", routedToName: "Ms. Hauwa Abdullahi", status: "Contacted",
    acknowledgedAt: "2026-09-21T14:00:00Z", acknowledgedBy: "Ms. Hauwa Abdullahi",
  },
];

/**
 * Ms. Hauwa Abdullahi (per-hauwa) is the seeded online tutor for CSC 201, so
 * her account is the one that sees a populated "my caseload" — matching
 * ODL-03's scoping rule rather than faking the same data for every account.
 */
export const initialTutorAssignments: TutorAssignment[] = [
  { id: "tut-160", tutorId: "per-hauwa", tutorName: "Ms. Hauwa Abdullahi", studentId: "student-2025-160", studentName: "Ifeoma Chukwu", offeringId: CSC_ONLINE },
  { id: "tut-161", tutorId: "per-hauwa", tutorName: "Ms. Hauwa Abdullahi", studentId: "student-2025-161", studentName: "Samuel Bassey", offeringId: CSC_ONLINE },
  { id: "tut-162", tutorId: "per-hauwa", tutorName: "Ms. Hauwa Abdullahi", studentId: "student-2025-162", studentName: "Maryam Lawal", offeringId: CSC_ONLINE },
];

export const initialContactAttempts: ContactAttempt[] = [
  { id: "contact-162-1", tutorId: "per-hauwa", studentId: "student-2025-162", offeringId: CSC_ONLINE, method: "Email", occurredAt: "2026-09-21T14:00:00Z", outcome: "Reached", note: "Explained the readiness gaps and pointed to the connectivity support scheme." },
];

export const initialIntegrityConfigs: AssessmentIntegrityConfig[] = [
  {
    id: "integrity-201-a1", assignmentId: "asg-201-a1", offeringId: CSC_ONLINE, riskLevel: "Medium", controls: ["Timed_Window", "Similarity_Check"],
    status: "Active", configuredBy: "per-samuel", configuredByName: "Dr. Samuel Okonkwo", configuredAt: "2026-09-10T09:00:00Z",
  },
  {
    id: "integrity-201-final", assignmentId: "asg-201-final", offeringId: CSC_ONLINE, riskLevel: "High", controls: ["ID_Verification", "Live_Proctoring"],
    status: "Draft", configuredBy: "per-samuel", configuredByName: "Dr. Samuel Okonkwo", configuredAt: "2026-09-18T09:00:00Z",
  },
];

export const initialIntegrityNotices: IntegrityNotice[] = [
  { id: "notice-201-a1-160", assignmentId: "asg-201-a1", studentId: "student-2025-160", sentAt: "2026-09-10T09:30:00Z", practicePathUrl: "/student-portal/learning/practice-timed-window", appealRoute: "Exams and Records appeal form, within 5 working days of release." },
];

const rate = (clarity: number, support: number, workload: number, overall: number) => ({ clarity, support, workload, overall });

export const initialEvaluationResponses: CourseEvaluationResponse[] = [
  { id: "eval-cos-1", offeringId: COS_BLENDED, studentId: "student-2026-201", ratings: rate(4, 5, 3, 4), submittedAt: "2026-10-01T09:00:00Z" },
  { id: "eval-cos-2", offeringId: COS_BLENDED, studentId: "student-2026-202", ratings: rate(4, 4, 3, 4), comment: "Loved the low-bandwidth notes.", submittedAt: "2026-10-01T09:10:00Z" },
  { id: "eval-cos-3", offeringId: COS_BLENDED, studentId: "student-2026-203", ratings: rate(3, 4, 2, 3), submittedAt: "2026-10-01T09:20:00Z" },
  { id: "eval-cos-4", offeringId: COS_BLENDED, studentId: "student-2025-150", ratings: rate(5, 5, 4, 5), submittedAt: "2026-10-01T09:30:00Z" },
  { id: "eval-cos-5", offeringId: COS_BLENDED, studentId: "student-2026-204", ratings: rate(3, 3, 2, 3), submittedAt: "2026-10-01T09:40:00Z" },
  { id: "eval-csc-1", offeringId: CSC_ONLINE, studentId: "student-2025-160", ratings: rate(5, 4, 3, 4), submittedAt: "2026-10-02T09:00:00Z" },
  { id: "eval-csc-2", offeringId: CSC_ONLINE, studentId: "student-2025-161", ratings: rate(3, 3, 2, 3), submittedAt: "2026-10-02T09:10:00Z" },
];

export const initialEvidenceGrants: EvidenceAccessGrant[] = [
  {
    id: "evidence-nuc-2026", reviewerId: "ext-nuc-reviewer-1", reviewerName: "Dr. Femi Adisa", reviewingBody: "National Universities Commission",
    offeringIds: [CSC_ONLINE], includesPrivateCommunications: false,
    grantedBy: "per-ngozi", grantedByName: "Dr. Ngozi Okafor", grantedAt: "2026-09-15T09:00:00Z", expiresAt: "2026-12-15T09:00:00Z",
  },
  {
    id: "evidence-nuc-2025", reviewerId: "ext-nuc-reviewer-2", reviewerName: "Prof. Bola Shittu", reviewingBody: "National Universities Commission",
    offeringIds: [COS_BLENDED], includesPrivateCommunications: false,
    grantedBy: "per-ngozi", grantedByName: "Dr. Ngozi Okafor", grantedAt: "2025-09-15T09:00:00Z", expiresAt: "2025-12-15T09:00:00Z",
  },
];

export const initialEvidenceAccessLog: EvidenceAccessLogEntry[] = [
  { id: "log-1", grantId: "evidence-nuc-2026", accessedAt: "2026-09-16T10:00:00Z", resourceType: "Aggregate_Engagement", offeringId: CSC_ONLINE, allowed: true },
];
