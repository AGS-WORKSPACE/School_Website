"use client";

import { useState } from "react";
import { BookOpen, CalendarClock, CheckCircle2, CircleDashed, FileText, Megaphone, MessageSquare, Video, Wifi, WifiOff } from "lucide-react";
import {
  criticalChannels, formatBytes, lateOutcome, lightestSize, useLms, gradePercent,
  type ContentItem, type NotificationChannel, type ProgressEntry,
} from "@tau/lms";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tau/ui/card";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Textarea } from "@tau/ui/textarea";

const channels: NotificationChannel[] = ["InApp", "Email", "SMS", "Push"];
const channelLabel: Record<NotificationChannel, string> = { InApp: "In the portal", Email: "Email", SMS: "SMS", Push: "Phone notifications" };
const deviceId = "web-demo";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function Learning() {
  const lms = useLms();
  const learners = [...new Map(lms.enrolments.filter((item) => item.status === "Active").map((item) => [item.studentId, item])).values()];
  const [studentId, setStudentId] = useState(learners[0]?.studentId ?? "");
  const myEnrolments = lms.enrolments.filter((item) => item.studentId === studentId && item.status === "Active");
  const [offeringId, setOfferingId] = useState(myEnrolments[0]?.offeringId ?? "");
  const [lowBandwidth, setLowBandwidth] = useState(true);
  const [online, setOnline] = useState(true);
  const [queue, setQueue] = useState<ProgressEntry[]>([]);
  const [sequence, setSequence] = useState(1000);
  const [message, setMessage] = useState<{ ok: boolean; text: string }>();
  const [postDrafts, setPostDrafts] = useState<Record<string, string>>({});

  const offering = lms.offerings.find((item) => item.id === offeringId && myEnrolments.some((enrolment) => enrolment.offeringId === item.id));
  const learner = learners.find((item) => item.studentId === studentId);
  if (!learner) return null;

  const content = lms.content.filter((item) => item.offeringId === offering?.id);
  const modules = [...new Set(content.map((item) => item.module))];
  const preference = lms.preferences.find((item) => item.studentId === studentId)?.channels ?? ["InApp"];

  function progressOf(item: ContentItem) {
    const queued = queue.filter((entry) => entry.itemId === item.id).at(-1);
    return queued ?? lms.progress.find((entry) => entry.studentId === studentId && entry.itemId === item.id);
  }

  function record(item: ContentItem, percent: number) {
    const entry: ProgressEntry = { studentId, itemId: item.id, percent, completed: percent >= 100, updatedAt: new Date().toISOString(), deviceId, sequence };
    setSequence(sequence + 1);
    if (online) {
      const result = lms.mutations.syncProgress([entry]);
      setMessage({ ok: true, text: result.data?.applied ? "Progress saved." : "Already recorded — nothing changed." });
    } else {
      setQueue([...queue, entry]);
      setMessage({ ok: true, text: "You're offline. Progress is kept on this device and will sync when you reconnect." });
    }
  }

  function reconnect() {
    setOnline(true);
    if (queue.length === 0) return setMessage({ ok: true, text: "Back online." });
    const result = lms.mutations.syncProgress(queue);
    setQueue([]);
    setMessage({ ok: true, text: `Back online: ${result.data?.applied ?? 0} update(s) saved, ${result.data?.ignored ?? 0} already on the server.` });
  }

  function togglePreference(channel: NotificationChannel) {
    const next = preference.includes(channel) ? preference.filter((item) => item !== channel) : [...preference, channel];
    lms.mutations.setPreference(studentId, next);
  }

  function post(discussionId: string) {
    const result = lms.mutations.addPost(discussionId, studentId, postDrafts[discussionId] ?? "");
    setMessage(result.ok ? { ok: true, text: result.data?.status === "Pending" ? "Posted. A moderator will approve it before others see it." : "Posted." } : { ok: false, text: result.error ?? "Could not post." });
    if (result.ok) setPostDrafts({ ...postDrafts, [discussionId]: "" });
  }

  return (
    <div className="bg-muted/25 py-12 sm:py-20">
      <div className="container-site max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><BookOpen className="size-6" aria-hidden /></div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">My courses</div>
              <h1 className="text-2xl font-bold">{offering ? `${offering.courseCode} · ${offering.courseTitle}` : "No active courses"}</h1>
              <div className="text-sm text-muted-foreground">{learner.studentName} · {learner.matriculationNumber}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Demonstration: view as
              <NativeSelect value={studentId} onChange={(e) => { const next = e.target.value; setStudentId(next); setOfferingId(lms.enrolments.find((item) => item.studentId === next && item.status === "Active")?.offeringId ?? ""); setQueue([]); setMessage(undefined); }} className="w-56">
                {learners.map((item) => <option key={item.studentId} value={item.studentId}>{item.studentName}</option>)}
              </NativeSelect>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Course
              <NativeSelect value={offering?.id ?? ""} onChange={(e) => setOfferingId(e.target.value)} className="w-40">
                {myEnrolments.map((item) => { const course = lms.offerings.find((o) => o.id === item.offeringId); return <option key={item.offeringId} value={item.offeringId}>{course?.courseCode}</option>; })}
              </NativeSelect>
            </label>
          </div>
        </div>

        {message && <div role={message.ok ? "status" : "alert"} className={`rounded-xl border p-4 text-sm font-medium ${message.ok ? "border-primary/20 bg-primary/5" : "border-destructive/30 bg-destructive/5 text-destructive"}`}>{message.text}</div>}

        {offering && (
          <>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={lowBandwidth} onChange={(e) => setLowBandwidth(e.target.checked)} />
                Low-bandwidth mode — show transcripts and lighter versions first
              </label>
              <div className="ml-auto flex items-center gap-2">
                {online ? <Badge variant="success"><Wifi className="mr-1 size-3.5" aria-hidden />Online</Badge> : <Badge variant="warning"><WifiOff className="mr-1 size-3.5" aria-hidden />Offline · {queue.length} change(s) waiting</Badge>}
                {online ? <Button size="sm" variant="outline" onClick={() => { setOnline(false); setMessage(undefined); }}>Simulate lost connection</Button> : <Button size="sm" onClick={reconnect}>Reconnect and sync</Button>}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
              <div className="space-y-6">
                {modules.map((module) => (
                  <Card key={module}>
                    <CardHeader className="border-b"><CardTitle className="text-lg">{module}</CardTitle></CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {content.filter((item) => item.module === module).map((item) => {
                        const progress = progressOf(item);
                        const text = item.alternatives.find((alt) => alt.kind === "Transcript" || alt.kind === "Text_Summary");
                        const captions = item.alternatives.some((alt) => alt.kind === "Captions");
                        return (
                          <div key={item.id} className="rounded-lg border p-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                {item.kind === "Video" ? <Video className="mt-0.5 size-4 text-primary" aria-hidden /> : <FileText className="mt-0.5 size-4 text-primary" aria-hidden />}
                                <div>
                                  <div className="font-semibold">{item.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.kind} · {lowBandwidth && lightestSize(item) < item.sizeBytes ? <>{formatBytes(lightestSize(item))} light version <span className="line-through">{formatBytes(item.sizeBytes)}</span></> : formatBytes(item.sizeBytes)}
                                    {item.essential ? " · essential" : " · optional"}
                                  </div>
                                </div>
                              </div>
                              {progress?.completed ? <Badge variant="success"><CheckCircle2 className="mr-1 size-3.5" aria-hidden />Done</Badge> : progress ? <Badge variant="outline">{progress.percent}%</Badge> : <Badge variant="muted"><CircleDashed className="mr-1 size-3.5" aria-hidden />Not started</Badge>}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              {text && <Badge variant="secondary">{text.kind === "Transcript" ? "Transcript" : "Text summary"} · {formatBytes(text.sizeBytes)}</Badge>}
                              {captions && <Badge variant="secondary">Captions</Badge>}
                              {item.kind === "Video" && !text && <Badge variant="warning">No transcript yet — your lecturer has been told</Badge>}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" onClick={() => record(item, 50)}>Mark halfway</Button>
                              <Button size="sm" onClick={() => record(item, 100)}>Mark complete</Button>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}

                <Card>
                  <CardHeader className="border-b"><CardTitle className="flex items-center gap-2 text-lg"><MessageSquare className="size-5" aria-hidden />Discussions</CardTitle></CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    {lms.discussions.filter((item) => item.offeringId === offering.id).map((discussion) => {
                      const posts = lms.posts.filter((item) => item.discussionId === discussion.id && (item.status === "Visible" || item.authorId === studentId));
                      const mine = posts.filter((item) => item.authorId === studentId && item.status !== "Hidden").length;
                      return (
                        <div key={discussion.id}>
                          <h3 className="font-semibold">{discussion.title}</h3>
                          <p className="text-sm text-muted-foreground">{discussion.prompt}</p>
                          <p className="mt-1 text-xs">You have {mine} of {discussion.participation.minimumPosts} post(s) due {formatDate(discussion.participation.dueAt)}{discussion.moderation === "Pre_Moderated" && " · posts are checked before they appear"}.</p>
                          <ul className="mt-3 space-y-2">
                            {posts.map((item) => (
                              <li key={item.id} className="rounded-lg bg-muted/40 p-2 text-sm">
                                <span className="font-medium">{item.authorName}</span>{item.status === "Pending" && <Badge variant="warning" className="ml-2">Awaiting moderation</Badge>}{item.status === "Hidden" && <Badge variant="muted" className="ml-2">Hidden: {item.moderationReason}</Badge>}
                                <p>{item.body}</p>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 space-y-2">
                            <Label htmlFor={`post-${discussion.id}`}>Your reply</Label>
                            <Textarea id={`post-${discussion.id}`} value={postDrafts[discussion.id] ?? ""} onChange={(e) => setPostDrafts({ ...postDrafts, [discussion.id]: e.target.value })} />
                            <Button size="sm" onClick={() => post(discussion.id)}>Post</Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Megaphone className="size-5" aria-hidden />Announcements</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {lms.announcements.filter((item) => item.offeringId === offering.id).map((item) => (
                      <div key={item.id} className="text-sm">
                        <div className="font-semibold">{item.title} {item.priority === "Critical" && <Badge variant="destructive" className="ml-1">Important</Badge>}</div>
                        <p className="text-muted-foreground">{item.body}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.postedAt)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg">Coursework</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {lms.assignments.filter((item) => item.offeringId === offering.id).map((assignment) => {
                      const extension = lms.extensions.find((item) => item.assignmentId === assignment.id && item.studentId === studentId);
                      const submission = lms.submissions.find((item) => item.assignmentId === assignment.id && item.studentId === studentId);
                      const late = lateOutcome(assignment, submission, extension);
                      const grade = lms.grades.find((item) => item.assignmentId === assignment.id && item.studentId === studentId && item.status !== "Draft");
                      return (
                        <div key={assignment.id} className="text-sm">
                          <div className="font-semibold">{assignment.title}</div>
                          <div className="text-xs text-muted-foreground">{assignment.weightPercent}% · due {formatDate(late.dueAt)}{extension && " (extended)"}</div>
                          <div className="text-xs">Late work: {assignment.latePolicy.graceMinutes} min grace, then −{assignment.latePolicy.penaltyPercentPerDay}% a day; not accepted after {assignment.latePolicy.maxLateDays} days.</div>
                          <div className="mt-1 text-xs font-medium">{late.state.replaceAll("_", " ")}{late.state === "Late" && ` · −${late.penaltyPercent}%`}</div>
                          {grade && <div className="mt-1 rounded bg-muted/40 p-2 text-xs"><span className="font-semibold">{gradePercent(assignment, grade, late)}%{grade.status === "Final" ? " (final)" : " (provisional)"}</span> — {grade.feedback}</div>}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CalendarClock className="size-5" aria-hidden />Live and office hours</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {lms.liveSessions.filter((item) => item.offeringId === offering.id).map((item) => <p key={item.id}><span className="font-medium">{item.title}</span><br /><span className="text-xs text-muted-foreground">{formatDate(item.startsAt)} · {item.durationMinutes} min · {item.recording === "Recorded_With_Notice" ? "recorded" : "not recorded"}{item.captioned && " · live captions"}</span></p>)}
                    {lms.officeHours.filter((item) => item.offeringId === offering.id).map((item) => <p key={item.id}><span className="font-medium">Office hours</span><br /><span className="text-xs text-muted-foreground">{item.weekday}s {item.startTime}–{item.endTime}{item.location && ` · ${item.location}`}</span></p>)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg">How we contact you</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <fieldset className="space-y-2">
                      <legend className="sr-only">Notification channels</legend>
                      {channels.map((channel) => (
                        <label key={channel} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={preference.includes(channel)} onChange={() => togglePreference(channel)} />{channelLabel[channel]}</label>
                      ))}
                    </fieldset>
                    <p className="text-xs text-muted-foreground">Important course messages always reach you by {criticalChannels.map((channel) => channelLabel[channel].toLowerCase()).join(" and ")}.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
