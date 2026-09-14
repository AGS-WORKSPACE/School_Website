import type { AdmissionRouteCode } from "./route";

export type OfferKind = "Conditional" | "Final";
export type OfferStatus = "Issued" | "Accepted" | "Declined" | "Expired" | "Withdrawn";
export type ConditionStatus = "Outstanding" | "Submitted" | "Satisfied" | "Waived" | "Rejected";

export interface OfferCondition {
  id: string;
  code: string;
  label: string;
  description: string;
  required: boolean;
  status: ConditionStatus;
  evidenceDocumentId?: string;
  decidedAt?: string;
  decidedBy?: string;
  exceptionReason?: string;
}

export interface OfferTemplate {
  id: string;
  name: string;
  version: number;
  status: "Draft" | "Approved" | "Retired";
  approvedAt?: string;
  approvedBy?: string;
  routeCodes: AdmissionRouteCode[];
  kind: OfferKind;
  body: string;
  defaultValidityDays: number;
  defaultConditions: Array<Pick<OfferCondition, "code" | "label" | "description" | "required">>;
}

export interface AdmissionOffer {
  id: string;
  applicationId: string;
  applicantId: string;
  applicantName: string;
  applicationNumber: string;
  templateId: string;
  templateVersion: number;
  kind: OfferKind;
  programmeId: string;
  programmeName: string;
  routeCode: AdmissionRouteCode;
  entryLevel: number;
  academicSession: string;
  conditions: OfferCondition[];
  status: OfferStatus;
  issuedAt: string;
  issuedBy: string;
  expiresAt: string;
  verificationCode: string;
  verificationUrl: string;
  acceptedAt?: string;
  declinedAt?: string;
  responseIpAddress?: string;
  capsRequired: boolean;
  capsStatus: "Not_Applicable" | "Pending" | "Accepted" | "Approved" | "Rejected";
  capsCheckedAt?: string;
}

export type ChargeReliefType = "None" | "Waiver" | "Sponsorship" | "Refund";

export interface AcceptanceCharge {
  id: string;
  offerId: string;
  amount: number;
  currency: "NGN" | "USD";
  status: "Assessed" | "Paid_Pending_Reconciliation" | "Reconciled" | "Waived" | "Sponsored" | "Refunded";
  assessedAt: string;
  assessedBy: string;
  dueAt: string;
  reliefType: ChargeReliefType;
  reliefReason?: string;
  reliefApprovedBy?: string;
  paymentReference?: string;
  reconciledAt?: string;
  refundedAt?: string;
}

export interface MatriculationScheme {
  id: string;
  academicSession: string;
  prefix: string;
  facultyCode: string;
  nextSequence: number;
  sequenceWidth: number;
  active: boolean;
  requireAcceptanceCharge: boolean;
  requireIdentityVerification: boolean;
  requireCapsApproval: boolean;
}

export interface MatriculationAllocation {
  id: string;
  studentId?: string;
  offerId: string;
  schemeId: string;
  matriculationNumber: string;
  status: "Reserved" | "Issued" | "Void";
  reservedAt: string;
  reservedBy: string;
  issuedAt?: string;
  issuedBy?: string;
  voidedAt?: string;
  voidedBy?: string;
  voidReason?: string;
}

export type OnboardingTaskType =
  | "Identity_Verification"
  | "Policy_Acknowledgement"
  | "Medical_Form"
  | "Consent_Form"
  | "Orientation"
  | "Account_Activation";

export interface OnboardingTask {
  id: string;
  studentId: string;
  type: OnboardingTaskType;
  title: string;
  required: boolean;
  sensitive: boolean;
  accessRoles: string[];
  status: "Not_Started" | "In_Progress" | "Completed" | "Excepted";
  dueAt?: string;
  completedAt?: string;
  exceptionReason?: string;
  exceptionApprovedBy?: string;
}

export interface StudentRecord {
  id: string;
  personId: string;
  sourceApplicationId: string;
  sourceOfferId: string;
  matriculationNumber: string;
  fullName: string;
  programmeId: string;
  programmeName: string;
  routeCode: AdmissionRouteCode;
  entryLevel: number;
  academicSession: string;
  status: "Provisioning" | "Active" | "Deferred";
  identityVerified: boolean;
  createdAt: string;
}

export interface ProvisioningEvent {
  id: string;
  idempotencyKey: string;
  type: "Student_Created";
  studentId: string;
  occurredAt: string;
  destinations: Array<{
    system: "SIS" | "LMS" | "Email" | "Library";
    status: "Pending" | "Succeeded" | "Failed";
    attempts: number;
    externalAccountId?: string;
    lastAttemptAt?: string;
    error?: string;
  }>;
}

export interface OnboardingAuditEntry {
  id: string;
  entityType: "Offer" | "Condition" | "Charge" | "Matriculation" | "Student" | "Provisioning";
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  timestamp: string;
  detail: string;
}
