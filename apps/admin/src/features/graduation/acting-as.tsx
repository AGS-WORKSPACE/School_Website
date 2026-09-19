"use client";

import { graduationActors } from "@tau/graduation";
import { createPersonaSwitcher } from "@/components/console/persona-switcher";

const { usePersona, PersonaSwitcher } = createPersonaSwitcher("tau_graduation_acting_as", graduationActors, (actor) => `${actor.title}, ${actor.unit}`);

export const useGraduationActor = usePersona;
export const GraduationActorSwitcher = PersonaSwitcher;
