import type { ScreeningScore } from "./screening";

export type AppointmentStatus = "Scheduled" | "Confirmed" | "Attended" | "Absent" | "Cancelled" | "Rescheduled";
export type ScreeningType = "Document_Review" | "Written_Test" | "Interview" | "Physical_Screening";

export interface ScreeningAppointment {
  id: string;
  screeningRecordId: string;
  applicationId: string;
  candidateName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  venueCapacity: number;
  screeningType: ScreeningType;
  assignedOfficerIds: string[];
  assignedOfficerNames: string[];
  status: AppointmentStatus;
  attendanceAt?: string;
  attendanceNote?: string;
}

export interface ScreeningAccommodation {
  id: string;
  screeningRecordId: string;
  candidateName: string;
  arrangement: string;
  enabled: boolean;
  validFrom: string;
  validTo?: string;
  sensitiveDetail?: string;
  restrictedToPermission: "admissions:config:manage";
}

export interface AppointmentConflict {
  type: "Candidate_Double_Booking" | "Officer_Double_Booking" | "Venue_Conflict" | "Capacity_Exceeded";
  message: string;
  blocking: boolean;
}

export interface AppointmentValidationResult {
  valid: boolean;
  conflicts: AppointmentConflict[];
}

export interface ScreeningScoreEntry {
  screeningRecordId: string;
  criterion: string;
  score: number;
  maximum: number;
  source: ScreeningScore["source"];
  reviewer: string;
  recordedAt: string;
}