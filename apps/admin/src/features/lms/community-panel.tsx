"use client";

import { useState } from "react";
import { CalendarClock, Video } from "lucide-react";
import { groupIssues, participationSummary, retentionDeleteAfter, useLms, type Announcement, type CourseOffering, type DiscussionPost } from "@tau/lms";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Textarea } from "@tau/ui/textarea";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { formatDate, formatDateTime, humanise, statusKey } from "@/lib/format";
import { useLmsActor } from "./acting-as";

export function CommunityPanel({ offering }: { offering: CourseOffering }) {
  const lms = useLms();
  const actor = useLmsActor();
  const { notice, announce } = useNotice();
  const [draft, setDraft] = useState({ title: "", body: "", priority: "Normal" as Announcement["priority"] });
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const announcements = lms.announcements.filter((item) => item.offeringId === offering.id);
  const discussions = lms.discussions.filter((item) => item.offeringId === offering.id);
  const groups = lms.groups.filter((item) => item.offeringId === offering.id);
  const issues = groupIssues(lms.groups, lms.enrolments, offering.id);
  const nameOf = (studentId: string) => lms.enrolments.find((item) => item.studentId === studentId)?.studentName ?? studentId;

  function post() {
    if (announce(lms.mutations.postAnnouncement(offering.id, draft, actor), `${draft.priority} announcement posted and queued to each learner's channels.`)) setDraft({ title: "", body: "", priority: "Normal" });
  }

  function moderate(item: DiscussionPost, action: "Approve" | "Hide") {
    announce(lms.mutations.moderatePost(item.id, action, reasons[item.id] ?? "", actor), action === "Approve" ? "Post approved and now visible." : "Post hidden; the reason is recorded.");
  }

  return (
    <div className="space-y-6">
      <NoticeBanner notice={notice} />

      <Section title="Announcements" description="Normal messages follow each learner's channel preferences. Critical messages always add in-app and email.">
        <div className="space-y-3">
          {announcements.map((item) => {
            const deliveries = lms.deliveries.filter((delivery) => delivery.announcementId === item.id);
            const byChannel = deliveries.flatMap((delivery) => delivery.channels).reduce<Record<string, number>>((acc, channel) => ({ ...acc, [channel]: (acc[channel] ?? 0) + 1 }), {});
            return (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="font-semibold">{item.title}</div>
                  {item.priority === "Critical" ? <Badge variant="destructive">Critical</Badge> : <Badge variant="outline">Normal</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{item.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.postedByName} · {formatDateTime(item.postedAt)}</p>
                {deliveries.length > 0 && <p className="mt-1 text-xs">Queued to {deliveries.length} learner(s): {Object.entries(byChannel).map(([channel, count]) => `${channel} ×${count}`).join(", ")}</p>}
              </div>
            );
          })}
        </div>
        <form className="mt-5 grid gap-3 border-t pt-4 md:grid-cols-4" onSubmit={(event) => { event.preventDefault(); post(); }}>
          <div className="space-y-1.5 md:col-span-3"><Label htmlFor="ann-title">Title</Label><Input id="ann-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="ann-priority">Priority</Label><NativeSelect id="ann-priority" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Announcement["priority"] })}><option>Normal</option><option>Critical</option></NativeSelect></div>
          <div className="space-y-1.5 md:col-span-4"><Label htmlFor="ann-body">Message</Label><Textarea id="ann-body" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} /></div>
          <div className="md:col-span-4"><Button type="submit">Post announcement</Button></div>
        </form>
      </Section>

      {discussions.map((discussion) => {
        const posts = lms.posts.filter((item) => item.discussionId === discussion.id);
        const participation = participationSummary(discussion, lms.posts, lms.enrolments);
        return (
          <Section
            key={discussion.id}
            title={discussion.title}
            description={`${humanise(discussion.moderation)} · at least ${discussion.participation.minimumPosts} post(s) by ${formatDate(discussion.participation.dueAt)}${discussion.participation.counted ? " (counts toward participation)" : ""} · closes ${formatDate(discussion.closesAt)} · deleted after ${formatDate(retentionDeleteAfter(discussion))}`}
          >
            <p className="mb-4 text-sm">{discussion.prompt}</p>
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <ul className="space-y-3">
                {posts.length === 0 && <EmptyState message="No posts yet." />}
                {posts.map((item) => (
                  <li key={item.id} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="text-sm font-semibold">{item.authorName}</div>
                      <StatusBadge status={statusKey(item.status)} />
                    </div>
                    <p className="text-sm">{item.body}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(item.postedAt)}{item.moderationReason && ` · ${item.moderatedByName}: ${item.moderationReason}`}</p>
                    {item.status !== "Hidden" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Input className="max-w-xs" placeholder="Reason (required to hide)" value={reasons[item.id] ?? ""} onChange={(e) => setReasons({ ...reasons, [item.id]: e.target.value })} aria-label={`Moderation reason for ${item.authorName}'s post`} />
                        {item.status === "Pending" && <Button size="sm" onClick={() => moderate(item, "Approve")}>Approve</Button>}
                        <Button size="sm" variant="outline" onClick={() => moderate(item, "Hide")}>Hide</Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Participation</h3>
                <ul className="divide-y text-sm">
                  {participation.map((row) => (
                    <li key={row.studentId} className="flex items-center justify-between py-1.5">
                      <span>{row.studentName}</span>
                      <span className="text-xs">{row.posts}/{discussion.participation.minimumPosts} {row.met ? <Badge variant="success">Met</Badge> : <Badge variant="muted">Not yet</Badge>}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">Hidden posts and posts after the due date do not count.</p>
              </div>
            </div>
          </Section>
        );
      })}

      <Section title="Groups" description="Every active learner belongs to exactly one group.">
        <div className="grid gap-3 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.id} className="rounded-lg border p-3">
              <div className="font-semibold">{group.name}</div>
              <ul className="mt-1 text-sm text-muted-foreground">{group.memberIds.map((id) => <li key={id}>{nameOf(id)}{issues.inactiveMembers.includes(id) && " (no longer registered)"}</li>)}</ul>
            </div>
          ))}
        </div>
        {issues.unassigned.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-accent-foreground">Not in a group: {issues.unassigned.map((item) => item.studentName).join(", ")}</p>
            {issues.unassigned.map((item) => (
              <div key={item.studentId} className="flex flex-wrap items-center gap-2 text-sm">
                <span>{item.studentName} →</span>
                {groups.map((group) => <Button key={group.id} size="sm" variant="outline" onClick={() => announce(lms.mutations.addToGroup(group.id, item.studentId, actor), `${item.studentName} added to ${group.name}.`)}>{group.name}</Button>)}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Live sessions and office hours" description="Live sessions are optional extras; recordings are announced in advance.">
        <ul className="space-y-3">
          {lms.liveSessions.filter((item) => item.offeringId === offering.id).map((session) => (
            <li key={session.id} className="flex flex-wrap items-start gap-3 rounded-lg border p-3">
              <Video className="mt-0.5 size-4 text-primary" aria-hidden />
              <div className="flex-1">
                <div className="font-semibold">{session.title}</div>
                <div className="text-xs text-muted-foreground">{formatDateTime(session.startsAt)} · {session.durationMinutes} min · {humanise(session.recording)} · {session.captioned ? "Live captions" : "No live captions"}</div>
                <a href={session.joinUrl} className="text-xs text-primary hover:underline">{session.joinUrl}</a>
              </div>
            </li>
          ))}
          {lms.officeHours.filter((item) => item.offeringId === offering.id).map((hours) => (
            <li key={hours.id} className="flex flex-wrap items-start gap-3 rounded-lg border p-3">
              <CalendarClock className="mt-0.5 size-4 text-primary" aria-hidden />
              <div>
                <div className="font-semibold">Office hours · {hours.staffName}</div>
                <div className="text-xs text-muted-foreground">{hours.weekday}s {hours.startTime}–{hours.endTime}{hours.location && ` · ${hours.location}`}{hours.onlineUrl && ` · online: ${hours.onlineUrl}`}</div>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
