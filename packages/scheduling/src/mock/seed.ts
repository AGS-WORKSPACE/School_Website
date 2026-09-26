import type { AcademicCalendarPublication, CalendarNotification, Campus, MaintenanceBlock, Room, RoomUsageRecord, ScheduledActivity, SupervisionAssignment, TimetableChangeNotice, WorkloadRule } from "../domain/scheduling";

export const initialCalendars: AcademicCalendarPublication[] = [{
  id: "calendar-2026-2027",
  academicSession: "2026/2027",
  title: "2026/2027 Academic Calendar",
  version: 3,
  status: "Approved",
  authority: "University Senate · 184th Regular Meeting",
  approvedAt: "2026-08-28T14:00:00Z",
  milestones: [
    { id: "milestone-resumption", name: "First semester resumption", startsAt: "2026-09-14T08:00:00+01:00", audience: ["All students", "Academic staff"] },
    { id: "milestone-registration", name: "Course registration closes", startsAt: "2026-09-25T17:00:00+01:00", audience: ["All students"] },
    { id: "milestone-exams", name: "First semester examinations", startsAt: "2027-01-11T08:00:00+01:00", endsAt: "2027-01-22T18:00:00+01:00", audience: ["All students", "Academic staff"] },
  ],
  revisions: [
    { version: 1, status: "Superseded", changedAt: "2026-06-02T10:00:00Z", changedBy: "Dr. Bisi Lawal", authority: "DAP Calendar Committee", reason: "Initial calendar draft." },
    { version: 2, status: "Superseded", changedAt: "2026-07-17T13:30:00Z", changedBy: "Dr. Bisi Lawal", authority: "Senate Business Committee", reason: "Aligned examination period with accreditation visit." },
    { version: 3, status: "Approved", changedAt: "2026-08-28T14:00:00Z", changedBy: "University Senate", authority: "University Senate · 184th Regular Meeting", reason: "Approved for institutional publication." },
  ],
}];

export const initialCalendarNotifications: CalendarNotification[] = [];
export const initialCampuses: Campus[] = [
  { id: "campus-main", name: "Main Campus" },
  { id: "campus-clinical", name: "Clinical Campus" },
];

export const initialRooms: Room[] = [
  { id: "room-lta", code: "LT-A", name: "Adewumi Lecture Theatre A", campusId: "campus-main", type: "Lecture_Room", capacity: 120, equipment: ["Projector", "PA System"], accessibility: ["Step-free access", "Hearing loop"], active: true },
  { id: "room-ltb", code: "LT-B", name: "Adewumi Lecture Theatre B", campusId: "campus-main", type: "Lecture_Room", capacity: 60, equipment: ["Projector"], accessibility: ["Step-free access"], active: true },
  { id: "room-cslab", code: "CS-LAB-1", name: "Computer Science Laboratory 1", campusId: "campus-main", type: "Laboratory", capacity: 40, equipment: ["Projector", "40 Workstations", "Linux"], accessibility: ["Step-free access", "Adjustable workstation"], active: true },
  { id: "room-clinical", code: "CLIN-SIM", name: "Clinical Simulation Suite", campusId: "campus-clinical", type: "Laboratory", capacity: 30, equipment: ["Simulation mannequins", "Projector"], accessibility: ["Step-free access"], active: true },
];

export const initialMaintenanceBlocks: MaintenanceBlock[] = [
  { id: "block-cslab-1", roomId: "room-cslab", startsAt: "2026-09-16T08:00:00+01:00", endsAt: "2026-09-16T13:00:00+01:00", reason: "Network switch replacement", status: "Planned", owner: "Facilities ICT Liaison" },
];

export const initialActivities: ScheduledActivity[] = [
  { id: "activity-csc201", code: "CSC 201", title: "Data Structures", kind: "Lecture", startsAt: "2026-09-15T09:00:00+01:00", endsAt: "2026-09-15T11:00:00+01:00", roomId: "room-lta", campusId: "campus-main", staffIds: ["staff-ada"], staffNames: ["Dr. Ada Nwosu"], cohortIds: ["cohort-csc-200"], cohortNames: ["Computer Science 200L"], expectedAttendance: 92, requiredEquipment: ["Projector"], accessibilityNeeds: ["Step-free access"], status: "Published", ownershipUnit: "Department of Computer Science", ownerName: "Dr. Ada Nwosu", weeks: 12 },
  { id: "activity-mth201", code: "MTH 201", title: "Linear Algebra", kind: "Lecture", startsAt: "2026-09-15T10:00:00+01:00", endsAt: "2026-09-15T12:00:00+01:00", roomId: "room-lta", campusId: "campus-main", staffIds: ["staff-tunde"], staffNames: ["Dr. Tunde Bello"], cohortIds: ["cohort-csc-200"], cohortNames: ["Computer Science 200L"], expectedAttendance: 88, requiredEquipment: ["Projector"], accessibilityNeeds: [], status: "Approved", ownershipUnit: "Department of Mathematics", ownerName: "Dr. Tunde Bello", weeks: 12 },
  { id: "activity-csc205", code: "CSC 205", title: "Systems Laboratory", kind: "Laboratory", startsAt: "2026-09-16T09:00:00+01:00", endsAt: "2026-09-16T12:00:00+01:00", roomId: "room-cslab", campusId: "campus-main", staffIds: ["staff-ada"], staffNames: ["Dr. Ada Nwosu"], cohortIds: ["cohort-csc-200"], cohortNames: ["Computer Science 200L"], expectedAttendance: 38, requiredEquipment: ["40 Workstations", "Linux"], accessibilityNeeds: ["Adjustable workstation"], status: "Draft", ownershipUnit: "Department of Computer Science", ownerName: "Dr. Ada Nwosu", weeks: 6 },
  // Computing 100L: the first-year cohort taught COS 101 and GST 111. Weekly
  // recurrence (`weeks`) is what the student dashboard expands into upcoming classes.
  { id: "activity-cos101", code: "COS 101", title: "Introduction to Computing Sciences", kind: "Lecture", startsAt: "2026-09-15T08:00:00+01:00", endsAt: "2026-09-15T10:00:00+01:00", roomId: "room-ltb", campusId: "campus-main", staffIds: ["staff-samuel"], staffNames: ["Dr. Samuel Okonkwo"], cohortIds: ["cohort-computing-100"], cohortNames: ["Computing 100L"], expectedAttendance: 110, requiredEquipment: ["Projector"], accessibilityNeeds: ["Step-free access"], status: "Published", ownershipUnit: "Department of Computer Science", ownerName: "Dr. Samuel Okonkwo", weeks: 12 },
  { id: "activity-cos101-lab", code: "COS 101", title: "Computing Laboratory", kind: "Laboratory", startsAt: "2026-09-17T14:00:00+01:00", endsAt: "2026-09-17T16:00:00+01:00", roomId: "room-cslab", campusId: "campus-main", staffIds: ["staff-samuel"], staffNames: ["Dr. Samuel Okonkwo"], cohortIds: ["cohort-computing-100"], cohortNames: ["Computing 100L"], expectedAttendance: 40, requiredEquipment: ["40 Workstations"], accessibilityNeeds: ["Adjustable workstation"], status: "Published", ownershipUnit: "Department of Computer Science", ownerName: "Dr. Samuel Okonkwo", weeks: 10 },
  { id: "activity-gst111", code: "GST 111", title: "Communication in English", kind: "Lecture", startsAt: "2026-09-16T11:00:00+01:00", endsAt: "2026-09-16T13:00:00+01:00", roomId: "room-lta", campusId: "campus-main", staffIds: ["staff-tunde"], staffNames: ["Dr. Tunde Bello"], cohortIds: ["cohort-computing-100"], cohortNames: ["Computing 100L"], expectedAttendance: 118, requiredEquipment: ["Projector", "PA System"], accessibilityNeeds: ["Hearing loop"], status: "Published", ownershipUnit: "School of General Studies", ownerName: "Dr. Tunde Bello", weeks: 12 },
  { id: "activity-med301", code: "MED 301", title: "Clinical Skills", kind: "Laboratory", startsAt: "2026-09-17T13:00:00+01:00", endsAt: "2026-09-17T16:00:00+01:00", roomId: "room-clinical", campusId: "campus-clinical", staffIds: ["staff-amaka"], staffNames: ["Dr. Amaka Eze"], cohortIds: ["cohort-med-300"], cohortNames: ["Medicine 300L"], expectedAttendance: 28, requiredEquipment: ["Simulation mannequins"], accessibilityNeeds: [], status: "Published", ownershipUnit: "Department of Medicine", ownerName: "Dr. Amaka Eze", weeks: 8 },
];

export const initialChangeNotices: TimetableChangeNotice[] = [{ id: "notice-cos101-lab-1", activityId: "activity-cos101-lab", title: "Computing Laboratory", oldStartsAt: "2026-09-17T10:00:00+01:00", oldEndsAt: "2026-09-17T12:00:00+01:00", oldRoomId: "room-ltb", newStartsAt: "2026-09-17T14:00:00+01:00", newEndsAt: "2026-09-17T16:00:00+01:00", newRoomId: "room-cslab", effectiveAt: "2026-09-17T00:00:00+01:00", audienceIds: ["staff-samuel", "cohort-computing-100"], portalStatus: "Published", feedStatus: "Published", createdAt: "2026-09-14T09:00:00Z" }, { id: "notice-med301-1", activityId: "activity-med301", title: "Clinical Skills", oldStartsAt: "2026-09-17T10:00:00+01:00", oldEndsAt: "2026-09-17T13:00:00+01:00", oldRoomId: "room-clinical", newStartsAt: "2026-09-17T13:00:00+01:00", newEndsAt: "2026-09-17T16:00:00+01:00", newRoomId: "room-clinical", effectiveAt: "2026-09-17T00:00:00+01:00", audienceIds: ["staff-amaka", "cohort-med-300"], portalStatus: "Published", feedStatus: "Published", createdAt: "2026-09-10T11:00:00Z" }];

export const initialWorkloadRule: WorkloadRule = { id: "workload-rule-2026", name: "2026/2027 Senate workload rule", lectureMultiplier: 1, laboratoryMultiplier: 0.75, tutorialMultiplier: 0.75, examinationMultiplier: 0.25, supervisionHoursPerStudent: 8, targetHours: 48, effectiveSession: "2026/2027" };
export const initialSupervisions: SupervisionAssignment[] = [
  { id: "sup-1", staffId: "staff-ada", staffName: "Dr. Ada Nwosu", studentId: "student-1", studentName: "Fatima Aliyu", approved: true },
  { id: "sup-2", staffId: "staff-tunde", staffName: "Dr. Tunde Bello", studentId: "student-2", studentName: "Chidi Okonkwo", approved: true },
  { id: "sup-3", staffId: "staff-ada", staffName: "Dr. Ada Nwosu", studentId: "student-3", studentName: "Grace Musa", approved: false },
];

export const initialUsageRecords: RoomUsageRecord[] = [
  { id: "usage-1", roomId: "room-lta", activityId: "past-1", startsAt: "2026-09-08T09:00:00+01:00", endsAt: "2026-09-08T11:00:00+01:00", status: "Used" },
  { id: "usage-2", roomId: "room-lta", activityId: "activity-csc201", startsAt: "2026-09-15T09:00:00+01:00", endsAt: "2026-09-15T11:00:00+01:00", status: "Reserved" },
  { id: "usage-3", roomId: "room-ltb", activityId: "cancelled-1", startsAt: "2026-09-11T12:00:00+01:00", endsAt: "2026-09-11T14:00:00+01:00", status: "Cancelled" },
];
