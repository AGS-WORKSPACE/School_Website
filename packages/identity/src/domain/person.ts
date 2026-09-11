/**
 * One person, one durable identity (IAM-01).
 *
 * A person who applies, matriculates, is later employed and finally becomes an
 * alumnus keeps a single `Person` record. Each of those relationships is an
 * `Affiliation`; none of them creates a second person.
 */

export type AffiliationType =
  | "applicant"
  | "student"
  | "staff"
  | "contractor"
  | "alumnus"
  | "external";

export type AffiliationStatus = "active" | "ended" | "suspended";

export interface Affiliation {
  id: string;
  type: AffiliationType;
  /** Business reference in the owning module: matriculation number, staff number, application number. */
  reference: string;
  status: AffiliationStatus;
  /** Module that owns this fact — the identity module never rewrites it. */
  sourceModule: "admissions" | "sis" | "hr" | "alumni" | "identity";
  startedAt: string;
  endedAt: string | null;
}

export interface Person {
  id: string;
  title: string | null;
  firstName: string;
  lastName: string;
  otherNames: string | null;
  preferredName: string | null;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  /** Home unit for directory purposes. Access still comes only from role assignments. */
  primaryUnitId: string | null;
  affiliations: Affiliation[];
  createdAt: string;
  updatedAt: string;
}

export function personDisplayName(person: Person): string {
  const first = person.preferredName ?? person.firstName;
  return [person.title, first, person.lastName].filter(Boolean).join(" ");
}

export function personInitials(person: Person): string {
  return `${person.firstName.charAt(0)}${person.lastName.charAt(0)}`.toUpperCase();
}

export function activeAffiliations(person: Person): Affiliation[] {
  return person.affiliations.filter((affiliation) => affiliation.status === "active");
}
