/**
 * Controlled mutations for the EP-15 demonstration store.
 */

import type { Assignment, Enrolment, ProgressEntry, Submission } from "@tau/lms/domain";
import type { ReadinessQuestion, ReadinessResult, ReadinessResponse } from "../domain/readiness";
import type { EngagementAlert, EngagementAlertStatus } from "../domain/engagement";
import type { ContactAttempt } from "../domain/caseload";
import type { AssessmentIntegrityConfig, IntegrityControl, AssessmentRiskLevel, IntegrityNotice } from "../domain/integrity";
import type { EvidenceAccessGrant, EvidenceResourceType } from "../domain/accreditation";
import { scoreReadiness } from "../policy/readiness";
import { canDecideAlert, detectEngagementSignals } from "../policy/engagement";
import { canExportCaseload } from "../policy/caseload";
import { canApproveDpia, canConfigureIntegrity, validateIntegrityConfig } from "../policy/integrity";
import { canGrantEvidenceAccess, decideEvidenceAccess } from "../policy/accreditation";
import { odlStore } from "./store";

export interface OdlActor {
  personId: string;
  name: string;
}

export interface MutationResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

export const odlMutations = {
  submitReadinessCheck(studentId: string, offeringId: string, responses: ReadinessResponse[], questions: ReadinessQuestion[]): MutationResult<ReadinessResult> {
    const { gaps, readinessScore } = scoreReadiness(questions, responses);
    const result: ReadinessResult = { id: `ready-${studentId}-${Date.now()}`, studentId, offeringId, responses, gaps, readinessScore, completedAt: new Date().toISOString() };
    odlStore.update((draft) => {
      draft.readinessResults = draft.readinessResults.filter((item) => !(item.studentId === studentId && item.offeringId === offeringId));
      draft.readinessResults.push(result);
    });
    // Advisory only: nothing above blocks or reviews the learner's admission or registration.
    return { ok: true, data: result };
  },

  raiseEngagementAlerts(input: { offeringId: string; enrolments: Enrolment[]; progress: ProgressEntry[]; assignments: Assignment[]; submissions: Submission[]; now: string; routeTo: { personId: string; name: string } }): MutationResult<number> {
    let raised = 0;
    odlStore.update((draft) => {
      for (const enrolment of input.enrolments.filter((item) => item.offeringId === input.offeringId)) {
        const signals = detectEngagementSignals({ enrolment, now: input.now, progress: input.progress, assignments: input.assignments, submissions: input.submissions });
        for (const signal of signals) {
          const alreadyOpen = draft.engagementAlerts.some((alert) => alert.studentId === enrolment.studentId && alert.offeringId === input.offeringId && alert.ruleId === signal.ruleId && alert.status !== "Resolved");
          if (alreadyOpen) continue;
          draft.engagementAlerts.push({
            id: `alert-${enrolment.studentId}-${signal.ruleId}-${Date.now()}`,
            offeringId: input.offeringId,
            studentId: enrolment.studentId,
            studentName: enrolment.studentName,
            ruleId: signal.ruleId,
            triggerExplanation: signal.triggerExplanation,
            raisedAt: input.now,
            routedToPersonId: input.routeTo.personId,
            routedToName: input.routeTo.name,
            status: "Open",
          });
          raised++;
        }
      }
    });
    return { ok: true, data: raised };
  },

  decideAlert(alertId: string, next: "Contacted" | "Resolved", note: string, actor: OdlActor, permissions: string[]): MutationResult<EngagementAlert> {
    if (!permissions.includes("lms:engagement:respond")) return { ok: false, error: "Your role does not include responding to engagement alerts." };
    const alert = odlStore.getSnapshot().engagementAlerts.find((item) => item.id === alertId);
    if (!alert) return { ok: false, error: "Alert not found." };
    if (!canDecideAlert(alert.status, next)) return { ok: false, error: `A ${alert.status} alert cannot move to ${next}.` };
    if (next === "Resolved" && !note.trim()) return { ok: false, error: "Record how this was resolved before closing the alert." };
    let updated: EngagementAlert | undefined;
    odlStore.update((draft) => {
      const item = draft.engagementAlerts.find((a) => a.id === alertId);
      if (!item) return;
      item.status = next;
      item.acknowledgedAt = new Date().toISOString();
      item.acknowledgedBy = actor.name;
      if (next === "Resolved") item.resolutionNote = note.trim();
      updated = structuredClone(item);
    });
    return updated ? { ok: true, data: updated } : { ok: false, error: "Alert could not be updated." };
  },

  logContactAttempt(input: Omit<ContactAttempt, "id">): MutationResult<ContactAttempt> {
    const attempt: ContactAttempt = { ...input, id: `contact-${Date.now()}` };
    odlStore.update((draft) => draft.contactAttempts.push(attempt));
    return { ok: true, data: attempt };
  },

  exportCaseload(tutorId: string, tutorName: string, studentCount: number, reason: string, permissions: string[]): MutationResult {
    if (!canExportCaseload(permissions)) return { ok: false, error: "Your role does not include exporting a caseload." };
    if (!reason.trim()) return { ok: false, error: "Record why this export is needed." };
    odlStore.update((draft) => draft.caseloadExports.push({ id: `export-${Date.now()}`, tutorId, tutorName, exportedAt: new Date().toISOString(), studentCount, reason: reason.trim() }));
    return { ok: true };
  },

  configureIntegrity(input: { assignmentId: string; offeringId: string; riskLevel: AssessmentRiskLevel; controls: IntegrityControl[] }, actor: OdlActor, permissions: string[]): MutationResult<AssessmentIntegrityConfig> {
    if (!canConfigureIntegrity(permissions)) return { ok: false, error: "Your role does not include configuring assessment integrity controls." };
    const validation = validateIntegrityConfig({ riskLevel: input.riskLevel, controls: input.controls, status: "Draft" });
    if (!validation.ok) return { ok: false, error: validation.error };
    const config: AssessmentIntegrityConfig = { id: `integrity-${input.assignmentId}-${Date.now()}`, assignmentId: input.assignmentId, offeringId: input.offeringId, riskLevel: input.riskLevel, controls: input.controls, status: "Draft", configuredBy: actor.personId, configuredByName: actor.name, configuredAt: new Date().toISOString() };
    odlStore.update((draft) => draft.integrityConfigs.push(config));
    return { ok: true, data: config };
  },

  approveDpia(configId: string, actor: OdlActor, permissions: string[]): MutationResult<AssessmentIntegrityConfig> {
    if (!canApproveDpia(permissions)) return { ok: false, error: "Your role does not include DPIA approval." };
    let updated: AssessmentIntegrityConfig | undefined;
    odlStore.update((draft) => {
      const config = draft.integrityConfigs.find((item) => item.id === configId);
      if (!config) return;
      config.dpiaApprovedBy = actor.personId;
      config.dpiaApprovedByName = actor.name;
      config.dpiaApprovedAt = new Date().toISOString();
      updated = structuredClone(config);
    });
    return updated ? { ok: true, data: updated } : { ok: false, error: "Integrity configuration not found." };
  },

  activateIntegrityConfig(configId: string, permissions: string[]): MutationResult<AssessmentIntegrityConfig> {
    if (!canConfigureIntegrity(permissions)) return { ok: false, error: "Your role does not include activating assessment integrity controls." };
    const config = odlStore.getSnapshot().integrityConfigs.find((item) => item.id === configId);
    if (!config) return { ok: false, error: "Integrity configuration not found." };
    const validation = validateIntegrityConfig({ ...config, status: "Active" });
    if (!validation.ok) return { ok: false, error: validation.error };
    let updated: AssessmentIntegrityConfig | undefined;
    odlStore.update((draft) => {
      const item = draft.integrityConfigs.find((c) => c.id === configId);
      if (!item) return;
      item.status = "Active";
      updated = structuredClone(item);
    });
    return updated ? { ok: true, data: updated } : { ok: false, error: "Integrity configuration could not be activated." };
  },

  sendIntegrityNotice(input: Omit<IntegrityNotice, "id" | "sentAt">): MutationResult<IntegrityNotice> {
    const notice: IntegrityNotice = { ...input, id: `notice-${Date.now()}`, sentAt: new Date().toISOString() };
    odlStore.update((draft) => draft.integrityNotices.push(notice));
    return { ok: true, data: notice };
  },

  grantEvidenceAccess(input: Omit<EvidenceAccessGrant, "id" | "grantedAt">, permissions: string[]): MutationResult<EvidenceAccessGrant> {
    if (!canGrantEvidenceAccess(permissions)) return { ok: false, error: "Your role does not include granting accreditation evidence access." };
    if (input.includesPrivateCommunications && !input.justification?.trim()) return { ok: false, error: "Including private communications needs a recorded justification." };
    const grant: EvidenceAccessGrant = { ...input, id: `evidence-${Date.now()}`, grantedAt: new Date().toISOString() };
    odlStore.update((draft) => draft.evidenceGrants.push(grant));
    return { ok: true, data: grant };
  },

  revokeEvidenceAccess(grantId: string, actor: OdlActor, permissions: string[]): MutationResult {
    if (!canGrantEvidenceAccess(permissions)) return { ok: false, error: "Your role does not include revoking accreditation evidence access." };
    odlStore.update((draft) => {
      const grant = draft.evidenceGrants.find((item) => item.id === grantId);
      if (grant) { grant.revokedAt = new Date().toISOString(); grant.revokedBy = actor.personId; }
    });
    return { ok: true };
  },

  accessEvidence(grantId: string, offeringId: string, resourceType: EvidenceResourceType, now: string): MutationResult<{ allowed: boolean; reason?: string }> {
    const grant = odlStore.getSnapshot().evidenceGrants.find((item) => item.id === grantId);
    if (!grant) return { ok: false, error: "Grant not found." };
    const decision = decideEvidenceAccess(grant, offeringId, resourceType, now);
    odlStore.update((draft) => draft.evidenceAccessLog.push({ id: `log-${Date.now()}`, grantId, accessedAt: now, resourceType, offeringId, allowed: decision.allowed, reason: decision.reason }));
    return { ok: true, data: decision };
  },
};
