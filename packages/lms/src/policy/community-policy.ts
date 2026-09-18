/**
 * Participation, moderation, retention, groups and notifications (LMS-04).
 */

import { rolesPermit } from "@tau/identity/policy";
import type { Announcement, CourseGroup, Discussion, DiscussionPost, NotificationChannel, NotificationPreference } from "../domain/community";
import type { Enrolment } from "../domain/offering";
import { check, type LmsActor, type PolicyCheck } from "./check";

/** Critical course messages always reach these channels, whatever the preference. */
export const criticalChannels: NotificationChannel[] = ["InApp", "Email"];

export function notificationChannels(preference: NotificationPreference | undefined, priority: Announcement["priority"]): NotificationChannel[] {
  const preferred = preference?.channels.length ? preference.channels : (["InApp"] as NotificationChannel[]);
  return priority === "Critical" ? [...new Set([...criticalChannels, ...preferred])] : preferred;
}

export function canPost(discussion: Discussion, enrolment: Enrolment | undefined, now: string): PolicyCheck {
  const errors: string[] = [];
  if (enrolment?.status !== "Active") errors.push("Only students on the active class list can post.");
  if (now > discussion.closesAt) errors.push("This discussion is closed.");
  return check(errors);
}

export function initialPostStatus(discussion: Discussion): DiscussionPost["status"] {
  return discussion.moderation === "Pre_Moderated" ? "Pending" : "Visible";
}

export function moderatePostCheck(post: DiscussionPost, action: "Approve" | "Hide", reason: string, actor: LmsActor): PolicyCheck {
  const errors: string[] = [];
  if (!rolesPermit(actor.roleIds, "lms:discussion:moderate")) errors.push("Your roles do not include discussion moderation.");
  if (action === "Approve" && post.status !== "Pending") errors.push("Only a post awaiting moderation can be approved.");
  if (action === "Hide" && post.status === "Hidden") errors.push("This post is already hidden.");
  if (action === "Hide" && !reason.trim()) errors.push("Record why the post is hidden; the author is told.");
  return check(errors);
}

export interface ParticipationRow {
  studentId: string;
  studentName: string;
  posts: number;
  met: boolean;
}

/** Counts posts made by the due date that were not hidden by a moderator. */
export function participationSummary(discussion: Discussion, posts: DiscussionPost[], enrolments: Enrolment[]): ParticipationRow[] {
  return enrolments
    .filter((enrolment) => enrolment.offeringId === discussion.offeringId && enrolment.status === "Active")
    .map((enrolment) => {
      const count = posts.filter((post) => post.discussionId === discussion.id && post.authorId === enrolment.studentId && post.status !== "Hidden" && post.postedAt <= discussion.participation.dueAt).length;
      return { studentId: enrolment.studentId, studentName: enrolment.studentName, posts: count, met: count >= discussion.participation.minimumPosts };
    });
}

export function retentionDeleteAfter(discussion: Discussion): string {
  return new Date(Date.parse(discussion.closesAt) + discussion.retentionDays * 86_400_000).toISOString();
}

export interface GroupIssues {
  unassigned: Enrolment[];
  inSeveralGroups: string[];
  inactiveMembers: string[];
}

export function groupIssues(groups: CourseGroup[], enrolments: Enrolment[], offeringId: string): GroupIssues {
  const active = enrolments.filter((item) => item.offeringId === offeringId && item.status === "Active");
  const activeIds = new Set(active.map((item) => item.studentId));
  const memberships = groups.filter((group) => group.offeringId === offeringId).flatMap((group) => group.memberIds);
  const counts = memberships.reduce<Record<string, number>>((acc, id) => ({ ...acc, [id]: (acc[id] ?? 0) + 1 }), {});
  return {
    unassigned: active.filter((item) => !counts[item.studentId]),
    inSeveralGroups: Object.keys(counts).filter((id) => counts[id] > 1),
    inactiveMembers: [...new Set(memberships.filter((id) => !activeIds.has(id)))],
  };
}
