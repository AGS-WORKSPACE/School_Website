/**
 * Announcements, discussions, groups, live sessions and office hours (LMS-04).
 */

export type NotificationChannel = "InApp" | "Email" | "SMS" | "Push";

export interface NotificationPreference {
  studentId: string;
  channels: NotificationChannel[];
}

export interface Announcement {
  id: string;
  offeringId: string;
  title: string;
  body: string;
  priority: "Normal" | "Critical";
  postedBy: string;
  postedByName: string;
  postedAt: string;
}

export interface Discussion {
  id: string;
  offeringId: string;
  title: string;
  prompt: string;
  moderation: "Post_Moderated" | "Pre_Moderated";
  participation: { minimumPosts: number; dueAt: string; counted: boolean };
  /** Posts are deleted this many days after the discussion closes. */
  retentionDays: number;
  closesAt: string;
}

export interface DiscussionPost {
  id: string;
  discussionId: string;
  authorId: string;
  authorName: string;
  body: string;
  postedAt: string;
  status: "Visible" | "Pending" | "Hidden";
  moderatedBy?: string;
  moderatedByName?: string;
  moderationReason?: string;
}

export interface CourseGroup {
  id: string;
  offeringId: string;
  name: string;
  memberIds: string[];
}

export interface LiveSession {
  id: string;
  offeringId: string;
  title: string;
  startsAt: string;
  durationMinutes: number;
  joinUrl: string;
  recording: "Not_Recorded" | "Recorded_With_Notice";
  captioned: boolean;
}

export interface OfficeHours {
  id: string;
  offeringId: string;
  staffName: string;
  weekday: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  startTime: string;
  endTime: string;
  location?: string;
  onlineUrl?: string;
}

/** One announcement's delivery plan for one student, honouring preferences. */
export interface NotificationDelivery {
  id: string;
  announcementId: string;
  studentId: string;
  channels: NotificationChannel[];
  queuedAt: string;
}
