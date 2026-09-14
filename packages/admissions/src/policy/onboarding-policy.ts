import type { ApplicationCase } from "../domain/application";
import type {
  AcceptanceCharge,
  AdmissionOffer,
  MatriculationAllocation,
  MatriculationScheme,
  OfferTemplate,
  ProvisioningEvent,
} from "../domain/onboarding";

const APPROVED_APPLICATION_STAGES = new Set(["Screening_Passed", "Offer_Recommended"]);
const CAPS_ROUTES = new Set(["UTME", "DIRECT_ENTRY"]);

export function canGenerateOffer(application: ApplicationCase, template: OfferTemplate) {
  const errors: string[] = [];
  if (!APPROVED_APPLICATION_STAGES.has(application.stage)) errors.push("Candidate has not completed approval screening.");
  if (template.status !== "Approved") errors.push("Only an approved offer template may be used.");
  if (!template.routeCodes.includes(application.routeCode)) errors.push("Template is not approved for this admission route.");
  return { allowed: errors.length === 0, errors };
}

export function routeRequiresCaps(routeCode: ApplicationCase["routeCode"]): boolean {
  return CAPS_ROUTES.has(routeCode);
}

export function outstandingAdmissionConditions(offer: AdmissionOffer): string[] {
  return offer.conditions
    .filter((condition) => condition.required && !["Satisfied", "Waived"].includes(condition.status))
    .map((condition) => condition.label);
}

export function evaluateMatriculationEligibility(
  offer: AdmissionOffer,
  charge: AcceptanceCharge | undefined,
  scheme: MatriculationScheme,
  identityVerified: boolean
) {
  const errors: string[] = [];
  if (offer.status !== "Accepted") errors.push("Offer has not been accepted.");
  const conditions = outstandingAdmissionConditions(offer);
  if (conditions.length) errors.push(`Admission conditions outstanding: ${conditions.join(", ")}.`);
  if (scheme.requireCapsApproval && offer.capsRequired && !["Accepted", "Approved"].includes(offer.capsStatus)) {
    errors.push("CAPS acceptance/approval is outstanding.");
  }
  if (scheme.requireAcceptanceCharge && !charge) errors.push("Acceptance charge has not been assessed.");
  if (scheme.requireAcceptanceCharge && charge && !["Reconciled", "Waived", "Sponsored"].includes(charge.status)) {
    errors.push("Acceptance charge is not reconciled or covered by approved relief.");
  }
  if (scheme.requireIdentityVerification && !identityVerified) errors.push("Identity verification is outstanding.");
  return { eligible: errors.length === 0, errors };
}

export function nextMatriculationNumber(
  scheme: MatriculationScheme,
  allocations: MatriculationAllocation[]
): { matriculationNumber: string; nextSequence: number } {
  let sequence = scheme.nextSequence;
  const used = new Set(allocations.map((item) => item.matriculationNumber));
  let candidate = "";
  do {
    candidate = `${scheme.prefix}/${scheme.facultyCode}/${String(sequence).padStart(scheme.sequenceWidth, "0")}`;
    sequence += 1;
  } while (used.has(candidate));
  return { matriculationNumber: candidate, nextSequence: sequence };
}

export function createProvisioningEvent(
  studentId: string,
  existingEvents: ProvisioningEvent[],
  occurredAt = new Date().toISOString()
): ProvisioningEvent {
  const existing = existingEvents.find((event) => event.idempotencyKey === `student-created:${studentId}`);
  if (existing) return existing;
  return {
    id: `evt-${studentId}`,
    idempotencyKey: `student-created:${studentId}`,
    type: "Student_Created",
    studentId,
    occurredAt,
    destinations: (["SIS", "LMS", "Email", "Library"] as const).map((system) => ({
      system,
      status: "Pending",
      attempts: 0,
    })),
  };
}
