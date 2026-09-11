/**
 * Organisational structure that access is scoped against (IAM-02).
 *
 * Units form a tree so that a grant made at faculty level implicitly covers the
 * departments beneath it. Units are effective-dated: an inactive unit keeps its
 * identifier so historical assignments and audit records stay readable.
 */

export type ScopeDimension =
  | "institution"
  | "campus"
  | "faculty"
  | "department"
  | "programme"
  | "cohort";

export const scopeDimensions: ScopeDimension[] = [
  "institution",
  "campus",
  "faculty",
  "department",
  "programme",
  "cohort",
];

export interface OrgUnit {
  id: string;
  name: string;
  shortName: string;
  dimension: ScopeDimension;
  /** Parent unit, or null for the institution root. */
  parentId: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
}

/**
 * A pointer to one place in the organisation. Every grant carries one, so
 * "Admissions Officer" always means "Admissions Officer *of something*".
 */
export interface Scope {
  dimension: ScopeDimension;
  unitId: string;
}

export function scopeKey(scope: Scope): string {
  return `${scope.dimension}:${scope.unitId}`;
}

export function isSameScope(a: Scope, b: Scope): boolean {
  return scopeKey(a) === scopeKey(b);
}
