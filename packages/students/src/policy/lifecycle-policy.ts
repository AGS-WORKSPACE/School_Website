/**
 * Effective-dated lifecycle events (SIS-03).
 */

import type { AcademicPlacement, EnrolmentStatus, LifecycleEvent, LifecycleEventRule, LifecycleEventType } from "../domain/lifecycle";
import { canApproveRecordChanges, type PolicyCheck } from "./record-policy";

const enrolled: EnrolmentStatus[] = ["Active", "Deferred", "Suspended"];

export const lifecycleEventRules: Record<LifecycleEventType, LifecycleEventRule & { appealRoute?: string }> = {
  Matriculation: { label: "Matriculation", allowedFrom: [], resultingStatus: "Active", changeableFields: ["programmeId", "programmeName", "curriculumVersion", "level", "mode", "cohort", "adviserId", "adviserName", "standing"], requiresAuthorityReference: false },
  Level_Progression: { label: "Level progression", allowedFrom: ["Active"], changeableFields: ["level"], requiresAuthorityReference: true },
  Programme_Transfer: { label: "Change of programme", allowedFrom: ["Active"], changeableFields: ["programmeId", "programmeName", "curriculumVersion", "level"], requiresAuthorityReference: true, workflowOnly: true },
  Mode_Change: { label: "Mode of study change", allowedFrom: ["Active"], changeableFields: ["mode"], requiresAuthorityReference: false },
  Adviser_Assignment: { label: "Adviser assignment", allowedFrom: enrolled, changeableFields: ["adviserId", "adviserName"], requiresAuthorityReference: false },
  Standing_Change: { label: "Academic standing", allowedFrom: ["Active", "Suspended"], changeableFields: ["standing"], requiresAuthorityReference: true, appealRoute: "Ask your adviser for a review, then appeal to the Faculty Board within 14 days." },
  Deferral: { label: "Deferral", allowedFrom: ["Active"], resultingStatus: "Deferred", changeableFields: [], requiresAuthorityReference: true },
  Suspension: { label: "Suspension", allowedFrom: ["Active", "Deferred"], resultingStatus: "Suspended", changeableFields: [], requiresAuthorityReference: true, appealRoute: "Appeal in writing to the Senate Student Appeals Committee within 21 days." },
  Withdrawal: { label: "Withdrawal", allowedFrom: enrolled, resultingStatus: "Withdrawn", changeableFields: [], requiresAuthorityReference: true, appealRoute: "Appeal in writing to the Senate Student Appeals Committee within 21 days." },
  Reinstatement: { label: "Reinstatement", allowedFrom: ["Deferred", "Suspended", "Withdrawn"], resultingStatus: "Active", changeableFields: [], requiresAuthorityReference: true },
  Death: { label: "Death", allowedFrom: [...enrolled, "Withdrawn"], resultingStatus: "Deceased", changeableFields: [], requiresAuthorityReference: true },
};

function byEffectiveOrder(a: LifecycleEvent, b: LifecycleEvent): number {
  return a.effectiveFrom.localeCompare(b.effectiveFrom) || (a.decidedAt ?? "").localeCompare(b.decidedAt ?? "") || a.id.localeCompare(b.id);
}

export function approvedEvents(events: LifecycleEvent[], studentId?: string): LifecycleEvent[] {
  return events.filter((event) => event.status === "Approved" && (!studentId || event.studentId === studentId)).sort(byEffectiveOrder);
}

function applyEvent(placement: AcademicPlacement | undefined, event: LifecycleEvent): AcademicPlacement {
  const rule = lifecycleEventRules[event.type];
  const next = { ...(placement ?? {}), ...event.changes } as AcademicPlacement;
  return { ...next, status: rule.resultingStatus ?? next.status };
}

/**
 * Replays approved events for one student. Pass `asOf` to see the placement on a
 * given date; omit it to include approved events that take effect in the future.
 */
export function derivePlacement(events: LifecycleEvent[], studentId: string, asOf?: string): AcademicPlacement | undefined {
  return approvedEvents(events, studentId)
    .filter((event) => !asOf || event.effectiveFrom <= asOf)
    .reduce<AcademicPlacement | undefined>(applyEvent, undefined);
}

/** Each approved event with the placement immediately before and after it. */
export function placementHistory(events: LifecycleEvent[], studentId: string): Array<{ event: LifecycleEvent; before?: AcademicPlacement; after: AcademicPlacement }> {
  const rows: Array<{ event: LifecycleEvent; before?: AcademicPlacement; after: AcademicPlacement }> = [];
  let placement: AcademicPlacement | undefined;
  for (const event of approvedEvents(events, studentId)) {
    const after = applyEvent(placement, event);
    rows.push({ event, before: placement, after });
    placement = after;
  }
  return rows;
}

export type LifecycleProposal = Pick<LifecycleEvent, "studentId" | "type" | "effectiveFrom" | "changes" | "reason" | "releasableReason" | "authorityReference" | "sourceCaseId">;

export function validateLifecycleProposal(proposal: LifecycleProposal, events: LifecycleEvent[], options: { ignoreEventId?: string } = {}): PolicyCheck {
  const errors: string[] = [];
  const rule = lifecycleEventRules[proposal.type];
  const history = approvedEvents(events, proposal.studentId);
  const current = history.reduce<AcademicPlacement | undefined>(applyEvent, undefined);
  const latest = history.at(-1);

  if (rule.workflowOnly && !proposal.sourceCaseId) errors.push(`${rule.label} is recorded only from an approved transfer case.`);
  if (!proposal.effectiveFrom) errors.push("Enter the effective date.");
  if (!proposal.reason.trim()) errors.push("Record the reason for this change.");
  if (!proposal.releasableReason.trim()) errors.push("Give the plain-language explanation the student will see.");
  if (rule.requiresAuthorityReference && !proposal.authorityReference?.trim()) errors.push(`${rule.label} needs an authority reference (Senate, committee or Registrar minute).`);

  const changedFields = Object.keys(proposal.changes) as Array<keyof AcademicPlacement>;
  const illegal = changedFields.filter((field) => !rule.changeableFields.includes(field));
  if (illegal.length) errors.push(`${rule.label} cannot change ${illegal.join(", ")}.`);
  if (!rule.resultingStatus && changedFields.length === 0) errors.push(`${rule.label} must change at least one of: ${rule.changeableFields.join(", ")}.`);

  if (rule.allowedFrom.length === 0) {
    if (current) errors.push("The student is already matriculated.");
  } else if (!current) {
    errors.push("Record matriculation before any other lifecycle event.");
  } else if (!rule.allowedFrom.includes(current.status)) {
    errors.push(`${rule.label} is not permitted while the student is ${current.status.toLowerCase()}.`);
  }

  if (latest && proposal.effectiveFrom && proposal.effectiveFrom < latest.effectiveFrom) {
    errors.push(`The effective date cannot precede the latest recorded event (${latest.effectiveFrom}). Correct history through a reversal, not a back-dated event.`);
  }
  if (current && proposal.type === "Level_Progression" && (proposal.changes.level ?? 0) <= current.level) {
    errors.push("Progression must move the student to a higher level.");
  }
  if (current && proposal.type === "Programme_Transfer" && proposal.changes.programmeId === current.programmeId) {
    errors.push("The new programme must differ from the current programme.");
  }
  if (events.some((event) => event.studentId === proposal.studentId && event.status === "Proposed" && event.id !== options.ignoreEventId)) {
    errors.push("Another lifecycle change for this student is already awaiting a decision.");
  }

  return { allowed: errors.length === 0, errors };
}

export function decideLifecycleCheck(event: LifecycleEvent, events: LifecycleEvent[], actor: { personId: string; role: string }, decision: "Approved" | "Rejected", note: string): PolicyCheck {
  const errors: string[] = [];
  if (event.status !== "Proposed") errors.push(`This event is already ${event.status.toLowerCase()}.`);
  if (!canApproveRecordChanges(actor.role)) errors.push(`${actor.role} cannot decide lifecycle changes; a records approver must.`);
  if (event.proposedBy === actor.personId) errors.push("The person who proposed a lifecycle change cannot approve it.");
  if (decision === "Rejected" && !note.trim()) errors.push("Record why the change was rejected.");
  if (decision === "Approved") {
    // The record may have moved on since the proposal; re-check against current history.
    errors.push(...validateLifecycleProposal(event, events, { ignoreEventId: event.id }).errors);
  }
  return { allowed: errors.length === 0, errors };
}
