import test from "node:test";
import assert from "node:assert/strict";

import type { ApplicationCase } from "../domain/application";
import type { AdmissionRouteConfig, DocumentRequirement } from "../domain/route";
import type { ApplicationFeeInvoice, ProviderCallback } from "../domain/payment";
import type { RefereeRequest, RefereeRecommendationContent } from "../domain/referee";
import {
  evaluateDuplicateMatch,
  canAutoMerge,
  scanForDeduplicationCases,
} from "./deduplication-engine";
import {
  validateUploadedDocument,
  evaluateApplicationCompleteness,
} from "./requirement-validator";
import {
  reconcilePaymentCallback,
  canFinalizePaidSubmission,
} from "./payment-reconciler";
import {
  validateRefereeToken,
  sanitizeRefereeRequestForApplicant,
  recordRefereeSubmission,
} from "./referee-policy";
import {
  validateAssistedIntakeCapture,
  confirmAssistedIntakeByApplicant,
} from "./assisted-intake-policy";

// Mock helper to build a baseline application
function makeSampleApp(overrides: Partial<ApplicationCase> = {}): ApplicationCase {
  return {
    id: "app-test-01",
    applicationNumber: "TAU/2026/UG/0001",
    admissionCycleId: "cycle-2026-2027",
    academicSession: "2026/2027",
    routeCode: "UTME",
    programmeId: "prog-csc",
    programmeName: "B.Sc. Computer Science",
    facultyId: "fac-sci",
    facultyName: "Faculty of Computing",
    departmentId: "dept-csc",
    departmentName: "Computer Science",
    firstChoiceProgramme: "B.Sc. Computer Science",
    stage: "Draft",
    stageHistory: [],
    qualifications: [
      {
        id: "qual-1",
        type: "O_LEVEL_WAEC",
        examYear: 2025,
        examRegistrationNumber: "4102938472",
        gradeScoreSummary: "7 Credits including English (B2) and Math (A1)",
      },
    ],
    documents: [
      {
        id: "doc-1",
        requirementId: "req-olevel",
        requirementCode: "O_LEVEL_RESULT",
        fileName: "waec_result.pdf",
        fileSizeBytes: 1024 * 500,
        mimeType: "application/pdf",
        fileUrl: "/docs/waec.pdf",
        checksumSha256: "sha256-sample-hash-1",
        uploadedAt: "2026-09-01T10:00:00Z",
        securityScan: {
          passed: true,
          scannedAt: "2026-09-01T10:00:01Z",
          scannerEngine: "ClamAV-TAU",
          signatureHash: "sha256-sample-hash-1",
          detectedMimeType: "application/pdf",
          flags: [],
        },
        replacementHistory: [],
      },
    ],
    applicant: {
      id: "usr-01",
      email: "ade.bello@example.com",
      phone: "+2348031234567",
      firstName: "Ade",
      lastName: "Bello",
      dateOfBirth: "2005-04-12",
      gender: "Male",
      nationality: "Nigerian",
      nationalIdNumber: "12345678901",
      jambRegistrationNumber: "202610293847AB",
      verification: {
        emailVerified: true,
        phoneVerified: true,
        verificationMethod: "OTP_SMS",
      },
      createdAt: "2026-09-01T08:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    },
    deadlineTimestamp: "2026-10-31T23:59:59Z",
    lastActiveAt: "2026-09-01T10:00:00Z",
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T10:00:00Z",
    ...overrides,
  };
}

const sampleRoute: AdmissionRouteConfig = {
  id: "route-utme",
  code: "UTME",
  name: "Undergraduate UTME",
  description: "Standard UTME route for 100-level candidates.",
  targetLevel: 100,
  applicationFeeNGN: 15000,
  requiresJambRegNumber: true,
  requiresNin: true,
  requiresRefereeNominations: false,
  minRefereeCount: 0,
  maxRefereeCount: 0,
  documentRequirements: [
    {
      id: "req-olevel",
      code: "O_LEVEL_RESULT",
      name: "O-Level Result Slip",
      description: "WAEC, NECO or NABTEB statement of result.",
      category: "Academic Qualification",
      allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeBytes: 5 * 1024 * 1024,
      mandatory: true,
    },
  ],
  qualificationRequirements: [
    {
      level: "O_LEVEL",
      minimumCredits: 5,
      requiredSubjects: ["English Language", "Mathematics"],
    },
  ],
  active: true,
};

test("ADM-01 & ADM-02: Requirement Validation and Completeness", async (t) => {
  await t.test("calculates completeness percentage when mandatory elements are satisfied", () => {
    const app = makeSampleApp();
    const report = evaluateApplicationCompleteness(app, sampleRoute);
    assert.equal(report.isReadyForSubmission, true);
    assert.equal(report.percentageComplete, 100);
    assert.equal(report.blockingReasons.length, 0);
  });

  await t.test("flags blocking reasons when mandatory documents or NIN/JAMB are missing", () => {
    const incompleteApp = makeSampleApp({
      documents: [], // missing waec result
      applicant: {
        ...makeSampleApp().applicant,
        nationalIdNumber: undefined,
        verification: { emailVerified: false, phoneVerified: false, verificationMethod: "OTP_SMS" },
      },
    });

    const report = evaluateApplicationCompleteness(incompleteApp, sampleRoute);
    assert.equal(report.isReadyForSubmission, false);
    assert.ok(report.blockingReasons.some((r) => r.includes("NIN")));
    assert.ok(report.blockingReasons.some((r) => r.includes("Mandatory document missing")));
    assert.ok(report.blockingReasons.some((r) => r.includes("contact details")));
  });
});

test("ADM-03: Evidence Upload and Security Validation", async (t) => {
  const req: DocumentRequirement = {
    id: "req-doc",
    code: "BIRTH_CERT",
    name: "Birth Certificate",
    description: "National Population Commission certificate",
    category: "Identification",
    allowedMimeTypes: ["application/pdf", "image/jpeg"],
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    mandatory: true,
  };

  await t.test("accepts valid PDF within size bounds", () => {
    const result = validateUploadedDocument(
      { fileName: "birth_cert.pdf", fileSizeBytes: 1024 * 500, mimeType: "application/pdf" },
      req
    );
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  await t.test("rejects files exceeding size threshold", () => {
    const result = validateUploadedDocument(
      { fileName: "birth_cert.pdf", fileSizeBytes: 3 * 1024 * 1024, mimeType: "application/pdf" },
      req
    );
    assert.equal(result.valid, false);
    assert.match(result.errors[0], /exceeds maximum size/);
  });

  await t.test("rejects forbidden MIME types and executable files", () => {
    const result = validateUploadedDocument(
      { fileName: "malicious.exe", fileSizeBytes: 1024, mimeType: "application/x-msdownload" },
      req
    );
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes("Unsupported file type")));
    assert.ok(result.errors.some((e) => e.includes("Executables and executable script files")));
  });
});

test("ADM-04: Assisted Walk-In Intake Policy", async (t) => {
  await t.test("accepts valid assisted intake with recorded officer provenance and applicant consent", () => {
    const res = validateAssistedIntakeCapture({
      assistingOfficerId: "usr-off-01",
      assistingOfficerName: "Mr. Chukwuma Obi",
      campusLocation: "Main Campus Admissions Desk",
      applicantConsent: {
        acknowledgedByApplicant: true,
        consentTimestamp: "2026-09-01T11:00:00Z",
        signatureType: "DIGITAL_ACK",
        consentStatement: "Applicant confirms data captured on their behalf is truthful.",
      },
    });
    assert.equal(res.valid, true);
  });

  await t.test("rejects assisted intake when applicant consent is missing", () => {
    const res = validateAssistedIntakeCapture({
      assistingOfficerId: "usr-off-01",
      assistingOfficerName: "Mr. Chukwuma Obi",
      campusLocation: "Main Campus Admissions Desk",
      applicantConsent: {
        acknowledgedByApplicant: false,
        consentTimestamp: "2026-09-01T11:00:00Z",
        signatureType: "DIGITAL_ACK",
        consentStatement: "",
      },
    });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes("applicant acknowledgement/consent is mandatory")));
  });

  await t.test("records applicant confirmation timestamp", () => {
    const record = confirmAssistedIntakeByApplicant({
      id: "asst-1",
      applicationId: "app-1",
      assistingOfficerId: "usr-off-01",
      assistingOfficerName: "Mr. Chukwuma Obi",
      assistingOfficerEmail: "c.obi@tau.edu.ng",
      campusLocation: "Main Campus Desk",
      intakeChannel: "Walk-In Desk",
      capturedAt: "2026-09-01T11:00:00Z",
      applicantConsent: {
        acknowledgedByApplicant: true,
        consentTimestamp: "2026-09-01T11:00:00Z",
        signatureType: "DIGITAL_ACK",
        consentStatement: "I agree",
      },
      applicantConfirmationStatus: "Pending_Applicant_Confirmation",
    });

    assert.equal(record.applicantConfirmationStatus, "Confirmed_By_Applicant");
    assert.ok(record.confirmedAt);
  });
});

test("ADM-05: Payment Reconciler and Provider Webhook Verification", async (t) => {
  const sampleInvoice: ApplicationFeeInvoice = {
    id: "inv-001",
    applicationId: "app-test-01",
    applicantId: "usr-01",
    routeCode: "UTME",
    amount: 15000,
    currency: "NGN",
    invoiceReference: "TAU-APP-2026-00192",
    issuedAt: "2026-09-01T10:00:00Z",
    status: "Pending",
  };

  const validCallback: ProviderCallback = {
    provider: "Paystack",
    transactionReference: "TAU-APP-2026-00192",
    gatewayReference: "pstk_ref_992104820",
    amountKobo: 1500000, // ₦15,000 in kobo
    currency: "NGN",
    paidAt: "2026-09-01T10:05:00Z",
    signatureHash: "sha512-valid-crypto-signature-hash-value-1234567890",
    rawPayloadSummary: "Successful charge",
  };

  await t.test("verifies valid callback and issues receipt", () => {
    const res = reconcilePaymentCallback(sampleInvoice, validCallback);
    assert.equal(res.verified, true);
    assert.equal(res.status, "Verified");
    assert.match(res.receiptNumber ?? "", /^REC-2026-\d{6}$/);
  });

  await t.test("rejects callback with mismatched reference or amount", () => {
    const badRefCallback: ProviderCallback = {
      ...validCallback,
      transactionReference: "WRONG-REF-999",
    };
    const res1 = reconcilePaymentCallback(sampleInvoice, badRefCallback);
    assert.equal(res1.verified, false);
    assert.match(res1.error ?? "", /mismatch/);

    const badAmountCallback: ProviderCallback = {
      ...validCallback,
      amountKobo: 500000, // only ₦5,000
    };
    const res2 = reconcilePaymentCallback(sampleInvoice, badAmountCallback);
    assert.equal(res2.verified, false);
    assert.match(res2.error ?? "", /Payment amount mismatch/);
  });

  await t.test("enforces idempotency on already verified invoice", () => {
    const verifiedInvoice: ApplicationFeeInvoice = {
      ...sampleInvoice,
      status: "Verified",
      receiptNumber: "REC-2026-888888",
    };
    const res = reconcilePaymentCallback(verifiedInvoice, validCallback);
    assert.equal(res.verified, true);
    assert.equal(res.receiptNumber, "REC-2026-888888");
  });

  await t.test("blocks final submission when payment is unverified", () => {
    const check1 = canFinalizePaidSubmission(sampleInvoice);
    assert.equal(check1.allowed, false);

    const check2 = canFinalizePaidSubmission({
      ...sampleInvoice,
      status: "Verified",
      receiptNumber: "REC-2026-112233",
    });
    assert.equal(check2.allowed, true);
  });
});

test("ADM-06: Deduplication Engine & Invariant Guarantees", async (t) => {
  const primary = makeSampleApp({
    id: "app-primary",
    applicant: {
      ...makeSampleApp().applicant,
      id: "usr-p",
      firstName: "Chinedu",
      lastName: "Okafor",
      dateOfBirth: "2004-11-20",
      jambRegistrationNumber: "2026889900AB",
      nationalIdNumber: "99887766554",
      phone: "+2348011223344",
      email: "chinedu.okafor@example.com",
    },
  });

  await t.test("flags exact JAMB match as high severity duplicate candidate", () => {
    const duplicateCandidate = makeSampleApp({
      id: "app-cand-1",
      applicant: {
        ...makeSampleApp().applicant,
        id: "usr-c1",
        firstName: "Chinedu",
        lastName: "Okafor",
        jambRegistrationNumber: "2026889900AB", // EXACT MATCH
        nationalIdNumber: "11111111111", // Different NIN
      },
    });

    const evalResult = evaluateDuplicateMatch(primary, duplicateCandidate);
    assert.equal(evalResult.isSuspicious, true);
    assert.ok(evalResult.compositeScore >= 45);
    assert.ok(evalResult.factors.some((f) => f.attribute === "JAMB_REG_NUMBER" && f.isExactMatch));
  });

  await t.test("flags exact NIN and Phone match as high severity", () => {
    const duplicateCandidate = makeSampleApp({
      id: "app-cand-2",
      applicant: {
        ...makeSampleApp().applicant,
        id: "usr-c2",
        firstName: "Chinedu",
        lastName: "Okafor",
        nationalIdNumber: "99887766554", // EXACT NIN
        phone: "+2348011223344", // EXACT Phone
        jambRegistrationNumber: "2026999999XY",
      },
    });

    const evalResult = evaluateDuplicateMatch(primary, duplicateCandidate);
    assert.equal(evalResult.isSuspicious, true);
    assert.equal(evalResult.severity, "High");
  });

  await t.test("INVARIANT: auto-merge is strictly rejected by policy even with matches", () => {
    const duplicateCandidate = makeSampleApp({
      id: "app-cand-3",
      applicant: {
        ...makeSampleApp().applicant,
        id: "usr-c3",
        firstName: "Chinedu",
        lastName: "Okafor",
      },
    });

    const evalResult = evaluateDuplicateMatch(primary, duplicateCandidate);
    const autoMergeCheck = canAutoMerge(evalResult.factors);
    assert.equal(autoMergeCheck.allowed, false);
    assert.match(autoMergeCheck.reason, /Policy Invariant|Statutory Violation/);
  });

  await t.test("shared name alone with different DOB gets low score and is not flagged suspicious", () => {
    const unrelatedCandidate = makeSampleApp({
      id: "app-cand-4",
      applicant: {
        ...makeSampleApp().applicant,
        id: "usr-c4",
        firstName: "Chinedu",
        lastName: "Okafor",
        dateOfBirth: "1998-05-15", // Different DOB
        nationalIdNumber: "55555555555",
        jambRegistrationNumber: "2026000000ZZ",
        phone: "+2347099999999",
        email: "different.chinedu@example.com",
      },
    });

    const evalResult = evaluateDuplicateMatch(primary, unrelatedCandidate);
    assert.equal(evalResult.isSuspicious, false);
    assert.equal(evalResult.compositeScore, 10);
  });
});

test("ADM-07: Confidential Referee Policy", async (t) => {
  const sampleRequest: RefereeRequest = {
    id: "ref-001",
    applicationId: "app-test-01",
    applicantId: "usr-01",
    applicantName: "Ade Bello",
    programmeName: "M.Sc. Computer Science",
    refereeName: "Prof. Kayode Alabi",
    refereeEmail: "k.alabi@unilag.edu.ng",
    refereeInstitution: "University of Lagos",
    refereeDesignation: "Professor of Computer Science",
    singleUseToken: "tok-sec-random-9872",
    tokenExpiresAt: "2026-12-31T23:59:59Z",
    status: "Pending",
    requestedAt: "2026-09-01T10:00:00Z",
    accessLogs: [],
  };

  await t.test("validates token when active and unexpired", () => {
    const res = validateRefereeToken(sampleRequest, "tok-sec-random-9872", "2026-09-10T12:00:00Z");
    assert.equal(res.valid, true);
    assert.equal(res.status, "Pending");
  });

  await t.test("rejects invalid token string or expired date", () => {
    const badTokenRes = validateRefereeToken(sampleRequest, "wrong-token");
    assert.equal(badTokenRes.valid, false);

    const expiredRes = validateRefereeToken(sampleRequest, "tok-sec-random-9872", "2027-01-01T00:00:00Z");
    assert.equal(expiredRes.valid, false);
    assert.equal(expiredRes.status, "Expired");
  });

  await t.test("records confidential submission and marks token consumed", () => {
    const content: RefereeRecommendationContent = {
      relationshipToApplicant: "Undergraduate Project Supervisor",
      knownDurationYears: 3,
      academicAbilityRating: "Exceptional (Top 5%)",
      moralCharacterRating: "Exemplary",
      confidentialNarrative: "Candidate possesses extraordinary intellectual depth.",
      recommendationDecision: "Strongly Recommend",
    };

    const submittedRequest = recordRefereeSubmission(
      sampleRequest,
      content,
      "197.210.65.12",
      "Mozilla/5.0"
    );

    assert.equal(submittedRequest.status, "Submitted");
    assert.ok(submittedRequest.submittedAt);
    assert.equal(submittedRequest.submission?.recommendationDecision, "Strongly Recommend");

    // Second use of token is blocked
    const reuseCheck = validateRefereeToken(submittedRequest, "tok-sec-random-9872");
    assert.equal(reuseCheck.valid, false);
    assert.match(reuseCheck.error ?? "", /already been used/);
  });

  await t.test("CONFIDENTIALITY INVARIANT: strips confidential narrative & ratings from applicant view", () => {
    const content: RefereeRecommendationContent = {
      relationshipToApplicant: "Former Employer",
      knownDurationYears: 2,
      academicAbilityRating: "Average",
      moralCharacterRating: "Satisfactory",
      confidentialNarrative: "Confidential remarks about applicant temperament.",
      recommendationDecision: "Recommend with Reservations",
    };

    const submittedRequest = recordRefereeSubmission(
      sampleRequest,
      content,
      "197.210.65.12",
      "Mozilla/5.0"
    );

    const applicantView = sanitizeRefereeRequestForApplicant(submittedRequest);
    assert.equal(applicantView.hasSubmittedContent, true);
    // @ts-expect-error Checking that field is not present
    assert.equal(applicantView.submission, undefined);
    // @ts-expect-error Checking that singleUseToken is not exposed
    assert.equal(applicantView.singleUseToken, undefined);
    assert.equal(applicantView.accessLogs[0].ipAddress, "[REDACTED]");
  });
});
