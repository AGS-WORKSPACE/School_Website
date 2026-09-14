export type CalendarStatus = "Draft" | "In_Review" | "Approved" | "Published" | "Superseded";
export type ActivityKind = "Lecture" | "Laboratory" | "Tutorial" | "Examination" | "Supervision";
export type ActivityStatus = "Draft" | "Approved" | "Published" | "Cancelled";

export interface CalendarMilestone {
  id: string;
  name: string;
  startsAt: string;
  endsAt?: string;
  audience: string[];
}

export interface CalendarRevision {
  version: number;
  status: CalendarStatus;
  changedAt: string;
  changedBy: string;
  authority: string;
  reason: string;
}

export interface AcademicCalendarPublication {
  id: string;
  academicSession: string;
  title: string;
  version: number;
  status: CalendarStatus;
  authority: string;
  approvedAt?: string;
  publishedAt?: string;
  milestones: CalendarMilestone[];
  revisions: CalendarRevision[];
}

export interface CalendarNotification {
  id: string;
  calendarId: string;
  version: number;
  audience: string;
  message: string;
  createdAt: string;
  status: "Queued" | "Delivered";
}

export interface Campus {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  campusId: string;
  type: "Lecture_Room" | "Laboratory" | "Auditorium" | "Seminar_Room";
  capacity: number;
  equipment: string[];
  accessibility: string[];
  active: boolean;
}

export interface MaintenanceBlock {
  id: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
  reason: string;
  status: "Planned" | "Active" | "Completed" | "Cancelled";
  owner: string;
}

export interface ScheduledActivity {
  id: string;
  code: string;
  title: string;
  kind: ActivityKind;
  startsAt: string;
  endsAt: string;
  roomId: string;
  campusId: string;
  staffIds: string[];
  staffNames: string[];
  cohortIds: string[];
  cohortNames: string[];
  expectedAttendance: number;
  requiredEquipment: string[];
  accessibilityNeeds: string[];
  status: ActivityStatus;
  ownershipUnit: string;
  ownerName: string;
  weeks: number;
  override?: {
    reason: string;
    approvedBy: string;
    approvedAt: string;
    violations: string[];
  };
}

export interface ScheduleConflict {
  id: string;
  severity: "Hard" | "Soft";
  type: "Room" | "Staff" | "Student_Cohort" | "Campus_Travel" | "Maintenance" | "Capacity" | "Equipment" | "Accessibility";
  activityIds: string[];
  description: string;
  resolved: boolean;
}

export interface TimetableChangeNotice {
  id: string;
  activityId: string;
  title: string;
  oldStartsAt: string;
  oldEndsAt: string;
  oldRoomId: string;
  newStartsAt: string;
  newEndsAt: string;
  newRoomId: string;
  effectiveAt: string;
  audienceIds: string[];
  portalStatus: "Published";
  feedStatus: "Published";
  createdAt: string;
}

export interface WorkloadRule {
  id: string;
  name: string;
  lectureMultiplier: number;
  laboratoryMultiplier: number;
  tutorialMultiplier: number;
  examinationMultiplier: number;
  supervisionHoursPerStudent: number;
  targetHours: number;
  effectiveSession: string;
}

export interface SupervisionAssignment {
  id: string;
  staffId: string;
  staffName: string;
  studentId: string;
  studentName: string;
  approved: boolean;
}

export interface WorkloadSummary {
  staffId: string;
  staffName: string;
  teachingHours: number;
  supervisionHours: number;
  totalHours: number;
  targetHours: number;
  variance: number;
  explanation: string[];
}

export interface RoomUsageRecord {
  id: string;
  roomId: string;
  activityId: string;
  startsAt: string;
  endsAt: string;
  status: "Reserved" | "Used" | "Cancelled";
}
