/**
 * Assisted Walk-in Intake Policy (ADM-04).
 *
 * Ensures walk-in / offline applications captured by an admissions officer
 * maintain full audit provenance and require affirmative applicant consent.
 */

import type { AssistedIntakeRecord, ApplicantConsentLog } from "../domain/assisted-intake";

export interface AssistedIntakeValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates that an assisted intake capture contains authorized officer credentials and valid applicant consent.
 */
export function validateAssistedIntakeCapture(
  intake: Partial<AssistedIntakeRecord>
): AssistedIntakeValidationResult {
  const errors: string[] = [];

  if (!intake.assistingOfficerId || !intake.assistingOfficerName) {
    errors.push("Assisting officer identity must be explicitly recorded.");
  }

  if (!intake.campusLocation) {
    errors.push("Intake location or campus desk is required for walk-in provenance.");
  }

  if (!intake.applicantConsent || !intake.applicantConsent.acknowledgedByApplicant) {
    errors.push("Affirmative applicant acknowledgement/consent is mandatory for assisted intake.");
  }

  if (!intake.applicantConsent?.consentStatement) {
    errors.push("A recorded consent statement is required.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Confirms applicant verification of assisted application data.
 */
export function confirmAssistedIntakeByApplicant(
  record: AssistedIntakeRecord,
  confirmedTimestamp: string = new Date().toISOString()
): AssistedIntakeRecord {
  return {
    ...record,
    applicantConfirmationStatus: "Confirmed_By_Applicant",
    confirmedAt: confirmedTimestamp,
  };
}
