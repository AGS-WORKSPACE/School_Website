/**
 * Offering capacity and constraint policy (REG-01).
 */

import type { CourseOffering, OfferingCapacityConstraint } from "../domain/offering";

export interface CapacityValidation {
  valid: boolean;
  reason?: string;
}

/** An offering's approved capacity may exceed the room/staff constraint only with a recorded exception. */
export function validateApprovedCapacity(
  approvedCapacity: number,
  constraint: OfferingCapacityConstraint,
  hasException: boolean
): CapacityValidation {
  const ceiling = Math.min(constraint.roomOrPlatformCapacity, constraint.staffMaxLoad);
  if (approvedCapacity <= ceiling) return { valid: true };
  if (hasException) return { valid: true };
  return {
    valid: false,
    reason: `Approved capacity ${approvedCapacity} exceeds the room/online (${constraint.roomOrPlatformCapacity}) and staff (${constraint.staffMaxLoad}) constraint. Record an exception with a reason to proceed.`,
  };
}

export function canPublishOffering(offering: Pick<CourseOffering, "lecturerId" | "approvedCapacity" | "constraint" | "capacityException" | "status">): CapacityValidation {
  if (!offering.lecturerId.trim()) return { valid: false, reason: "An offering needs an assigned lecturer before publication." };
  const capacity = validateApprovedCapacity(offering.approvedCapacity, offering.constraint, Boolean(offering.capacityException));
  if (!capacity.valid) return capacity;
  return { valid: true };
}

export function remainingSeats(offering: Pick<CourseOffering, "approvedCapacity" | "enrolledCount">): number {
  return Math.max(0, offering.approvedCapacity - offering.enrolledCount);
}

export function canViewOfferings(permissions: string[]): boolean {
  return permissions.some((permission) => ["academics:offering:manage", "academics:curriculum:review", "academics:curriculum:approve"].includes(permission));
}

export function canManageOfferings(permissions: string[]): boolean {
  return permissions.includes("academics:offering:manage");
}
