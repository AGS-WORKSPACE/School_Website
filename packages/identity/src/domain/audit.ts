/**
 * Tamper-evident audit trail (OPS-05, and the evidence behind IAM-03 to IAM-06).
 *
 * Each entry stores the SHA-256 of its own canonical content plus the hash of
 * the entry before it. Editing or removing any entry breaks every hash after
 * it, so `verifyAuditChain` can say exactly where a trail stopped being
 * trustworthy. This gives tamper *evidence*, not tamper proofing — the store
 * itself must still be append-only and held outside ordinary admin reach.
 */

import type { Scope } from "./org";

export type AuditChannel = "web" | "api" | "batch" | "system";

export type AuditOutcome = "success" | "denied" | "failure";

export interface AuditEvent {
  id: string;
  /** Monotonic position in the chain. */
  seq: number;
  at: string;
  actorPersonId: string | null;
  actorLabel: string;
  action: string;
  subjectType: string;
  subjectId: string;
  subjectLabel: string;
  scope: Scope | null;
  channel: AuditChannel;
  outcome: AuditOutcome;
  reason: string | null;
  /** Small, redacted before/after snapshots. Never the full record. */
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  /** Grant or delegation the actor was relying on, when relevant. */
  viaGrantId: string | null;
  prevHash: string;
  hash: string;
}

export type AuditDraft = Omit<AuditEvent, "id" | "seq" | "hash" | "prevHash">;

export const auditGenesisHash = "0".repeat(64);

/** Field order is fixed: the hash must not change because a key moved. */
function canonicalise(event: Omit<AuditEvent, "hash">): string {
  return JSON.stringify([
    event.seq,
    event.at,
    event.actorPersonId,
    event.action,
    event.subjectType,
    event.subjectId,
    event.scope ? `${event.scope.dimension}:${event.scope.unitId}` : null,
    event.channel,
    event.outcome,
    event.reason,
    event.before,
    event.after,
    event.viaGrantId,
    event.prevHash,
  ]);
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function sealAuditEvent(
  event: Omit<AuditEvent, "hash">,
): Promise<AuditEvent> {
  return { ...event, hash: await sha256Hex(canonicalise(event)) };
}

export interface AuditChainVerification {
  valid: boolean;
  checked: number;
  /** Sequence number of the first entry whose hash does not reconcile. */
  brokenAtSeq: number | null;
  message: string;
}

export async function verifyAuditChain(events: AuditEvent[]): Promise<AuditChainVerification> {
  const ordered = [...events].sort((a, b) => a.seq - b.seq);
  let expectedPrev = auditGenesisHash;

  for (const event of ordered) {
    if (event.prevHash !== expectedPrev) {
      return {
        valid: false,
        checked: ordered.length,
        brokenAtSeq: event.seq,
        message: `Entry ${event.seq} does not follow the entry before it. The trail was altered at or before this point.`,
      };
    }
    const { hash, ...unsealed } = event;
    const recomputed = await sha256Hex(canonicalise(unsealed));
    if (recomputed !== hash) {
      return {
        valid: false,
        checked: ordered.length,
        brokenAtSeq: event.seq,
        message: `Entry ${event.seq} has been edited since it was written.`,
      };
    }
    expectedPrev = event.hash;
  }

  return {
    valid: true,
    checked: ordered.length,
    brokenAtSeq: null,
    message: `All ${ordered.length} entries reconcile against the chain.`,
  };
}
