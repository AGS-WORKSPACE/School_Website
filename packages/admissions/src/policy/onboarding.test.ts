import assert from "node:assert/strict";
import test from "node:test";
import type { ApplicationCase } from "../domain/application";
import type { AcceptanceCharge, AdmissionOffer, MatriculationAllocation, MatriculationScheme, OfferTemplate, ProvisioningEvent } from "../domain/onboarding";
import { canGenerateOffer, createProvisioningEvent, evaluateMatriculationEligibility, nextMatriculationNumber, routeRequiresCaps } from "./onboarding-policy";

const application = { id: "app-1", stage: "Offer_Recommended", routeCode: "UTME" } as ApplicationCase;
const template: OfferTemplate = { id: "tpl-1", name: "Approved UG", version: 1, status: "Approved", routeCodes: ["UTME"], kind: "Conditional", body: "Offer", defaultValidityDays: 14, defaultConditions: [] };

function offer(overrides: Partial<AdmissionOffer> = {}): AdmissionOffer {
  return {
    id: "offer-1", applicationId: "app-1", applicantId: "person-1", applicantName: "Ada Student", applicationNumber: "TAU/1", templateId: "tpl-1", templateVersion: 1, kind: "Conditional", programmeId: "prog-1", programmeName: "B.Sc. Test", routeCode: "UTME", entryLevel: 100, academicSession: "2026/2027", conditions: [], status: "Accepted", issuedAt: "2026-09-01T00:00:00Z", issuedBy: "officer-1", expiresAt: "2026-10-01T00:00:00Z", verificationCode: "VERIFY", verificationUrl: "/verify", capsRequired: true, capsStatus: "Accepted", acceptedAt: "2026-09-02T00:00:00Z", ...overrides,
  };
}

const scheme: MatriculationScheme = { id: "scheme-1", academicSession: "2026/2027", prefix: "TAU/26", facultyCode: "SCI", nextSequence: 1, sequenceWidth: 4, active: true, requireAcceptanceCharge: true, requireIdentityVerification: true, requireCapsApproval: true };
const paidCharge: AcceptanceCharge = { id: "charge-1", offerId: "offer-1", amount: 50_000, currency: "NGN", status: "Reconciled", assessedAt: "2026-09-02T00:00:00Z", assessedBy: "system", dueAt: "2026-09-15T00:00:00Z", reliefType: "None" };

test("offers are generated only for approved candidates using approved route templates", () => {
  assert.equal(canGenerateOffer(application, template).allowed, true);
  assert.equal(canGenerateOffer({ ...application, stage: "Payment_Verified" }, template).allowed, false);
  assert.equal(canGenerateOffer(application, { ...template, status: "Draft" }).allowed, false);
  assert.equal(canGenerateOffer(application, { ...template, routeCodes: ["POSTGRADUATE"] }).allowed, false);
});

test("CAPS applies to UTME and Direct Entry, not postgraduate offers", () => {
  assert.equal(routeRequiresCaps("UTME"), true);
  assert.equal(routeRequiresCaps("DIRECT_ENTRY"), true);
  assert.equal(routeRequiresCaps("POSTGRADUATE"), false);
});

test("payment cannot override outstanding admission conditions", () => {
  const conditional = offer({ conditions: [{ id: "c1", code: "RESULT", label: "Verify result", description: "Verify", required: true, status: "Outstanding" }] });
  const result = evaluateMatriculationEligibility(conditional, paidCharge, scheme, true);
  assert.equal(result.eligible, false);
  assert.match(result.errors.join(" "), /conditions outstanding/i);
});

test("CAPS, charge and identity are independent matriculation gates", () => {
  assert.equal(evaluateMatriculationEligibility(offer({ capsStatus: "Pending" }), paidCharge, scheme, true).eligible, false);
  assert.equal(evaluateMatriculationEligibility(offer(), { ...paidCharge, status: "Paid_Pending_Reconciliation" }, scheme, true).eligible, false);
  assert.equal(evaluateMatriculationEligibility(offer(), paidCharge, scheme, false).eligible, false);
  assert.equal(evaluateMatriculationEligibility(offer(), paidCharge, scheme, true).eligible, true);
});

test("waivers and sponsorships explicitly satisfy the charge gate", () => {
  assert.equal(evaluateMatriculationEligibility(offer(), { ...paidCharge, status: "Waived", reliefType: "Waiver", reliefReason: "Scholarship", reliefApprovedBy: "bursar" }, scheme, true).eligible, true);
  assert.equal(evaluateMatriculationEligibility(offer(), { ...paidCharge, status: "Sponsored", reliefType: "Sponsorship", reliefReason: "Government award", reliefApprovedBy: "bursar" }, scheme, true).eligible, true);
});

test("matriculation allocation skips every prior number including voids", () => {
  const allocations = [
    { matriculationNumber: "TAU/26/SCI/0001", status: "Void" },
    { matriculationNumber: "TAU/26/SCI/0002", status: "Issued" },
  ] as MatriculationAllocation[];
  assert.deepEqual(nextMatriculationNumber(scheme, allocations), { matriculationNumber: "TAU/26/SCI/0003", nextSequence: 4 });
});

test("student-created provisioning events are idempotent", () => {
  const first = createProvisioningEvent("student-1", [], "2026-09-01T00:00:00Z");
  const retry = createProvisioningEvent("student-1", [first] as ProvisioningEvent[], "2026-09-02T00:00:00Z");
  assert.equal(retry, first);
  assert.equal(retry.idempotencyKey, "student-created:student-1");
  assert.deepEqual(retry.destinations.map((item) => item.system), ["SIS", "LMS", "Email", "Library"]);
});
