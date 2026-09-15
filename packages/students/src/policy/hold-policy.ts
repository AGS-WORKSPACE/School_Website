/**
 * Holds are separate from lifecycle status (SIS-05).
 */

import type { HoldEffect, HoldType, HoldTypePolicy, StudentHold } from "../domain/hold";
import type { PolicyCheck } from "./record-policy";

export const holdTypePolicies: Record<HoldType, HoldTypePolicy> = {
  Financial: { ownerUnit: "Bursary", permittedEffects: ["Registration", "Transcript", "Graduation", "Accommodation"], defaultAppealRoute: "Raise a payment or charge dispute with the Bursary; enforcement pauses while it is reviewed." },
  Library: { ownerUnit: "Library", permittedEffects: ["Transcript", "Graduation"], defaultAppealRoute: "Contact the Circulation Desk to dispute a loan or fine." },
  Disciplinary: { ownerUnit: "Student Affairs", permittedEffects: ["Registration", "Results_Release", "Transcript", "Graduation", "Accommodation"], defaultAppealRoute: "Appeal in writing to the Senate Student Appeals Committee within 21 days." },
  Academic: { ownerUnit: "Department", permittedEffects: ["Registration"], defaultAppealRoute: "Ask your Head of Department to review the decision." },
  Documentation: { ownerUnit: "Registry", permittedEffects: ["Registration", "Results_Release", "Transcript"], defaultAppealRoute: "Submit the outstanding document or ask the Registry for an extension." },
};

export const holdEffectLabels: Record<HoldEffect, string> = {
  Registration: "course registration",
  Results_Release: "release of results",
  Transcript: "transcripts",
  Graduation: "graduation clearance",
  Accommodation: "hostel allocation",
};

export function isHoldActive(hold: StudentHold, at: string): boolean {
  return hold.startsAt <= at && (!hold.releasedAt || hold.releasedAt > at);
}

export type HoldDraft = Pick<StudentHold, "studentId" | "type" | "ownerUnit" | "reason" | "releasableReason" | "effects" | "appealRoute">;

export function validateHold(draft: HoldDraft, actorUnit: string): PolicyCheck {
  const errors: string[] = [];
  const policy = holdTypePolicies[draft.type];
  if (draft.ownerUnit !== policy.ownerUnit) errors.push(`${draft.type} holds are owned by ${policy.ownerUnit}.`);
  if (actorUnit !== policy.ownerUnit) errors.push(`Only ${policy.ownerUnit} can place a ${draft.type.toLowerCase()} hold.`);
  if (draft.effects.length === 0) errors.push("Choose at least one service the hold restricts.");
  const notPermitted = draft.effects.filter((effect) => !policy.permittedEffects.includes(effect));
  if (notPermitted.length) errors.push(`A ${draft.type.toLowerCase()} hold cannot restrict ${notPermitted.map((effect) => holdEffectLabels[effect]).join(", ")}.`);
  if (!draft.reason.trim()) errors.push("Record the internal reason.");
  if (!draft.releasableReason.trim()) errors.push("Tell the student what the hold is and how to clear it.");
  if (!draft.appealRoute.trim()) errors.push("Give the appeal route.");
  return { allowed: errors.length === 0, errors };
}

/**
 * The only question a consuming module should ask: "is anything blocking this
 * service for this student?" Registration never sees a library-only hold.
 */
export function holdsBlocking(holds: StudentHold[], studentId: string, effect: HoldEffect, at: string): StudentHold[] {
  return holds.filter((hold) => hold.studentId === studentId && hold.effects.includes(effect) && isHoldActive(hold, at));
}

export function releaseHoldCheck(hold: StudentHold, actorUnit: string, note: string, at: string): PolicyCheck {
  const errors: string[] = [];
  if (!isHoldActive(hold, at)) errors.push("This hold is not active.");
  if (actorUnit !== hold.ownerUnit) errors.push(`Only ${hold.ownerUnit} can release this hold.`);
  if (!note.trim()) errors.push("Record why the hold is being released.");
  return { allowed: errors.length === 0, errors };
}
