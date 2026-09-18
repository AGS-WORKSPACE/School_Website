/**
 * Security review, activation and observability for learning-tool
 * integrations (LMS-07).
 */

import { rolesPermit } from "@tau/identity/policy";
import type { DataContract, Integration, IntegrationEvent, IntegrationEventKind } from "../domain/integration";
import { check, type LmsActor, type PolicyCheck } from "./check";

export function contractGaps(contract: DataContract): string[] {
  const gaps: string[] = [];
  if (contract.fields.length === 0) gaps.push("data fields");
  if (!contract.purpose.trim()) gaps.push("purpose");
  if (!contract.lawfulBasis.trim()) gaps.push("lawful basis");
  if (!contract.retention.trim()) gaps.push("retention");
  if (!contract.dataLocation.trim()) gaps.push("data location");
  return gaps;
}

function approverErrors(integration: Integration, actor: LmsActor): string[] {
  const errors: string[] = [];
  if (!rolesPermit(actor.roleIds, "lms:integration:approve")) errors.push("Your roles do not include integration security approval.");
  if (integration.requestedBy === actor.personId) errors.push("The person who requested an integration cannot review or activate it.");
  return errors;
}

export function reviewIntegrationCheck(integration: Integration, actor: LmsActor, notes: string): PolicyCheck {
  const errors = approverErrors(integration, actor);
  if (!notes.trim()) errors.push("Record the review findings.");
  const gaps = contractGaps(integration.dataContract);
  if (gaps.length) errors.push(`The data contract is missing: ${gaps.join(", ")}.`);
  return check(errors);
}

export function activationCheck(integration: Integration, actor: LmsActor): PolicyCheck {
  const errors = approverErrors(integration, actor);
  if (integration.status === "Active") errors.push("This integration is already active.");
  if (integration.securityReview?.outcome !== "Approved") errors.push("A passed security review must come before activation.");
  if (!integration.conformanceReference) errors.push(`No 1EdTech conformance certification is recorded for ${integration.standard.replaceAll("_", " ")}.`);
  const gaps = contractGaps(integration.dataContract);
  if (gaps.length) errors.push(`The data contract is missing: ${gaps.join(", ")}.`);
  return check(errors);
}

export interface IntegrationHealth {
  kind: IntegrationEventKind;
  total: number;
  failures: number;
  failureRate: number;
  consecutiveFailures: number;
  lastError?: string;
  alert: boolean;
}

/** Failure-rate alerting over a recent window, per event kind. */
export function integrationHealth(events: IntegrationEvent[], integrationId: string, now: string, windowHours = 24): IntegrationHealth[] {
  const since = Date.parse(now) - windowHours * 3_600_000;
  const recent = events.filter((event) => event.integrationId === integrationId && Date.parse(event.at) >= since).sort((a, b) => a.at.localeCompare(b.at));
  const kinds = [...new Set(recent.map((event) => event.kind))];
  return kinds.map((kind) => {
    const ofKind = recent.filter((event) => event.kind === kind);
    const failures = ofKind.filter((event) => !event.ok);
    let consecutiveFailures = 0;
    for (const event of [...ofKind].reverse()) {
      if (event.ok) break;
      consecutiveFailures++;
    }
    const failureRate = ofKind.length ? failures.length / ofKind.length : 0;
    return {
      kind,
      total: ofKind.length,
      failures: failures.length,
      failureRate,
      consecutiveFailures,
      lastError: failures.at(-1)?.error,
      alert: consecutiveFailures >= 3 || (ofKind.length >= 5 && failureRate > 0.1),
    };
  });
}
