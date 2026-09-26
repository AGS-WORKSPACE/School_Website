/**
 * What the dashboard home shows (SD-02): a summary, what happens next, what
 * needs action, and what changed. Every item names the module it came from and
 * links back to that module's own journey.
 */

export type SourceModule =
  | "Student record"
  | "Timetable"
  | "LMS"
  | "Online learning"
  | "Registration"
  | "Results"
  | "Examinations"
  | "Finance";

export interface DashboardSummary {
  displayName: string;
  matriculationNumber: string;
  programmeName: string;
  level: number;
  mode: string;
  academicSession: string;
  cohort: string;
  enrolmentStatus: string;
  standing: string;
  /** Courses the student is rostered on in the LMS. */
  activeCourses: number;
}

export type AgendaKind = "Class" | "Laboratory" | "Live_Session" | "Office_Hours" | "Coursework" | "Examination";

export interface AgendaItem {
  id: string;
  source: SourceModule;
  kind: AgendaKind;
  title: string;
  courseCode?: string;
  startsAt: string;
  endsAt?: string;
  /** Face to face, online or blended, as the owning module recorded it. */
  deliveryMode: string;
  location?: string;
  joinUrl?: string;
  /** Recording and caption arrangements, only where the source supplied them. */
  arrangements?: string;
  action?: { label: string; href: string };
}

export type TaskSeverity = "Blocking" | "Due" | "Informational";

export interface TaskItem {
  id: string;
  source: SourceModule;
  severity: TaskSeverity;
  title: string;
  /** Plain-language state, in the owning module's meaning. */
  state: string;
  detail: string;
  dueAt?: string;
  owner?: string;
  action: { label: string; href: string };
}

export interface AlertItem {
  id: string;
  source: SourceModule;
  title: string;
  detail: string;
  changedAt: string;
  /** Only where the source recorded a before and after. */
  previousValue?: string;
  newValue?: string;
  effectiveFrom?: string;
  action?: { label: string; href: string };
}

export type SourceStatus = "Live" | "Delayed" | "Unavailable" | "No_Record";

export interface SourceHealth {
  source: SourceModule;
  status: SourceStatus;
  /** When this module's data was last read. */
  asOf?: string;
  note: string;
}

export interface DashboardHome {
  summary: DashboardSummary;
  agenda: AgendaItem[];
  tasks: TaskItem[];
  alerts: AlertItem[];
  sources: SourceHealth[];
  generatedAt: string;
}
