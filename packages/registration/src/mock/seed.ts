/**
 * Demonstration seed data for EP-10 registration and advising.
 *
 * Reuses the B.Sc. Computer Science programme (prog-csc, ver-csc-2023) and
 * its published course catalogue from @tau/curriculum, so eligibility and
 * degree-audit results are computed against the same data an officer would
 * see in the curriculum console.
 */

import type { HoldEffect, StudentHold } from "@tau/students/domain";
import type { CourseOffering } from "../domain/offering";
import type { StudentRegistrationTerm } from "../domain/term";
import type { RegistrationException } from "../domain/exception";
import type { RegistrationStatement } from "../domain/statement";
import type { CompletedCourseRecord } from "../policy/eligibility";

export const demoProgrammeId = "prog-csc";
export const demoCurriculumVersionId = "ver-csc-2023";

export interface DemoStudentContext {
  studentId: string;
  studentName: string;
  matriculationNumber: string;
  adviserId: string;
  adviserName: string;
  academicStanding: string;
  cumulativeGpa: number | null;
  completedCourses: CompletedCourseRecord[];
}

export const demoStudents: DemoStudentContext[] = [
  {
    studentId: "TAU/2024/0123",
    studentName: "Ada Nwosu",
    matriculationNumber: "TAU/24/SCI/0123",
    adviserId: "stf-musa-ibrahim",
    adviserName: "Dr. Musa Ibrahim",
    academicStanding: "Good_Standing",
    cumulativeGpa: 4.2,
    completedCourses: [
      { courseCode: "MTH 101", grade: "B", passed: true },
      { courseCode: "GST 111", grade: "A", passed: true },
      { courseCode: "COS 101", grade: "A", passed: true },
      { courseCode: "GST 112", grade: "B", passed: true },
      { courseCode: "COS 102", grade: "A", passed: true },
      { courseCode: "CSC 201", grade: "A", passed: true },
      { courseCode: "COS 201", grade: "B", passed: true },
      { courseCode: "TAU 201", grade: "A", passed: true },
      { courseCode: "CSC 202", grade: "B", passed: true },
    ],
  },
  {
    studentId: "TAU/2023/0087",
    studentName: "Ibrahim Musa Yakubu",
    matriculationNumber: "TAU/23/SCI/0087",
    adviserId: "stf-musa-ibrahim",
    adviserName: "Dr. Musa Ibrahim",
    academicStanding: "Academic_Warning",
    cumulativeGpa: 2.6,
    completedCourses: [
      { courseCode: "MTH 101", grade: "C", passed: true },
      { courseCode: "GST 111", grade: "B", passed: true },
      { courseCode: "COS 101", grade: "C", passed: true },
      { courseCode: "GST 112", grade: "C", passed: true },
      { courseCode: "COS 102", grade: "D", passed: true },
      { courseCode: "CSC 201", grade: "C", passed: true },
      { courseCode: "COS 201", grade: "D", passed: true },
      { courseCode: "TAU 201", grade: "B", passed: true },
      { courseCode: "CSC 202", grade: "C", passed: true },
    ],
  },
  {
    studentId: "TAU/2022/0054",
    studentName: "Chidinma Eze",
    matriculationNumber: "TAU/22/SCI/0054",
    adviserId: "stf-uche-obi",
    adviserName: "Dr. Uche Obi",
    academicStanding: "Good_Standing",
    cumulativeGpa: 3.9,
    completedCourses: [
      { courseCode: "MTH 101", grade: "A", passed: true },
      { courseCode: "GST 111", grade: "A", passed: true },
      { courseCode: "COS 101", grade: "A", passed: true },
      { courseCode: "GST 112", grade: "B", passed: true },
      { courseCode: "COS 102", grade: "A", passed: true },
      { courseCode: "CSC 201", grade: "A", passed: true },
      { courseCode: "COS 201", grade: "A", passed: true },
      { courseCode: "TAU 201", grade: "A", passed: true },
      { courseCode: "CSC 202", grade: "A", passed: true },
    ],
  },
];

export const initialOfferings: CourseOffering[] = [
  {
    id: "off-csc301-2026-1",
    courseId: "c-csc301",
    courseCode: "CSC 301",
    courseTitle: "Data Structures and Algorithms",
    courseVersionId: "ver-c-csc301-v1",
    creditUnits: 3,
    level: 300,
    academicSession: "2026/2027",
    semester: 1,
    departmentId: "dept-computer",
    departmentName: "Department of Computer Science",
    lecturerId: "stf-samuel-okonkwo",
    lecturerName: "Dr. Samuel Okonkwo",
    deliveryMode: "In-Person",
    roomOrPlatform: "LT-3 (Computing Building)",
    constraint: { roomOrPlatformCapacity: 120, staffMaxLoad: 120 },
    approvedCapacity: 110,
    enrolledCount: 62,
    waitlistCount: 3,
    status: "Published",
    createdBy: "Dr. Samuel Okonkwo",
    createdAt: "2026-07-01T09:00:00Z",
    publishedAt: "2026-07-03T10:00:00Z",
  },
  {
    id: "off-csc303-2026-1",
    courseId: "c-csc303",
    courseCode: "CSC 303",
    courseTitle: "Operating Systems Architecture",
    courseVersionId: "ver-c-csc303-v1",
    creditUnits: 3,
    level: 300,
    academicSession: "2026/2027",
    semester: 1,
    departmentId: "dept-computer",
    departmentName: "Department of Computer Science",
    lecturerId: "stf-samuel-okonkwo",
    lecturerName: "Dr. Samuel Okonkwo",
    deliveryMode: "Blended",
    roomOrPlatform: "LT-1 (Computing Building) + LMS",
    constraint: { roomOrPlatformCapacity: 100, staffMaxLoad: 100 },
    approvedCapacity: 95,
    enrolledCount: 58,
    waitlistCount: 0,
    status: "Published",
    createdBy: "Dr. Samuel Okonkwo",
    createdAt: "2026-07-01T09:05:00Z",
    publishedAt: "2026-07-03T10:00:00Z",
  },
  {
    id: "off-csc305-2026-2",
    courseId: "c-csc305",
    courseCode: "CSC 305",
    courseTitle: "Database Management Systems",
    courseVersionId: "ver-c-csc305-v1",
    creditUnits: 3,
    level: 300,
    academicSession: "2026/2027",
    semester: 2,
    departmentId: "dept-computer",
    departmentName: "Department of Computer Science",
    lecturerId: "stf-amina-bello",
    lecturerName: "Dr. Amina Bello",
    deliveryMode: "In-Person",
    roomOrPlatform: "Lab-2 (Computing Building)",
    constraint: { roomOrPlatformCapacity: 80, staffMaxLoad: 80 },
    approvedCapacity: 75,
    enrolledCount: 0,
    waitlistCount: 0,
    status: "Draft",
    createdBy: "Dr. Samuel Okonkwo",
    createdAt: "2026-07-02T09:00:00Z",
  },
  {
    id: "off-mth101-2026-1",
    courseId: "c-mth101",
    courseCode: "MTH 101",
    courseTitle: "Elementary Mathematics I (Calculus)",
    courseVersionId: "ver-c-mth101-v1",
    creditUnits: 3,
    level: 100,
    academicSession: "2026/2027",
    semester: 1,
    departmentId: "dept-math",
    departmentName: "Mathematics",
    lecturerId: "stf-hod-math",
    lecturerName: "HOD Mathematics",
    deliveryMode: "In-Person",
    roomOrPlatform: "Main Auditorium",
    constraint: { roomOrPlatformCapacity: 200, staffMaxLoad: 200 },
    approvedCapacity: 240,
    enrolledCount: 0,
    waitlistCount: 0,
    status: "Draft",
    createdBy: "HOD Mathematics",
    createdAt: "2026-07-02T09:00:00Z",
  },
];

export const initialRegistrationTerms: StudentRegistrationTerm[] = [
  {
    id: "term-ada-2026-1",
    studentId: "TAU/2024/0123",
    studentName: "Ada Nwosu",
    programmeId: demoProgrammeId,
    programmeName: "Computer Science",
    curriculumVersionId: demoCurriculumVersionId,
    level: 300,
    academicSession: "2026/2027",
    semester: 1,
    addDropOpensAt: "2026-09-01T00:00:00Z",
    addDropClosesAt: "2026-09-26T23:59:00Z",
    lines: [
      { id: "line-ada-csc301", offeringId: "off-csc301-2026-1", courseCode: "CSC 301", courseTitle: "Data Structures and Algorithms", creditUnits: 3, source: "Required", status: "Registered", addedAt: "2026-09-05T09:00:00Z" },
    ],
    status: "Draft",
  },
  {
    id: "term-ibrahim-2026-1",
    studentId: "TAU/2023/0087",
    studentName: "Ibrahim Musa Yakubu",
    programmeId: demoProgrammeId,
    programmeName: "Computer Science",
    curriculumVersionId: demoCurriculumVersionId,
    level: 300,
    academicSession: "2026/2027",
    semester: 1,
    addDropOpensAt: "2026-09-01T00:00:00Z",
    addDropClosesAt: "2026-09-26T23:59:00Z",
    lines: [
      { id: "line-ibr-csc301", offeringId: "off-csc301-2026-1", courseCode: "CSC 301", courseTitle: "Data Structures and Algorithms", creditUnits: 3, source: "Required", status: "Registered", addedAt: "2026-09-04T09:00:00Z" },
      { id: "line-ibr-csc303", offeringId: "off-csc303-2026-1", courseCode: "CSC 303", courseTitle: "Operating Systems Architecture", creditUnits: 3, source: "Required", status: "Pending Late Approval", addedAt: "2026-10-02T11:00:00Z", lateChangeExceptionId: "exc-late-ibrahim" },
    ],
    status: "Draft",
  },
  {
    id: "term-chidinma-2026-1",
    studentId: "TAU/2022/0054",
    studentName: "Chidinma Eze",
    programmeId: demoProgrammeId,
    programmeName: "Computer Science",
    curriculumVersionId: demoCurriculumVersionId,
    level: 300,
    academicSession: "2026/2027",
    semester: 1,
    addDropOpensAt: "2026-09-01T00:00:00Z",
    addDropClosesAt: "2026-09-26T23:59:00Z",
    lines: [
      { id: "line-chi-csc301", offeringId: "off-csc301-2026-1", courseCode: "CSC 301", courseTitle: "Data Structures and Algorithms", creditUnits: 3, source: "Required", status: "Registered", addedAt: "2026-09-03T09:00:00Z" },
      { id: "line-chi-csc303", offeringId: "off-csc303-2026-1", courseCode: "CSC 303", courseTitle: "Operating Systems Architecture", creditUnits: 3, source: "Required", status: "Registered", addedAt: "2026-09-03T09:05:00Z" },
    ],
    status: "Frozen",
    submittedAt: "2026-09-20T10:00:00Z",
    frozenAt: "2026-09-27T09:00:00Z",
    frozenBy: "Registry officer",
  },
];

export const initialExceptions: RegistrationException[] = [
  {
    id: "exc-late-ibrahim",
    studentId: "TAU/2023/0087",
    termId: "term-ibrahim-2026-1",
    type: "Late_Change",
    courseCode: "CSC 303",
    requestedBy: "TAU/2023/0087",
    requestedByName: "Ibrahim Musa Yakubu",
    reason: "Hospitalised during the add/drop window; medical evidence attached with the request.",
    status: "Pending",
    submittedAt: "2026-10-02T11:05:00Z",
  },
  {
    id: "exc-limit-chidinma",
    studentId: "TAU/2022/0054",
    termId: "term-chidinma-2026-1",
    type: "Over_Credit_Limit",
    courseCode: "TAU 302",
    requestedBy: "TAU/2022/0054",
    requestedByName: "Chidinma Eze",
    reason: "Requesting one credit unit above the 24-unit ceiling to complete a minor elective sequence before graduation.",
    status: "Approved",
    submittedAt: "2026-09-10T09:00:00Z",
    adviserId: "stf-uche-obi",
    adviserName: "Dr. Uche Obi",
    decisionNote: "Approved; student is in good standing with strong CGPA headroom.",
    decidedAt: "2026-09-11T14:00:00Z",
  },
];

const registrationEffect: HoldEffect = "Registration";

export const initialHolds: StudentHold[] = [
  {
    id: "hold-fin-ibrahim",
    studentId: "TAU/2023/0087",
    type: "Financial",
    ownerUnit: "Bursary",
    reason: "Outstanding balance of NGN 145,000 exceeds the registration threshold for 2025/2026 Semester 2.",
    releasableReason: "Clear the outstanding balance or agree an approved instalment plan with Bursary before registration is unblocked.",
    effects: [registrationEffect],
    appealRoute: "Bursary service desk, Block C",
    startsAt: "2026-08-01T00:00:00Z",
    placedBy: "stf-bursary-1",
    placedByName: "Bursary Office",
  },
  {
    id: "hold-lib-ibrahim",
    studentId: "TAU/2023/0087",
    type: "Library",
    ownerUnit: "Library Services",
    reason: "Two overdue reserve-shelf textbooks with a replacement invoice pending.",
    releasableReason: "Return the overdue items or settle the replacement invoice with the Library.",
    effects: ["Transcript"],
    appealRoute: "Library circulation desk",
    startsAt: "2026-08-10T00:00:00Z",
    placedBy: "stf-library-1",
    placedByName: "Library Services",
  },
];

export const initialStatements: RegistrationStatement[] = [
  {
    id: "stmt-chidinma-2026-1",
    termId: "term-chidinma-2026-1",
    studentId: "TAU/2022/0054",
    studentName: "Chidinma Eze",
    academicSession: "2026/2027",
    semester: 1,
    version: "v1.1",
    totalCredits: 6,
    lines: [
      { courseCode: "CSC 301", courseTitle: "Data Structures and Algorithms", creditUnits: 3, source: "Required" },
      { courseCode: "CSC 303", courseTitle: "Operating Systems Architecture", creditUnits: 3, source: "Required" },
    ],
    frozenAt: "2026-09-27T09:00:00Z",
    frozenBy: "person-registry-1",
    frozenByName: "Registry officer",
    amendments: [
      {
        id: "amend-chidinma-1",
        summary: "Corrected CSC 303 credit weighting from 3 to 4 units.",
        reason: "Senate-ratified correction to CSC 303 credit weighting (SEN/RES/2026/012), applied after the freeze.",
        approvedBy: "person-registry-1",
        approvedByName: "Registry officer",
        approvedAt: "2026-10-05T10:00:00Z",
        linesAfter: [
          { courseCode: "CSC 301", courseTitle: "Data Structures and Algorithms", creditUnits: 3, source: "Required" },
          { courseCode: "CSC 303", courseTitle: "Operating Systems Architecture", creditUnits: 4, source: "Required" },
        ],
      },
    ],
  },
];
