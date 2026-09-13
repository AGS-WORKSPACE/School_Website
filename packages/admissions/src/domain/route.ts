/**
 * Admission route and requirement configuration domain models (ADM-02).
 *
 * Configurable without code changes across undergraduate, direct entry,
 * foundation/JUPEB, postgraduate, transfer, and international routes.
 */

export type AdmissionRouteCode =
  | "UTME"
  | "DIRECT_ENTRY"
  | "JUPEB_FOUNDATION"
  | "POSTGRADUATE"
  | "TRANSFER"
  | "INTERNATIONAL";

export interface DocumentRequirement {
  id: string;
  code: string;
  name: string;
  description: string;
  category: "Identification" | "Academic Qualification" | "Reference" | "Medical" | "Other";
  allowedMimeTypes: string[]; // ["application/pdf", "image/jpeg", "image/png"]
  maxSizeBytes: number; // e.g. 5 * 1024 * 1024
  mandatory: boolean;
}

export interface QualificationRequirement {
  level: "O_LEVEL" | "A_LEVEL" | "ND" | "HND" | "BACHELORS" | "MASTERS";
  minimumCredits?: number; // e.g. 5 O-Level credits including English & Math
  requiredSubjects?: string[]; // ["English Language", "Mathematics"]
  minimumClassOfDegree?: "First Class" | "Second Class Upper" | "Second Class Lower" | "Third Class" | "Pass";
}

export interface AdmissionRouteConfig {
  id: string; // "route-utme"
  code: AdmissionRouteCode;
  name: string;
  description: string;
  targetLevel: 100 | 200 | 700 | 800; // 100 for UTME/JUPEB, 200 for DE/Transfer, 700 for PGD/Masters
  applicationFeeNGN: number;
  applicationFeeUSD?: number;
  requiresJambRegNumber: boolean;
  requiresNin: boolean;
  requiresRefereeNominations: boolean;
  minRefereeCount: number;
  maxRefereeCount: number;
  documentRequirements: DocumentRequirement[];
  qualificationRequirements: QualificationRequirement[];
  active: boolean;
}

export interface AdmissionCycle {
  id: string; // "cycle-2026-2027"
  academicSession: string; // "2026/2027"
  name: string;
  applicationOpensAt: string;
  applicationClosesAt: string;
  lateFeeAppliesAt?: string;
  status: "Upcoming" | "Active" | "Closed" | "Archived";
  routes: AdmissionRouteConfig[];
}
