/**
 * Credentials and sessions attached to a person (IAM-01, IAM-03).
 *
 * A person has exactly one account across every module. Disabling the account
 * is the single control that ends access everywhere: `revokedAt` is stamped on
 * every live session rather than waiting for each module to notice.
 */

export type AccountStatus = "active" | "suspended" | "disabled" | "pending-activation";

export type MfaMethodKind = "totp" | "security-key" | "sms";

export interface MfaEnrolment {
  id: string;
  accountId: string;
  kind: MfaMethodKind;
  label: string;
  status: "active" | "revoked";
  enrolledAt: string;
  lastUsedAt: string | null;
}

export interface RecoveryCodeBatch {
  id: string;
  accountId: string;
  issuedAt: string;
  issuedBy: string;
  /** Demo store keeps only usage state; a real store keeps one-way hashes. */
  codes: { id: string; usedAt: string | null }[];
}

export interface Account {
  id: string;
  personId: string;
  username: string;
  status: AccountStatus;
  statusReason: string | null;
  mfaEnrolments: MfaEnrolment[];
  recoveryCodes: RecoveryCodeBatch | null;
  lastSignInAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  accountId: string;
  personId: string;
  /** Which module the session was opened against. */
  module: string;
  device: string;
  ipAddress: string;
  startedAt: string;
  lastSeenAt: string;
  expiresAt: string;
  mfaSatisfiedAt: string | null;
  revokedAt: string | null;
  revokedReason: string | null;
}

export function isSessionLive(session: Session, now: Date): boolean {
  if (session.revokedAt) return false;
  return new Date(session.expiresAt).getTime() > now.getTime();
}

export function hasActiveMfa(account: Account): boolean {
  return account.mfaEnrolments.some((enrolment) => enrolment.status === "active");
}

export function unusedRecoveryCodeCount(account: Account): number {
  if (!account.recoveryCodes) return 0;
  return account.recoveryCodes.codes.filter((code) => !code.usedAt).length;
}
