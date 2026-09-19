/**
 * Certificate custody (GRD-06): every received serial is accounted for as
 * blank, printed, void or issued; printing needs an approved graduand list and
 * release needs an identified, authorised collector.
 */

import { rolesPermit } from "@tau/identity/policy";
import type { CertificateState, CertificateStock, Collector, StockReceipt } from "../domain/certificate";
import type { ClearanceStatus } from "../domain/clearance";
import type { GraduandList } from "../domain/graduand-list";
import { approvedListFor } from "./list-policy";
import { check, type GraduationActor, type PolicyCheck } from "./check";

export interface StockReconciliation {
  expected: number;
  counts: Record<CertificateState, number>;
  missingSerials: number[];
  unexpectedSerials: number[];
  duplicateSerials: number[];
  balanced: boolean;
}

export function reconcileStock(receipts: StockReceipt[], stock: CertificateStock[]): StockReconciliation {
  const expectedSerials = new Set(receipts.flatMap((receipt) => Array.from({ length: receipt.lastSerial - receipt.firstSerial + 1 }, (_, index) => receipt.firstSerial + index)));
  const seen = new Map<number, number>();
  for (const item of stock) seen.set(item.serial, (seen.get(item.serial) ?? 0) + 1);
  const counts: Record<CertificateState, number> = { Blank: 0, Printed: 0, Void: 0, Issued: 0 };
  for (const item of stock) counts[item.state]++;
  const missingSerials = [...expectedSerials].filter((serial) => !seen.has(serial));
  const unexpectedSerials = [...seen.keys()].filter((serial) => !expectedSerials.has(serial));
  const duplicateSerials = [...seen.entries()].filter(([, count]) => count > 1).map(([serial]) => serial);
  return { expected: expectedSerials.size, counts, missingSerials, unexpectedSerials, duplicateSerials, balanced: !missingSerials.length && !unexpectedSerials.length && !duplicateSerials.length };
}

function managerErrors(actor: GraduationActor): string[] {
  return rolesPermit(actor.roleIds, "records:certificate:manage") ? [] : ["Your roles do not include certificate custody."];
}

export function printCertificateCheck(input: { item: CertificateStock; studentId: string; stock: CertificateStock[]; lists: GraduandList[]; actor: GraduationActor }): PolicyCheck {
  const errors = managerErrors(input.actor);
  if (input.item.state !== "Blank") errors.push(`Serial ${input.item.serial} is ${input.item.state.toLowerCase()}, not blank.`);
  if (!approvedListFor(input.lists, input.studentId)) errors.push("The graduate is not on an approved, intact graduand list.");
  if (input.stock.some((item) => item.studentId === input.studentId && (item.state === "Printed" || item.state === "Issued"))) errors.push("A live certificate already exists for this graduate; void it before printing a replacement.");
  return check(errors);
}

export function voidCertificateCheck(item: CertificateStock, reason: string, actor: GraduationActor): PolicyCheck {
  const errors = managerErrors(actor);
  if (item.state === "Issued" || item.state === "Void") errors.push(`Serial ${item.serial} is already ${item.state.toLowerCase()}.`);
  if (!reason.trim()) errors.push("Record why the certificate is void.");
  return check(errors);
}

export function issueCertificateCheck(input: { item: CertificateStock; collector: Collector; clearance: ClearanceStatus | undefined; actor: GraduationActor }): PolicyCheck {
  const errors = managerErrors(input.actor);
  if (input.item.state !== "Printed") errors.push(`Serial ${input.item.serial} must be printed before it is released.`);
  if (input.clearance !== "Cleared") errors.push("The graduate has not completed clearance.");
  if (!input.collector.name.trim() || !input.collector.idNumber.trim()) errors.push("Record the collector's name and identity document.");
  if (input.collector.relationship === "Proxy" && !input.collector.authorityDocument?.trim()) errors.push("A proxy collector needs a written authority from the graduate.");
  return check(errors);
}
