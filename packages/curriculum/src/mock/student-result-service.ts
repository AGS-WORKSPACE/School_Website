import type { StudentAcademicSummary } from "../domain/student-result";
import { calculateStudentAcademicSummary } from "../policy/student-results";
import { availableStudentResults, demoStudentId, undergraduateGradingPolicy } from "./student-result-seed";

export interface StudentResultPeriod { academicSession: string; semester: number; label: string; }

export function getStudentResultPeriods(): StudentResultPeriod[] {
  return [{ academicSession: "2025/2026", semester: 2, label: "2025/2026 · Semester 2" }];
}

export function getStudentResults(input: { studentId: string; viewerStudentId: string; academicSession?: string; semester?: number }): { ok: boolean; data?: StudentAcademicSummary; error?: string } {
  if (input.studentId.trim().toUpperCase() !== input.viewerStudentId.trim().toUpperCase()) return { ok: false, error: "Student result access is restricted to the signed-in student." };
  if (input.studentId.trim().toUpperCase() !== demoStudentId) return { ok: false, error: "No student result record is available for this frontend demo account." };
  const period = getStudentResultPeriods().find((item) => item.academicSession === (input.academicSession ?? "2025/2026") && item.semester === (input.semester ?? 2));
  if (!period) return { ok: true, data: undefined };
  return { ok: true, data: calculateStudentAcademicSummary({ studentId: demoStudentId, studentName: "Ngozi Eze", programme: "B.Sc. Computer Science", academicSession: period.academicSession, semester: period.semester, results: structuredClone(availableStudentResults), policy: structuredClone(undergraduateGradingPolicy), calculationVersion: "student-results-projection-v1" }) };
}
