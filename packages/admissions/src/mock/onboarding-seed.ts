import type {
  AcceptanceCharge,
  AdmissionOffer,
  MatriculationAllocation,
  MatriculationScheme,
  OfferTemplate,
  OnboardingAuditEntry,
  OnboardingTask,
  ProvisioningEvent,
  StudentRecord,
} from "../domain/onboarding";

export const initialOfferTemplates: OfferTemplate[] = [
  {
    id: "offer-template-ug-2026",
    name: "Undergraduate admission offer",
    version: 3,
    status: "Approved",
    approvedAt: "2026-07-01T09:00:00Z",
    approvedBy: "Senate Admissions Committee",
    routeCodes: ["UTME", "DIRECT_ENTRY", "TRANSFER"],
    kind: "Conditional",
    body: "The University offers the named candidate admission subject to the stated conditions.",
    defaultValidityDays: 21,
    defaultConditions: [
      { code: "CREDENTIALS", label: "Original credential verification", description: "Present original academic credentials for verification.", required: true },
      { code: "IDENTITY", label: "Identity verification", description: "Complete NIN and biometric identity verification.", required: true },
    ],
  },
  {
    id: "offer-template-pg-2026",
    name: "Postgraduate final offer",
    version: 2,
    status: "Approved",
    approvedAt: "2026-07-08T09:00:00Z",
    approvedBy: "School of Postgraduate Studies Board",
    routeCodes: ["POSTGRADUATE"],
    kind: "Final",
    body: "The University offers the named candidate admission to the stated postgraduate programme.",
    defaultValidityDays: 30,
    defaultConditions: [
      { code: "IDENTITY", label: "Identity verification", description: "Complete identity verification before matriculation.", required: true },
    ],
  },
];

export const initialOffers: AdmissionOffer[] = [
  {
    id: "offer-2026-003",
    applicationId: "app-2026-003",
    applicantId: "usr-app-003",
    applicantName: "Emeka Junior Okafor",
    applicationNumber: "TAU/2026/UG/0045",
    templateId: "offer-template-ug-2026",
    templateVersion: 3,
    kind: "Conditional",
    programmeId: "prog-med",
    programmeName: "MBBS Medicine & Surgery",
    routeCode: "UTME",
    entryLevel: 100,
    academicSession: "2026/2027",
    conditions: [
      { id: "cond-003-credentials", code: "CREDENTIALS", label: "Original credential verification", description: "Present original academic credentials for verification.", required: true, status: "Submitted" },
      { id: "cond-003-identity", code: "IDENTITY", label: "Identity verification", description: "Complete NIN and biometric identity verification.", required: true, status: "Outstanding" },
    ],
    status: "Issued",
    issuedAt: "2026-09-01T10:00:00Z",
    issuedBy: "usr-admissions-registrar",
    expiresAt: "2026-09-22T10:00:00Z",
    verificationCode: "TAU-OFR-26-003-VF",
    verificationUrl: "/admissions/offer/TAU-OFR-26-003-VF",
    capsRequired: true,
    capsStatus: "Pending",
  },
  {
    id: "offer-2026-004",
    applicationId: "app-2026-004",
    applicantId: "usr-app-004",
    applicantName: "Fatima Aliyu",
    applicationNumber: "TAU/2026/PG/0002",
    templateId: "offer-template-pg-2026",
    templateVersion: 2,
    kind: "Final",
    programmeId: "prog-csc",
    programmeName: "M.Sc. Computer Science",
    routeCode: "POSTGRADUATE",
    entryLevel: 700,
    academicSession: "2026/2027",
    conditions: [{ id: "cond-004-identity", code: "IDENTITY", label: "Identity verification", description: "Complete identity verification before matriculation.", required: true, status: "Satisfied", decidedAt: "2026-09-04T08:00:00Z", decidedBy: "usr-registry-01" }],
    status: "Accepted",
    issuedAt: "2026-09-01T11:00:00Z",
    issuedBy: "usr-pg-secretary",
    expiresAt: "2026-10-01T11:00:00Z",
    verificationCode: "TAU-OFR-26-004-VF",
    verificationUrl: "/admissions/offer/TAU-OFR-26-004-VF",
    acceptedAt: "2026-09-03T14:12:00Z",
    responseIpAddress: "102.89.22.14",
    capsRequired: false,
    capsStatus: "Not_Applicable",
  },
];

export const initialAcceptanceCharges: AcceptanceCharge[] = [
  { id: "charge-004", offerId: "offer-2026-004", amount: 50000, currency: "NGN", status: "Reconciled", assessedAt: "2026-09-03T14:13:00Z", assessedBy: "system", dueAt: "2026-09-17T23:59:59Z", reliefType: "None", paymentReference: "TAU-ACC-2026-004", reconciledAt: "2026-09-03T14:20:00Z" },
];

export const initialMatriculationSchemes: MatriculationScheme[] = [
  { id: "scheme-2026-sci", academicSession: "2026/2027", prefix: "TAU/26", facultyCode: "SCI", nextSequence: 43, sequenceWidth: 4, active: true, requireAcceptanceCharge: true, requireIdentityVerification: true, requireCapsApproval: true },
];

export const initialMatriculationAllocations: MatriculationAllocation[] = [
  { id: "mat-alloc-004", studentId: "student-2026-004", offerId: "offer-2026-004", schemeId: "scheme-2026-sci", matriculationNumber: "TAU/26/SCI/0042", status: "Issued", reservedAt: "2026-09-04T09:00:00Z", reservedBy: "usr-registry-01", issuedAt: "2026-09-04T09:02:00Z", issuedBy: "usr-registry-01" },
  { id: "mat-alloc-void-041", offerId: "offer-withdrawn-041", schemeId: "scheme-2026-sci", matriculationNumber: "TAU/26/SCI/0041", status: "Void", reservedAt: "2026-09-02T09:00:00Z", reservedBy: "usr-registry-01", voidedAt: "2026-09-02T12:00:00Z", voidedBy: "usr-registry-01", voidReason: "Offer withdrawn after reservation; number permanently retired." },
];

export const initialStudents: StudentRecord[] = [
  { id: "student-2026-004", personId: "usr-app-004", sourceApplicationId: "app-2026-004", sourceOfferId: "offer-2026-004", matriculationNumber: "TAU/26/SCI/0042", fullName: "Fatima Aliyu", programmeId: "prog-csc", programmeName: "M.Sc. Computer Science", routeCode: "POSTGRADUATE", entryLevel: 700, academicSession: "2026/2027", status: "Provisioning", identityVerified: true, createdAt: "2026-09-04T09:02:00Z" },
];

export const initialOnboardingTasks: OnboardingTask[] = [
  { id: "task-004-id", studentId: "student-2026-004", type: "Identity_Verification", title: "Verify identity", required: true, sensitive: true, accessRoles: ["Registry", "Identity_Verification_Officer"], status: "Completed", completedAt: "2026-09-04T08:00:00Z" },
  { id: "task-004-med", studentId: "student-2026-004", type: "Medical_Form", title: "Submit confidential medical form", required: true, sensitive: true, accessRoles: ["Student", "Medical_Officer"], status: "In_Progress", dueAt: "2026-09-25T23:59:59Z" },
  { id: "task-004-consent", studentId: "student-2026-004", type: "Consent_Form", title: "Complete guardian consent", required: false, sensitive: true, accessRoles: ["Student", "Registry"], status: "Excepted", exceptionReason: "Candidate is over 18; guardian consent does not apply.", exceptionApprovedBy: "usr-registry-01" },
  { id: "task-004-policy", studentId: "student-2026-004", type: "Policy_Acknowledgement", title: "Acknowledge student policies", required: true, sensitive: false, accessRoles: ["Student", "Registry"], status: "Not_Started", dueAt: "2026-09-25T23:59:59Z" },
  { id: "task-004-orientation", studentId: "student-2026-004", type: "Orientation", title: "Attend new-student orientation", required: true, sensitive: false, accessRoles: ["Student", "Student_Affairs"], status: "Not_Started", dueAt: "2026-10-02T23:59:59Z" },
  { id: "task-004-account", studentId: "student-2026-004", type: "Account_Activation", title: "Activate university account", required: true, sensitive: false, accessRoles: ["Student", "ICT"], status: "In_Progress" },
];

export const initialProvisioningEvents: ProvisioningEvent[] = [
  { id: "evt-student-2026-004", idempotencyKey: "student-created:student-2026-004", type: "Student_Created", studentId: "student-2026-004", occurredAt: "2026-09-04T09:02:00Z", destinations: [
    { system: "SIS", status: "Succeeded", attempts: 1, externalAccountId: "SIS-2026-004", lastAttemptAt: "2026-09-04T09:02:03Z" },
    { system: "LMS", status: "Succeeded", attempts: 1, externalAccountId: "fatima.aliyu", lastAttemptAt: "2026-09-04T09:02:08Z" },
    { system: "Email", status: "Succeeded", attempts: 1, externalAccountId: "fatima.aliyu@students.tau.edu.ng", lastAttemptAt: "2026-09-04T09:02:10Z" },
    { system: "Library", status: "Pending", attempts: 0 },
  ] },
];

export const initialOnboardingAudit: OnboardingAuditEntry[] = [
  { id: "audit-onb-004", entityType: "Student", entityId: "student-2026-004", action: "STUDENT_CREATED", actorId: "usr-registry-01", actorName: "Mrs. Ada Nwosu", timestamp: "2026-09-04T09:02:00Z", detail: "Student created from accepted offer offer-2026-004 without re-keying." },
  { id: "audit-mat-void-041", entityType: "Matriculation", entityId: "mat-alloc-void-041", action: "MATRICULATION_NUMBER_VOIDED", actorId: "usr-registry-01", actorName: "Mrs. Ada Nwosu", timestamp: "2026-09-02T12:00:00Z", detail: "TAU/26/SCI/0041 voided and permanently retired after offer withdrawal." },
];
