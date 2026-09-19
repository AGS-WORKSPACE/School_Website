import type { AssessmentConfiguration } from "../domain/assessment";
import type { CourseRegistrationRecord, MarkEntryRecord } from "../domain/mark-entry";

export const initialCourseRegistrations: CourseRegistrationRecord[] = [
  { id: "reg-csc201-001", studentId: "student-001", studentNumber: "TAU/23/CSC/001", studentName: "Chidiebere Okonkwo", courseId: "c-csc201", courseCode: "CSC 201", courseTitle: "Computer Programming I (Data Structures in Java)", academicSessionId: "2026-2027", academicSession: "2026/2027", semester: 1, status: "Registered" },
  { id: "reg-csc201-002", studentId: "student-002", studentNumber: "TAU/23/CSC/002", studentName: "Fatima Aliyu", courseId: "c-csc201", courseCode: "CSC 201", courseTitle: "Computer Programming I (Data Structures in Java)", academicSessionId: "2026-2027", academicSession: "2026/2027", semester: 1, status: "Registered" },
  { id: "reg-csc201-003", studentId: "student-003", studentNumber: "TAU/23/CSC/003", studentName: "Ngozi Eze", courseId: "c-csc201", courseCode: "CSC 201", courseTitle: "Computer Programming I (Data Structures in Java)", academicSessionId: "2026-2027", academicSession: "2026/2027", semester: 1, status: "Dropped" },
  { id: "reg-csc201-004", studentId: "student-004", studentNumber: "TAU/23/CSC/004", studentName: "Emeka Nwosu", courseId: "c-csc201", courseCode: "CSC 201", courseTitle: "Computer Programming I (Data Structures in Java)", academicSessionId: "2026-2027", academicSession: "2026/2027", semester: 1, status: "Registered" },
];

export function createInitialMarkEntries(configuration: AssessmentConfiguration): MarkEntryRecord[] {
  const component = configuration.components[0];
  return [
    { id: "mark-csc201-001-ca", registrationId: "reg-csc201-001", studentId: "student-001", studentNumber: "TAU/23/CSC/001", studentName: "Chidiebere Okonkwo", courseId: configuration.courseId, courseCode: configuration.courseCode, assessmentConfigurationId: configuration.id, componentId: component.id, mark: 24, maximumMark: component.maximumMark, recordStatus: "Draft", saveStatus: "Saved", lastSavedAt: "2026-09-24T09:18:00.000Z" },
    { id: "mark-csc201-002-ca", registrationId: "reg-csc201-002", studentId: "student-002", studentNumber: "TAU/23/CSC/002", studentName: "Fatima Aliyu", courseId: configuration.courseId, courseCode: configuration.courseCode, assessmentConfigurationId: configuration.id, componentId: component.id, mark: null, maximumMark: component.maximumMark, recordStatus: "Draft", saveStatus: "Saved", lastSavedAt: "2026-09-24T09:18:00.000Z" },
    { id: "mark-csc201-003-ca", registrationId: "reg-csc201-003", studentId: "student-003", studentNumber: "TAU/23/CSC/003", studentName: "Ngozi Eze", courseId: configuration.courseId, courseCode: configuration.courseCode, assessmentConfigurationId: configuration.id, componentId: component.id, mark: null, maximumMark: component.maximumMark, recordStatus: "Draft", saveStatus: "Saved", lastSavedAt: "2026-09-24T09:18:00.000Z" },
    { id: "mark-csc201-004-ca", registrationId: "reg-csc201-004", studentId: "student-004", studentNumber: "TAU/23/CSC/004", studentName: "Emeka Nwosu", courseId: configuration.courseId, courseCode: configuration.courseCode, assessmentConfigurationId: configuration.id, componentId: component.id, mark: 28, maximumMark: component.maximumMark, recordStatus: "Approved", saveStatus: "Saved", lastSavedAt: "2026-09-20T13:10:00.000Z" },
  ];
}
