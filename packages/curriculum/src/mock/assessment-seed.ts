import type { AssessmentConfiguration } from "../domain/assessment";

export const initialAssessmentConfigurations: AssessmentConfiguration[] = [
  {
    id: "assessment-csc201-2026-1-v1",
    courseId: "c-csc201",
    courseCode: "CSC 201",
    courseTitle: "Computer Programming I (Data Structures in Java)",
    academicSessionId: "2026-2027",
    academicSession: "2026/2027",
    semester: 1,
    components: [
      { id: "csc201-ca", name: "Continuous Assessment", type: "Continuous Assessment", maximumMark: 30, weight: 30 },
      { id: "csc201-practical", name: "Practical / Laboratory Exam", type: "Practical", maximumMark: 20, weight: 20 },
      { id: "csc201-exam", name: "End-of-Semester Examination", type: "Examination", maximumMark: 50, weight: 50 },
    ],
    requiredTotalWeight: 100,
    status: "Published",
    version: "v1.0",
    effectiveDate: "2026-09-21",
    marksExist: true,
    approvalStatus: "Approved",
  },
  {
    id: "assessment-mth101-2026-1-v1",
    courseId: "c-mth101",
    courseCode: "MTH 101",
    courseTitle: "Elementary Mathematics I (Calculus)",
    academicSessionId: "2026-2027",
    academicSession: "2026/2027",
    semester: 1,
    components: [
      { id: "mth101-ca", name: "Continuous Assessment", type: "Continuous Assessment", maximumMark: 30, weight: 30 },
      { id: "mth101-exam", name: "End-of-Semester Examination", type: "Examination", maximumMark: 70, weight: 70 },
    ],
    requiredTotalWeight: 100,
    status: "Draft",
    version: "v1.0",
    effectiveDate: "2026-09-21",
    marksExist: false,
    approvalStatus: "Not Required",
  },
];
