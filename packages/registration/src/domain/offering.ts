/**
 * Semester course offerings (REG-01).
 *
 * An offering always references an approved, published course version. Its
 * approved capacity can never exceed the validated room/online/staff
 * constraint without a recorded, separately-authorised exception.
 */

export type OfferingStatus = "Draft" | "Published" | "Closed" | "Cancelled";

export type OfferingDeliveryMode = "In-Person" | "Online" | "Blended" | "Clinical/Lab";

export interface OfferingCapacityConstraint {
  /** The largest room, lab batch or platform limit this offering may run in. */
  roomOrPlatformCapacity: number;
  /** Maximum students a single lecturer/section can supervise under policy. */
  staffMaxLoad: number;
}

export interface OfferingCapacityException {
  id: string;
  requestedCapacity: number;
  reason: string;
  approvedBy: string;
  approvedByName: string;
  approvedAt: string;
}

export interface CourseOffering {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  courseVersionId: string;
  creditUnits: number;
  level: number;
  academicSession: string;
  semester: 1 | 2;
  departmentId: string;
  departmentName: string;
  lecturerId: string;
  lecturerName: string;
  deliveryMode: OfferingDeliveryMode;
  roomOrPlatform: string;
  constraint: OfferingCapacityConstraint;
  approvedCapacity: number;
  capacityException?: OfferingCapacityException;
  enrolledCount: number;
  waitlistCount: number;
  status: OfferingStatus;
  createdBy: string;
  createdAt: string;
  publishedAt?: string;
}
