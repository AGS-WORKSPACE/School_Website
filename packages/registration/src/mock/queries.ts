/**
 * Read-side queries that combine the registration store with the live
 * curriculum catalogue, so proposals and audits always reflect the current
 * programme structure rather than a stale copy.
 */

import { curriculumStore } from "@tau/curriculum/mock";
import { buildRegistrationProposal } from "../policy/eligibility";
import { buildAdviserRiskView } from "../policy/exception";
import { buildDegreeAudit } from "../policy/degree-audit";
import type { RegistrationProposal } from "../domain/proposal";
import type { AdviserRiskView } from "../domain/exception";
import type { DegreeAuditResult } from "../domain/degree-audit";
import { demoStudents } from "./seed";
import { registrationStore } from "./store";

export interface QueryResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

function findStudent(studentId: string) {
  return demoStudents.find((s) => s.studentId === studentId);
}

export function getRegistrationProposal(studentId: string): QueryResult<RegistrationProposal> {
  const student = findStudent(studentId);
  const term = registrationStore.getSnapshot().terms.find((item) => item.studentId === studentId);
  if (!student || !term) return { ok: false, error: "No registration term is available for this student." };
  const curriculum = curriculumStore.getSnapshot();
  const programme = curriculum.programmes.find((p) => p.id === term.programmeId);
  const version = programme?.versions.find((v) => v.id === term.curriculumVersionId);
  if (!programme || !version) return { ok: false, error: "The student's curriculum version could not be found." };
  const proposal = buildRegistrationProposal({
    studentId,
    programme,
    version,
    courses: curriculum.courses,
    level: term.level,
    academicSession: term.academicSession,
    semester: term.semester,
    maxCreditUnits: 24,
    completedCourses: student.completedCourses,
  });
  return { ok: true, data: proposal };
}

export function getAdviserRiskView(studentId: string): QueryResult<AdviserRiskView> {
  const student = findStudent(studentId);
  if (!student) return { ok: false, error: "Student not found." };
  const holds = registrationStore.getSnapshot().holds.filter((hold) => hold.studentId === studentId);
  return { ok: true, data: buildAdviserRiskView({ studentId, academicStanding: student.academicStanding, cumulativeGpa: student.cumulativeGpa, holds }) };
}

export function getDegreeAudit(studentId: string): QueryResult<DegreeAuditResult> {
  const student = findStudent(studentId);
  const term = registrationStore.getSnapshot().terms.find((item) => item.studentId === studentId);
  if (!student || !term) return { ok: false, error: "No academic record is available for this student." };
  const curriculum = curriculumStore.getSnapshot();
  const programme = curriculum.programmes.find((p) => p.id === term.programmeId);
  const version = programme?.versions.find((v) => v.id === term.curriculumVersionId);
  if (!programme || !version) return { ok: false, error: "The student's curriculum version could not be found." };
  const inProgress = term.lines.filter((line) => line.status !== "Dropped").map((line) => line.courseCode);
  const audit = buildDegreeAudit({
    studentId,
    studentName: student.studentName,
    programmeName: programme.name,
    version,
    courses: curriculum.courses,
    completedCourses: student.completedCourses,
    inProgressCourseCodes: inProgress,
    equivalencies: curriculum.equivalencies,
  });
  return { ok: true, data: audit };
}
