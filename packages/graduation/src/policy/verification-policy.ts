/**
 * Credential verification (GRD-07): a signed code returns validity and a fixed
 * set of minimal fields — never grades, CGPA, date of birth or matriculation
 * number. Every query is logged and requesters are rate-limited.
 */

import type { GraduandList } from "../domain/graduand-list";
import type { Graduand } from "../domain/record";
import type { VerificationDisclosure, VerificationOutcome, VerificationQuery, VerificationRecord } from "../domain/verification";
import { fingerprint } from "./check";
import { approvedListFor } from "./list-policy";

export const verificationRateLimit = { maxQueries: 5, windowMinutes: 10 };

/** The complete list of fields a verifier may see. */
export const disclosedFields: Array<keyof VerificationDisclosure> = ["holderName", "credentialType", "award", "programme", "classification", "graduationSession", "issuedAt"];

/** Demonstration signature; production signs with a server-held key. */
export function signVerificationCode(code: string): string {
  return fingerprint(`tau-credential|${code}`).slice(0, 12);
}

export function verificationPath(code: string): string {
  return `/verify?code=${encodeURIComponent(code)}&sig=${signVerificationCode(code)}`;
}

export function verifyCredential(input: {
  code: string;
  signature?: string;
  requester: string;
  records: VerificationRecord[];
  log: VerificationQuery[];
  graduands: Graduand[];
  lists: GraduandList[];
  now: string;
  queryId: string;
}): { outcome: VerificationOutcome; disclosure?: VerificationDisclosure; query: VerificationQuery } {
  const code = input.code.trim().toUpperCase();
  const requester = input.requester.trim() || "Anonymous";
  const since = Date.parse(input.now) - verificationRateLimit.windowMinutes * 60_000;
  const recent = input.log.filter((query) => query.requester.toLowerCase() === requester.toLowerCase() && Date.parse(query.at) >= since);

  const respond = (outcome: VerificationOutcome, disclosure?: VerificationDisclosure) => ({ outcome, disclosure, query: { id: input.queryId, code, requester, at: input.now, outcome } });

  if (recent.length >= verificationRateLimit.maxQueries) return respond("Rate_Limited");
  if (input.signature !== undefined && input.signature !== signVerificationCode(code)) return respond("Invalid_Link");
  const record = input.records.find((item) => item.code === code);
  if (!record) return respond("Not_Found");
  if (record.status === "Revoked") return respond("Revoked");

  const graduand = input.graduands.find((item) => item.studentId === record.studentId);
  if (!graduand) return respond("Not_Found");
  const entry = approvedListFor(input.lists, graduand.studentId)?.entries.find((item) => item.studentId === graduand.studentId);
  return respond("Valid", {
    holderName: graduand.name,
    credentialType: record.credentialType,
    award: graduand.award,
    programme: graduand.programmeName,
    classification: entry?.classification ?? null,
    graduationSession: graduand.graduationSession,
    issuedAt: record.issuedAt,
  });
}
