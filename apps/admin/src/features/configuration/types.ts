export type ConfigurationStatus =
  | "Active"
  | "Inactive"
  | "Draft"
  | "In Review"
  | "Approved"
  | "Published"
  | "Superseded"
  | "Archived"
  | "Scheduled";

export interface VersionEntry {
  version: string;
  status: ConfigurationStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  changedAt: string;
  changedBy: string;
  reason: string;
}

export interface OrganisationUnit {
  id: string;
  name: string;
  shortName: string;
  type: string;
  parentId?: string;
  campus: string;
  reportingUnitId?: string;
  head: string;
  email: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: ConfigurationStatus;
  reason: string;
  authority: string;
  notes?: string;
  history: VersionEntry[];
}

export interface AcademicTerm {
  id: string;
  name: string;
  start: string;
  end: string;
  teachingWeeks: number;
  examWeeks: number;
}

export interface AcademicMilestone {
  id: string;
  name: string;
  type: string;
  start: string;
  end?: string;
  audience: string;
  status: ConfigurationStatus;
}

export interface AcademicSession {
  id: string;
  name: string;
  start: string;
  end: string;
  status: ConfigurationStatus;
  version: string;
  terms: AcademicTerm[];
  milestones: AcademicMilestone[];
  variations: { id: string; programme: string; deliveryMode: string; change: string }[];
  lastModified: string;
}

export interface ReferenceValue {
  id: string;
  code: string;
  name: string;
  parent?: string;
  sortOrder: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: ConfigurationStatus;
  usedBy: string[];
}

export interface ReferenceCategory {
  id: string;
  name: string;
  description: string;
  owner: string;
  lastUpdate: string;
  version: string;
  usageCount: number;
  status: ConfigurationStatus;
  values: ReferenceValue[];
}

export type RuleCategory =
  | "Grading"
  | "Credit"
  | "Progression"
  | "Approval"
  | "Degree classification";

export interface PolicyRule {
  id: string;
  name: string;
  category: RuleCategory;
  scope: string;
  version: string;
  effectiveSession: string;
  cohorts: string;
  status: ConfigurationStatus;
  owner: string;
  lastModified: string;
  description: string;
  configuration: Record<string, string | number | boolean>;
  versions: VersionEntry[];
}

export interface ImpactSimulation {
  affectedStudents: number;
  changedStanding: number;
  probation: number;
  eligibleToProgress: number;
  cohorts: string[];
  programmes: string[];
  conflicts: string[];
  missingConfiguration: string[];
}

export type EnvironmentName = "Development" | "Staging" | "Production";

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  owner: string;
  development: boolean;
  staging: boolean;
  production: boolean;
  audience: string;
  lastChanged: string;
  risk: "Low" | "Medium" | "High";
  restrictions: string;
  dependencies: string[];
  schedule?: string;
  history: VersionEntry[];
}

export interface ConfigurationActivity {
  id: string;
  date: string;
  actor: string;
  module: string;
  action: string;
  record: string;
  previous: string;
  next: string;
  reason: string;
  environment: string;
  status: string;
}
