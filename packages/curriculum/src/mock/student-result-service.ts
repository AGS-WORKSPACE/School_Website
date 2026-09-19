import type { StudentAcademicSummary } from "../domain/student-result";
import { calculateStudentAcademicSummary } from "../policy/student-results";
import { demoStudentId, demoStudentResults, undergraduateGradingPolicy } from "./student-result-seed";

export function getStudentResults(input: { studentId: string; viewerStudentId: string }): { ok: boolean; data?: StudentAcademicSummary; error?: string } {
  if (input.studentId.trim().toUpperCase() !== input.viewerStudentId.trim().toUpperCase()) return { ok: false, error: "Student result access is restricted to the signed-in student." };
  if (input.studentId.trim().toUpperCase() !== demoStudentId) return { ok: false, error: "No student result record is available for this frontend demo account." };
  return { ok: true, data: calculateStudentAcademicSummary({ studentId: demoStudentId, studentName: "Ada Nwosu", programme: "B.Sc. Computer Science", academicSession: "2025/2026", semester: 2, results: structuredClone(demoStudentResults), policy: structuredClone(undergraduateGradingPolicy), calculationVersion: "student-results-frontend-v1" }) };
}
