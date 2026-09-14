"use client";

import { studentsActors, useStudents } from "@tau/students";
import { studentName } from "./format";

/** Resolves staff and student person ids to display names for audit columns. */
export function usePersonName() {
  const { students } = useStudents();
  return (personId: string) => {
    const staff = studentsActors.find((actor) => actor.personId === personId);
    if (staff) return staff.name;
    const student = students.find((item) => item.personId === personId);
    return student ? `${studentName(student.fields)} (student)` : personId;
  };
}
