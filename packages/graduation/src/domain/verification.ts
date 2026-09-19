/**
 * Minimal-disclosure credential verification (GRD-07).
 */

export interface VerificationRecord {
  code: string;
  credentialType: "Transcript" | "Certificate";
  studentId: string;
  issuedAt: string;
  status: "Valid" | "Revoked";
  revokedReason?: string;
}

export type VerificationOutcome = "Valid" | "Revoked" | "Not_Found" | "Invalid_Link" | "Rate_Limited";

/** The only fields a verifier ever receives. */
export interface VerificationDisclosure {
  holderName: string;
  credentialType: VerificationRecord["credentialType"];
  award: string;
  programme: string;
  classification: string | null;
  graduationSession: string;
  issuedAt: string;
}

export interface VerificationQuery {
  id: string;
  code: string;
  requester: string;
  at: string;
  outcome: VerificationOutcome;
}
