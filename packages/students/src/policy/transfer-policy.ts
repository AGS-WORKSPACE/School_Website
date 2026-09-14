/**
 * Transfer / change-of-programme workflow with credit decisions (SIS-04).
 */

import type { AcademicPlacement, LifecycleEvent } from "../domain/lifecycle";
import type { StudentHold } from "../domain/hold";
import type { CreditDecision, EligibilityCriterion, TransferCase, TransferStage } from "../domain/transfer";
import { holdsBlocking } from "./hold-policy";
import type { PolicyCheck } from "./record-policy";

export const transferStages: TransferStage[] = ["Releasing_Department", "Receiving_Department", "Faculty", "Registry"];

/** The organisational unit expected to decide each stage. */
export const transferStageUnits: Record<TransferStage, string> = {
  Releasing_Department: "Department",
  Receiving_Department: "Department",
  Faculty: "Faculty",
  Registry: "Registry",
};

export function evaluateTransferEligibility(transfer: TransferCase, placement: AcademicPlacement | undefined, holds: StudentHold[], at: string): EligibilityCriterion[] {
  const blocking = holdsBlocking(holds, transfer.studentId, "Registration", at);
  const incomplete = transfer.creditDecisions.filter((item) => !item.rationale.trim() || (item.decision === "Map_To_Course" && !item.targetCourseCode));
  return [
    { code: "ACTIVE", label: "Student is active", met: placement?.status === "Active", detail: placement ? `Current status: ${placement.status}` : "No matriculation recorded" },
    { code: "CURRENT_PROGRAMME", label: "Case matches current programme", met: placement?.programmeId === transfer.fromProgrammeId, detail: `Record shows ${placement?.programmeName ?? "no programme"}` },
    { code: "CGPA", label: "Meets receiving CGPA threshold", met: transfer.cgpa >= transfer.minimumCgpa, detail: `CGPA ${transfer.cgpa.toFixed(2)} against minimum ${transfer.minimumCgpa.toFixed(2)}` },
    { code: "CAPACITY", label: "Receiving programme has capacity", met: transfer.receivingCapacityRemaining > 0, detail: `${transfer.receivingCapacityRemaining} place(s) remaining` },
    { code: "NO_REGISTRATION_HOLD", label: "No hold blocking registration", met: blocking.length === 0, detail: blocking.length ? `${blocking.map((hold) => hold.type).join(", ")} hold active` : "None" },
    { code: "CREDIT_DECISIONS", label: "Every prior course has a credit decision", met: transfer.creditDecisions.length > 0 && incomplete.length === 0, detail: incomplete.length ? `${incomplete.length} decision(s) missing rationale or target course` : `${transfer.creditDecisions.length} course(s) assessed` },
  ];
}

export function creditSummary(decisions: CreditDecision[]) {
  return {
    attempted: decisions.reduce((sum, item) => sum + item.credits, 0),
    awarded: decisions.reduce((sum, item) => sum + item.creditsAwarded, 0),
    mapped: decisions.filter((item) => item.decision === "Map_To_Course").length,
    notCredited: decisions.filter((item) => item.decision === "No_Credit").length,
  };
}

export function nextTransferStage(transfer: TransferCase): TransferStage | undefined {
  if (transfer.status !== "In_Review") return undefined;
  return transferStages.find((stage) => !transfer.approvals.some((approval) => approval.stage === stage));
}

export function decideTransferStageCheck(
  transfer: TransferCase,
  actor: { personId: string; unit: string },
  decision: "Approved" | "Rejected",
  note: string,
  eligibility: EligibilityCriterion[],
): PolicyCheck {
  const errors: string[] = [];
  const stage = nextTransferStage(transfer);
  if (!stage) errors.push(`This case is ${transfer.status.replaceAll("_", " ").toLowerCase()}.`);
  if (stage && actor.unit !== transferStageUnits[stage]) errors.push(`The ${stage.replaceAll("_", " ").toLowerCase()} stage must be decided by ${transferStageUnits[stage]}.`);
  if (actor.personId === transfer.preparedBy) errors.push("The officer who prepared the case cannot approve any stage of it.");
  if (transfer.approvals.some((approval) => approval.decidedBy === actor.personId)) errors.push("One person cannot decide two stages of the same transfer.");
  if (decision === "Approved") {
    const unmet = eligibility.filter((item) => !item.met);
    if (unmet.length) errors.push(`Eligibility not met: ${unmet.map((item) => item.label).join("; ")}.`);
  }
  if (!note.trim()) errors.push("Record a note for this decision.");
  return { allowed: errors.length === 0, errors };
}

/**
 * The approved case becomes one effective-dated Programme_Transfer event. The old
 * programme's events stay untouched, so the record keeps both histories.
 */
export function buildTransferEvent(transfer: TransferCase, approver: { personId: string; name: string }, at: string, id: string): LifecycleEvent {
  const registry = transfer.approvals.find((approval) => approval.stage === "Registry");
  return {
    id,
    studentId: transfer.studentId,
    type: "Programme_Transfer",
    effectiveFrom: transfer.effectiveFrom,
    changes: { programmeId: transfer.toProgrammeId, programmeName: transfer.toProgrammeName, curriculumVersion: transfer.toCurriculumVersion, level: transfer.entryLevel },
    reason: transfer.reason,
    releasableReason: `Your change of programme to ${transfer.toProgrammeName} was approved, starting at ${transfer.entryLevel} level.`,
    authorityReference: `Transfer case ${transfer.id}`,
    status: "Approved",
    proposedBy: transfer.preparedBy,
    proposedByName: transfer.preparedByName,
    proposedAt: transfer.createdAt,
    decidedBy: approver.personId,
    decidedByName: approver.name,
    decidedAt: at,
    decisionNote: registry?.note,
    sourceCaseId: transfer.id,
  };
}
