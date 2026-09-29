"use client";

import * as React from "react";
import Link from "next/link";
import {
  Accessibility,
  ArrowLeft,
  BookOpen,
  Captions,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  CloudOff,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  Headphones,
  Layers3,
  Megaphone,
  MessageSquareText,
  Radio,
  RefreshCw,
  ShieldCheck,
  Users,
  Video,
  Wifi,
} from "lucide-react";
import { useCurriculum } from "@tau/curriculum";
import {
  accessibilityIssues,
  formatBytes,
  lightestSize,
  useLms,
  type ContentItem,
  type ProgressEntry,
} from "@tau/lms";
import type { StudentContext } from "@tau/student-dashboard";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Progress } from "@tau/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { formatDashboardDateTime } from "@/lib/dashboard-format";
import { attendanceForCourse } from "@/data/student-attendance";
import { CourseContentViewer } from "./course-content-viewer";
import { CourseworkPanels } from "./coursework-panels";

const portalBase =
  process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL ?? "http://localhost:3000";
const deviceId = "lms-dashboard";

function when(value: string): string {
  return formatDashboardDateTime(value);
}

function semesterLabel(semester: 1 | 2): string {
  return semester === 1 ? "First semester" : "Second semester";
}

function contentIcon(item: ContentItem) {
  if (item.kind === "Video") return Video;
  if (item.kind === "Audio") return Headphones;
  if (item.kind === "Quiz") return Gauge;
  return FileText;
}

function moduleSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function LearningPanels({ context }: { context: StudentContext }) {
  const lms = useLms();
  const curriculum = useCurriculum();
  const enrolments = lms.enrolments.filter(
    (item) =>
      item.studentId === context.sisStudentId && item.status === "Active",
  );
  const courses = enrolments.flatMap((enrolment) => {
    const offering = lms.offerings.find(
      (item) => item.id === enrolment.offeringId && item.status === "Published",
    );
    return offering ? [offering] : [];
  });
  const [selectedId, setSelectedId] = React.useState("");
  const [lowBandwidth, setLowBandwidth] = React.useState(true);
  const [online, setOnline] = React.useState(true);
  const [queue, setQueue] = React.useState<ProgressEntry[]>([]);
  const [sequence, setSequence] = React.useState(2000);
  const [message, setMessage] = React.useState<string>();
  const [openItemId, setOpenItemId] = React.useState<string>();
  const selected = courses.find((course) => course.id === selectedId);

  if (!courses.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <BookOpen className="mx-auto size-8 text-lms-muted" aria-hidden />
        <h2 className="mt-3 font-display text-xl font-bold">
          No active course shells
        </h2>
        <p className="mt-2 text-sm text-lms-muted">
          The LMS has no active SIS-rostered course for this student. The
          dashboard will not create one.
        </p>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              My learning
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
              {context.academicSession} · First semester courses
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-lms-muted">
              Open a course to view its published modules, learning materials,
              outcomes and support information.
            </p>
          </div>
          <Badge variant={online ? "success" : "warning"}>
            {online ? (
              <Wifi className="mr-1 size-3.5" aria-hidden />
            ) : (
              <CloudOff className="mr-1 size-3.5" aria-hidden />
            )}
            {online ? "Online" : `${queue.length} waiting to sync`}
          </Badge>
        </header>

        {message ? (
          <p
            role="status"
            className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900"
          >
            {message}
          </p>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const courseContent = lms.content.filter(
              (item) => item.offeringId === course.id,
            );
            const done = courseContent.filter((item) => {
              const queued = queue
                .filter((entry) => entry.itemId === item.id)
                .at(-1);
              return (
                queued ??
                lms.progress.find(
                  (entry) =>
                    entry.studentId === context.sisStudentId &&
                    entry.itemId === item.id,
                )
              )?.completed;
            }).length;
            const percentage = courseContent.length
              ? Math.round((done / courseContent.length) * 100)
              : 0;
            const catalogueCourse = curriculum.courses.find(
              (item) => item.id === course.courseId,
            );
            const version = catalogueCourse?.versions.find(
              (item) => item.id === course.courseVersionId,
            );
            const assignmentCount = lms.assignments.filter(
              (item) => item.offeringId === course.id,
            ).length;
            return (
              <article
                key={course.id}
                className="flex min-h-72 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="h-2 bg-gradient-to-r from-[#10102d] to-[#3b3b98]" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">
                        {course.courseCode}
                      </p>
                      <h3 className="mt-2 font-display text-xl font-bold leading-snug">
                        {course.courseTitle}
                      </h3>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="whitespace-nowrap">
                        {semesterLabel(course.semester)}
                      </Badge>
                      <Badge variant="outline">
                        {course.deliveryMode.replaceAll("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <CourseFact
                      label="Credit units"
                      value={
                        version
                          ? `${version.credits.creditUnits} CU`
                          : "Not published"
                      }
                    />
                    <CourseFact
                      label="Semester"
                      value={semesterLabel(course.semester)}
                    />
                    <CourseFact
                      label="Lecturer"
                      value={course.lecturers
                        .map((item) => item.name)
                        .join(", ")}
                      wide
                    />
                    <CourseFact
                      label="Materials"
                      value={`${courseContent.length} published`}
                    />
                    <CourseFact
                      label="Assignments"
                      value={`${assignmentCount} coursework item${assignmentCount === 1 ? "" : "s"}`}
                    />
                  </dl>
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">Course progress</span>
                      <span>
                        {percentage}% · {done}/{courseContent.length}
                      </span>
                    </div>
                    <Progress value={percentage} className="mt-2" />
                  </div>
                  <Button
                    className="mt-6 w-full"
                    onClick={() => setSelectedId(course.id)}
                  >
                    Open course <ChevronRight className="size-4" aria-hidden />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  const template = lms.templates.find(
    (item) =>
      item.id === selected.templateId &&
      item.version === selected.templateVersion,
  );
  const content = lms.content.filter((item) => item.offeringId === selected.id);
  const modules = [...new Set(content.map((item) => item.module))];
  const announcements = lms.announcements.filter(
    (item) => item.offeringId === selected.id,
  );
  const discussions = lms.discussions.filter(
    (item) => item.offeringId === selected.id,
  );
  const group = lms.groups.find(
    (item) =>
      item.offeringId === selected.id &&
      item.memberIds.includes(context.sisStudentId),
  );
  const officeHours = lms.officeHours.filter(
    (item) => item.offeringId === selected.id,
  );
  const activeTools = lms.integrations.filter(
    (item) => item.status === "Active" && item.standard === "LTI_1.3",
  );
  const openItem = content.find((item) => item.id === openItemId);
  const catalogueCourse = curriculum.courses.find(
    (item) => item.id === selected.courseId,
  );
  const courseVersion = catalogueCourse?.versions.find(
    (item) => item.id === selected.courseVersionId,
  );
  const attendance = attendanceForCourse(selected.courseCode);

  function progressOf(item: ContentItem): ProgressEntry | undefined {
    return (
      queue.filter((entry) => entry.itemId === item.id).at(-1) ??
      lms.progress.find(
        (entry) =>
          entry.studentId === context.sisStudentId && entry.itemId === item.id,
      )
    );
  }

  const completed = content.filter(
    (item) => progressOf(item)?.completed,
  ).length;
  const courseProgress = content.length
    ? Math.round((completed / content.length) * 100)
    : 0;

  function recordProgress(item: ContentItem, percent: number) {
    const entry: ProgressEntry = {
      studentId: context.sisStudentId,
      itemId: item.id,
      percent,
      completed: percent >= 100,
      updatedAt: new Date().toISOString(),
      deviceId,
      sequence,
    };
    setSequence((current) => current + 1);
    if (online) {
      const result = lms.mutations.syncProgress([entry]);
      setMessage(
        result.data?.applied
          ? "Progress saved to the LMS."
          : "This progress is already recorded; nothing changed.",
      );
    } else {
      setQueue((current) => [...current, entry]);
      setMessage(
        "You are offline. Progress is queued on this device until you reconnect.",
      );
    }
  }

  function reconnect() {
    setOnline(true);
    if (!queue.length) return setMessage("You are back online.");
    const result = lms.mutations.syncProgress(queue);
    setQueue([]);
    setMessage(
      `${result.data?.applied ?? 0} progress update(s) saved; ${result.data?.ignored ?? 0} replayed or older update(s) safely ignored.`,
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="-ml-3"
        onClick={() => {
          setSelectedId("");
          setOpenItemId(undefined);
        }}
      >
        <ArrowLeft className="size-4" aria-hidden /> All semester courses
      </Button>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            My learning
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            Course details
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-lms-muted">
            Review the approved course structure, then open a module to study
            its published materials.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={online ? "success" : "warning"}>
            {online ? (
              <Wifi className="mr-1 size-3.5" aria-hidden />
            ) : (
              <CloudOff className="mr-1 size-3.5" aria-hidden />
            )}
            {online ? "Online" : `${queue.length} waiting to sync`}
          </Badge>
          {online ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setOnline(false);
                setMessage(undefined);
              }}
            >
              <CloudOff aria-hidden /> Test offline mode
            </Button>
          ) : (
            <Button size="sm" onClick={reconnect}>
              <RefreshCw aria-hidden /> Reconnect & sync
            </Button>
          )}
        </div>
      </header>

      {message ? (
        <p
          role="status"
          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900"
        >
          {message}
        </p>
      ) : null}

      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="bg-gradient-to-r from-[#10102d] to-[#25256b] p-6 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="whitespace-nowrap border-white/15 bg-white/10 text-white">
                    {semesterLabel(selected.semester)}
                  </Badge>
                  <Badge className="border-white/15 bg-white/10 text-white">
                    {selected.deliveryMode.replaceAll("_", " ")}
                  </Badge>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold">
                  {selected.courseCode} · {selected.courseTitle}
                </h3>
                <p className="mt-2 text-sm text-white/65">
                  {selected.lecturers.map((item) => item.name).join(", ")} ·{" "}
                  {selected.session} · {semesterLabel(selected.semester)}
                </p>
              </div>
              <Layers3 className="size-8 text-[#e1bd55]" aria-hidden />
            </div>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-3">
            <div className="bg-card p-4">
              <p className="text-xs text-lms-muted">Orientation/template</p>
              <p className="mt-1 text-sm font-bold">
                {template?.name ?? "Approved course structure"}
              </p>
              <p className="mt-1 text-xs text-lms-muted">
                Version {selected.templateVersion}
              </p>
            </div>
            <div className="bg-card p-4">
              <p className="text-xs text-lms-muted">Learning outcomes</p>
              <p className="mt-1 text-sm font-bold">
                {selected.outcomes.length} approved
              </p>
              <p className="mt-1 text-xs text-lms-muted">
                Mapped to activities and assessment
              </p>
            </div>
            <div className="bg-card p-4">
              <p className="text-xs text-lms-muted">Assessment</p>
              <p className="mt-1 text-sm font-bold">
                {selected.assessmentScheme.continuousAssessmentPercent}% CA ·{" "}
                {selected.assessmentScheme.practicalPercent}% practical
              </p>
              <p className="mt-1 text-xs text-lms-muted">
                Final exam: {selected.assessmentScheme.finalExamPercent}%
              </p>
            </div>
          </div>
        </section>

        <Tabs defaultValue="course-details" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl border border-border bg-card p-1 shadow-card sm:inline-grid sm:w-auto sm:min-w-[32rem]">
            <TabsTrigger value="course-details" className="whitespace-normal py-3 text-center">
              Course details & materials
            </TabsTrigger>
            <TabsTrigger value="coursework" className="whitespace-normal py-3 text-center">
              Assignments & coursework
            </TabsTrigger>
          </TabsList>

          <TabsContent value="course-details" className="space-y-6">

        <section
          className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]"
          aria-labelledby="course-overview-title"
        >
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Approved course information
            </p>
            <h3
              id="course-overview-title"
              className="mt-1 font-display text-lg font-bold"
            >
              Course overview and outcomes
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-lms-muted">
              {courseVersion?.synopsis ??
                "The approved course synopsis is not available in this shell."}
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <CourseFact
                label="Credit units"
                value={
                  courseVersion
                    ? `${courseVersion.credits.creditUnits} CU`
                    : "Not published"
                }
              />
              <CourseFact
                label="Level"
                value={
                  catalogueCourse
                    ? `${catalogueCourse.level} level`
                    : "Not published"
                }
              />
              <CourseFact
                label="Classification"
                value={catalogueCourse?.classification ?? "Not published"}
              />
              <CourseFact
                label="Course version"
                value={courseVersion?.versionNumber ?? selected.courseVersionId}
              />
              <CourseFact
                label="Released attendance"
                value={attendance ? `${attendance.releasedRate}% · ${attendance.attended}/${attendance.sessionsHeld} sessions` : "Not published"}
              />
            </dl>
            <h4 className="mt-6 text-sm font-bold">Learning outcomes</h4>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2">
              {selected.outcomes.map((outcome) => (
                <li
                  key={outcome.id}
                  className="rounded-xl border border-border p-3 text-sm"
                >
                  <span className="font-mono text-xs font-bold text-primary">
                    {outcome.code}
                  </span>
                  <p className="mt-1 text-lms-muted">{outcome.description}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-5">
            <section
              className="rounded-2xl bg-[#10102d] p-5 text-white shadow-card"
              aria-labelledby="course-progress-title"
            >
              <p
                id="course-progress-title"
                className="text-xs font-bold uppercase tracking-widest text-white/45"
              >
                Course progress
              </p>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-3xl font-bold">{courseProgress}%</span>
                <span className="text-xs text-white/55">
                  {completed}/{content.length} complete
                </span>
              </div>
              <Progress
                value={courseProgress}
                className="mt-3 bg-white/15 [&>div]:bg-[#e1bd55]"
              />
              <p className="mt-3 text-xs leading-relaxed text-white/55">
                Synced progress never moves backwards and completed work stays
                complete.
              </p>
            </section>
            <section
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
              aria-labelledby="course-support-title"
            >
              <h3 id="course-support-title" className="font-display font-bold">
                Course support
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-lms-muted">
                {template?.sections.find(
                  (section) => section.kind === "Support",
                )?.guidance ??
                  "Use the published office hours and LMS support route when you need help."}
              </p>
              <p className="mt-3 text-xs text-lms-muted">
                Department: {catalogueCourse?.departmentName ?? "Not published"}
              </p>
            </section>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={lowBandwidth}
              onChange={(event) => setLowBandwidth(event.target.checked)}
              className="size-4 accent-primary"
            />
            <span>
              <span className="block">Low-bandwidth mode</span>
              <span className="block text-xs font-normal text-lms-muted">
                Prefer the lightest usable version and show download size.
              </span>
            </span>
          </label>
          <Badge variant="outline">
            <Download className="mr-1 size-3.5" /> Data-aware
          </Badge>
        </div>

        {openItem ? (
          <CourseContentViewer
            item={openItem}
            initialPercent={progressOf(openItem)?.percent ?? 0}
            onClose={() => setOpenItemId(undefined)}
            onSaveProgress={(percent) => recordProgress(openItem, percent)}
          />
        ) : null}

        {modules.map((module) => (
          <details
            key={module}
            className="group rounded-2xl border border-border bg-card shadow-card"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Course module
                </p>
                <h3 className="mt-1 font-display text-lg font-bold">
                  {module}
                </h3>
                <p className="mt-1 text-xs text-lms-muted">
                  {content.filter((item) => item.module === module).length}{" "}
                  published material(s)
                </p>
              </div>
              <ChevronDown
                className="size-5 text-primary transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="border-t border-border p-5">
              <div className="mb-4 flex justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link
                    href={`/dashboard/learning/${selected.id}/modules/${moduleSlug(module)}`}
                  >
                    Open module page{" "}
                    <ExternalLink className="size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {content
                  .filter((item) => item.module === module)
                  .map((item) => {
                    const progress = progressOf(item);
                    const Icon = contentIcon(item);
                    const lightSize = lightestSize(item);
                    const issues = accessibilityIssues(item);
                    return (
                      <article
                        key={item.id}
                        className="rounded-xl border border-border p-4"
                      >
                        <div className="flex flex-wrap items-start gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
                            <Icon className="size-5" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold">{item.title}</h4>
                              {item.essential ? (
                                <Badge variant="outline">Essential</Badge>
                              ) : (
                                <Badge variant="muted">Optional</Badge>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-lms-muted">
                              {item.kind} · {item.format.replaceAll("_", " ")} ·{" "}
                              {lowBandwidth && lightSize < item.sizeBytes ? (
                                <>
                                  <strong className="text-foreground">
                                    {formatBytes(lightSize)} light version
                                  </strong>{" "}
                                  <span className="line-through">
                                    {formatBytes(item.sizeBytes)}
                                  </span>
                                </>
                              ) : (
                                formatBytes(item.sizeBytes)
                              )}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.alternatives.map((alternative) => (
                                <Badge
                                  key={alternative.kind}
                                  variant="secondary"
                                >
                                  {alternative.kind.replaceAll("_", " ")} ·{" "}
                                  {formatBytes(alternative.sizeBytes)}
                                </Badge>
                              ))}
                              {issues.length ? (
                                <Badge variant="warning">
                                  <Accessibility className="mr-1 size-3" />{" "}
                                  Accessibility support needed
                                </Badge>
                              ) : (
                                <Badge variant="success">
                                  <Captions className="mr-1 size-3" />{" "}
                                  Accessible options checked
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={
                              progress?.completed
                                ? "success"
                                : progress
                                  ? "outline"
                                  : "muted"
                            }
                          >
                            {progress?.completed ? (
                              <CheckCircle2 className="mr-1 size-3.5" />
                            ) : (
                              <CircleDashed className="mr-1 size-3.5" />
                            )}
                            {progress?.completed
                              ? "Complete"
                              : progress
                                ? `${progress.percent}%`
                                : "Not started"}
                          </Badge>
                        </div>
                        {issues.length ? (
                          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                            {issues.join(" ")}{" "}
                            <a
                              href="/support"
                              className="font-semibold underline"
                            >
                              Report this to LMS support
                            </a>
                            .
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setOpenItemId(item.id);
                            }}
                          >
                            {item.kind === "Video"
                              ? "Watch lesson"
                              : item.kind === "Audio"
                                ? "Listen to lesson"
                                : "Open material"}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => recordProgress(item, 100)}
                          >
                            Mark complete
                          </Button>
                        </div>
                      </article>
                    );
                  })}
              </div>
            </div>
          </details>
        ))}

        <div className="grid gap-6 lg:grid-cols-2">
          <section
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
            aria-labelledby="engagement-title"
          >
            <div className="flex items-center gap-2">
              <MessageSquareText className="size-5 text-primary" aria-hidden />
              <h3
                id="engagement-title"
                className="font-display text-lg font-bold"
              >
                Community & support
              </h3>
            </div>
            <div className="mt-4 space-y-4">
              {announcements.map((item) => (
                <article key={item.id} className="rounded-xl bg-muted/40 p-3">
                  <div className="flex items-center gap-2">
                    <Megaphone className="size-4 text-primary" />
                    <p className="font-semibold">{item.title}</p>
                    {item.priority === "Critical" ? (
                      <Badge variant="destructive">Important</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-lms-muted">{item.body}</p>
                </article>
              ))}
              {discussions.map((item) => {
                const mine = lms.posts.filter(
                  (post) =>
                    post.discussionId === item.id &&
                    post.authorId === context.sisStudentId &&
                    post.status !== "Hidden",
                );
                return (
                  <article
                    key={item.id}
                    className="rounded-xl border border-border p-3"
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-lms-muted">
                      {item.moderation.replaceAll("_", " ")} ·{" "}
                      {item.participation.minimumPosts} post(s) by{" "}
                      {when(item.participation.dueAt)} · {item.retentionDays}
                      -day retention
                    </p>
                    <p className="mt-2 text-sm">
                      Your visible or pending posts:{" "}
                      <strong>{mine.length}</strong>
                    </p>
                  </article>
                );
              })}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Users className="size-4 text-primary" /> Group
                  </p>
                  <p className="mt-1 text-xs text-lms-muted">
                    {group?.name ?? "No group assigned"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Radio className="size-4 text-primary" /> Office hours
                  </p>
                  <p className="mt-1 text-xs text-lms-muted">
                    {officeHours[0]
                      ? `${officeHours[0].weekday} ${officeHours[0].startTime}–${officeHours[0].endTime}`
                      : "Not published"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
            aria-labelledby="tools-title"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" aria-hidden />
              <h3 id="tools-title" className="font-display text-lg font-bold">
                Approved learning tools
              </h3>
            </div>
            <p className="mt-1 text-sm text-lms-muted">
              Only active integrations with an approved data contract are
              listed.
            </p>
            <div className="mt-4 space-y-3">
              {activeTools.map((tool) => (
                <article
                  key={tool.id}
                  className="rounded-xl border border-border p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{tool.name}</p>
                      <p className="text-xs text-lms-muted">
                        {tool.standard.replaceAll("_", " ")} · {tool.vendor}
                      </p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <p className="mt-2 text-xs text-lms-muted">
                    Purpose: {tool.dataContract.purpose}
                  </p>
                </article>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-5 w-full">
              <a href={`${portalBase}/student-portal/learning`}>
                Open course activities <ExternalLink aria-hidden />
              </a>
            </Button>
            <p className="mt-2 text-center text-[11px] text-lms-muted">
              External tools launch only from their approved course activity.
            </p>
          </section>
        </div>
          </TabsContent>

          <TabsContent value="coursework">
            <CourseworkPanels
              context={context}
              offeringId={selected.id}
              embedded
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CourseFact({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-xl bg-muted/45 p-3 ${wide ? "col-span-2" : ""}`}>
      <dt className="text-xs text-lms-muted">{label}</dt>
      <dd className="mt-1 text-sm font-bold">{value}</dd>
    </div>
  );
}
