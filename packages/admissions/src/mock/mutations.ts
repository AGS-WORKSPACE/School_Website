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
import { admissionsStore } from "./store";
import { scanForDeduplicationCases } from "../policy/deduplication-engine";
import { reconcilePaymentCallback } from "../policy/payment-reconciler";
import { recordRefereeSubmission, validateRefereeToken } from "../policy/referee-policy";
import { validateAssistedIntakeCapture } from "../policy/assisted-intake-policy";

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
