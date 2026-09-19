/**
 * In-memory reactive graduation store with localStorage persistence.
 */

import type { ResultBatch } from "@tau/curriculum/domain";
import { initialCourses, initialEquivalencies, initialProgrammes, initialResultBatches } from "@tau/curriculum/mock";
import type { AuditOverride } from "../domain/audit";
import type { CertificateStock, StockReceipt } from "../domain/certificate";
import type { ClearanceCase } from "../domain/clearance";
import type { GraduandList } from "../domain/graduand-list";
import type { ApprovedResult, Graduand, GraduationAuditEntry } from "../domain/record";
import type { Transcript, TranscriptRequest } from "../domain/transcript";
import type { VerificationQuery, VerificationRecord } from "../domain/verification";
import { computeTotals, listFingerprint, selectGraduands } from "../policy/list-policy";
import { prepareTranscript } from "../policy/transcript-policy";
import { auditAll } from "./context";
import {
  archivedResultBatches, classificationRule, graduationActors, initialCertificateStock, initialClearances, initialGraduands, initialOverrides, initialResults,
  initialStockReceipts, initialTranscriptRequests, initialVerificationLog, initialVerificationRecords, previousListMeta, previousTranscriptMeta, transcriptTemplate,
} from "./seed";

export interface GraduationStoreState {
  graduands: Graduand[];
  results: ApprovedResult[];
  archivedBatches: ResultBatch[];
  overrides: AuditOverride[];
  clearances: ClearanceCase[];
  lists: GraduandList[];
  transcriptRequests: TranscriptRequest[];
  transcripts: Transcript[];
  stockReceipts: StockReceipt[];
  certificateStock: CertificateStock[];
  verificationRecords: VerificationRecord[];
  verificationLog: VerificationQuery[];
  audit: GraduationAuditEntry[];
}

const STORAGE_KEY = "tau_graduation_store_v1";

/** The previous cycle's approved list and issued transcript, built through the real policies. */
function previousCycle(): { list: GraduandList; transcript: Transcript } {
  const context = { programmes: initialProgrammes, courses: initialCourses, equivalencies: initialEquivalencies, batches: [...initialResultBatches, ...archivedResultBatches], holds: [], lifecycleEvents: [] };
  const audits = auditAll({ graduands: initialGraduands, results: initialResults, overrides: initialOverrides, context, now: previousListMeta.approvedAt });
  const { entries } = selectGraduands({ graduands: initialGraduands, audits, clearances: initialClearances, overrides: initialOverrides, session: previousListMeta.graduationSession });
  const officer = graduationActors[0];
  const senate = graduationActors[2];
  const base = { ...previousListMeta, entries };
  const list: GraduandList = {
    id: base.id, graduationSession: base.graduationSession, version: base.version, status: "Approved", entries, totals: computeTotals(entries),
    preparedBy: officer.personId, preparedByName: officer.name, preparedAt: "2025-10-01T10:00:00Z", submittedAt: "2025-10-02T10:00:00Z",
    approvedBy: senate.personId, approvedByName: senate.name, approvedAt: base.approvedAt, senateReference: base.senateReference, frozenFingerprint: listFingerprint(base),
  };

  const request = initialTranscriptRequests.find((item) => item.id === previousTranscriptMeta.requestId)!;
  const prepared = prepareTranscript({ id: previousTranscriptMeta.id, serial: previousTranscriptMeta.serial, request: { ...request, status: "Paid" }, results: initialResults, batches: context.batches, rule: classificationRule, template: transcriptTemplate, actor: officer, now: previousTranscriptMeta.preparedAt });
  if (!prepared.transcript) throw new Error(`Seed transcript is invalid: ${prepared.check.errors.join(" ")}`);
  const signatory = graduationActors[1];
  return {
    list,
    transcript: { ...prepared.transcript, signatory: { personId: signatory.personId, name: signatory.name, title: signatory.title }, sealed: true, issuedAt: previousTranscriptMeta.issuedAt, verificationCode: previousTranscriptMeta.verificationCode },
  };
}

function seedState(): GraduationStoreState {
  const previous = previousCycle();
  return structuredClone({
    graduands: initialGraduands,
    results: initialResults,
    archivedBatches: archivedResultBatches,
    overrides: initialOverrides,
    clearances: initialClearances,
    lists: [previous.list],
    transcriptRequests: initialTranscriptRequests,
    transcripts: [previous.transcript],
    stockReceipts: initialStockReceipts,
    certificateStock: initialCertificateStock,
    verificationRecords: initialVerificationRecords,
    verificationLog: initialVerificationLog,
    audit: [],
  });
}

class GraduationStore {
  private state: GraduationStoreState;
  private listeners = new Set<() => void>();

  constructor() {
    this.state = this.load();
  }

  private load(): GraduationStoreState {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return { ...seedState(), ...(JSON.parse(saved) as Partial<GraduationStoreState>) };
      } catch (err) {
        console.warn("Could not read graduation store from localStorage:", err);
      }
    }
    return seedState();
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.warn("Failed to persist graduation store to localStorage:", err);
    }
  }

  getSnapshot(): GraduationStoreState {
    return this.state;
  }

  setState(updater: (prev: GraduationStoreState) => GraduationStoreState) {
    this.state = updater(this.state);
    this.persist();
    this.notify();
  }

  resetToSeed() {
    this.state = seedState();
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Storage may be unavailable; the in-memory reset still applies.
      }
    }
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) listener();
  }
}

export const graduationStore = new GraduationStore();
