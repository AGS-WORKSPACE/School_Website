/**
 * The permission vocabulary shared by every module.
 *
 * Permissions are named `module:resource:action` so that a module added later
 * (LMS, bursary) extends the catalogue without renaming anything already
 * granted. Risk class drives MFA and segregation-of-duties handling.
 */

export type PermissionRisk = "low" | "elevated" | "high";

export type PermissionModule =
  | "identity"
  | "admissions"
  | "records"
  | "academics"
  | "finance"
  | "hr"
  | "lms"
  | "content";

export interface PermissionDefinition {
  id: string;
  module: PermissionModule;
  resource: string;
  action: string;
  label: string;
  description: string;
  risk: PermissionRisk;
  /** High-risk permissions may only be exercised in an MFA-satisfied session. */
  requiresMfa: boolean;
  /**
   * The broadest scope this permission may be granted at. Stops a department
   * officer being handed an institution-wide financial permission by accident.
   */
  maxGrantDimension: "institution" | "campus" | "faculty" | "department";
}

export function permissionModuleOf(permissionId: string): string {
  return permissionId.split(":")[0] ?? "";
}
