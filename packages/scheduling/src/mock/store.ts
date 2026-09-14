import type { AcademicCalendarPublication, CalendarNotification, Campus, MaintenanceBlock, Room, RoomUsageRecord, ScheduledActivity, SupervisionAssignment, TimetableChangeNotice, WorkloadRule } from "../domain/scheduling";
import { initialActivities, initialCalendarNotifications, initialCalendars, initialCampuses, initialChangeNotices, initialMaintenanceBlocks, initialRooms, initialSupervisions, initialUsageRecords, initialWorkloadRule } from "./seed";

export interface SchedulingStoreState {
  calendars: AcademicCalendarPublication[];
  calendarNotifications: CalendarNotification[];
  campuses: Campus[];
  rooms: Room[];
  maintenanceBlocks: MaintenanceBlock[];
  activities: ScheduledActivity[];
  changeNotices: TimetableChangeNotice[];
  workloadRule: WorkloadRule;
  supervisions: SupervisionAssignment[];
  usageRecords: RoomUsageRecord[];
}

const STORAGE_KEY = "tau_scheduling_store_v1";
function seedState(): SchedulingStoreState {
  return { calendars: structuredClone(initialCalendars), calendarNotifications: structuredClone(initialCalendarNotifications), campuses: structuredClone(initialCampuses), rooms: structuredClone(initialRooms), maintenanceBlocks: structuredClone(initialMaintenanceBlocks), activities: structuredClone(initialActivities), changeNotices: structuredClone(initialChangeNotices), workloadRule: structuredClone(initialWorkloadRule), supervisions: structuredClone(initialSupervisions), usageRecords: structuredClone(initialUsageRecords) };
}

class SchedulingStore {
  private state = this.load();
  private listeners = new Set<() => void>();
  private load(): SchedulingStoreState {
    if (typeof window !== "undefined") {
      try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) return { ...seedState(), ...JSON.parse(saved) }; } catch { /* use seed data */ }
    }
    return seedState();
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  setState(updater: (state: SchedulingStoreState) => SchedulingStoreState) { this.state = updater(this.state); if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); this.listeners.forEach((listener) => listener()); }
  reset() { this.state = seedState(); if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY); this.listeners.forEach((listener) => listener()); }
}

export const schedulingStore = new SchedulingStore();
