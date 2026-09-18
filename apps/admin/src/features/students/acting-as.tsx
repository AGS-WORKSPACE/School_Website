"use client";

import { studentsActors } from "@tau/students";
import { createPersonaSwitcher } from "@/components/console/persona-switcher";

const { usePersona, PersonaSwitcher } = createPersonaSwitcher("tau_students_acting_as", studentsActors, (actor) => actor.role);

export const useActingAs = usePersona;
export const ActingAsSwitcher = PersonaSwitcher;
