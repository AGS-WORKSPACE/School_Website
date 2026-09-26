/**
 * The identifier crosswalk (SD-AUTH-02).
 *
 * Each module keys a student its own way: identity by person, the SIS by
 * record id, registration and released results by matriculation number, and
 * the timetable by teaching cohort. The dashboard states the link once, here,
 * rather than inferring it from names anywhere else.
 *
 * `personId` matches both the identity person and `Student.personId` in the
 * SIS, which is what makes the link safe.
 */

import type { StudentLink } from "../domain/context";

export const initialStudentLinks: StudentLink[] = [
  {
    personId: "per-ngozi-eze",
    sisStudentId: "student-2025-150",
    // Registration and released results hold no record for her yet; the
    // dashboard says so rather than showing an empty registration.
    timetableCohortIds: ["cohort-computing-100"],
  },
  {
    personId: "per-chinedu-okonkwo",
    sisStudentId: "student-2023-117",
    timetableCohortIds: ["cohort-csc-200"],
  },
  {
    personId: "per-ibrahim-musa",
    sisStudentId: "student-2024-061",
    timetableCohortIds: [],
  },
];

/** Where the student's existing journeys live. The dashboard links out; it does not reimplement them. */
export const defaultStudentPortalBase = "http://localhost:3000";
