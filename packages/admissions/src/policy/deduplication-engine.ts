/**
 * Deduplication and Identity Discrepancy Policy Engine (ADM-06).
 *
 * Enforces multi-parameter matching across JAMB, NIN, phone, email, and name/DOB.
 * INVARIANT: Records are NEVER merged automatically on name alone or fuzzy similarity.
 * All suspicious candidates require human investigation by an authorized officer.
 */

import type { ApplicationCase } from "../domain/application";
import type { DuplicateMatchCase, MatchFactor, DiscrepancySeverity } from "../domain/deduplication";

/**
 * Phonetic/Normalized string comparison for names.
 */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Calculates match factors between an incoming application and an existing candidate.
 */
export function evaluateDuplicateMatch(
  primary: ApplicationCase,
  candidate: ApplicationCase
): {
  isSuspicious: boolean;
  compositeScore: number;
  factors: MatchFactor[];
  severity: DiscrepancySeverity;
} {
  // Prevent matching an application with itself
  if (primary.id === candidate.id || primary.applicant.id === candidate.applicant.id) {
    return { isSuspicious: false, compositeScore: 0, factors: [], severity: "Low" };
  }

  const factors: MatchFactor[] = [];
  let score = 0;

  // 1. JAMB Registration Number Check
  if (
    primary.applicant.jambRegistrationNumber &&
    candidate.applicant.jambRegistrationNumber
  ) {
    const isExact =
      primary.applicant.jambRegistrationNumber.trim().toUpperCase() ===
      candidate.applicant.jambRegistrationNumber.trim().toUpperCase();
    if (isExact) {
      factors.push({
        attribute: "JAMB_REG_NUMBER",
        primaryValue: primary.applicant.jambRegistrationNumber,
        matchedValue: candidate.applicant.jambRegistrationNumber,
        weight: 45,
        isExactMatch: true,
      });
      score += 45;
    }
  }

  // 2. National Identification Number (NIN) Check
  if (
    primary.applicant.nationalIdNumber &&
    candidate.applicant.nationalIdNumber
  ) {
    const isExact =
      primary.applicant.nationalIdNumber.trim() ===
      candidate.applicant.nationalIdNumber.trim();
    if (isExact) {
      factors.push({
        attribute: "NIN",
        primaryValue: primary.applicant.nationalIdNumber,
        matchedValue: candidate.applicant.nationalIdNumber,
        weight: 45,
        isExactMatch: true,
      });
      score += 45;
    }
  }

  // 3. Email Check
  if (
    primary.applicant.email.trim().toLowerCase() ===
    candidate.applicant.email.trim().toLowerCase()
  ) {
    factors.push({
      attribute: "EMAIL",
      primaryValue: primary.applicant.email,
      matchedValue: candidate.applicant.email,
      weight: 25,
      isExactMatch: true,
    });
    score += 25;
  }

  // 4. Phone Check
  const pPhone = primary.applicant.phone.replace(/[^0-9]/g, "");
  const cPhone = candidate.applicant.phone.replace(/[^0-9]/g, "");
  if (pPhone && cPhone && (pPhone === cPhone || pPhone.endsWith(cPhone) || cPhone.endsWith(pPhone))) {
    factors.push({
      attribute: "PHONE",
      primaryValue: primary.applicant.phone,
      matchedValue: candidate.applicant.phone,
      weight: 20,
      isExactMatch: true,
    });
    score += 20;
  }

  // 5. Name + DOB Phonetic Check
  const pFirst = normalizeName(primary.applicant.firstName);
  const pLast = normalizeName(primary.applicant.lastName);
  const cFirst = normalizeName(candidate.applicant.firstName);
  const cLast = normalizeName(candidate.applicant.lastName);

  const nameMatch = (pFirst === cFirst && pLast === cLast) || (pFirst === cLast && pLast === cFirst);
  const dobMatch = primary.applicant.dateOfBirth === candidate.applicant.dateOfBirth;

  if (nameMatch && dobMatch) {
    factors.push({
      attribute: "NAME_DOB_SOUNDEX",
      primaryValue: `${primary.applicant.firstName} ${primary.applicant.lastName} (${primary.applicant.dateOfBirth})`,
      matchedValue: `${candidate.applicant.firstName} ${candidate.applicant.lastName} (${candidate.applicant.dateOfBirth})`,
      weight: 30,
      isExactMatch: true,
    });
    score += 30;
  } else if (nameMatch && !dobMatch) {
    // Shared name alone with different DOB gets low weight and NEVER triggers auto-flag as a duplicate
    factors.push({
      attribute: "NAME_DOB_SOUNDEX",
      primaryValue: `${primary.applicant.firstName} ${primary.applicant.lastName}`,
      matchedValue: `${candidate.applicant.firstName} ${candidate.applicant.lastName}`,
      weight: 10,
      isExactMatch: false,
    });
    score += 10;
  }

  // Composite cap at 100
  const compositeScore = Math.min(score, 100);

  let severity: DiscrepancySeverity = "Low";
  if (compositeScore >= 70) {
    severity = "High";
  } else if (compositeScore >= 40) {
    severity = "Medium";
  }

  // Suspicious if compositeScore >= 40 OR if exact match on national identifier (JAMB or NIN)
  const hasIdentifierConflict = factors.some(
    (f) => (f.attribute === "JAMB_REG_NUMBER" || f.attribute === "NIN") && f.isExactMatch
  );

  const isSuspicious = compositeScore >= 40 || hasIdentifierConflict;

  return {
    isSuspicious,
    compositeScore,
    factors,
    severity,
  };
}

/**
 * Statutory safety check: ensures automatic merging on name alone is strictly denied.
 */
export function canAutoMerge(factors: MatchFactor[]): { allowed: boolean; reason: string } {
  const onlyNameFactor = factors.every((f) => f.attribute === "NAME_DOB_SOUNDEX");
  if (onlyNameFactor) {
    return {
      allowed: false,
      reason: "Statutory Violation: Records can never be automatically merged based on names alone.",
    };
  }

  // In this system, all merges must be human-adjudicated
  return {
    allowed: false,
    reason: "Policy Invariant: All candidate deduplication merges require authorized human review.",
  };
}

/**
 * Scans an incoming application against the existing database and generates discrepancy cases.
 */
export function scanForDeduplicationCases(
  incoming: ApplicationCase,
  catalogue: ApplicationCase[]
): DuplicateMatchCase[] {
  const cases: DuplicateMatchCase[] = [];

  for (const existing of catalogue) {
    const evaluation = evaluateDuplicateMatch(incoming, existing);
    if (evaluation.isSuspicious) {
      cases.push({
        id: `dup-${incoming.id}-${existing.id}`,
        primaryApplicationId: incoming.id,
        matchedApplicationId: existing.id,
        primaryApplicantName: `${incoming.applicant.firstName} ${incoming.applicant.lastName}`,
        matchedApplicantName: `${existing.applicant.firstName} ${existing.applicant.lastName}`,
        compositeScore: evaluation.compositeScore,
        severity: evaluation.severity,
        status: "Open_Under_Review",
        detectedAt: new Date().toISOString(),
        matchFactors: evaluation.factors,
        investigationNotes: `Flagged automatically by Deduplication Engine: ${evaluation.factors
          .map((f) => f.attribute)
          .join(", ")} matched.`,
      });
    }
  }

  return cases;
}
