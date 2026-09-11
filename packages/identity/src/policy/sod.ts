/**
 * Segregation-of-duties rules and conflict detection (IAM-05).
 *
 * Detection runs over effective grants rather than role assignments, which
 * matters: the most common way a conflict appears in practice is somebody
 * covering for a colleague on leave, not somebody being given a second job.
 */

import type { OrgUnit } from "../domain/org";
import type { SodConflict, SodException, SodRule, SodConflictSource } from "../domain/sod";
import { sodExceptionStatus } from "../domain/sod";
import type { EffectiveGrant } from "./access";
import { indexUnits, overlappingScope, scopeCovers } from "./scope";

export const sodRuleset: SodRule[] = [
  {
    id: "sod-admission-batch",
    label: "Prepare and approve an admission batch",
    description:
      "The officer who assembles a recommended admission list must not also be the authority that approves it.",
    permissionA: "admissions:batch:prepare",
    permissionB: "admissions:batch:approve",
    severity: "blocking",
    basis: "Product principle 4 — maker-checker; JAMB CAPS separates recommendation from approval.",
  },
  {
    id: "sod-result-release",
    label: "Enter and approve results",
    description: "Marks must be moderated and released by someone other than the person who recorded them.",
    permissionA: "records:result:enter",
    permissionB: "records:result:approve",
    severity: "blocking",
    basis: "Product principle 4 — maker-checker on academic records.",
  },
  {
    id: "sod-refund-release",
    label: "Prepare and authorise a refund",
    description: "Refund preparation and authorisation must rest with different people.",
    permissionA: "finance:refund:prepare",
    permissionB: "finance:refund:authorise",
    severity: "blocking",
    basis: "Financial control; product principle 4.",
  },
  {
    id: "sod-appointment",
    label: "Recommend and approve an appointment",
    description: "A panel recommendation must be approved by a separate authority.",
    permissionA: "hr:appointment:recommend",
    permissionB: "hr:appointment:approve",
    severity: "blocking",
    basis: "Conditions of service; product principle 4.",
  },
  {
    id: "sod-access-grant",
    label: "Prepare and approve access",
    description: "Nobody may give themselves or a colleague access without a second authority approving it.",
    permissionA: "identity:role-assignment:prepare",
    permissionB: "identity:role-assignment:approve",
    severity: "blocking",
    basis: "Risk register — super-admin abuse.",
  },
  {
    id: "sod-break-glass",
    label: "Request and approve emergency access",
    description: "Emergency access must be approved by someone other than the person who asked for it.",
    permissionA: "identity:break-glass:request",
    permissionB: "identity:break-glass:approve",
    severity: "blocking",
    basis: "IAM-06 — break-glass must not be self-service.",
  },
  {
    id: "sod-billing-receipt",
    label: "Raise charges and receipt payments",
    description:
      "Raising a charge and receipting the money against it in one pair of hands hides misallocation. Small bursaries may need an exception with a compensating reconciliation control.",
    permissionA: "finance:invoice:raise",
    permissionB: "finance:payment:receipt",
    severity: "reviewable",
    basis: "Financial reconciliation control.",
  },
  {
    id: "sod-content-publish",
    label: "Draft and publish public content",
    description: "Editorial approval is weakened when the author releases their own work.",
    permissionA: "content:page:draft",
    permissionB: "content:page:publish",
    severity: "reviewable",
    basis: "WEB-03 — only authorised approvers publish.",
  },
];

export function getSodRule(id: string): SodRule | undefined {
  return sodRuleset.find((rule) => rule.id === id);
}

function toSource(grant: EffectiveGrant): SodConflictSource {
  return {
    kind: grant.source.kind,
    id: grant.source.id,
    roleId: grant.source.roleId,
    label: grant.source.label,
  };
}

/**
 * Conflicts for one person. Two grants only conflict where their scopes overlap:
 * preparing batches for Health Sciences and approving them for Engineering is
 * not a conflict, and flagging it would train people to ignore the warnings.
 */
export function detectConflicts(options: {
  personId: string;
  grants: EffectiveGrant[];
  units: OrgUnit[];
  exceptions: SodException[];
  now: Date;
  rules?: SodRule[];
}): SodConflict[] {
  const index = indexUnits(options.units);
  const rules = options.rules ?? sodRuleset;
  const conflicts: SodConflict[] = [];

  for (const rule of rules) {
    const holdersA = options.grants.filter((grant) => grant.permissionId === rule.permissionA);
    const holdersB = options.grants.filter((grant) => grant.permissionId === rule.permissionB);

    for (const grantA of holdersA) {
      for (const grantB of holdersB) {
        const scope = overlappingScope(index, grantA.scope, grantB.scope);
        if (!scope) continue;

        const exception =
          options.exceptions.find(
            (candidate) =>
              candidate.ruleId === rule.id &&
              candidate.personId === options.personId &&
              sodExceptionStatus(candidate, options.now) === "approved" &&
              scopeCovers(index, candidate.scope, scope),
          ) ?? null;

        conflicts.push({
          rule,
          personId: options.personId,
          scope,
          sourceA: toSource(grantA),
          sourceB: toSource(grantB),
          exception,
        });
      }
    }
  }

  return dedupeConflicts(conflicts);
}

function dedupeConflicts(conflicts: SodConflict[]): SodConflict[] {
  const seen = new Map<string, SodConflict>();
  for (const conflict of conflicts) {
    const key = [
      conflict.rule.id,
      conflict.personId,
      `${conflict.scope.dimension}:${conflict.scope.unitId}`,
      conflict.sourceA.id,
      conflict.sourceB.id,
    ].join("|");
    if (!seen.has(key)) seen.set(key, conflict);
  }
  return [...seen.values()];
}

export interface SodSubmissionCheck {
  permitted: boolean;
  blockingConflicts: SodConflict[];
  reviewableConflicts: SodConflict[];
  message: string;
}

/**
 * The gate a module calls before letting a high-risk item be submitted. A
 * blocking conflict without a live exception stops the submission; a reviewable
 * one lets it through and records that it was noticed.
 */
export function checkSubmission(options: {
  conflicts: SodConflict[];
  permissionId: string;
  now: Date;
}): SodSubmissionCheck {
  const relevant = options.conflicts.filter(
    (conflict) =>
      conflict.rule.permissionA === options.permissionId ||
      conflict.rule.permissionB === options.permissionId,
  );

  const blocking = relevant.filter(
    (conflict) =>
      conflict.rule.severity === "blocking" &&
      (!conflict.exception || sodExceptionStatus(conflict.exception, options.now) !== "approved"),
  );
  const reviewable = relevant.filter((conflict) => conflict.rule.severity === "reviewable");

  if (blocking.length > 0) {
    return {
      permitted: false,
      blockingConflicts: blocking,
      reviewableConflicts: reviewable,
      message: `Blocked by ${blocking.length} segregation-of-duties rule${blocking.length === 1 ? "" : "s"}. A documented exception approved by a separate authority is required.`,
    };
  }

  return {
    permitted: true,
    blockingConflicts: [],
    reviewableConflicts: reviewable,
    message:
      reviewable.length > 0
        ? `Permitted, with ${reviewable.length} conflict${reviewable.length === 1 ? "" : "s"} recorded for review.`
        : "No segregation-of-duties conflict applies.",
  };
}

export interface ExceptionApprovalCheck {
  permitted: boolean;
  reason: string;
}

/** An exception must be approved by someone who is neither the subject nor the requester. */
export function canApproveException(options: {
  exception: SodException;
  approverPersonId: string;
}): ExceptionApprovalCheck {
  if (options.approverPersonId === options.exception.personId) {
    return {
      permitted: false,
      reason: "An exception cannot be approved by the person it covers.",
    };
  }
  if (options.approverPersonId === options.exception.requestedBy) {
    return {
      permitted: false,
      reason: "The person who requested the exception cannot also approve it.",
    };
  }
  return { permitted: true, reason: "Approver is independent of the subject and the requester." };
}
