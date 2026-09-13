/**
 * Assisted walk-in intake models (ADM-04).
 *
 * Captures offline/walk-in applications taken by an admissions desk officer.
 * Retains officer provenance, applicant acknowledgement, and data confirmation.
 */

export interface ApplicantConsentLog {
  acknowledgedByApplicant: boolean;
  consentTimestamp: string;
  signatureType: "DIGITAL_ACK" | "PHYSICAL_FORM_SCAN" | "SMS_TOKEN_CONFIRM";
  evidenceReference?: string;
  consentStatement: string;
}

export interface AssistedIntakeRecord {
  id: string; // "asst-001"
  applicationId: string;
  assistingOfficerId: string;
  assistingOfficerName: string;
  assistingOfficerEmail: string;
  campusLocation: string; // e.g. "Main Campus Admissions Pavilion"
  intakeChannel: "Walk-In Desk" | "Outreach Fair" | "Affiliate Liaison";
  capturedAt: string;
  notes?: string;
  applicantConsent: ApplicantConsentLog;
  applicantConfirmationStatus: "Pending_Applicant_Confirmation" | "Confirmed_By_Applicant" | "Disputed";
  confirmedAt?: string;
}
