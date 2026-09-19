/**
 * Multi-unit clearance (GRD-02). A unit decides only its own checkpoint, and
 * cannot clear while one of its own graduation holds is active in the student
 * record (EP-08): the hold is released first, by the unit that owns it.
 */

import { rolesPermit } from "@tau/identity/policy";
import type { StudentHold } from "@tau/students/domain";
import { holdsBlocking } from "@tau/students/policy";
import type { ClearanceCase, ClearanceCheckpoint, ClearanceStatus, ClearanceUnit } from "../domain/clearance";
import { check, type GraduationActor, type PolicyCheck } from "./check";

export const clearanceUnits: ClearanceUnit[] = ["Registry", "Bursary", "Library", "Department", "Student Affairs", "Hostel", "ICT"];

export function defaultCheckpoints(options: { residential: boolean }): ClearanceCheckpoint[] {
  return clearanceUnits.map((unit) => ({ unit, required: unit !== "Hostel" || options.residential, status: unit === "Hostel" && !options.residential ? "Not_Applicable" : "Pending" }));
}

export function clearanceStatus(clearance: ClearanceCase): ClearanceStatus {
  const required = clearance.checkpoints.filter((item) => item.required);
  if (required.some((item) => item.status === "Blocked")) return "Blocked";
  return required.every((item) => item.status === "Cleared") ? "Cleared" : "In_Progress";
}

/** Holds in the student record that this unit owns and that restrict graduation. */
export function unitGraduationHolds(holds: StudentHold[], studentId: string, unit: ClearanceUnit, at: string): StudentHold[] {
  return holdsBlocking(holds, studentId, "Graduation", at).filter((hold) => hold.ownerUnit === unit);
}

export function decideCheckpointCheck(input: {
  clearance: ClearanceCase;
  unit: ClearanceUnit;
  decision: "Cleared" | "Blocked";
  reason: string;
  actor: GraduationActor;
  holds: StudentHold[];
  at: string;
}): PolicyCheck {
  const errors: string[] = [];
  const checkpoint = input.clearance.checkpoints.find((item) => item.unit === input.unit);
  if (!rolesPermit(input.actor.roleIds, "records:clearance:decide")) errors.push("Your roles do not include clearance decisions.");
  if (input.actor.unit !== input.unit) errors.push(`Only ${input.unit} decides the ${input.unit} checkpoint.`);
  if (!checkpoint?.required) errors.push(`The ${input.unit} checkpoint does not apply to this graduand.`);
  if (checkpoint?.appeal?.status === "Open") errors.push("An appeal is open on this checkpoint; it must be decided first.");
  if (input.decision === "Blocked" && !input.reason.trim()) errors.push("Tell the graduand what is outstanding and how to resolve it.");
  if (input.decision === "Cleared") {
    const holds = unitGraduationHolds(input.holds, input.clearance.studentId, input.unit, input.at);
    if (holds.length) errors.push(`Release the ${holds.map((hold) => hold.type.toLowerCase()).join(" and ")} hold in the student record first: ${holds[0].releasableReason}`);
  }
  return check(errors);
}

export function lodgeAppealCheck(checkpoint: ClearanceCheckpoint | undefined, grounds: string): PolicyCheck {
  const errors: string[] = [];
  if (checkpoint?.status !== "Blocked") errors.push("Only a blocked checkpoint can be appealed.");
  if (checkpoint?.appeal?.status === "Open") errors.push("An appeal is already open.");
  if (grounds.trim().length < 10) errors.push("Explain the grounds for the appeal.");
  return check(errors);
}

export function decideAppealCheck(input: { clearance: ClearanceCase; checkpoint: ClearanceCheckpoint | undefined; decision: "Upheld" | "Dismissed"; note: string; actor: GraduationActor; holds: StudentHold[]; at: string }): PolicyCheck {
  const errors: string[] = [];
  if (!rolesPermit(input.actor.roleIds, "records:graduation:approve")) errors.push("Appeals are decided by a records approver.");
  if (input.checkpoint?.decidedBy === input.actor.personId) errors.push("The person who blocked the checkpoint cannot decide its appeal.");
  if (input.checkpoint?.appeal?.status !== "Open") errors.push("There is no open appeal.");
  if (!input.note.trim()) errors.push("Record the reason for the decision.");
  if (input.decision === "Upheld" && input.checkpoint) {
    const holds = unitGraduationHolds(input.holds, input.clearance.studentId, input.checkpoint.unit, input.at);
    if (holds.length) errors.push(`${input.checkpoint.unit} must release its hold in the student record before the appeal can clear the checkpoint.`);
  }
  return check(errors);
}
