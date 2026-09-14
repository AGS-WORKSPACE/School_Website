/**
 * Builds the student's plain-language timeline (SIS-06). Only releasable text is
 * read from source records; proposed and rejected lifecycle events never appear.
 */

import type { CorrectionRequest } from "../domain/correction";
import type { StudentHold } from "../domain/hold";
import type { LifecycleEvent, LifecycleEventType } from "../domain/lifecycle";
import type { ServiceLevels, StudentTimelineItem } from "../domain/timeline";
import type { TransferCase } from "../domain/transfer";
import { holdEffectLabels, isHoldActive } from "./hold-policy";
import { lifecycleEventRules } from "./lifecycle-policy";
import { fieldDefinition } from "./record-policy";
import { nextTransferStage } from "./transfer-policy";

export const defaultServiceLevels: ServiceLevels = { correctionDays: 10, transferStageDays: 14 };

const eventTitles: Record<LifecycleEventType, string> = {
  Matriculation: "You were matriculated",
  Level_Progression: "You moved to a new level",
  Programme_Transfer: "Your programme changed",
  Mode_Change: "Your mode of study changed",
  Adviser_Assignment: "Your academic adviser changed",
  Standing_Change: "Your academic standing was updated",
  Deferral: "Your studies were deferred",
  Suspension: "Your studentship was suspended",
  Withdrawal: "You were withdrawn from your programme",
  Reinstatement: "Your studentship was reinstated",
  Death: "Record closed",
};

function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * 86_400_000).toISOString();
}

function sla(from: string, days: number, now: string) {
  const dueBy = addDays(from, days);
  return { dueBy, overdue: now > dueBy };
}

export function buildStudentTimeline(input: {
  studentId: string;
  events: LifecycleEvent[];
  corrections: CorrectionRequest[];
  holds: StudentHold[];
  transfers: TransferCase[];
  now: string;
  serviceLevels?: ServiceLevels;
}): StudentTimelineItem[] {
  const levels = input.serviceLevels ?? defaultServiceLevels;
  const items: StudentTimelineItem[] = [];

  for (const event of input.events) {
    if (event.studentId !== input.studentId || event.status !== "Approved" || event.type === "Death") continue;
    const scheduled = event.effectiveFrom > input.now;
    items.push({
      id: event.id,
      occurredAt: event.effectiveFrom,
      category: event.type === "Programme_Transfer" || event.type === "Level_Progression" ? "Programme" : "Status",
      title: scheduled ? `${lifecycleEventRules[event.type].label} scheduled` : eventTitles[event.type],
      description: event.releasableReason,
      state: scheduled ? "In_Progress" : "Completed",
      actionOwner: "Registry",
      appeal: lifecycleEventRules[event.type].appealRoute,
    });
  }

  for (const request of input.corrections) {
    if (request.studentId !== input.studentId) continue;
    const label = fieldDefinition(request.field).label.toLowerCase();
    if (request.status === "Submitted") {
      items.push({ id: request.id, occurredAt: request.submittedAt, category: "Request", title: `Correction to your ${label} is being reviewed`, description: `You asked to change your ${label}. Registry is checking your evidence.`, state: "In_Progress", actionOwner: "Registry (Records)", ...sla(request.submittedAt, levels.correctionDays, input.now) });
    } else if (request.status === "Approved") {
      items.push({ id: request.id, occurredAt: request.decidedAt ?? request.submittedAt, category: "Request", title: `Your ${label} was corrected`, description: request.releasableReason ?? `Your record now shows the corrected ${label}.`, state: "Completed", actionOwner: "Registry (Records)" });
    } else if (request.status === "Rejected") {
      items.push({ id: request.id, occurredAt: request.decidedAt ?? request.submittedAt, category: "Request", title: `Correction to your ${label} was not approved`, description: request.releasableReason ?? "Contact the Registry for details.", state: "Declined", actionOwner: "Registry (Records)", appeal: "Submit a new request with further evidence, or ask the Registrar to review the decision." });
    } else {
      items.push({ id: request.id, occurredAt: request.decidedAt ?? request.submittedAt, category: "Request", title: `You withdrew a correction to your ${label}`, description: "No change was made to your record.", state: "Completed", actionOwner: "You" });
    }
  }

  for (const hold of input.holds) {
    if (hold.studentId !== input.studentId) continue;
    const restricts = hold.effects.map((effect) => holdEffectLabels[effect]).join(", ");
    if (isHoldActive(hold, input.now)) {
      items.push({ id: hold.id, occurredAt: hold.startsAt, category: "Hold", title: `${hold.type} hold on ${restricts}`, description: hold.releasableReason, state: "Active", actionOwner: hold.ownerUnit, appeal: hold.appealRoute });
    } else if (hold.releasedAt) {
      items.push({ id: hold.id, occurredAt: hold.releasedAt, category: "Hold", title: `${hold.type} hold released`, description: `This hold no longer restricts ${restricts}.`, state: "Completed", actionOwner: hold.ownerUnit });
    }
  }

  for (const transfer of input.transfers) {
    if (transfer.studentId !== input.studentId) continue;
    const stage = nextTransferStage(transfer);
    if (stage) {
      const since = transfer.approvals.at(-1)?.decidedAt ?? transfer.createdAt;
      items.push({ id: transfer.id, occurredAt: transfer.createdAt, category: "Request", title: `Change of programme to ${transfer.toProgrammeName} is being reviewed`, description: `${transfer.approvals.length} of 4 approvals complete.`, state: "In_Progress", actionOwner: stage.replaceAll("_", " "), ...sla(since, levels.transferStageDays, input.now) });
    } else if (transfer.status === "Rejected") {
      const decided = transfer.approvals.at(-1)?.decidedAt ?? transfer.createdAt;
      items.push({ id: transfer.id, occurredAt: decided, category: "Request", title: `Change of programme to ${transfer.toProgrammeName} was not approved`, description: "Your decision letter is available from the Registry.", state: "Declined", actionOwner: "Registry", appeal: "Appeal in writing to the Faculty Board within 14 days." });
    }
  }

  return items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}
