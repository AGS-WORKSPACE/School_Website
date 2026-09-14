/**
 * Provenance, protected fields and correction rules (SIS-01, SIS-02).
 */

import type { CorrectionEvidence, CorrectionRequest } from "../domain/correction";
import type { FieldDefinition, FieldHistoryEntry, Provenance, Student, StudentFieldKey } from "../domain/record";

export interface PolicyCheck {
  allowed: boolean;
  errors: string[];
}

function check(errors: string[]): PolicyCheck {
  return { allowed: errors.length === 0, errors };
}

const identityEvidence = ["Sworn affidavit", "NIMC record", "Gazette notice"];

export const studentFieldCatalogue: FieldDefinition[] = [
  { key: "surname", label: "Surname", category: "Biographical", protected: true, acceptedEvidence: [...identityEvidence, "Marriage certificate"] },
  { key: "firstName", label: "First name", category: "Biographical", protected: true, acceptedEvidence: identityEvidence },
  { key: "middleName", label: "Middle name", category: "Biographical", protected: true, acceptedEvidence: identityEvidence },
  { key: "dateOfBirth", label: "Date of birth", category: "Biographical", protected: true, acceptedEvidence: ["Birth certificate", "NIMC record", "Sworn affidavit"] },
  { key: "sex", label: "Sex", category: "Biographical", protected: true, acceptedEvidence: ["NIMC record", "Birth certificate"] },
  { key: "nationality", label: "Nationality", category: "Biographical", protected: true, acceptedEvidence: ["International passport", "NIMC record"] },
  { key: "stateOfOrigin", label: "State of origin", category: "Biographical", protected: true, acceptedEvidence: ["Certificate of state of origin", "NIMC record"] },
  { key: "lga", label: "Local government area", category: "Biographical", protected: true, acceptedEvidence: ["Certificate of state of origin", "NIMC record"] },
  { key: "nin", label: "National Identification Number", category: "Biographical", protected: true, acceptedEvidence: ["NIMC record"] },
  { key: "email", label: "Personal email", category: "Contact", protected: false, acceptedEvidence: [] },
  { key: "phone", label: "Phone", category: "Contact", protected: false, acceptedEvidence: [] },
  { key: "address", label: "Residential address", category: "Contact", protected: false, acceptedEvidence: [] },
  { key: "nextOfKin", label: "Next of kin", category: "Contact", protected: false, acceptedEvidence: [] },
  { key: "sponsorType", label: "Sponsor type", category: "Sponsor", protected: false, acceptedEvidence: ["Sponsorship letter"] },
  { key: "sponsorName", label: "Sponsor", category: "Sponsor", protected: false, acceptedEvidence: ["Sponsorship letter"] },
  { key: "sponsorContact", label: "Sponsor contact", category: "Sponsor", protected: false, acceptedEvidence: [] },
];

export function fieldDefinition(key: StudentFieldKey): FieldDefinition {
  const definition = studentFieldCatalogue.find((item) => item.key === key);
  if (!definition) throw new Error(`Unknown student field: ${key}`);
  return definition;
}

/**
 * Roles holding records:student-record:approve. They decide corrections and
 * lifecycle changes, and alone may read superseded protected-field values.
 */
export const recordsApproverRoles = ["Deputy Registrar (Records)", "Registrar"];

export function canApproveRecordChanges(role: string): boolean {
  return recordsApproverRoles.includes(role);
}

export function canViewRestrictedHistory(role: string): boolean {
  return canApproveRecordChanges(role);
}

export function visibleHistory(history: FieldHistoryEntry[], role: string): FieldHistoryEntry[] {
  return canViewRestrictedHistory(role) ? history : history.filter((entry) => !entry.restricted);
}

/** Fields whose value has not been verified against a source. Used as a data-quality queue. */
export function unverifiedFields(student: Student): StudentFieldKey[] {
  return studentFieldCatalogue
    .filter((definition) => definition.protected && student.fields[definition.key].provenance.verification !== "Verified")
    .map((definition) => definition.key);
}

export function validateCorrectionRequest(
  input: { student: Student; field: StudentFieldKey; requestedValue: string; justification: string; evidence: CorrectionEvidence[] },
  existing: CorrectionRequest[],
): PolicyCheck {
  const errors: string[] = [];
  const definition = fieldDefinition(input.field);
  const current = input.student.fields[input.field].value;

  if (!definition.protected) errors.push(`${definition.label} is not a protected field; update it directly instead of requesting a correction.`);
  if (!input.requestedValue.trim()) errors.push("Enter the corrected value.");
  if (input.requestedValue.trim() === current) errors.push("The requested value is the same as the recorded value.");
  if (input.justification.trim().length < 10) errors.push("Explain why the recorded value is wrong.");
  if (definition.protected && input.evidence.length === 0) errors.push(`Attach evidence: ${definition.acceptedEvidence.join(", ")}.`);
  const unaccepted = input.evidence.filter((item) => !definition.acceptedEvidence.includes(item.documentType));
  if (unaccepted.length) errors.push(`${unaccepted.map((item) => item.documentType).join(", ")} is not accepted evidence for ${definition.label.toLowerCase()}.`);
  if (existing.some((item) => item.studentId === input.student.id && item.field === input.field && item.status === "Submitted")) {
    errors.push(`A ${definition.label.toLowerCase()} correction is already awaiting a decision.`);
  }
  return check(errors);
}

export function decideCorrectionCheck(
  request: CorrectionRequest,
  decision: "Approved" | "Rejected",
  actor: { personId: string; role: string },
  reasons: { decisionReason?: string; releasableReason?: string },
): PolicyCheck {
  const errors: string[] = [];
  if (request.status !== "Submitted") errors.push(`This request is already ${request.status.toLowerCase()}.`);
  if (!canApproveRecordChanges(actor.role)) errors.push(`${actor.role} cannot decide identity corrections; a records approver must.`);
  if (request.submittedBy === actor.personId) errors.push("The person who raised a correction cannot decide it.");
  if (decision === "Approved" && request.evidence.length === 0) errors.push("A protected field cannot change without evidence.");
  if (decision === "Rejected" && !reasons.decisionReason?.trim()) errors.push("Record the internal reason for rejecting.");
  if (decision === "Rejected" && !reasons.releasableReason?.trim()) errors.push("Give the student a plain-language reason.");
  return check(errors);
}

/**
 * Replaces a field and returns the history entry for the superseded value.
 * History for protected fields is restricted, so correcting a name or date of
 * birth does not expose the previous value to general Registry staff.
 */
export function applyFieldChange(
  student: Student,
  field: StudentFieldKey,
  value: string,
  provenance: Provenance,
  change: { reference: string; historyId: string; actorId: string; at: string },
): { student: Student; history: FieldHistoryEntry } {
  const previous = student.fields[field];
  return {
    student: { ...student, fields: { ...student.fields, [field]: { value, provenance } } },
    history: {
      id: change.historyId,
      studentId: student.id,
      field,
      previousValue: previous.value,
      previousProvenance: previous.provenance,
      replacedAt: change.at,
      replacedBy: change.actorId,
      changeReference: change.reference,
      restricted: fieldDefinition(field).protected,
    },
  };
}

export function verifyFieldCheck(student: Student, field: StudentFieldKey, actorId: string): PolicyCheck {
  const errors: string[] = [];
  const provenance = student.fields[field].provenance;
  if (provenance.verification === "Verified") errors.push("This value is already verified.");
  if (provenance.recordedBy === actorId) errors.push("A value must be verified by someone other than the person who recorded it.");
  return check(errors);
}
