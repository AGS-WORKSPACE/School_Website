/**
 * In-memory reactive LMS store with localStorage persistence.
 */

import type { Assignment, Extension, Grade, PassbackBatch, Submission } from "../domain/assessment";
import type { LmsAuditEntry } from "../domain/audit";
import type { Announcement, CourseGroup, Discussion, DiscussionPost, LiveSession, NotificationDelivery, NotificationPreference, OfficeHours } from "../domain/community";
import type { ContentItem, ProgressEntry } from "../domain/content";
import type { Integration, IntegrationEvent } from "../domain/integration";
import type { CourseOffering, Enrolment, RegistrationEvent, RosterSyncRun } from "../domain/offering";
import type { CourseTemplate } from "../domain/template";
import {
  initialAnnouncements, initialAssignments, initialContent, initialDiscussions, initialEnrolments, initialExtensions, initialGrades, initialGroups,
  initialIntegrationEvents, initialIntegrations, initialLiveSessions, initialOfferings, initialOfficeHours, initialPosts, initialPreferences,
  initialProcessedEventIds, initialProgress, initialRegistrationFeed, initialSubmissions, initialTemplates,
} from "./seed";

export interface LmsStoreState {
  templates: CourseTemplate[];
  offerings: CourseOffering[];
  registrationFeed: RegistrationEvent[];
  processedEventIds: string[];
  enrolments: Enrolment[];
  syncRuns: RosterSyncRun[];
  content: ContentItem[];
  progress: ProgressEntry[];
  announcements: Announcement[];
  deliveries: NotificationDelivery[];
  discussions: Discussion[];
  posts: DiscussionPost[];
  groups: CourseGroup[];
  liveSessions: LiveSession[];
  officeHours: OfficeHours[];
  preferences: NotificationPreference[];
  assignments: Assignment[];
  extensions: Extension[];
  submissions: Submission[];
  grades: Grade[];
  passbacks: PassbackBatch[];
  integrations: Integration[];
  integrationEvents: IntegrationEvent[];
  audit: LmsAuditEntry[];
}

const STORAGE_KEY = "tau_lms_store_v1";

function mergeSeeded<T>(seeded: T[], saved: T[] | undefined, key: (item: T) => string): T[] {
  if (!saved) return seeded;
  const savedKeys = new Set(saved.map(key));
  return [...saved, ...seeded.filter((item) => !savedKeys.has(key(item)))];
}

function seedState(): LmsStoreState {
  return structuredClone({
    templates: initialTemplates,
    offerings: initialOfferings,
    registrationFeed: initialRegistrationFeed,
    processedEventIds: initialProcessedEventIds,
    enrolments: initialEnrolments,
    syncRuns: [],
    content: initialContent,
    progress: initialProgress,
    announcements: initialAnnouncements,
    deliveries: [],
    discussions: initialDiscussions,
    posts: initialPosts,
    groups: initialGroups,
    liveSessions: initialLiveSessions,
    officeHours: initialOfficeHours,
    preferences: initialPreferences,
    assignments: initialAssignments,
    extensions: initialExtensions,
    submissions: initialSubmissions,
    grades: initialGrades,
    passbacks: [],
    integrations: initialIntegrations(),
    integrationEvents: initialIntegrationEvents(),
    audit: [],
  });
}

class LmsStore {
  private state: LmsStoreState;
  private listeners = new Set<() => void>();

  constructor() {
    this.state = this.load();
  }

  private load(): LmsStoreState {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const seeded = seedState();
          const restored = JSON.parse(saved) as Partial<LmsStoreState>;
          return {
            ...seeded,
            ...restored,
            offerings: mergeSeeded(seeded.offerings, restored.offerings, (item) => item.id),
            registrationFeed: mergeSeeded(seeded.registrationFeed, restored.registrationFeed, (item) => item.id),
            processedEventIds: [...new Set([...(restored.processedEventIds ?? []), ...seeded.processedEventIds])],
            enrolments: mergeSeeded(seeded.enrolments, restored.enrolments, (item) => `${item.offeringId}:${item.studentId}`),
            content: mergeSeeded(seeded.content, restored.content, (item) => item.id),
            announcements: mergeSeeded(seeded.announcements, restored.announcements, (item) => item.id),
            officeHours: mergeSeeded(seeded.officeHours, restored.officeHours, (item) => item.id),
            assignments: mergeSeeded(seeded.assignments, restored.assignments, (item) => item.id),
          };
        }
      } catch (err) {
        console.warn("Could not read LMS store from localStorage:", err);
      }
    }
    return seedState();
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.warn("Failed to persist LMS store to localStorage:", err);
    }
  }

  getSnapshot(): LmsStoreState {
    return this.state;
  }

  setState(updater: (prev: LmsStoreState) => LmsStoreState) {
    this.state = updater(this.state);
    this.persist();
    this.notify();
  }

  resetToSeed() {
    this.state = seedState();
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Storage may be unavailable; the in-memory reset still applies.
      }
    }
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) listener();
  }
}

export const lmsStore = new LmsStore();
