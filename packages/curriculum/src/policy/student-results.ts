import type { GradeBand, StudentAcademicSummary, StudentGradingPolicy, StudentResultRecord } from "../domain/student-result";

export function gradeForMark(mark: number, policy: StudentGradingPolicy): GradeBand {
  return [...policy.bands].sort((a, b) => b.minimumMark - a.minimumMark).find((band) => mark >= band.minimumMark) ?? policy.bands[policy.bands.length - 1];
}

export function calculateStudentAcademicSummary(input: {
  studentId: string;
  studentName: string;
  programme: string;
  academicSession: string;
  semester: number;
  results: StudentResultRecord[];
  policy: StudentGradingPolicy;
  calculationVersion: string;
  previousWeightedPoints?: number;
  previousCredits?: number;
}): StudentAcademicSummary {
  const released = input.results.filter((result) => result.status === "Released" && result.mark !== null);
  const creditsAttempted = input.results.reduce((sum, result) => sum + result.creditUnits, 0);
  const creditsEarned = released.reduce((sum, result) => sum + (result.grade && result.grade !== "F" ? result.creditUnits : 0), 0);
  const weightedPoints = released.reduce((sum, result) => sum + (result.gradePoint ?? 0) * result.creditUnits, 0);
  const totalCredits = released.reduce((sum, result) => sum + result.creditUnits, 0);
  const cumulativeCredits = (input.previousCredits ?? 0) + totalCredits;
  const cumulativePoints = (input.previousWeightedPoints ?? 0) + weightedPoints;
  const semesterGpa = totalCredits ? weightedPoints / totalCredits : null;
  const cumulativeGpa = cumulativeCredits ? cumulativePoints / cumulativeCredits : null;
  const academicStanding = cumulativeGpa === null ? "Not available" : cumulativeGpa >= 2 ? "Good standing" : cumulativeGpa >= 1.5 ? "Probation" : "Withdrawal review";
  return { studentId: input.studentId, studentName: input.studentName, programme: input.programme, academicSession: input.academicSession, semester: input.semester, calculationVersion: input.calculationVersion, gradingPolicy: input.policy, results: input.results, creditsAttempted, creditsEarned, semesterGpa, cumulativeGpa, academicStanding, calculationIsAuthoritative: false };
}
