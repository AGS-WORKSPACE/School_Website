"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, BookOpenCheck, PlugZap, Search, SlidersHorizontal, Users, X } from "lucide-react";
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
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<DeliveryMode | "All">("All");
  const [sessionFilter, setSessionFilter] = useState("All");

  const sessions = [...new Set(lms.offerings.map((offering) => offering.session))].sort().reverse();
  const normalisedQuery = query.trim().toLowerCase();
  const filteredOfferings = lms.offerings.filter((offering) => {
    const matchesQuery = !normalisedQuery || [offering.courseCode, offering.courseTitle, ...offering.lecturers.map((lecturer) => lecturer.name)]
      .some((value) => value.toLowerCase().includes(normalisedQuery));
    const matchesMode = modeFilter === "All" || offering.deliveryMode === modeFilter;
    const matchesSession = sessionFilter === "All" || offering.session === sessionFilter;
    return matchesQuery && matchesMode && matchesSession;
  });
  const filtersActive = Boolean(normalisedQuery || modeFilter !== "All" || sessionFilter !== "All");

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
        description="Manage courses, class lists, and learning activities."
        actions={<><LmsActorSwitcher /><Button variant="outline" size="sm" className="self-end" onClick={lms.resetLmsStore}>Reset demo data</Button></>}
      />
      <NoticeBanner notice={notice} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Course shells" value={lms.offerings.length} hint={`${lms.templates.filter((t) => t.status === "Approved").length} approved templates`} icon={BookOpenCheck} href="/lms/templates" />
        <Stat label="Active learners" value={lms.enrolments.filter((item) => item.status === "Active").length} hint="Rostered from SIS registration" icon={Users} />
        <Stat label="Content issues" value={contentIssues} hint="Accessibility and low-bandwidth" icon={Activity} tone={contentIssues ? "warning" : "good"} />
        <Stat label="Integrations alerting" value={alerting.length} hint={`${lms.integrations.filter((i) => i.status === "Active").length} active integrations`} icon={PlugZap} tone={alerting.length ? "danger" : "good"} href="/lms/integrations" />
      </div>

      <Section
        title="Find a course shell"
        description="Search by course code, title or lecturer, then narrow the list."
        contentClassName="space-y-4"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_13rem_12rem_auto] lg:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="course-search">Search courses</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="course-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Code, course title or lecturer"
                className="h-11 pl-9 pr-10"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Clear search">
                  <X className="size-4" aria-hidden />
                </button>
              ) : null}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="course-delivery">Delivery mode</Label>
            <NativeSelect id="course-delivery" value={modeFilter} onChange={(event) => setModeFilter(event.target.value as DeliveryMode | "All")} className="h-11">
              <option value="All">All delivery modes</option>
              {modes.map((mode) => <option key={mode} value={mode}>{humanise(mode)}</option>)}
            </NativeSelect>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="course-session">Session</Label>
            <NativeSelect id="course-session" value={sessionFilter} onChange={(event) => setSessionFilter(event.target.value)} className="h-11">
              <option value="All">All sessions</option>
              {sessions.map((session) => <option key={session} value={session}>{session}</option>)}
            </NativeSelect>
          </div>
          <Button type="button" variant="outline" className="h-11" disabled={!filtersActive} onClick={() => { setQuery(""); setModeFilter("All"); setSessionFilter("All"); }}>
            <SlidersHorizontal className="size-4" aria-hidden /> Reset
          </Button>
        </div>
        <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span aria-live="polite">Showing {filteredOfferings.length} of {lms.offerings.length} course shells</span>
          {filtersActive ? <Badge variant="secondary">Filters applied</Badge> : null}
        </div>
      </Section>

      <Section title="Course shells" description="Roster, content checks and coursework status for each offering.">
        {lms.offerings.length === 0 ? <EmptyState message="No course shells yet." /> : filteredOfferings.length === 0 ? (
          <EmptyState message="No course shells match these filters. Clear a filter or try another search." />
        ) : (
          <>
          <div className="hidden overflow-x-auto md:block">
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
                {filteredOfferings.map((offering) => {
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
          <div className="grid gap-3 md:hidden">
            {filteredOfferings.map((offering) => {
              const pending = pendingRegistrationEvents(lms.registrationFeed, lms.processedEventIds, offering.id).length;
              const report = contentReport(lms.content.filter((item) => item.offeringId === offering.id));
              const weights = validateCourseworkWeights(lms.assignments, offering);
              return (
                <Link key={offering.id} href={`/lms/${offering.id}`} className="rounded-xl border bg-card p-4 shadow-card transition hover:border-primary/30 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-primary">{offering.courseCode}</p>
                      <h3 className="mt-1 font-display text-base font-bold leading-snug">{offering.courseTitle}</h3>
                    </div>
                    <Badge variant="outline" className="shrink-0">{humanise(offering.deliveryMode)}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{offering.session} · Semester {offering.semester}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{offering.lecturers.map((item) => item.name).join(", ")}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <span className="rounded-lg bg-muted/60 p-2"><strong className="block text-sm text-foreground">{activeRoster(lms.enrolments, offering.id).length}</strong>Active learners{pending ? ` · ${pending} waiting` : ""}</span>
                    <span className="rounded-lg bg-muted/60 p-2"><strong className="block text-sm text-foreground">{report.accessibilityIssueCount + report.lowBandwidthIssueCount}</strong>Content issues</span>
                  </div>
                  <div className="mt-3">{weights.allowed ? <Badge variant="success">Coursework ready</Badge> : <Badge variant="destructive">Review coursework</Badge>}</div>
                </Link>
              );
            })}
          </div>
          </>
        )}
      </Section>

      <Section title="Build a course shell" description="Uses the published curriculum version's outcomes and assessment scheme, and the newest approved template for the delivery mode. Needs the course design permission.">
        <form className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" onSubmit={(event) => { event.preventDefault(); buildShell(); }}>
          <div className="space-y-1.5 md:col-span-2"><Label htmlFor="shell-course">Course (published version)</Label><NativeSelect id="shell-course" value={draft.courseId} onChange={(e) => setDraft({ ...draft, courseId: e.target.value })}>{publishedCourses.map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}</NativeSelect></div>
          <div className="space-y-1.5"><Label htmlFor="shell-mode">Delivery</Label><NativeSelect id="shell-mode" value={draft.deliveryMode} onChange={(e) => setDraft({ ...draft, deliveryMode: e.target.value as DeliveryMode })}>{modes.map((mode) => <option key={mode} value={mode}>{humanise(mode)}</option>)}</NativeSelect></div>
          <div className="space-y-1.5"><Label htmlFor="shell-session">Session</Label><Input id="shell-session" value={draft.session} onChange={(e) => setDraft({ ...draft, session: e.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="shell-semester">Semester</Label><NativeSelect id="shell-semester" value={draft.semester} onChange={(e) => setDraft({ ...draft, semester: e.target.value })}><option value="1">First</option><option value="2">Second</option></NativeSelect></div>
          <div className="space-y-1.5 md:col-span-2"><Label htmlFor="shell-lecturer">Lecturer</Label><NativeSelect id="shell-lecturer" value={draft.lecturerId} onChange={(e) => setDraft({ ...draft, lecturerId: e.target.value })}>{lecturers.map((item) => <option key={item.personId} value={item.personId}>{item.name}</option>)}</NativeSelect></div>
          <div className="flex items-end sm:col-span-2 xl:col-span-3"><Button type="submit" className="w-full sm:w-auto">Build shell</Button></div>
        </form>
      </Section>

      <Section title="Recent activity" description="Every accepted LMS change, newest first.">
        {lms.audit.length === 0 ? <EmptyState message="No changes yet in this session." /> : (
          <div className="divide-y">
            {lms.audit.slice(0, 12).map((entry) => (
                <div key={entry.id} className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr_auto]">
                <span className="text-xs font-semibold uppercase text-muted-foreground">{entry.entity}</span>
                <div><div className="text-sm font-semibold">{humanise(entry.action)}</div><div className="text-xs text-muted-foreground">{entry.detail}</div></div>
                <div className="text-xs text-muted-foreground sm:text-right">{entry.actorName}<br />{formatDateTime(entry.at)}</div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
