/**
 * Senate graduand lists (GRD-03): built only from eligible, cleared graduands,
 * reconciled by programme, award and classification, and frozen on approval.
 */

import { rolesPermit } from "@tau/identity/policy";
import type { AuditOverride, GraduationAudit } from "../domain/audit";
import type { ClearanceCase } from "../domain/clearance";
import type { GraduandList, GraduandListEntry, GraduandListTotals } from "../domain/graduand-list";
import type { Graduand } from "../domain/record";
import { check, fingerprint, type GraduationActor, type PolicyCheck } from "./check";
import { clearanceStatus } from "./clearance-policy";

export interface ListExclusion {
  studentId: string;
  name: string;
  reason: string;
}

export function selectGraduands(input: { graduands: Graduand[]; audits: GraduationAudit[]; clearances: ClearanceCase[]; overrides: AuditOverride[]; session: string }): { entries: GraduandListEntry[]; exclusions: ListExclusion[] } {
  const entries: GraduandListEntry[] = [];
  const exclusions: ListExclusion[] = [];
  for (const graduand of input.graduands.filter((item) => item.graduationSession === input.session)) {
    const audit = input.audits.find((item) => item.studentId === graduand.studentId);
    const clearance = input.clearances.find((item) => item.studentId === graduand.studentId);
    const reasons: string[] = [];
    if (!audit?.eligible) reasons.push(`graduation audit has ${audit?.openGaps.length ?? "unknown"} open gap(s)`);
    if (!clearance || clearanceStatus(clearance) !== "Cleared") reasons.push(`clearance ${clearance ? clearanceStatus(clearance).replace("_", " ").toLowerCase() : "not opened"}`);
    if (reasons.length || !audit || audit.cgpa === null || !audit.classification) {
      exclusions.push({ studentId: graduand.studentId, name: graduand.name, reason: reasons.join("; ") || "no classification" });
      continue;
    }
    entries.push({
      studentId: graduand.studentId,
      matriculationNumber: graduand.matriculationNumber,
      name: graduand.name,
      programmeName: graduand.programmeName,
      award: graduand.award,
      classification: audit.classification,
      cgpa: audit.cgpa,
      exceptions: input.overrides.filter((item) => item.studentId === graduand.studentId && item.status === "Approved").map((item) => `${item.id} (${item.authorityReference})`),
    });
  }
  return { entries: entries.sort((a, b) => a.programmeName.localeCompare(b.programmeName) || b.cgpa - a.cgpa || a.name.localeCompare(b.name)), exclusions };
}

function countBy(entries: GraduandListEntry[], key: (entry: GraduandListEntry) => string): Record<string, number> {
  return entries.reduce<Record<string, number>>((acc, entry) => ({ ...acc, [key(entry)]: (acc[key(entry)] ?? 0) + 1 }), {});
}

export function computeTotals(entries: GraduandListEntry[]): GraduandListTotals {
  return { total: entries.length, byProgramme: countBy(entries, (entry) => entry.programmeName), byAward: countBy(entries, (entry) => entry.award), byClassification: countBy(entries, (entry) => entry.classification) };
}

/** Every breakdown must add up to the same total as the entries themselves. */
export function reconcileList(list: GraduandList): { balanced: boolean; issues: string[] } {
  const recomputed = computeTotals(list.entries);
  const issues: string[] = [];
  const sum = (record: Record<string, number>) => Object.values(record).reduce((total, value) => total + value, 0);
  if (list.totals.total !== list.entries.length) issues.push(`Declared total ${list.totals.total} but the list has ${list.entries.length} graduands.`);
  for (const [label, record] of [["programme", list.totals.byProgramme], ["award", list.totals.byAward], ["classification", list.totals.byClassification]] as const) {
    if (sum(record) !== list.entries.length) issues.push(`Totals by ${label} add up to ${sum(record)}, not ${list.entries.length}.`);
  }
  if (fingerprint(recomputed) !== fingerprint(list.totals)) issues.push("Declared totals differ from the entries.");
  return { balanced: issues.length === 0, issues };
}

export function listFingerprint(list: Pick<GraduandList, "graduationSession" | "version" | "entries">): string {
  return fingerprint({ session: list.graduationSession, version: list.version, entries: list.entries });
}

export function isListIntact(list: GraduandList): boolean {
  return !list.frozenFingerprint || list.frozenFingerprint === listFingerprint(list);
}

export function submitListCheck(list: GraduandList, actor: GraduationActor): PolicyCheck {
  const errors: string[] = [];
  if (!rolesPermit(actor.roleIds, "records:graduation:audit")) errors.push("Your roles do not include preparing graduand lists.");
  if (list.status !== "Draft") errors.push(`Version ${list.version} is ${list.status.toLowerCase()}; prepare a new version to change it.`);
  if (list.entries.length === 0) errors.push("The list has no graduands.");
  errors.push(...reconcileList(list).issues);
  return check(errors);
}

export function approveListCheck(list: GraduandList, actor: GraduationActor, senateReference: string): PolicyCheck {
  const errors: string[] = [];
  if (!rolesPermit(actor.roleIds, "records:graduation:approve")) errors.push("Your roles do not include approving graduand lists.");
  if (list.preparedBy === actor.personId) errors.push("The person who prepared the list cannot approve it.");
  if (list.status !== "Submitted") errors.push("Only a submitted list can be approved.");
  if (!senateReference.trim()) errors.push("Cite the Senate minute that approves the list.");
  errors.push(...reconcileList(list).issues);
  return check(errors);
}

export function returnListCheck(list: GraduandList, actor: GraduationActor, reason: string): PolicyCheck {
  const errors: string[] = [];
  if (!rolesPermit(actor.roleIds, "records:graduation:approve")) errors.push("Your roles do not include returning graduand lists.");
  if (list.status !== "Submitted") errors.push("Only a submitted list can be returned.");
  if (!reason.trim()) errors.push("Say what must change.");
  return check(errors);
}

export function approvedListFor(lists: GraduandList[], studentId: string): GraduandList | undefined {
  return lists.filter((list) => list.status === "Approved" && isListIntact(list) && list.entries.some((entry) => entry.studentId === studentId)).sort((a, b) => b.version - a.version)[0];
}
