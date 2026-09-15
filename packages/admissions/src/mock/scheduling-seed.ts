import type { ScreeningAccommodation, ScreeningAppointment } from "../domain/scheduling";

export const initialScreeningAppointments: ScreeningAppointment[] = [
  { id: "appointment-001", screeningRecordId: "screen-2026-001", applicationId: "app-2026-001", candidateName: "Chidiebere Okonkwo", date: "2026-09-18", startTime: "09:00", endTime: "09:45", venue: "Admissions Hall A", venueCapacity: 2, screeningType: "Physical_Screening", assignedOfficerIds: ["usr-admissions-lead"], assignedOfficerNames: ["Mrs. Amina Yusuf"], status: "Confirmed" },
  { id: "appointment-002", screeningRecordId: "screen-2026-002", applicationId: "app-2026-004", candidateName: "Fatima Aliyu", date: "2026-09-18", startTime: "10:00", endTime: "10:45", venue: "Postgraduate School Room 2", venueCapacity: 1, screeningType: "Interview", assignedOfficerIds: ["usr-pg-officer"], assignedOfficerNames: ["Dr. Ngozi Madu"], status: "Scheduled" },
];

export const initialScreeningAccommodations: ScreeningAccommodation[] = [
  { id: "accommodation-001", screeningRecordId: "screen-2026-001", candidateName: "Chidiebere Okonkwo", arrangement: "Extra time required", enabled: true, validFrom: "2026-09-01", validTo: "2026-10-31", sensitiveDetail: "Restricted support documentation on file.", restrictedToPermission: "admissions:config:manage" },
];