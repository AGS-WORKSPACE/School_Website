/**
 * Applicant identity and profile domain models (ADM-01).
 *
 * Applicants hold a prospect account with verified contact details,
 * demographic background, and national identifiers (JAMB, NIN).
 */

export interface ContactVerification {
  emailVerified: boolean;
  emailVerifiedAt?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  verificationMethod: "OTP_SMS" | "OTP_EMAIL" | "MAGIC_LINK" | "OFFICER_CONFIRMED";
}

export interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address: string;
}

export interface SponsorInfo {
  type: "Self" | "Parent/Guardian" | "Government Scholarship" | "Corporate Sponsor" | "Other";
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface ApplicantAccount {
  id: string; // "app-acc-001"
  email: string;
  phone: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: "Male" | "Female" | "Other";
  nationality: string; // "Nigerian", "Ghanaian", etc.
  stateOfOrigin?: string; // Nigerian state
  lga?: string; // Nigerian Local Government Area
  nationalIdNumber?: string; // NIN (11 digits)
  jambRegistrationNumber?: string; // e.g. "202610293847AB"
  verification: ContactVerification;
  nextOfKin?: NextOfKin;
  sponsor?: SponsorInfo;
  createdAt: string;
  updatedAt: string;
}
