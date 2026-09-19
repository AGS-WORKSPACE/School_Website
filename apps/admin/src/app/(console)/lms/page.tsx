"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, BookOpenCheck, PlugZap, Users } from "lucide-react";
import { useCurriculum } from "@tau/curriculum";
import {
  activeRoster, contentReport, integrationHealth, lmsActors, outcomeCoverage, pendingRegistrationEvents, useLms, validateCourseworkWeights, type DeliveryMode,
} from "@tau/lms";
import { rolesPermit } from "@tau/identity";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { Stat } from "@/components/console/stat";
import { LmsActorSwitcher, useLmsActor } from "@/features/lms/acting-as";
import { formatDateTime, humanise } from "@/lib/format";

const modes: DeliveryMode[] = ["Face_To_Face", "Blended", "Online"];
const lecturers = lmsActors.filter((actor) => rolesPermit(actor.roleIds, "lms:course:teach"));

export default function LmsOverviewPage() {
  const lms = useLms();
  const { courses } = useCurriculum();
  const actor = useLmsActor();
  const { notice, announce } = useNotice();
  const [now] = useState(() => new Date().toISOString());
  const publishedCourses = courses.filter((course) => course.versions.find((version) => version.id === course.activeVersionId)?.status === "Published");
  const [draft, setDraft] = useState({ courseId: publishedCourses[0]?.id ?? "", deliveryMode: "Blended" as DeliveryMode, session: "2026/2027", semester: "1", lecturerId: lecturers[0]?.personId ?? "" });

  const alerting = lms.integrations.filter((integration) => integrationHealth(lms.integrationEvents, integration.id, now, 72).some((row) => row.alert));
  const contentIssues = lms.offerings.reduce((sum, offering) => {
    const report = contentReport(lms.content.filter((item) => item.offeringId === offering.id));
    return sum + report.accessibilityIssueCount + report.lowBandwidthIssueCount;
  }, 0);

  function buildShell() {
    const course = courses.find((item) => item.id === draft.courseId);
    const lecturer = lecturers.find((item) => item.personId === draft.lecturerId);
    if (!course || !lecturer) return;
    announce(
      lms.mutations.buildShell({ course, courseVersionId: course.activeVersionId, deliveryMode: draft.deliveryMode, session: draft.session.trim(), semester: draft.semester === "2" ? 2 : 1, lecturer: { personId: lecturer.personId, name: lecturer.name } }, actor),
      `${course.code} shell created from ${course.activeVersionId} with its approved outcomes and assessment scheme.`,
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-14 · Learning"
        title="Course delivery"
        description="Course shells built from approved curriculum versions, rostered from SIS registration, and checked for low-bandwidth use, accessibility and coursework rules."
        actions={<><LmsActorSwitcher /><Button variant="outline" size="sm" className="self-end" onClick={lms.resetLmsStore}>Reset demo data</Button></>}
      />
      <NoticeBanner notice={notice} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Course shells" value={lms.offerings.length} hint={`${lms.templates.filter((t) => t.status === "Approved").length} approved templates`} icon={BookOpenCheck} href="/lms/templates" />
        <Stat label="Active learners" value={lms.enrolments.filter((item) => item.status === "Active").length} hint="Rostered from SIS registration" icon={Users} />
        <Stat label="Content issues" value={contentIssues} hint="Accessibility and low-bandwidth" icon={Activity} tone={contentIssues ? "warning" : "good"} />
        <Stat label="Integrations alerting" value={alerting.length} hint={`${lms.integrations.filter((i) => i.status === "Active").length} active integrations`} icon={PlugZap} tone={alerting.length ? "danger" : "good"} href="/lms/integrations" />
      </div>

      <Section title="Course shells" description="Roster, outcome coverage, content checks and coursework rules for each offering.">
        {lms.offerings.length === 0 ? <EmptyState message="No course shells yet." /> : (
          <div className="overflow-x-auto">
            <Table className="min-w-[72rem] table-fixed text-xs">
              <colgroup>
                <col style={{ width: "40%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "16%" }} />
              </colgroup>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Roster</TableHead>
                  <TableHead>Outcomes covered</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Coursework</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lms.offerings.map((offering) => {
                  const pending = pendingRegistrationEvents(lms.registrationFeed, lms.processedEventIds, offering.id).length;
                  const coverage = outcomeCoverage(offering, lms.content, lms.assignments);
                  const report = contentReport(lms.content.filter((item) => item.offeringId === offering.id));
                  const weights = validateCourseworkWeights(lms.assignments, offering);
                  const latest = lms.passbacks.filter((item) => item.offeringId === offering.id).sort((a, b) => b.version - a.version)[0];
                  return (
                    <TableRow key={offering.id}>
                      <TableCell>
                        <Link href={`/lms/${offering.id}`} className="font-semibold text-primary hover:underline">{offering.courseCode} · {offering.courseTitle}</Link>
                        <div className="text-xs text-muted-foreground">{offering.session} semester {offering.semester} · {offering.lecturers.map((item) => item.name).join(", ")}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{humanise(offering.deliveryMode)}</Badge></TableCell>
                      <TableCell className="text-sm">{activeRoster(lms.enrolments, offering.id).length} active{pending > 0 && <div className="text-xs font-medium text-accent-foreground">{pending} SIS change(s) waiting</div>}</TableCell>
                      <TableCell className="text-sm">{coverage.filter((row) => row.covered).length} of {coverage.length}</TableCell>
                      <TableCell>{report.passes ? <Badge variant="success" className="whitespace-nowrap px-2 py-0.5 text-[11px]">Meets checks</Badge> : <Badge variant="warning" className="whitespace-nowrap px-2 py-0.5 text-[11px]">{report.accessibilityIssueCount + report.lowBandwidthIssueCount} content issues</Badge>}</TableCell>
                      <TableCell className="text-xs">
                        {weights.allowed ? <Badge variant="success" className="whitespace-nowrap px-2 py-0.5 text-[11px]">Weights match scheme</Badge> : <Badge variant="destructive" className="whitespace-nowrap px-2 py-0.5 text-[11px]">Weights off scheme</Badge>}
                        <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{latest ? `Passback v${latest.version}, ${formatDateTime(latest.submittedAt)}` : "Not yet passed back"}</div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>

      <Section title="Build a course shell" description="Uses the published curriculum version's outcomes and assessment scheme, and the newest approved template for the delivery mode. Needs the course design permission.">
        <form className="grid gap-4 md:grid-cols-5" onSubmit={(event) => { event.preventDefault(); buildShell(); }}>
          <div className="space-y-1.5 md:col-span-2"><Label htmlFor="shell-course">Course (published version)</Label><NativeSelect id="shell-course" value={draft.courseId} onChange={(e) => setDraft({ ...draft, courseId: e.target.value })}>{publishedCourses.map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}</NativeSelect></div>
          <div className="space-y-1.5"><Label htmlFor="shell-mode">Delivery</Label><NativeSelect id="shell-mode" value={draft.deliveryMode} onChange={(e) => setDraft({ ...draft, deliveryMode: e.target.value as DeliveryMode })}>{modes.map((mode) => <option key={mode} value={mode}>{humanise(mode)}</option>)}</NativeSelect></div>
          <div className="space-y-1.5"><Label htmlFor="shell-session">Session</Label><Input id="shell-session" value={draft.session} onChange={(e) => setDraft({ ...draft, session: e.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="shell-semester">Semester</Label><NativeSelect id="shell-semester" value={draft.semester} onChange={(e) => setDraft({ ...draft, semester: e.target.value })}><option value="1">First</option><option value="2">Second</option></NativeSelect></div>
          <div className="space-y-1.5 md:col-span-2"><Label htmlFor="shell-lecturer">Lecturer</Label><NativeSelect id="shell-lecturer" value={draft.lecturerId} onChange={(e) => setDraft({ ...draft, lecturerId: e.target.value })}>{lecturers.map((item) => <option key={item.personId} value={item.personId}>{item.name}</option>)}</NativeSelect></div>
          <div className="flex items-end md:col-span-3"><Button type="submit">Build shell</Button></div>
        </form>
      </Section>

      <Section title="Recent activity" description="Every accepted LMS change, newest first.">
        {lms.audit.length === 0 ? <EmptyState message="No changes yet in this session." /> : (
          <div className="divide-y">
            {lms.audit.slice(0, 12).map((entry) => (
              <div key={entry.id} className="grid gap-1 py-2 sm:grid-cols-[7rem_1fr_auto]">
                <span className="text-xs font-semibold uppercase text-muted-foreground">{entry.entity}</span>
                <div><div className="text-sm font-semibold">{humanise(entry.action)}</div><div className="text-xs text-muted-foreground">{entry.detail}</div></div>
                <div className="text-right text-xs text-muted-foreground">{entry.actorName}<br />{formatDateTime(entry.at)}</div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
