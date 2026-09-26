/**
 * Session and student context (SD-AUTH-01 to SD-AUTH-04).
 *
 * The dashboard refuses rather than guesses: a disabled account, an ended
 * session or a person with no linked student record all stop here, with
 * wording that never reveals whether some other account exists.
 */

import type { LifecycleEvent, Student } from "@tau/students/domain";
import { derivePlacement } from "@tau/students/policy";
import type { ContextDenial, ContextDenialReason, StudentContext, StudentLink, StudentSession } from "../domain/context";

/** A student session is idle-limited; identity policy owns the real value. */
export const studentSessionTtlMinutes = 45;

export type SessionState = "Active" | "Expired" | "Revoked";

export function sessionState(session: StudentSession | undefined, now: string, ttlMinutes = studentSessionTtlMinutes): SessionState {
  if (!session) return "Expired";
  if (session.revokedAt && session.revokedAt <= now) return "Revoked";
  const age = (Date.parse(now) - Date.parse(session.startedAt)) / 60_000;
  return age > ttlMinutes ? "Expired" : "Active";
}

/** Minimal shapes this module needs; identity owns the full records. */
export interface AccountView {
  id: string;
  personId: string;
  username: string;
  status: string;
}

export interface PersonView {
  id: string;
  title: string | null;
  firstName: string;
  lastName: string;
  affiliations: Array<{ type: string; status: string; reference: string }>;
}

const denials: Record<ContextDenialReason, Omit<ContextDenial, "reason">> = {
  No_Session: { message: "Sign in to open your dashboard.", action: { label: "Sign in", href: "/login/student" } },
  Session_Expired: { message: "Your session has ended. Sign in again to continue.", action: { label: "Sign in", href: "/login/student" } },
  Account_Disabled: { message: "This account cannot be used at the moment. Contact the ICT service desk, who can check your account with you.", action: { label: "Get help", href: "/support" } },
  Not_A_Student: { message: "This account has no active student record, so the student dashboard is not available to it.", action: { label: "Get help", href: "/support" } },
  No_Student_Record: { message: "Your student record is not available yet. The Registry can confirm your registration status.", action: { label: "Get help", href: "/support" } },
  Record_Not_Linked: { message: "Your sign-in is not yet linked to a student record. The ICT service desk can connect them.", action: { label: "Get help", href: "/support" } },
};

export function denial(reason: ContextDenialReason): ContextDenial {
  return { reason, ...denials[reason] };
}

export function resolveStudentContext(input: {
  session?: StudentSession;
  accounts: AccountView[];
  persons: PersonView[];
  links: StudentLink[];
  students: Student[];
  lifecycleEvents: LifecycleEvent[];
  now: string;
  ttlMinutes?: number;
}): { context?: StudentContext; denial?: ContextDenial } {
  const { session } = input;
  if (!session) return { denial: denial("No_Session") };
  const state = sessionState(session, input.now, input.ttlMinutes);
  if (state !== "Active") return { denial: denial("Session_Expired") };

  const account = input.accounts.find((item) => item.id === session.accountId);
  if (!account || account.status !== "active") return { denial: denial("Account_Disabled") };

  const person = input.persons.find((item) => item.id === session.personId);
  const studentAffiliation = person?.affiliations.find((item) => item.type === "student" && item.status === "active");
  if (!person || !studentAffiliation) return { denial: denial("Not_A_Student") };

  const link = input.links.find((item) => item.personId === person.id);
  if (!link) return { denial: denial("Record_Not_Linked") };

  const student = input.students.find((item) => item.id === link.sisStudentId);
  const placement = student ? derivePlacement(input.lifecycleEvents, student.id, input.now) : undefined;
  if (!student || !placement) return { denial: denial("No_Student_Record") };

  return {
    context: {
      personId: person.id,
      accountId: account.id,
      sessionId: session.sessionId,
      displayName: [person.title, person.firstName, person.lastName].filter(Boolean).join(" "),
      matriculationNumber: student.matriculationNumber,
      sisStudentId: student.id,
      recordsStudentId: link.recordsStudentId,
      timetableCohortIds: link.timetableCohortIds,
      programmeName: placement.programmeName,
      level: placement.level,
      mode: placement.mode.replaceAll("_", " "),
      cohort: placement.cohort,
      academicSession: placement.cohort,
      enrolmentStatus: placement.status,
      standing: placement.standing.replaceAll("_", " "),
      // Context switching is limited to student records this person is linked to.
      availableStudentIds: input.links.filter((item) => item.personId === person.id).map((item) => item.sisStudentId),
      mfaSatisfied: session.mfaSatisfied,
    },
  };
}
