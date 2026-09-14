/**
 * The role catalogue, one role per job rather than one role per office.
 *
 * Note there is no "administrator" role that holds everything. The closest thing
 * is `emergency-platform-administrator`, and it is `breakGlassOnly`: it cannot be
 * assigned, only granted through an approved, expiring break-glass request.
 */

import type { Role } from "../domain/role";

export const roleCatalogue: Role[] = [
  {
    id: "identity-administrator",
    name: "Identity administrator",
    workspace: "identity",
    description:
      "Administers accounts, prepares role assignments and manages MFA enrolment. Cannot approve its own preparations.",
    permissionIds: [
      "identity:person:read",
      "identity:person:write",
      "identity:account:disable",
      "identity:role-assignment:prepare",
      "identity:delegation:manage",
      "identity:break-glass:request",
    ],
    assignableDimensions: ["institution", "campus"],
    privileged: true,
    breakGlassOnly: false,
  },
  {
    id: "access-approver",
    name: "Access approver",
    workspace: "identity",
    description:
      "Approves role assignments, duties exceptions and emergency access. Held separately from the staff who prepare them.",
    permissionIds: [
      "identity:person:read",
      "identity:role-assignment:approve",
      "identity:sod-exception:approve",
      "identity:break-glass:approve",
      "identity:break-glass:review",
      "identity:access-review:conduct",
    ],
    assignableDimensions: ["institution"],
    privileged: true,
    breakGlassOnly: false,
  },
  {
    id: "auditor",
    name: "Auditor",
    workspace: "identity",
    description:
      "Reads the audit trail and access position across the institution. Holds no permission that changes a record.",
    permissionIds: ["identity:person:read", "identity:audit:read", "identity:access-review:conduct"],
    assignableDimensions: ["institution"],
    privileged: true,
    breakGlassOnly: false,
  },
  {
    id: "admissions-officer",
    name: "Admissions officer",
    workspace: "admissions",
    description: "Processes applications, screening, assisted walk-in intake, and recommended admission batches within scope.",
    permissionIds: [
      "admissions:application:read",
      "admissions:assisted:intake",
      "admissions:screening:score",
      "admissions:batch:prepare",
      "identity:person:read",
    ],
    assignableDimensions: ["institution", "campus", "faculty"],
    privileged: false,
    breakGlassOnly: false,
  },
  {
    id: "admissions-approver",
    name: "Admissions approver",
    workspace: "admissions",
    description: "Registrar-side authority that approves batches, resolves deduplication cases, and manages route configurations.",
    permissionIds: [
      "admissions:application:read",
      "admissions:batch:approve",
      "admissions:case:resolve",
      "admissions:config:manage",
    ],
    assignableDimensions: ["institution"],
    privileged: true,
    breakGlassOnly: false,
  },
  {
    id: "exams-officer",
    name: "Exams officer",
    workspace: "records",
    description: "Records marks and prepares result sets for moderation within a department.",
    permissionIds: ["records:result:enter", "lms:enrolment:read", "academics:timetable:publish"],
    assignableDimensions: ["faculty", "department"],
    privileged: false,
    breakGlassOnly: false,
  },
  {
    id: "records-approver",
    name: "Records approver",
    workspace: "records",
    description: "Moderates and releases results, and issues sealed transcripts and certificates.",
    permissionIds: ["records:result:approve", "records:transcript:issue", "records:student-record:approve", "identity:person:read"],
    assignableDimensions: ["institution", "faculty"],
    privileged: true,
    breakGlassOnly: false,
  },
  {
    id: "registry-officer",
    name: "Registry officer",
    workspace: "records",
    description:
      "Maintains the student record: contact and sponsor details, identity corrections, lifecycle proposals, transfer cases and Registry holds. Changes to protected data wait for a records approver.",
    permissionIds: ["records:student-record:amend", "records:hold:manage", "identity:person:read"],
    assignableDimensions: ["institution", "faculty"],
    privileged: false,
    breakGlassOnly: false,
  },
  {
    id: "bursary-cashier",
    name: "Bursary cashier",
    workspace: "finance",
    description: "Raises charges, receipts verified payments and prepares refunds.",
    permissionIds: ["finance:invoice:raise", "finance:payment:receipt", "finance:refund:prepare"],
    assignableDimensions: ["institution", "campus"],
    privileged: false,
    breakGlassOnly: false,
  },
  {
    id: "bursar",
    name: "Bursar",
    workspace: "finance",
    description: "Authorises refunds and oversees the finance position. Does not prepare the items it releases.",
    permissionIds: ["finance:refund:authorise", "finance:invoice:raise"],
    assignableDimensions: ["institution"],
    privileged: true,
    breakGlassOnly: false,
  },
  {
    id: "hr-officer",
    name: "HR officer",
    workspace: "hr",
    description: "Maintains staff records and puts panel recommendations forward.",
    permissionIds: ["hr:staff-record:read", "hr:appointment:recommend", "identity:person:read"],
    assignableDimensions: ["institution", "campus", "faculty"],
    privileged: false,
    breakGlassOnly: false,
  },
  {
    id: "hr-approver",
    name: "HR approver",
    workspace: "hr",
    description: "Approves appointments and promotions, and authorises payroll cycles.",
    permissionIds: ["hr:staff-record:read", "hr:appointment:approve", "hr:payroll:run"],
    assignableDimensions: ["institution"],
    privileged: true,
    breakGlassOnly: false,
  },
  {
    id: "head-of-department",
    name: "Head of department",
    workspace: "academics",
    description: "Runs a department: curriculum proposals, teaching allocation and class oversight.",
    permissionIds: [
      "academics:curriculum:propose",
      "academics:curriculum:review",
      "academics:timetable:publish",
      "lms:enrolment:read",
      "hr:staff-record:read",
      "identity:delegation:manage",
    ],
    assignableDimensions: ["department"],
    privileged: false,
    breakGlassOnly: false,
  },
  {
    id: "dap-director",
    name: "Director of Academic Planning",
    workspace: "academics",
    description:
      "Oversees academic curriculum catalogue, CCMAS compliance, and approves academic planning changes for Senate ratification.",
    permissionIds: [
      "academics:curriculum:review",
      "academics:curriculum:approve",
      "academics:timetable:publish",
    ],
    assignableDimensions: ["institution"],
    privileged: true,
    breakGlassOnly: false,
  },
  {
    id: "lecturer",
    name: "Lecturer",
    workspace: "lms",
    description: "Teaches assigned classes and sees only those class lists.",
    permissionIds: ["lms:course:teach", "lms:enrolment:read"],
    assignableDimensions: ["department", "programme", "cohort"],
    privileged: false,
    breakGlassOnly: false,
  },
  {
    id: "content-editor",
    name: "Content editor",
    workspace: "content",
    description: "Drafts public pages, news and events. Publishing is a separate role on purpose.",
    permissionIds: ["content:page:draft"],
    assignableDimensions: ["institution"],
    privileged: false,
    breakGlassOnly: false,
  },
  {
    id: "content-approver",
    name: "Content approver",
    workspace: "content",
    description: "Reviews and publishes staged public content.",
    permissionIds: ["content:page:publish"],
    assignableDimensions: ["institution"],
    privileged: false,
    breakGlassOnly: false,
  },
  {
    id: "emergency-platform-administrator",
    name: "Emergency platform administrator",
    workspace: "identity",
    description:
      "Wide administrative access for incident resolution. Cannot be assigned — only granted through an approved break-glass request that expires on its own.",
    permissionIds: [
      "identity:person:read",
      "identity:person:write",
      "identity:account:disable",
      "identity:role-assignment:prepare",
      "identity:audit:read",
      "records:result:enter",
      "finance:invoice:raise",
    ],
    assignableDimensions: ["institution"],
    privileged: true,
    breakGlassOnly: true,
  },
];

const byId = new Map(roleCatalogue.map((role) => [role.id, role]));

export function getRole(id: string): Role | undefined {
  return byId.get(id);
}

export function requireRole(id: string): Role {
  const role = byId.get(id);
  if (!role) throw new Error(`Unknown role: ${id}`);
  return role;
}

export function assignableRoles(): Role[] {
  return roleCatalogue.filter((role) => !role.breakGlassOnly);
}

export function breakGlassRoles(): Role[] {
  return roleCatalogue.filter((role) => role.breakGlassOnly);
}
