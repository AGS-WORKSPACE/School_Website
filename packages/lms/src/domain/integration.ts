/**
 * Standards-based learning-tool integrations (LMS-07).
 */

export type IntegrationStandard = "LTI_1.3" | "OneRoster_1.2" | "QTI_3.0";

export type IntegrationEventKind = "Launch" | "Roster_Sync" | "Grade_Return" | "Item_Import";

export interface DataContract {
  fields: string[];
  purpose: string;
  lawfulBasis: string;
  retention: string;
  dataLocation: string;
}

export interface SecurityReview {
  outcome: "Approved" | "Rejected";
  reviewedBy: string;
  reviewedByName: string;
  reviewedAt: string;
  notes: string;
}

export interface Integration {
  id: string;
  name: string;
  vendor: string;
  standard: IntegrationStandard;
  /** 1EdTech conformance certification for the claimed standard, if any. */
  conformanceReference?: string;
  dataContract: DataContract;
  securityReview?: SecurityReview;
  status: "Proposed" | "Active" | "Suspended";
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  activatedAt?: string;
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  kind: IntegrationEventKind;
  ok: boolean;
  at: string;
  error?: string;
}
