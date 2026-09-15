/**
 * Student holds (SIS-05). A hold restricts specific services; it never changes
 * enrolment status, and each consuming module honours only the effects it owns.
 */

export type HoldType = "Financial" | "Library" | "Disciplinary" | "Academic" | "Documentation";

export type HoldEffect = "Registration" | "Results_Release" | "Transcript" | "Graduation" | "Accommodation";

export interface HoldTypePolicy {
  ownerUnit: string;
  permittedEffects: HoldEffect[];
  defaultAppealRoute: string;
}

export interface StudentHold {
  id: string;
  studentId: string;
  type: HoldType;
  ownerUnit: string;
  /** Internal reason; not shown to the student. */
  reason: string;
  /** What the student sees and what to do next. */
  releasableReason: string;
  effects: HoldEffect[];
  appealRoute: string;
  startsAt: string;
  placedBy: string;
  placedByName: string;
  releasedAt?: string;
  releasedBy?: string;
  releasedByName?: string;
  releaseNote?: string;
}
