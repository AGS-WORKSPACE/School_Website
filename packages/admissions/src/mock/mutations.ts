/**
 * Controlled Admissions Mutations.
 * Enforces business policy invariants, validation, and maker-checker segregation.
 */

import type { ApplicationCase, ApplicationStage } from "../domain/application";
import type { UploadedDocument } from "../domain/evidence";
import type { ApplicationFeeInvoice, ProviderCallback } from "../domain/payment";
import type { RefereeRecommendationContent } from "../domain/referee";
import type { DiscrepancyStatus } from "../domain/deduplication";
import type { AdmissionRouteConfig } from "../domain/route";
import type { CapsCandidateAssociation, CapsImportReport } from "../domain/caps";
import type { EligibilityScoringRule } from "../domain/scoring";
import type { ScreeningAppointment, ScreeningScoreEntry } from "../domain/scheduling";
import type { RecommendationStatus, RankingOverrideAudit } from "../domain/ranking";
import type { AdmissionBatch, AdmissionBatchReview } from "../domain/batch";
import { admissionsStore } from "./store";
import { scanForDeduplicationCases } from "../policy/deduplication-engine";
import { reconcilePaymentCallback } from "../policy/payment-reconciler";
import { recordRefereeSubmission, validateRefereeToken } from "../policy/referee-policy";
import { validateAssistedIntakeCapture } from "../policy/assisted-intake-policy";
import type { AcceptanceCharge, AdmissionOffer, OfferCondition, OnboardingTask } from "../domain/onboarding";
import { canGenerateOffer, createProvisioningEvent, evaluateMatriculationEligibility, nextMatriculationNumber, routeRequiresCaps } from "../policy/onboarding-policy";
import { validateScreeningAppointment } from "../policy/scheduling-policy";
import { validateRankingOverride } from "../policy/ranking-policy";

export interface MutationActor {
  personId: string;
  name: string;
  role: string;
}

export interface MutationResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

export const admissionsMutations = {
  submitAdmissionBatch(batchId: string, actor: MutationActor): MutationResult<AdmissionBatch> {
    const batch = admissionsStore.getSnapshot().admissionBatches.find((item) => item.id === batchId);
    if (!batch) return { ok: false, error: "Admission batch not found." };
    if (batch.preparerId !== actor.personId && batch.status !== "Draft") return { ok: false, error: "Only the named preparer may prepare this batch." };
    if (batch.candidates.some((candidate) => candidate.blocked)) return { ok: false, error: "Blocked candidates must be removed or corrected before review." };
    const updated = { ...batch, status: "Pending_Review" as const, version: batch.version + 1, preparedAt: new Date().toISOString(), capsChecklist: batch.capsChecklist.map((item) => item.id === "capacity-checked" || item.id === "policy-checked" || item.id === "overrides-reviewed" ? item : { ...item, complete: false }) };
    admissionsStore.setState((prev) => ({ ...prev, admissionBatches: prev.admissionBatches.map((item) => item.id === batchId ? updated : item) }));
    return { ok: true, data: updated };
  },

  decideAdmissionBatch(batchId: string, decision: AdmissionBatchReview["decision"], actor: MutationActor, reason?: string, mfaSatisfied = false): MutationResult<AdmissionBatch> {
    const batch = admissionsStore.getSnapshot().admissionBatches.find((item) => item.id === batchId);
    if (!batch) return { ok: false, error: "Admission batch not found." };
    if (batch.preparerId === actor.personId) return { ok: false, error: "The preparer cannot approve or reject their own batch." };
    if (!mfaSatisfied) return { ok: false, error: "MFA is required for batch approval decisions." };
    if (!reason?.trim() && decision !== "Approved") return { ok: false, error: "A reason is required for rejection or correction requests." };
    if (decision === "Approved" && batch.candidates.some((candidate) => candidate.blocked)) return { ok: false, error: "Blocked candidates prevent approval." };
    const review: AdmissionBatchReview = { reviewer: actor.name, reviewedAt: new Date().toISOString(), decision, reason, batchVersion: batch.version };
    const status = decision === "Approved" ? "Frozen" : decision === "Rejected" ? "Rejected" : "Prepared";
    const updated = { ...batch, status: status as AdmissionBatch["status"], review, ...(decision === "Approved" ? { frozenAt: review.reviewedAt, frozenBy: actor.name, capsChecklist: batch.capsChecklist.map((item) => item.id === "batch-approved" || item.id === "approval-recorded" ? { ...item, complete: true } : item) } : {}) };
    admissionsStore.setState((prev) => ({ ...prev, admissionBatches: prev.admissionBatches.map((item) => item.id === batchId ? updated : item) }));
    return { ok: true, data: updated };
  },
  recordRankingOverride(input: { rankedCandidateId: string; overriddenResult: RecommendationStatus; reason: string; authority: string; actor: string }): MutationResult<RankingOverrideAudit> {
    const candidate = admissionsStore.getSnapshot().rankedCandidates.find((item) => item.id === input.rankedCandidateId);
    if (!candidate) return { ok: false, error: "Ranked candidate not found." };
    const validation = validateRankingOverride({ originalResult: candidate.recommendationStatus, overriddenResult: input.overriddenResult, reason: input.reason, authority: input.authority });
    if (!validation.valid) return { ok: false, error: validation.errors.join(" ") };
    if (input.overriddenResult === "Recommended" && (candidate.eligibility !== "Eligible" || candidate.score === null || candidate.tieStatus === "Tied")) return { ok: false, error: "A blocked, ineligible, unscored, or unresolved-tie candidate cannot be recommended." };
    if (input.overriddenResult === "Recommended") {
      const summary = admissionsStore.getSnapshot().rankedCandidates.filter((item) => item.programmeId === candidate.programmeId && item.recommendationStatus === "Recommended");
      const quota = admissionsStore.getSnapshot().approvedAdmissionQuotas.find((item) => item.type === "Programme" && item.programmeId === candidate.programmeId);
      if (quota && summary.length >= quota.limit) return { ok: false, error: "Override cannot exceed the approved programme capacity." };
    }
    const audit: RankingOverrideAudit = { id: `ranking-override-${Date.now()}`, rankedCandidateId: candidate.id, originalResult: candidate.recommendationStatus, overriddenResult: input.overriddenResult, reason: input.reason, authority: input.authority, timestamp: new Date().toISOString(), actor: input.actor, status: "Recorded_Frontend_Only" };
    admissionsStore.setState((prev) => ({ ...prev, rankedCandidates: prev.rankedCandidates.map((item) => item.id === candidate.id ? { ...item, recommendationStatus: input.overriddenResult } : item), rankingOverrideAudits: [audit, ...prev.rankingOverrideAudits] }));
    return { ok: true, data: audit };
  },
  scheduleScreeningAppointment(appointment: ScreeningAppointment): MutationResult<ScreeningAppointment> {
    const state = admissionsStore.getSnapshot();
    const validation = validateScreeningAppointment(appointment, state.screeningAppointments);
    if (!validation.valid) return { ok: false, error: validation.conflicts.map((item) => item.message).join(" ") };
    admissionsStore.setState((prev) => ({ ...prev, screeningAppointments: [appointment, ...prev.screeningAppointments.filter((item) => item.id !== appointment.id)] }));
    return { ok: true, data: appointment };
  },

  recordScreeningAttendance(appointmentId: string, status: Extract<ScreeningAppointment["status"], "Attended" | "Absent" | "Rescheduled">, actor: MutationActor, note?: string): MutationResult<ScreeningAppointment> {
    const appointment = admissionsStore.getSnapshot().screeningAppointments.find((item) => item.id === appointmentId);
    if (!appointment) return { ok: false, error: "Screening appointment not found." };
    const updated = { ...appointment, status, attendanceAt: new Date().toISOString(), attendanceNote: note ? `${actor.name}: ${note}` : `Recorded by ${actor.name}.` };
    admissionsStore.setState((prev) => ({ ...prev, screeningAppointments: prev.screeningAppointments.map((item) => item.id === appointmentId ? updated : item) }));
    return { ok: true, data: updated };
  },

  recordScreeningScore(entry: Omit<ScreeningScoreEntry, "recordedAt">): MutationResult<ScreeningScoreEntry> {
    if (entry.score < 0 || entry.score > entry.maximum) return { ok: false, error: `Score must be between 0 and ${entry.maximum}.` };
    if (!admissionsStore.getSnapshot().screeningRecords.some((item) => item.id === entry.screeningRecordId)) return { ok: false, error: "Screening record not found." };
    const recorded: ScreeningScoreEntry = { ...entry, recordedAt: new Date().toISOString() };
    admissionsStore.setState((prev) => {
      const existing = prev.screeningScoreEntries.filter((item) => !(item.screeningRecordId === entry.screeningRecordId && item.criterion === entry.criterion));
      const record = prev.screeningRecords.find((item) => item.id === entry.screeningRecordId);
      if (!record) return prev;
      const scores = [...record.scores.filter((item) => item.criterion !== entry.criterion), { criterion: entry.criterion, score: entry.score, maximum: entry.maximum, source: entry.source }];
      return { ...prev, screeningScoreEntries: [recorded, ...existing], screeningRecords: prev.screeningRecords.map((item) => item.id === entry.screeningRecordId ? { ...item, scores, score: scores.reduce((sum, item) => sum + item.score, 0) } : item) };
    });
    return { ok: true, data: recorded };
  },
  createScoringRuleVersion(ruleId: string): MutationResult<EligibilityScoringRule> {
    const rule = admissionsStore.getSnapshot().scoringRules.find((item) => item.id === ruleId);
    if (!rule) return { ok: false, error: "Scoring rule not found." };
    const draft: EligibilityScoringRule = {
      ...structuredClone(rule),
      version: `${rule.version}-draft`,
      status: "Draft",
      approvalStatus: "Pending",
      effectiveDate: "2026-10-01",
      versions: [{ version: `${rule.version}-draft`, status: "Draft", effectiveDate: "2026-10-01", changedAt: new Date().toISOString(), changedBy: "Current admissions officer", reason: "Created as a separate editable version." }, ...structuredClone(rule.versions)],
    };
    admissionsStore.setState((prev) => ({ ...prev, scoringRules: prev.scoringRules.map((item) => item.id === ruleId ? draft : item) }));
    return { ok: true, data: draft };
  },
  saveCapsImportReport(report: CapsImportReport): MutationResult<CapsImportReport> {
    admissionsStore.setState((prev) => ({ ...prev, capsImportReports: [report, ...prev.capsImportReports] }));
    return { ok: true, data: report };
  },

  associateCapsRecord(input: Omit<CapsCandidateAssociation, "id" | "associatedAt">): MutationResult<CapsCandidateAssociation> {
    if (input.status === "Blocked" || input.discrepancyStatus === "Blocked") return { ok: false, error: "This CAPS record has a blocking discrepancy and cannot be associated." };
    const association: CapsCandidateAssociation = { ...input, id: `caps-association-${Date.now()}`, associatedAt: new Date().toISOString() };
    admissionsStore.setState((prev) => ({
      ...prev,
      capsAssociations: [association, ...prev.capsAssociations.filter((item) => item.importRecordId !== input.importRecordId)],
      capsImportReports: prev.capsImportReports.map((report) => ({
        ...report,
        records: report.records.map((record) => record.id === input.importRecordId ? { ...record, associationStatus: "Associated" } : record),
      })),
    }));
    return { ok: true, data: association };
  },
  /**
   * Saves or updates an applicant's draft application.
   */
  saveDraftApplication(
    application: Partial<ApplicationCase> & { id: string },
    actor: MutationActor
  ): MutationResult<ApplicationCase> {
    const state = admissionsStore.getSnapshot();
    const existingIndex = state.applications.findIndex((a) => a.id === application.id);

    const now = new Date().toISOString();
    let updatedApp: ApplicationCase;

    if (existingIndex >= 0) {
      const existing = state.applications[existingIndex];
      updatedApp = {
        ...existing,
        ...application,
        applicant: {
          ...existing.applicant,
          ...(application.applicant ?? {}),
          verification: {
            ...existing.applicant.verification,
            ...(application.applicant?.verification ?? {}),
          },
          updatedAt: now,
        },
        updatedAt: now,
        lastActiveAt: now,
      } as ApplicationCase;

      admissionsStore.setState((prev) => {
        const next = [...prev.applications];
        next[existingIndex] = updatedApp;
        return { ...prev, applications: next };
      });
    } else {
      updatedApp = {
        id: application.id,
        applicationNumber: `TAU/${new Date().getFullYear()}/${application.routeCode ?? "UG"}/${Math.floor(
          1000 + Math.random() * 9000
        )}`,
        applicant: application.applicant!,
        admissionCycleId: application.admissionCycleId ?? "cycle-2026-2027",
        academicSession: application.academicSession ?? "2026/2027",
        routeCode: application.routeCode ?? "UTME",
        programmeId: application.programmeId ?? "prog-csc",
        programmeName: application.programmeName ?? "B.Sc. Computer Science",
        facultyId: application.facultyId ?? "fac-sci",
        facultyName: application.facultyName ?? "Faculty of Computing and Applied Sciences",
        departmentId: application.departmentId ?? "dept-csc",
        departmentName: application.departmentName ?? "Department of Computer Science",
        firstChoiceProgramme: application.firstChoiceProgramme ?? "B.Sc. Computer Science",
        stage: "Draft",
        stageHistory: [
          {
            id: `log-${Date.now()}`,
            newStage: "Draft",
            timestamp: now,
            actorId: actor.personId,
            actorName: actor.name,
            actorRole: actor.role,
            remarks: "Draft application created.",
          },
        ],
        qualifications: application.qualifications ?? [],
        documents: application.documents ?? [],
        deadlineTimestamp: application.deadlineTimestamp ?? "2026-10-31T23:59:59Z",
        lastActiveAt: now,
        createdAt: now,
        updatedAt: now,
      };

      // Check for deduplication flags
      const newDups = scanForDeduplicationCases(updatedApp, state.applications);

      admissionsStore.setState((prev) => ({
        ...prev,
        applications: [updatedApp, ...prev.applications],
        deduplicationCases: [...newDups, ...prev.deduplicationCases],
      }));
    }

    return { ok: true, data: updatedApp };
  },

  /**
   * Finalizes submission and generates an application fee invoice.
   */
  submitApplication(applicationId: string, actor: MutationActor): MutationResult<ApplicationCase> {
    const state = admissionsStore.getSnapshot();
    const app = state.applications.find((a) => a.id === applicationId);
    if (!app) return { ok: false, error: "Application not found." };

    const route = state.routes.find((r) => r.code === app.routeCode) ?? state.routes[0];
    const now = new Date().toISOString();

    const invoice: ApplicationFeeInvoice = {
      id: `inv-${Date.now()}`,
      applicationId: app.id,
      applicantId: app.applicant.id,
      routeCode: app.routeCode,
      amount: route.applicationFeeNGN,
      currency: "NGN",
      invoiceReference: `TAU-APP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      issuedAt: now,
      status: "Pending",
    };

    const updatedApp: ApplicationCase = {
      ...app,
      stage: "Submitted_Pending_Payment",
      invoice,
      submittedAt: now,
      updatedAt: now,
      stageHistory: [
        ...app.stageHistory,
        {
          id: `log-${Date.now()}`,
          previousStage: app.stage,
          newStage: "Submitted_Pending_Payment",
          timestamp: now,
          actorId: actor.personId,
          actorName: actor.name,
          actorRole: actor.role,
          remarks: "Online application submitted. Invoice generated for fee payment.",
        },
      ],
    };

    // Scan for duplicate cases upon submission
    const duplicateCases = scanForDeduplicationCases(updatedApp, state.applications);

    admissionsStore.setState((prev) => ({
      ...prev,
      applications: prev.applications.map((a) => (a.id === applicationId ? updatedApp : a)),
      deduplicationCases: [...duplicateCases, ...prev.deduplicationCases],
    }));

    return { ok: true, data: updatedApp };
  },

  /**
   * Captures an assisted walk-in application by an admissions desk officer.
   */
  captureAssistedIntake(
    application: ApplicationCase,
    actor: MutationActor
  ): MutationResult<ApplicationCase> {
    const state = admissionsStore.getSnapshot();
    const now = new Date().toISOString();

    if (!application.assistedIntake) {
      return { ok: false, error: "Assisted intake metadata is missing." };
    }

    const validation = validateAssistedIntakeCapture(application.assistedIntake);
    if (!validation.valid) {
      return { ok: false, error: validation.errors.join(" ") };
    }

    const newApp: ApplicationCase = {
      ...application,
      stage: "Payment_Verified",
      stageHistory: [
        {
          id: `log-${Date.now()}`,
          newStage: "Payment_Verified",
          timestamp: now,
          actorId: actor.personId,
          actorName: actor.name,
          actorRole: actor.role,
          remarks: `Assisted walk-in capture completed by ${actor.name} (${actor.role}). Applicant acknowledged consent.`,
        },
      ],
      createdAt: now,
      updatedAt: now,
      submittedAt: now,
    };

    const duplicateCases = scanForDeduplicationCases(newApp, state.applications);

    admissionsStore.setState((prev) => ({
      ...prev,
      applications: [newApp, ...prev.applications],
      deduplicationCases: [...duplicateCases, ...prev.deduplicationCases],
    }));

    return { ok: true, data: newApp };
  },

  /**
   * Simulates/processes a verified payment provider callback (webhook).
   */
  processPaymentWebhook(
    applicationId: string,
    callback: ProviderCallback
  ): MutationResult<ApplicationCase> {
    const state = admissionsStore.getSnapshot();
    const app = state.applications.find((a) => a.id === applicationId);
    if (!app || !app.invoice) {
      return { ok: false, error: "Application or fee invoice not found." };
    }

    const recResult = reconcilePaymentCallback(app.invoice, callback);
    if (!recResult.verified) {
      return { ok: false, error: recResult.error };
    }

    const now = new Date().toISOString();
    const updatedInvoice: ApplicationFeeInvoice = {
      ...app.invoice,
      status: "Verified",
      verifiedAt: now,
      receiptNumber: recResult.receiptNumber,
      verifiedCallback: callback,
      paymentMethod: `Online (${callback.provider})`,
    };

    const updatedApp: ApplicationCase = {
      ...app,
      stage: "Payment_Verified",
      invoice: updatedInvoice,
      updatedAt: now,
      stageHistory: [
        ...app.stageHistory,
        {
          id: `log-${Date.now()}`,
          previousStage: app.stage,
          newStage: "Payment_Verified",
          timestamp: now,
          actorId: `gateway-${callback.provider.toLowerCase()}`,
          actorName: `${callback.provider} Webhook`,
          actorRole: "Payment_Gateway",
          remarks: `Payment of ₦${(callback.amountKobo / 100).toLocaleString()} verified. Receipt #${recResult.receiptNumber} issued.`,
        },
      ],
    };

    admissionsStore.setState((prev) => ({
      ...prev,
      applications: prev.applications.map((a) => (a.id === applicationId ? updatedApp : a)),
    }));

    return { ok: true, data: updatedApp };
  },

  /**
   * Submits a confidential referee recommendation using a single-use token.
   */
  submitRefereeRecommendation(
    token: string,
    content: RefereeRecommendationContent,
    ipAddress: string = "127.0.0.1",
    userAgent: string = "Browser"
  ): MutationResult<void> {
    const state = admissionsStore.getSnapshot();
    const refReq = state.refereeRequests.find((r) => r.singleUseToken === token);
    if (!refReq) {
      return { ok: false, error: "Invalid referee recommendation token." };
    }

    const tokenCheck = validateRefereeToken(refReq, token);
    if (!tokenCheck.valid) {
      return { ok: false, error: tokenCheck.error };
    }

    const submitted = recordRefereeSubmission(refReq, content, ipAddress, userAgent);

    admissionsStore.setState((prev) => ({
      ...prev,
      refereeRequests: prev.refereeRequests.map((r) => (r.id === refReq.id ? submitted : r)),
      applications: prev.applications.map((app) => {
        if (app.id === refReq.applicationId && app.refereeRequests) {
          return {
            ...app,
            refereeRequests: app.refereeRequests.map((r) => (r.id === refReq.id ? submitted : r)),
          };
        }
        return app;
      }),
    }));

    return { ok: true };
  },

  /**
   * Resolves a deduplication / identity discrepancy case (Strict human adjudication).
   */
  resolveDeduplicationCase(
    caseId: string,
    resolution: DiscrepancyStatus,
    investigationNotes: string,
    actor: MutationActor
  ): MutationResult<void> {
    const state = admissionsStore.getSnapshot();
    const dupCase = state.deduplicationCases.find((c) => c.id === caseId);
    if (!dupCase) return { ok: false, error: "Deduplication case not found." };

    const now = new Date().toISOString();

    const updatedCase = {
      ...dupCase,
      status: resolution,
      investigationNotes,
      resolvedAt: now,
      resolvedBy: {
        personId: actor.personId,
        name: actor.name,
        role: actor.role,
      },
      resolutionSummary: `Resolved as '${resolution.replace(/_/g, " ")}' by ${actor.name} (${actor.role}).`,
    };

    admissionsStore.setState((prev) => ({
      ...prev,
      deduplicationCases: prev.deduplicationCases.map((c) => (c.id === caseId ? updatedCase : c)),
    }));

    return { ok: true };
  },

  generateOffer(applicationId: string, templateId: string, actor: MutationActor): MutationResult<AdmissionOffer> {
    const state = admissionsStore.getSnapshot();
    const application = state.applications.find((item) => item.id === applicationId);
    const template = state.offerTemplates.find((item) => item.id === templateId);
    if (!application || !template) return { ok: false, error: "Application or offer template not found." };
    if (state.offers.some((item) => item.applicationId === applicationId && item.status !== "Withdrawn")) {
      return { ok: false, error: "An active offer already exists for this application." };
    }
    const decision = canGenerateOffer(application, template);
    if (!decision.allowed) return { ok: false, error: decision.errors.join(" ") };
    const now = new Date();
    const code = `TAU-OFR-${now.getUTCFullYear().toString().slice(-2)}-${application.applicationNumber.split("/").at(-1)}-VF`;
    const offer: AdmissionOffer = {
      id: `offer-${application.id}-${Date.now()}`,
      applicationId: application.id,
      applicantId: application.applicant.id,
      applicantName: [application.applicant.firstName, application.applicant.middleName, application.applicant.lastName].filter(Boolean).join(" "),
      applicationNumber: application.applicationNumber,
      templateId: template.id,
      templateVersion: template.version,
      kind: template.kind,
      programmeId: application.programmeId,
      programmeName: application.programmeName,
      routeCode: application.routeCode,
      entryLevel: state.routes.find((route) => route.code === application.routeCode)?.targetLevel ?? 100,
      academicSession: application.academicSession,
      conditions: template.defaultConditions.map((condition, index) => ({ ...condition, id: `cond-${application.id}-${index + 1}`, status: "Outstanding" })),
      status: "Issued",
      issuedAt: now.toISOString(),
      issuedBy: actor.personId,
      expiresAt: new Date(now.getTime() + template.defaultValidityDays * 86_400_000).toISOString(),
      verificationCode: code,
      verificationUrl: `/admissions/offer/${code}`,
      capsRequired: routeRequiresCaps(application.routeCode),
      capsStatus: routeRequiresCaps(application.routeCode) ? "Pending" : "Not_Applicable",
    };
    admissionsStore.setState((prev) => ({
      ...prev,
      offers: [offer, ...prev.offers],
      applications: prev.applications.map((item) => item.id === applicationId ? { ...item, stage: "Offer_Issued", updatedAt: now.toISOString(), stageHistory: [...item.stageHistory, { id: `log-offer-${Date.now()}`, previousStage: item.stage, newStage: "Offer_Issued", timestamp: now.toISOString(), actorId: actor.personId, actorName: actor.name, actorRole: actor.role, remarks: `Generated from approved template ${template.name} v${template.version}.` }] } : item),
      onboardingAudit: [{ id: `audit-${Date.now()}`, entityType: "Offer", entityId: offer.id, action: "OFFER_ISSUED", actorId: actor.personId, actorName: actor.name, timestamp: now.toISOString(), detail: `Issued ${offer.kind.toLowerCase()} offer with verification code ${code}.` }, ...prev.onboardingAudit],
    }));
    return { ok: true, data: offer };
  },

  respondToOffer(verificationCode: string, response: "Accepted" | "Declined", ipAddress = "Browser session"): MutationResult<AdmissionOffer> {
    const state = admissionsStore.getSnapshot();
    const offer = state.offers.find((item) => item.verificationCode === verificationCode);
    if (!offer) return { ok: false, error: "Offer verification code is invalid." };
    if (offer.status !== "Issued") return { ok: false, error: `This offer has already been ${offer.status.toLowerCase()}.` };
    const now = new Date().toISOString();
    if (new Date(offer.expiresAt).getTime() < Date.now()) return { ok: false, error: "This offer has expired." };
    const updated: AdmissionOffer = { ...offer, status: response, responseIpAddress: ipAddress, ...(response === "Accepted" ? { acceptedAt: now } : { declinedAt: now }) };
    admissionsStore.setState((prev) => ({
      ...prev,
      offers: prev.offers.map((item) => item.id === offer.id ? updated : item),
      applications: prev.applications.map((item) => item.id === offer.applicationId ? { ...item, stage: response === "Accepted" ? "Offer_Accepted" : "Withdrawn", updatedAt: now } : item),
      onboardingAudit: [{ id: `audit-${Date.now()}`, entityType: "Offer", entityId: offer.id, action: `OFFER_${response.toUpperCase()}`, actorId: offer.applicantId, actorName: offer.applicantName, timestamp: now, detail: `${response} by candidate; response timestamp retained.` }, ...prev.onboardingAudit],
    }));
    return { ok: true, data: updated };
  },

  decideOfferCondition(offerId: string, conditionId: string, status: "Satisfied" | "Waived" | "Rejected", actor: MutationActor, reason?: string): MutationResult<void> {
    const state = admissionsStore.getSnapshot();
    const offer = state.offers.find((item) => item.id === offerId);
    const condition = offer?.conditions.find((item) => item.id === conditionId);
    if (!offer || !condition) return { ok: false, error: "Offer condition not found." };
    if (status === "Waived" && !reason?.trim()) return { ok: false, error: "A documented reason is required for a condition waiver." };
    const now = new Date().toISOString();
    const update = (item: OfferCondition): OfferCondition => item.id === conditionId ? { ...item, status, decidedAt: now, decidedBy: actor.personId, exceptionReason: status === "Waived" ? reason : undefined } : item;
    admissionsStore.setState((prev) => ({ ...prev, offers: prev.offers.map((item) => item.id === offerId ? { ...item, conditions: item.conditions.map(update) } : item), onboardingAudit: [{ id: `audit-${Date.now()}`, entityType: "Condition", entityId: conditionId, action: `CONDITION_${status.toUpperCase()}`, actorId: actor.personId, actorName: actor.name, timestamp: now, detail: reason || condition.label }, ...prev.onboardingAudit] }));
    return { ok: true };
  },

  recordCapsStatus(offerId: string, status: AdmissionOffer["capsStatus"], actor: MutationActor): MutationResult<void> {
    const state = admissionsStore.getSnapshot();
    const offer = state.offers.find((item) => item.id === offerId);
    if (!offer) return { ok: false, error: "Offer not found." };
    if (!offer.capsRequired) return { ok: false, error: "CAPS does not apply to this admission route." };
    const now = new Date().toISOString();
    admissionsStore.setState((prev) => ({ ...prev, offers: prev.offers.map((item) => item.id === offerId ? { ...item, capsStatus: status, capsCheckedAt: now } : item), onboardingAudit: [{ id: `audit-${Date.now()}`, entityType: "Offer", entityId: offerId, action: "CAPS_STATUS_RECORDED", actorId: actor.personId, actorName: actor.name, timestamp: now, detail: `CAPS status recorded as ${status}.` }, ...prev.onboardingAudit] }));
    return { ok: true };
  },

  assessAcceptanceCharge(offerId: string, amount: number, actor: MutationActor): MutationResult<AcceptanceCharge> {
    const state = admissionsStore.getSnapshot();
    if (!state.offers.some((item) => item.id === offerId)) return { ok: false, error: "Offer not found." };
    const existing = state.acceptanceCharges.find((item) => item.offerId === offerId);
    if (existing) return { ok: true, data: existing };
    if (amount < 0) return { ok: false, error: "Charge amount cannot be negative." };
    const now = new Date();
    const charge: AcceptanceCharge = { id: `charge-${Date.now()}`, offerId, amount, currency: "NGN", status: "Assessed", assessedAt: now.toISOString(), assessedBy: actor.personId, dueAt: new Date(now.getTime() + 14 * 86_400_000).toISOString(), reliefType: "None" };
    admissionsStore.setState((prev) => ({ ...prev, acceptanceCharges: [charge, ...prev.acceptanceCharges] }));
    return { ok: true, data: charge };
  },

  setAcceptanceChargeStatus(chargeId: string, status: "Reconciled" | "Waived" | "Sponsored" | "Refunded", actor: MutationActor, reason?: string): MutationResult<void> {
    if (["Waived", "Sponsored", "Refunded"].includes(status) && !reason?.trim()) return { ok: false, error: `${status} requires a documented reason.` };
    const state = admissionsStore.getSnapshot();
    if (!state.acceptanceCharges.some((item) => item.id === chargeId)) return { ok: false, error: "Acceptance charge not found." };
    const now = new Date().toISOString();
    admissionsStore.setState((prev) => ({ ...prev, acceptanceCharges: prev.acceptanceCharges.map((item) => item.id === chargeId ? { ...item, status, reliefType: status === "Reconciled" ? "None" : status === "Waived" ? "Waiver" : status === "Sponsored" ? "Sponsorship" : "Refund", reliefReason: reason, reliefApprovedBy: status === "Reconciled" ? undefined : actor.personId, reconciledAt: status === "Reconciled" ? now : item.reconciledAt, refundedAt: status === "Refunded" ? now : item.refundedAt } : item), onboardingAudit: [{ id: `audit-${Date.now()}`, entityType: "Charge", entityId: chargeId, action: `CHARGE_${status.toUpperCase()}`, actorId: actor.personId, actorName: actor.name, timestamp: now, detail: reason || "Payment reconciled against provider record." }, ...prev.onboardingAudit] }));
    return { ok: true };
  },

  matriculate(offerId: string, schemeId: string, identityVerified: boolean, actor: MutationActor) {
    const state = admissionsStore.getSnapshot();
    const offer = state.offers.find((item) => item.id === offerId);
    const scheme = state.matriculationSchemes.find((item) => item.id === schemeId && item.active);
    if (!offer || !scheme) return { ok: false, error: "Offer or active matriculation scheme not found." };
    const existingStudent = state.students.find((item) => item.sourceOfferId === offerId);
    if (existingStudent) return { ok: true, data: existingStudent };
    const charge = state.acceptanceCharges.find((item) => item.offerId === offerId);
    const eligibility = evaluateMatriculationEligibility(offer, charge, scheme, identityVerified);
    if (!eligibility.eligible) return { ok: false, error: eligibility.errors.join(" ") };
    const { matriculationNumber, nextSequence } = nextMatriculationNumber(scheme, state.matriculationAllocations);
    const now = new Date().toISOString();
    const studentId = `student-${offer.applicationId.replace("app-", "")}`;
    const student = { id: studentId, personId: offer.applicantId, sourceApplicationId: offer.applicationId, sourceOfferId: offer.id, matriculationNumber, fullName: offer.applicantName, programmeId: offer.programmeId, programmeName: offer.programmeName, routeCode: offer.routeCode, entryLevel: offer.entryLevel, academicSession: offer.academicSession, status: "Provisioning" as const, identityVerified, createdAt: now };
    const event = createProvisioningEvent(studentId, state.provisioningEvents, now);
    admissionsStore.setState((prev) => ({
      ...prev,
      students: [student, ...prev.students],
      matriculationSchemes: prev.matriculationSchemes.map((item) => item.id === schemeId ? { ...item, nextSequence } : item),
      matriculationAllocations: [{ id: `mat-${Date.now()}`, studentId, offerId, schemeId, matriculationNumber, status: "Issued", reservedAt: now, reservedBy: actor.personId, issuedAt: now, issuedBy: actor.personId }, ...prev.matriculationAllocations],
      onboardingTasks: [...createDefaultOnboardingTasks(studentId), ...prev.onboardingTasks],
      provisioningEvents: prev.provisioningEvents.some((item) => item.idempotencyKey === event.idempotencyKey) ? prev.provisioningEvents : [event, ...prev.provisioningEvents],
      onboardingAudit: [
        { id: `audit-student-${Date.now()}`, entityType: "Student", entityId: studentId, action: "STUDENT_CREATED", actorId: actor.personId, actorName: actor.name, timestamp: now, detail: `Created directly from application data; no candidate details were re-keyed.` },
        { id: `audit-mat-${Date.now()}`, entityType: "Matriculation", entityId: matriculationNumber, action: "MATRICULATION_NUMBER_ISSUED", actorId: actor.personId, actorName: actor.name, timestamp: now, detail: `${matriculationNumber} reserved and issued under controlled scheme ${scheme.id}.` },
        ...prev.onboardingAudit,
      ],
    }));
    return { ok: true, data: student };
  },

  retryProvisioning(eventId: string, system: "SIS" | "LMS" | "Email" | "Library"): MutationResult<void> {
    const state = admissionsStore.getSnapshot();
    if (!state.provisioningEvents.some((item) => item.id === eventId)) return { ok: false, error: "Provisioning event not found." };
    const now = new Date().toISOString();
    admissionsStore.setState((prev) => ({ ...prev, provisioningEvents: prev.provisioningEvents.map((event) => event.id === eventId ? { ...event, destinations: event.destinations.map((destination) => destination.system === system ? { ...destination, status: "Succeeded", attempts: destination.attempts + 1, lastAttemptAt: now, externalAccountId: destination.externalAccountId ?? `${system.toLowerCase()}-${event.studentId}`, error: undefined } : destination) } : event) }));
    return { ok: true };
  },

  voidMatriculationAllocation(allocationId: string, reason: string, actor: MutationActor): MutationResult<void> {
    if (!reason.trim()) return { ok: false, error: "A void reason is required." };
    const state = admissionsStore.getSnapshot();
    const allocation = state.matriculationAllocations.find((item) => item.id === allocationId);
    if (!allocation) return { ok: false, error: "Matriculation allocation not found." };
    if (allocation.status === "Void") return { ok: true };
    if (allocation.status === "Issued") return { ok: false, error: "An issued matriculation number cannot be voided from this workflow." };
    const now = new Date().toISOString();
    admissionsStore.setState((prev) => ({
      ...prev,
      matriculationAllocations: prev.matriculationAllocations.map((item) => item.id === allocationId ? { ...item, status: "Void", voidedAt: now, voidedBy: actor.personId, voidReason: reason } : item),
      onboardingAudit: [{ id: `audit-${Date.now()}`, entityType: "Matriculation", entityId: allocationId, action: "MATRICULATION_NUMBER_VOIDED", actorId: actor.personId, actorName: actor.name, timestamp: now, detail: `${allocation.matriculationNumber} permanently retired: ${reason}` }, ...prev.onboardingAudit],
    }));
    return { ok: true };
  },

  exceptOnboardingTask(taskId: string, reason: string, actor: MutationActor): MutationResult<void> {
    if (!reason.trim()) return { ok: false, error: "An exception reason is required." };
    const state = admissionsStore.getSnapshot();
    if (!state.onboardingTasks.some((item) => item.id === taskId)) return { ok: false, error: "Onboarding task not found." };
    admissionsStore.setState((prev) => ({ ...prev, onboardingTasks: prev.onboardingTasks.map((item): OnboardingTask => item.id === taskId ? { ...item, status: "Excepted", exceptionReason: reason, exceptionApprovedBy: actor.personId } : item) }));
    return { ok: true };
  },

  /**
   * Updates route configuration (ADM-02).
   */
  updateRouteConfig(route: AdmissionRouteConfig): MutationResult<void> {
    admissionsStore.setState((prev) => ({
      ...prev,
      routes: prev.routes.map((r) => (r.id === route.id ? route : r)),
    }));
    return { ok: true };
  },
};

function createDefaultOnboardingTasks(studentId: string): OnboardingTask[] {
  const definitions: Array<Pick<OnboardingTask, "type" | "title" | "required" | "sensitive" | "accessRoles">> = [
    { type: "Identity_Verification", title: "Verify identity", required: true, sensitive: true, accessRoles: ["Registry", "Identity_Verification_Officer"] },
    { type: "Policy_Acknowledgement", title: "Acknowledge student policies", required: true, sensitive: false, accessRoles: ["Student", "Registry"] },
    { type: "Medical_Form", title: "Submit confidential medical form", required: true, sensitive: true, accessRoles: ["Student", "Medical_Officer"] },
    { type: "Consent_Form", title: "Complete consent forms", required: true, sensitive: true, accessRoles: ["Student", "Registry"] },
    { type: "Orientation", title: "Attend new-student orientation", required: true, sensitive: false, accessRoles: ["Student", "Student_Affairs"] },
    { type: "Account_Activation", title: "Activate university account", required: true, sensitive: false, accessRoles: ["Student", "ICT"] },
  ];
  return definitions.map((definition, index) => ({ id: `task-${studentId}-${index + 1}`, studentId, status: "Not_Started", ...definition }));
}
