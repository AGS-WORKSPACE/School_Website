/**
 * The authoritative student record (SIS-01).
 *
 * Every recorded value carries its provenance, so Registry can always answer
 * "where did this come from, who verified it, and who approved the change?".
 */

export type FieldCategory = "Biographical" | "Contact" | "Sponsor";

export type StudentFieldKey =
  | "surname"
  | "firstName"
  | "middleName"
  | "dateOfBirth"
  | "sex"
  | "nationality"
  | "stateOfOrigin"
  | "lga"
  | "nin"
  | "email"
  | "phone"
  | "address"
  | "nextOfKin"
  | "sponsorType"
  | "sponsorName"
  | "sponsorContact";

export interface FieldDefinition {
  key: StudentFieldKey;
  label: string;
  category: FieldCategory;
  /** Protected identity fields change only through an evidenced, approved correction (SIS-02). */
  protected: boolean;
  /** Evidence types Registry accepts when this field is corrected. */
  acceptedEvidence: string[];
}

export type ProvenanceSource =
  | "Admission_Application"
  | "Admission_Offer"
  | "Student_Request"
  | "Registry_Entry"
  | "External_Verification"
  | "Legacy_Migration";

export type VerificationState = "Unverified" | "Verified" | "Disputed";

export interface Provenance {
  source: ProvenanceSource;
  /** Application number, correction id, NIMC reference, migration batch, etc. */
  sourceReference: string;
  verification: VerificationState;
  verifiedBy?: string;
  verifiedAt?: string;
  effectiveFrom: string;
  recordedBy: string;
  recordedAt: string;
  /** Present when the change needed approval; always a different person from the requester. */
  approvedBy?: string;
  approvedAt?: string;
}

export interface RecordedField {
  value: string;
  provenance: Provenance;
}

export interface FieldHistoryEntry {
  id: string;
  studentId: string;
  field: StudentFieldKey;
  previousValue: string;
  previousProvenance: Provenance;
  replacedAt: string;
  replacedBy: string;
  /** The correction request or amendment that superseded the value. */
  changeReference: string;
  /** Prior values of protected fields are visible only to restricted Registry roles. */
  restricted: boolean;
}

export type QualificationType =
  | "WASSCE"
  | "NECO_SSCE"
  | "NABTEB"
  | "UTME"
  | "A_Level"
  | "JUPEB"
  | "ND"
  | "HND"
  | "Bachelors"
  | "Other";

export interface PriorQualification {
  id: string;
  qualificationType: QualificationType;
  institution: string;
  examNumber?: string;
  year: number;
  summary: string;
  provenance: Provenance;
}

export interface Student {
  id: string;
  personId: string;
  matriculationNumber: string;
  /** Links back to EP-07 onboarding so the record is never re-keyed. */
  sourceApplicationId?: string;
  sourceOfferId?: string;
  fields: Record<StudentFieldKey, RecordedField>;
  priorEducation: PriorQualification[];
  createdAt: string;
}

export interface StudentAuditEntry {
  id: string;
  studentId: string;
  entity: "Record" | "Correction" | "Lifecycle" | "Transfer" | "Hold";
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  timestamp: string;
  detail: string;
}
