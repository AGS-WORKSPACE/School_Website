"use client";

import { getRole } from "@tau/identity";
import { lmsActors } from "@tau/lms";
import { createPersonaSwitcher } from "@/components/console/persona-switcher";

const { usePersona, PersonaSwitcher } = createPersonaSwitcher("tau_lms_acting_as", lmsActors, (actor) =>
  actor.roleIds.map((roleId) => getRole(roleId)?.name ?? roleId).join(", "),
);

export const useLmsActor = usePersona;
export const LmsActorSwitcher = PersonaSwitcher;
