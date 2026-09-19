import type { StudentGradingPolicy, StudentResultRecord } from "../domain/student-result";

export const demoStudentId = "TAU/2024/0123";
export const demoStudentResults: StudentResultRecord[] = [
  { id: "student-result-csc201", academicSession: "2025/2026", semester: 2, courseCode: "CSC 201", courseTitle: "Computer Programming I", creditUnits: 3, mark: 78, grade: "A", gradePoint: 5, status: "Released", resultVersion: "v1.0" },
  { id: "student-result-anat201", academicSession: "2025/2026", semester: 2, courseCode: "ANA 201", courseTitle: "Gross Anatomy II", creditUnits: 4, mark: 64, grade: "B", gradePoint: 4, status: "Released", resultVersion: "v1.0" },
  { id: "student-result-phy201", academicSession: "2025/2026", semester: 2, courseCode: "PHY 201", courseTitle: "Human Physiology II", creditUnits: 3, mark: null, grade: null, gradePoint: null, status: "Withheld", resultVersion: "v1.0" },
  { id: "student-result-bch201", academicSession: "2025/2026", semester: 2, courseCode: "BCH 201", courseTitle: "Biochemistry II", creditUnits: 3, mark: null, grade: null, gradePoint: null, status: "Pending", resultVersion: "v1.1" },
];

export const undergraduateGradingPolicy: StudentGradingPolicy = {
  id: "grading-undergraduate", name: "Undergraduate grading scale", version: "v3.1", academicSession: "2025/2026", maximumGradePoint: 5,
  bands: [{ minimumMark: 70, grade: "A", gradePoint: 5 }, { minimumMark: 60, grade: "B", gradePoint: 4 }, { minimumMark: 50, grade: "C", gradePoint: 3 }, { minimumMark: 45, grade: "D", gradePoint: 2 }, { minimumMark: 40, grade: "E", gradePoint: 1 }, { minimumMark: 0, grade: "F", gradePoint: 0 }],
};
