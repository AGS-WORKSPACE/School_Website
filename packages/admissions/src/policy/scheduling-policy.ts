import type { ScreeningAppointment, AppointmentValidationResult } from "../domain/scheduling";

const ACTIVE_STATUSES = new Set(["Scheduled", "Confirmed", "Attended", "Rescheduled"]);

function overlaps(left: ScreeningAppointment, right: Pick<ScreeningAppointment, "date" | "startTime" | "endTime">) {
  return left.date === right.date && left.startTime < right.endTime && right.startTime < left.endTime;
}

export function validateScreeningAppointment(candidate: ScreeningAppointment, existing: ScreeningAppointment[]): AppointmentValidationResult {
  const conflicts = existing.filter((item) => item.id !== candidate.id && ACTIVE_STATUSES.has(item.status) && overlaps(item, candidate)).flatMap((item) => {
    const result = [] as AppointmentValidationResult["conflicts"];
    if (item.applicationId === candidate.applicationId) result.push({ type: "Candidate_Double_Booking", message: `${candidate.candidateName} already has an overlapping appointment.`, blocking: true });
    if (item.assignedOfficerIds.some((officerId) => candidate.assignedOfficerIds.includes(officerId))) result.push({ type: "Officer_Double_Booking", message: "An assigned screening officer is already booked for this time.", blocking: true });
    if (item.venue === candidate.venue) result.push({ type: "Venue_Conflict", message: `${candidate.venue} is already booked for this time.`, blocking: true });
    return result;
  });
  const concurrentAtVenue = existing.filter((item) => item.id !== candidate.id && ACTIVE_STATUSES.has(item.status) && item.venue === candidate.venue && overlaps(item, candidate)).length;
  if (concurrentAtVenue >= candidate.venueCapacity) conflicts.push({ type: "Capacity_Exceeded", message: `${candidate.venue} has capacity for ${candidate.venueCapacity} concurrent appointment(s).`, blocking: true });
  return { valid: conflicts.length === 0, conflicts };
}

export function canViewSensitiveAccommodation(permissionIds: string[]) {
  return permissionIds.includes("admissions:config:manage");
}