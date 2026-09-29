"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Award,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  Landmark,
  LifeBuoy,
  Plus,
  ShieldAlert,
  X,
} from "lucide-react";
import {
  activeCreditTotal,
  canSubmitTerm,
  getDegreeAudit,
  getRegistrationProposal,
  isWithinAddDropWindow,
  useRegistration,
  type ProposedCourse,
} from "@tau/registration";
import type { StudentContext } from "@tau/student-dashboard";
import {
  useStudents,
  type Student,
  type TransferCase,
} from "@tau/students";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Progress } from "@tau/ui/progress";
import { Textarea } from "@tau/ui/textarea";
import {
  formatDashboardDateTime,
  formatDashboardShortDate,
} from "@/lib/dashboard-format";

type ProposalSource = "Required" | "Outstanding" | "Elective";

function findAuthorisedRegistrationStudent(
  context: StudentContext,
  demoStudents: ReturnType<typeof useRegistration>["demoStudents"],
) {
  return demoStudents.find(
    (student) =>
      student.matriculationNumber === context.matriculationNumber ||
      student.studentId === context.recordsStudentId,
  );
}

function MissingRecord({
  context,
  service,
}: {
  context: StudentContext;
  service: "registration" | "degree audit";
}) {
  return (
    <section
      className="rounded-2xl border border-amber-200 bg-amber-50 p-6"
      role="status"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert
          className="mt-0.5 size-6 shrink-0 text-amber-800"
          aria-hidden
        />
        <div>
          <h3 className="font-display text-lg font-bold text-amber-950">
            Your {service} record is not connected
          </h3>
          <p className="mt-2 text-sm text-amber-900">
            No authorised {service} record matches {context.matriculationNumber}
            . The LMS will not display another student&apos;s demonstration data
            or create a substitute record.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/support">
                <LifeBuoy className="size-4" aria-hidden /> Ask LMS support
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/support">Contact Registry</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RegistrationPanels({ context }: { context: StudentContext }) {
  const registration = useRegistration();
  const students = useStudents();
  const matchedStudent = findAuthorisedRegistrationStudent(
    context,
    registration.demoStudents,
  );
  const studentRecord = students.students.find(
    (item) => item.id === context.sisStudentId,
  );
  const studentId = matchedStudent?.studentId ?? "";
  const term = registration.terms.find((item) => item.studentId === studentId);
  const proposal = getRegistrationProposal(studentId);
  const [now] = React.useState(() => new Date().toISOString());
  const [message, setMessage] = React.useState<{ ok: boolean; text: string }>();
  const [exceptionReason, setExceptionReason] = React.useState("");
  const [pendingCourse, setPendingCourse] = React.useState<{
    courseCode: string;
    courseTitle: string;
    creditUnits: number;
    offeringId: string;
    source: ProposalSource;
  }>();

  if ((!matchedStudent || !term) && studentRecord) {
    return (
      <AdmissionRegistrationRecord context={context} student={studentRecord} />
    );
  }

  if (!matchedStudent || !term) {
    return (
      <ServiceShell
        eyebrow="Course registration"
        title="Registration and statements"
        description="Registration data is matched to your signed-in student record before anything is shown."
      >
        <MissingRecord context={context} service="registration" />
      </ServiceShell>
    );
  }

  const credits = activeCreditTotal(term.lines);
  const withinWindow = isWithinAddDropWindow(now, term);
  const submitCheck = canSubmitTerm(term);
  const statement = registration.statements.find(
    (item) => item.termId === term.id,
  );
  const hasProposalItems = Boolean(
    proposal.data &&
    (proposal.data.required.length ||
      proposal.data.outstanding.length ||
      proposal.data.eligibleElectives.length ||
      proposal.data.ineligible.length),
  );

  function addCourse(course: ProposedCourse, source: ProposalSource) {
    if (!term) return;
    const offeringId = `off-${course.courseCode.toLowerCase().replace(/\s+/g, "")}-2026-1`;
    const result = registration.mutations.addCourse(
      term.id,
      {
        offeringId,
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        creditUnits: course.creditUnits,
        source,
      },
      24,
      now,
    );
    if (!result.ok)
      return setMessage({
        ok: false,
        text: result.error ?? "Could not add this course.",
      });
    if (result.data?.requiresLateException) {
      setPendingCourse({
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        creditUnits: course.creditUnits,
        offeringId,
        source,
      });
      setMessage({
        ok: true,
        text: `${course.courseCode} was added and needs an approved late-change exception.`,
      });
    } else setMessage({ ok: true, text: `${course.courseCode} added.` });
  }

  function dropCourse(courseCode: string) {
    if (!term) return;
    const result = registration.mutations.dropCourse(term.id, courseCode, now);
    setMessage(
      result.ok
        ? { ok: true, text: `${courseCode} dropped.` }
        : { ok: false, text: result.error ?? "Could not drop this course." },
    );
  }

  function submitException() {
    if (!term || !pendingCourse || !matchedStudent) return;
    registration.mutations.submitException({
      studentId,
      termId: term.id,
      type: "Late_Change",
      courseCode: pendingCourse.courseCode,
      requestedBy: studentId,
      requestedByName: matchedStudent.studentName,
      reason: exceptionReason,
    });
    setPendingCourse(undefined);
    setExceptionReason("");
    setMessage({
      ok: true,
      text: "Late-change exception submitted to your adviser.",
    });
  }

  function submitRegistration() {
    if (!term) return;
    const result = registration.mutations.submitTerm(term.id);
    setMessage(
      result.ok
        ? { ok: true, text: "Registration submitted for Registry review." }
        : { ok: false, text: result.error ?? "Could not submit this term." },
    );
  }

  return (
    <ServiceShell
      eyebrow="Course registration"
      title="Registration and statements"
      description={`${term.academicSession} · Semester ${term.semester} · ${term.programmeName}`}
    >
      {message ? (
        <p
          role={message.ok ? "status" : "alert"}
          className={`rounded-xl border p-4 text-sm font-medium ${message.ok ? "border-blue-200 bg-blue-50 text-blue-950" : "border-red-200 bg-red-50 text-red-900"}`}
        >
          {message.text}
        </p>
      ) : null}
      {!withinWindow ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>
            The add/drop window closed on{" "}
            {formatDashboardShortDate(term.addDropClosesAt)}. Late additions
            require an adviser-approved exception.
          </p>
        </div>
      ) : null}
      {pendingCourse ? (
        <section
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
          aria-labelledby="exception-title"
        >
          <h3 id="exception-title" className="font-display font-bold">
            Late-change exception for {pendingCourse.courseCode}
          </h3>
          <Textarea
            className="mt-3"
            aria-label="Reason for late course change"
            placeholder="Explain why this course is being added after the deadline"
            value={exceptionReason}
            onChange={(event) => setExceptionReason(event.target.value)}
          />
          <Button
            className="mt-3"
            onClick={submitException}
            disabled={!exceptionReason.trim()}
          >
            Submit exception
          </Button>
        </section>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_21rem]">
        <div className="space-y-5">
          <ProposalSection
            title="Required this level"
            items={proposal.data?.required ?? []}
            termLines={term.lines}
            onAdd={(course) => addCourse(course, "Required")}
          />
          <ProposalSection
            title="Outstanding from a prior level"
            items={proposal.data?.outstanding ?? []}
            termLines={term.lines}
            onAdd={(course) => addCourse(course, "Outstanding")}
          />
          <ProposalSection
            title="Eligible electives"
            items={proposal.data?.eligibleElectives ?? []}
            termLines={term.lines}
            onAdd={(course) => addCourse(course, "Elective")}
          />
          {proposal.data?.ineligible.length ? (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display font-bold">Not yet eligible</h3>
              <ul className="mt-3 space-y-2">
                {proposal.data.ineligible.map((course) => (
                  <li
                    key={course.courseCode}
                    className="rounded-xl border border-border p-3 text-sm"
                  >
                    <strong>{course.courseCode}</strong> · {course.courseTitle}
                    <p className="mt-1 text-xs text-lms-muted">
                      {course.missingPrerequisites.join("; ")}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {!hasProposalItems ? (
            <section className="rounded-2xl border border-dashed border-border bg-card p-6">
              <h3 className="font-display font-bold">
                No new course proposal is published
              </h3>
              <p className="mt-2 text-sm text-lms-muted">
                Your frozen registration remains available as a versioned
                statement. The dashboard does not invent additional course
                choices outside the configured curriculum.
              </p>
            </section>
          ) : null}
          {statement ? (
            <section
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
              aria-labelledby="statement-title"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3
                    id="statement-title"
                    className="font-display text-lg font-bold"
                  >
                    Frozen registration statement
                  </h3>
                  <p className="mt-1 text-sm text-lms-muted">
                    Original approved snapshot · {statement.totalCredits} CU ·
                    frozen {formatDashboardDateTime(statement.frozenAt)}
                  </p>
                </div>
                <Badge variant="outline">{statement.version}</Badge>
              </div>
              <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
                {statement.lines.map((line) => (
                  <li
                    key={line.courseCode}
                    className="flex items-center justify-between gap-3 p-3 text-sm"
                  >
                    <span>
                      <strong>{line.courseCode}</strong> · {line.courseTitle}
                    </span>
                    <span className="shrink-0 font-semibold">
                      {line.creditUnits} CU
                    </span>
                  </li>
                ))}
              </ul>
              {statement.amendments.length ? (
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    Appended amendments
                  </p>
                  <ol className="mt-3 space-y-3">
                    {statement.amendments.map((amendment) => (
                      <li
                        key={amendment.id}
                        className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-950"
                      >
                        <p className="text-sm font-bold">{amendment.summary}</p>
                        <p className="mt-1 text-xs">{amendment.reason}</p>
                        <p className="mt-2 text-xs text-blue-900/70">
                          Approved by {amendment.approvedByName} ·{" "}
                          {formatDashboardDateTime(amendment.approvedAt)}
                        </p>
                        <ul className="mt-3 space-y-1 text-xs">
                          {amendment.linesAfter.map((line) => (
                            <li
                              key={line.courseCode}
                              className="flex justify-between gap-3"
                            >
                              <span>
                                {line.courseCode} · {line.courseTitle}
                              </span>
                              <strong>{line.creditUnits} CU</strong>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <p className="mt-4 text-sm text-lms-muted">
                  No amendments have been appended.
                </p>
              )}
            </section>
          ) : null}
        </div>
        <aside className="space-y-4">
          <section
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
            aria-labelledby="current-registration-title"
          >
            <div className="flex items-center justify-between gap-3">
              <h3
                id="current-registration-title"
                className="font-display font-bold"
              >
                Your registration
              </h3>
              <Badge variant="outline">{credits}/24 CU</Badge>
            </div>
            <ul className="mt-4 space-y-2">
              {term.lines
                .filter((line) => line.status !== "Dropped")
                .map((line) => (
                  <li
                    key={line.id}
                    className="rounded-xl border border-border p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">
                          {line.courseCode}
                        </p>
                        <p className="text-xs text-lms-muted">
                          {line.creditUnits} CU · {line.source}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Drop ${line.courseCode}`}
                        onClick={() => dropCourse(line.courseCode)}
                        className="rounded-full p-1 text-lms-muted hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <Badge
                      className="mt-2"
                      variant={
                        line.status === "Registered" ? "success" : "warning"
                      }
                    >
                      {line.status}
                    </Badge>
                  </li>
                ))}
            </ul>
            <p className="mt-4 text-xs text-lms-muted">
              Status: {term.status} · Source record {term.id}
            </p>
          </section>
          {term.status === "Draft" ? (
            <>
              <Button
                className="w-full"
                disabled={!submitCheck.ok}
                onClick={submitRegistration}
              >
                <CheckCircle2 className="size-4" aria-hidden /> Submit
                registration
              </Button>
              {!submitCheck.ok ? (
                <p className="text-xs text-lms-muted">{submitCheck.error}</p>
              ) : null}
            </>
          ) : (
            <p className="rounded-xl bg-muted p-3 text-sm">
              This registration was frozen{" "}
              {term.frozenAt
                ? formatDashboardDateTime(term.frozenAt)
                : "by Registry"}
              .
            </p>
          )}
        </aside>
      </div>
    </ServiceShell>
  );
}

export function DegreeAuditPanels({ context }: { context: StudentContext }) {
  const registration = useRegistration();
  const students = useStudents();
  const matchedStudent = findAuthorisedRegistrationStudent(
    context,
    registration.demoStudents,
  );
  const studentRecord = students.students.find(
    (item) => item.id === context.sisStudentId,
  );
  const transfer = students.transfers.find(
    (item) => item.studentId === context.sisStudentId,
  );
  const studentId = matchedStudent?.studentId ?? "";
  const audit = getDegreeAudit(studentId);

  if (
    (!matchedStudent || !audit.ok || !audit.data) &&
    studentRecord?.id === "student-2025-150"
  ) {
    return (
      <StudentDegreeProgressRecord
        context={context}
        student={studentRecord}
        transfer={transfer}
      />
    );
  }

  if (!matchedStudent || !audit.ok || !audit.data) {
    return (
      <ServiceShell
        eyebrow="Degree progress"
        title="Curriculum audit"
        description="Progress is calculated only from the curriculum and approved result records linked to you."
      >
        <MissingRecord context={context} service="degree audit" />
      </ServiceShell>
    );
  }

  const result = audit.data;
  const total =
    result.creditsSatisfied + result.creditsInProgress + result.creditsMissing;
  const progress = total
    ? Math.round(
        ((result.creditsSatisfied + result.creditsInProgress) / total) * 100,
      )
    : 0;
  return (
    <ServiceShell
      eyebrow="Degree progress"
      title="Curriculum audit"
      description={`${result.programmeName} · Curriculum ${result.curriculumVersionId}`}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Credits satisfied" value={result.creditsSatisfied} />
        <Metric label="Credits in progress" value={result.creditsInProgress} />
        <Metric label="Credits missing" value={result.creditsMissing} />
      </div>
      <section
        className="rounded-2xl border border-border bg-card p-5 shadow-card"
        aria-labelledby="audit-progress-title"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3
              id="audit-progress-title"
              className="font-display text-lg font-bold"
            >
              Overall progress
            </h3>
            <p className="mt-1 text-sm text-lms-muted">
              Satisfied and currently registered curriculum credits.
            </p>
          </div>
          <span className="text-2xl font-bold">{progress}%</span>
        </div>
        <Progress value={progress} className="mt-4" />
        <p className="mt-4 rounded-xl bg-muted/50 p-3 text-sm">
          {result.onTrack
            ? "All requirements are satisfied, substituted or in progress."
            : "Some curriculum requirements are still missing. Speak with your academic adviser about a completion plan."}
        </p>
      </section>
      <section
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
        aria-labelledby="requirements-title"
      >
        <div className="border-b border-border p-5">
          <h3
            id="requirements-title"
            className="font-display text-lg font-bold"
          >
            Requirement detail
          </h3>
          <p className="mt-1 text-sm text-lms-muted">
            Source terminology is preserved.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-lms-muted">
              <tr>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Credits</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Grade / substitution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.lines.map((line) => (
                <tr key={`${line.courseCode}-${line.level}`}>
                  <td className="px-5 py-3">
                    {line.level} L{line.semester}
                  </td>
                  <td className="px-5 py-3">
                    <strong>{line.courseCode}</strong>
                    <span className="ml-2 text-lms-muted">
                      {line.courseTitle}
                    </span>
                  </td>
                  <td className="px-5 py-3">{line.creditUnits}</td>
                  <td className="px-5 py-3">
                    <Badge
                      variant={
                        line.status === "Satisfied" ||
                        line.status === "Substituted"
                          ? "success"
                          : line.status === "In_Progress"
                            ? "outline"
                            : "warning"
                      }
                    >
                      {line.status.replaceAll("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {line.status === "Satisfied"
                      ? line.grade
                      : line.status === "Substituted"
                        ? `${line.grade} via ${line.substitutedByCourseCode}`
                        : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </ServiceShell>
  );
}

const ngoziDegreeRequirements = [
  {
    name: "Core Physics",
    credits: 86,
    satisfied: 4,
    inProgress: 0,
    detail: "PHY 101 and PHY 107 recorded",
  },
  {
    name: "Mathematics & computing",
    credits: 24,
    satisfied: 6,
    inProgress: 3,
    detail: "MTH 101–102 completed; COS 101 in progress",
  },
  {
    name: "General studies",
    credits: 14,
    satisfied: 2,
    inProgress: 0,
    detail: "GST 111 completed",
  },
  {
    name: "Science breadth",
    credits: 8,
    satisfied: 3,
    inProgress: 0,
    detail: "CHM 101 completed",
  },
  {
    name: "Approved electives",
    credits: 12,
    satisfied: 0,
    inProgress: 0,
    detail: "Choose with your academic adviser",
  },
] as const;

function StudentDegreeProgressRecord({
  context,
  student,
  transfer,
}: {
  context: StudentContext;
  student: Student;
  transfer?: TransferCase;
}) {
  const creditsSatisfied = 15;
  const creditsInProgress = 3;
  const totalCredits = 144;
  const creditsMissing = totalCredits - creditsSatisfied - creditsInProgress;
  const progress = Math.round(
    ((creditsSatisfied + creditsInProgress) / totalCredits) * 100,
  );
  const completedCourses = transfer?.creditDecisions ?? [];
  const transferCredits =
    transfer?.creditDecisions.reduce(
      (total, decision) => total + decision.creditsAwarded,
      0,
    ) ?? 0;

  return (
    <ServiceShell
      eyebrow="Degree progress"
      title="Curriculum audit"
      description={`${context.programmeName} · Curriculum ver-phy-2023 · ${context.cohort} cohort`}
    >
      <section
        className="rounded-2xl border border-border bg-card p-5 shadow-card"
        aria-labelledby="degree-record-title"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Current programme record
            </p>
            <h3
              id="degree-record-title"
              className="mt-2 font-display text-xl font-bold"
            >
              {student.matriculationNumber} · {context.level} level
            </h3>
            <p className="mt-1 text-sm text-lms-muted">
              Full-time · Good standing · Academic adviser: Prof. Grace Udoh
            </p>
          </div>
          <Badge variant="success">
            <CheckCircle2 className="size-3.5" aria-hidden /> Record connected
          </Badge>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Credits satisfied" value={creditsSatisfied} />
        <Metric label="Credits in progress" value={creditsInProgress} />
        <Metric label="Credits missing" value={creditsMissing} />
      </div>

      <section
        className="rounded-2xl border border-border bg-card p-5 shadow-card"
        aria-labelledby="student-audit-progress-title"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3
              id="student-audit-progress-title"
              className="font-display text-lg font-bold"
            >
              Overall degree progress
            </h3>
            <p className="mt-1 text-sm text-lms-muted">
              Completed and currently registered credits out of {totalCredits}
              required credits.
            </p>
          </div>
          <span className="text-2xl font-bold" aria-label={`${progress} percent`}>
            {progress}%
          </span>
        </div>
        <Progress value={progress} className="mt-4" />
        <p className="mt-4 rounded-xl bg-muted/50 p-3 text-sm">
          You have satisfied {creditsSatisfied} credits. COS 101 adds {creditsInProgress}{" "}
          credits when completed; {creditsMissing} credits remain after current
          study.
        </p>
      </section>

      <section
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
        aria-labelledby="degree-requirements-title"
      >
        <div className="border-b border-border p-5">
          <h3
            id="degree-requirements-title"
            className="font-display text-lg font-bold"
          >
            Requirement groups
          </h3>
          <p className="mt-1 text-sm text-lms-muted">
            Satisfied, in-progress and missing requirements follow the current
            B.Sc. Physics curriculum.
          </p>
        </div>
        <div className="divide-y divide-border">
          {ngoziDegreeRequirements.map((requirement) => {
            const remaining =
              requirement.credits -
              requirement.satisfied -
              requirement.inProgress;
            const requirementProgress = Math.round(
              ((requirement.satisfied + requirement.inProgress) /
                requirement.credits) *
                100,
            );
            return (
              <div
                key={requirement.name}
                className="grid gap-4 p-5 md:grid-cols-[minmax(0,1.4fr)_minmax(260px,1fr)] md:items-center"
              >
                <div>
                  <h4 className="font-semibold">{requirement.name}</h4>
                  <p className="mt-1 text-sm text-lms-muted">
                    {requirement.detail}
                  </p>
                </div>
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span>
                      {requirement.satisfied} satisfied
                      {requirement.inProgress
                        ? ` · ${requirement.inProgress} in progress`
                        : ""}
                    </span>
                    <strong>{remaining} missing</strong>
                  </div>
                  <Progress value={requirementProgress} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
        aria-labelledby="degree-course-detail-title"
      >
        <div className="border-b border-border p-5">
          <h3
            id="degree-course-detail-title"
            className="font-display text-lg font-bold"
          >
            Course detail
          </h3>
          <p className="mt-1 text-sm text-lms-muted">
            Only recorded results count as satisfied. Current study remains in
            progress until an approved result is released.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-lms-muted">
              <tr>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Credits</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3">Degree-audit state</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {completedCourses.map((course) => (
                <tr key={course.id}>
                  <td className="px-5 py-3">
                    <strong>{course.courseCode}</strong>
                    <span className="ml-2 text-lms-muted">
                      {course.courseTitle}
                    </span>
                  </td>
                  <td className="px-5 py-3">{course.credits}</td>
                  <td className="px-5 py-3">{course.grade}</td>
                  <td className="px-5 py-3">
                    <Badge variant="success">Satisfied</Badge>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="px-5 py-3">
                  <strong>COS 101</strong>
                  <span className="ml-2 text-lms-muted">
                    Introduction to Computing Sciences
                  </span>
                </td>
                <td className="px-5 py-3">3</td>
                <td className="px-5 py-3">—</td>
                <td className="px-5 py-3">
                  <Badge variant="outline">In progress</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {transfer ? (
        <section
          className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"
          aria-labelledby="transfer-projection-title"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em]">
                    Provisional projection
                  </p>
                  <h3
                    id="transfer-projection-title"
                    className="mt-1 font-display text-lg font-bold"
                  >
                    Change to {transfer.toProgrammeName}
                  </h3>
                </div>
                <Badge variant="warning">
                  {transfer.status.replaceAll("_", " ")}
                </Badge>
              </div>
              <p className="mt-3 text-sm">
                {transferCredits} of 15 reviewed credits are proposed to carry
                into curriculum {transfer.toCurriculumVersion} at {transfer.entryLevel}{" "}
                level. This projection does not change your current B.Sc.
                Physics audit until all approvals are complete and the transfer
                takes effect on {formatDashboardShortDate(transfer.effectiveFrom)}.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <TransferFact
                  label="Approval progress"
                  value={`${transfer.approvals.length} of 4 complete`}
                />
                <TransferFact
                  label="Current action owner"
                  value="Receiving Department"
                />
                <TransferFact
                  label="Entry check"
                  value={`CGPA ${transfer.cgpa.toFixed(2)} · minimum ${transfer.minimumCgpa.toFixed(2)}`}
                />
              </div>
              <div className="mt-4 overflow-x-auto rounded-xl border border-amber-200 bg-white/70">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="border-b border-amber-200 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Completed course</th>
                      <th className="px-4 py-3">Proposed treatment</th>
                      <th className="px-4 py-3">Credits awarded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {transfer.creditDecisions.map((decision) => (
                      <tr key={decision.id}>
                        <td className="px-4 py-3">
                          <strong>{decision.courseCode}</strong> · {decision.grade}
                        </td>
                        <td className="px-4 py-3">
                          {decision.decision === "No_Credit"
                            ? "No credit"
                            : `${decision.decision.replaceAll("_", " ")}${decision.targetCourseCode ? ` → ${decision.targetCourseCode}` : ""}`}
                        </td>
                        <td className="px-4 py-3">
                          {decision.creditsAwarded}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-card sm:flex-row sm:items-center">
        <div>
          <h3 className="font-display text-lg font-bold">Need a completion plan?</h3>
          <p className="mt-1 text-sm text-lms-muted">
            Your adviser can confirm elective choices and explain any missing
            requirement.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/support">Contact academic adviser</Link>
        </Button>
      </section>
    </ServiceShell>
  );
}

function TransferFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-white/70 p-3">
      <p className="text-xs uppercase text-amber-800">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function AdmissionRegistrationRecord({
  context,
  student,
}: {
  context: StudentContext;
  student: Student;
}) {
  const jamb = student.priorEducation.find(
    (item) => item.qualificationType === "UTME",
  );
  const oLevel = student.priorEducation.find((item) =>
    ["WASSCE", "NECO_SSCE", "NABTEB"].includes(item.qualificationType),
  );
  const applicationNumber = student.fields.firstName.provenance.sourceReference;
  const isNgoziDemo = student.id === "student-2025-150";

  const screening = isNgoziDemo
    ? {
        type: "Post-UTME screening",
        score: "82 / 100",
        attendance: "Attended",
        eligibility: "Eligible",
        evidence: "Verified",
        reviewedAt: "2025-09-22T11:30:00Z",
        ruleVersion: "UG-UTME-2025-v2",
        caps: "Matched and accepted",
        offer: "Accepted",
      }
    : undefined;

  return (
    <ServiceShell
      eyebrow="Admission & entry registration"
      title="Admission registration record"
      description={`2025/2026 admission cycle · ${context.programmeName}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdmissionMetric
          icon={Landmark}
          label="Admission route"
          value={jamb ? "UTME" : "Institutional route"}
          detail={
            jamb
              ? "100-level undergraduate entry"
              : "See supporting qualifications"
          }
        />
        <AdmissionMetric
          icon={ClipboardCheck}
          label="Application"
          value={applicationNumber}
          detail="Offer accepted and onboarded"
        />
        <AdmissionMetric
          icon={Award}
          label="Screening"
          value={screening?.eligibility ?? "Recorded"}
          detail={
            screening
              ? `${screening.type} · ${screening.score}`
              : "Student-facing details unavailable"
          }
        />
        <AdmissionMetric
          icon={GraduationCap}
          label="Matriculation"
          value={student.matriculationNumber}
          detail={`${context.programmeName} · ${context.level} level`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
          aria-labelledby="entry-record-title"
        >
          <div className="flex items-start gap-3">
            <Landmark className="mt-0.5 size-5 text-primary" aria-hidden />
            <div>
              <h3
                id="entry-record-title"
                className="font-display text-xl font-bold"
              >
                Entry and JAMB/CAPS record
              </h3>
              <p className="mt-1 text-sm text-lms-muted">
                Route-specific identifiers and verification evidence retained
                from admission onboarding.
              </p>
            </div>
          </div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <RegistrationFact label="Applicant" value={context.displayName} />
            <RegistrationFact
              label="Application number"
              value={applicationNumber}
            />
            <RegistrationFact
              label="Entry route"
              value={jamb ? "UTME" : "Institutional route"}
            />
            <RegistrationFact label="Academic session" value="2025/2026" />
            <RegistrationFact
              label="JAMB registration number"
              value={jamb?.examNumber ?? "Not applicable"}
              mono
            />
            <RegistrationFact
              label="UTME result"
              value={jamb?.summary ?? "Not applicable"}
            />
            <RegistrationFact
              label="CAPS status"
              value={
                screening?.caps ??
                (jamb ? "Verified during onboarding" : "Not applicable")
              }
            />
            <RegistrationFact
              label="CAPS evidence"
              value={
                jamb?.provenance.sourceReference ?? "No JAMB route evidence"
              }
            />
          </dl>
          <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-950">
            JAMB/CAPS remains authoritative for this UTME route. This page
            reports the retained university record and does not replace the CAPS
            portal.
          </p>
        </section>

        <section
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
          aria-labelledby="olevel-title"
        >
          <div className="flex items-start gap-3">
            <FileCheck2 className="mt-0.5 size-5 text-primary" aria-hidden />
            <div>
              <h3 id="olevel-title" className="font-display text-xl font-bold">
                O’Level result
              </h3>
              <p className="mt-1 text-sm text-lms-muted">
                WAEC, NECO or NABTEB evidence linked to the student record.
              </p>
            </div>
          </div>
          {oLevel ? (
            <>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Badge variant="success">
                  {oLevel.provenance.verification}
                </Badge>
                <Badge variant="outline">
                  {oLevel.qualificationType.replaceAll("_", " ")}
                </Badge>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <RegistrationFact
                  label="Examination number"
                  value={oLevel.examNumber ?? "Not recorded"}
                  mono
                />
                <RegistrationFact
                  label="Examination year"
                  value={String(oLevel.year)}
                />
                <RegistrationFact
                  label="School / institution"
                  value={oLevel.institution}
                />
                <RegistrationFact
                  label="Result summary"
                  value={oLevel.summary}
                />
                <RegistrationFact
                  label="Verification reference"
                  value={oLevel.provenance.sourceReference}
                />
                <RegistrationFact
                  label="Verified"
                  value={
                    oLevel.provenance.verifiedAt
                      ? formatDashboardDateTime(oLevel.provenance.verifiedAt)
                      : "During admission onboarding"
                  }
                />
              </dl>
            </>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-border p-5 text-sm text-lms-muted">
              No O’Level qualification is linked to this student record.
            </p>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
          aria-labelledby="screening-title"
        >
          <h3 id="screening-title" className="font-display text-xl font-bold">
            Screening and decision
          </h3>
          {screening ? (
            <>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <RegistrationFact
                  label="Screening type"
                  value={screening.type}
                />
                <RegistrationFact
                  label="Attendance"
                  value={screening.attendance}
                />
                <RegistrationFact
                  label="Released score"
                  value={screening.score}
                />
                <RegistrationFact
                  label="Eligibility"
                  value={screening.eligibility}
                />
                <RegistrationFact
                  label="Evidence status"
                  value={screening.evidence}
                />
                <RegistrationFact
                  label="Rule version"
                  value={screening.ruleVersion}
                  mono
                />
                <RegistrationFact
                  label="Reviewed"
                  value={formatDashboardDateTime(screening.reviewedAt)}
                />
                <RegistrationFact
                  label="Offer response"
                  value={screening.offer}
                />
              </dl>
              <p className="mt-4 text-xs text-lms-muted">
                Internal reviewer notes, protected attributes and unreleased
                ranking details are not shown to students.
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-lms-muted">
              No student-releasable screening detail is available.
            </p>
          )}
        </section>

        <section
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
          aria-labelledby="route-evidence-title"
        >
          <h3
            id="route-evidence-title"
            className="font-display text-xl font-bold"
          >
            Route and evidence checklist
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <EvidenceLine
              label="JAMB official result slip"
              status={jamb ? "Verified" : "Not applicable"}
            />
            <EvidenceLine
              label="O’Level result"
              status={oLevel?.provenance.verification ?? "Missing"}
            />
            <EvidenceLine
              label="Post-UTME screening"
              status={
                screening?.eligibility === "Eligible"
                  ? "Passed"
                  : "Not available"
              }
            />
            <EvidenceLine
              label="JAMB/CAPS association"
              status={screening?.caps ?? "Not applicable"}
            />
            <EvidenceLine
              label="Admission offer acceptance"
              status={screening?.offer ?? "Recorded"}
            />
          </ul>
          <div className="mt-5 rounded-xl bg-muted/45 p-4">
            <p className="text-sm font-semibold">Alternative entry routes</p>
            <p className="mt-1 text-xs text-lms-muted">
              JUPEB/Foundation and Pre-science are not applicable to this
              student’s UTME admission. Where used, their centre, candidate
              reference, subject combination and result evidence would appear
              here instead.
            </p>
          </div>
        </section>
      </div>
    </ServiceShell>
  );
}

function AdmissionMetric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Landmark;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <Icon className="size-5 text-primary" aria-hidden />
      <p className="mt-4 text-xs text-lms-muted">{label}</p>
      <p className="mt-1 font-display text-lg font-bold">{value}</p>
      <p className="mt-1 text-xs text-lms-muted">{detail}</p>
    </article>
  );
}

function RegistrationFact({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl bg-muted/45 p-3">
      <dt className="text-xs text-lms-muted">{label}</dt>
      <dd className={`mt-1 text-sm font-semibold ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function EvidenceLine({ label, status }: { label: string; status: string }) {
  const positive = [
    "Verified",
    "Passed",
    "Accepted",
    "Matched and accepted",
  ].some((value) => status.includes(value));
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
      <span>{label}</span>
      <Badge variant={positive ? "success" : "outline"}>{status}</Badge>
    </li>
  );
}

function ServiceShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-lms-muted">{description}</p>
      </header>
      {children}
    </div>
  );
}

function ProposalSection({
  title,
  items,
  termLines,
  onAdd,
}: {
  title: string;
  items: ProposedCourse[];
  termLines: { courseCode: string; status: string }[];
  onAdd: (course: ProposedCourse) => void;
}) {
  if (!items.length) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h3 className="flex items-center gap-2 font-display font-bold">
        <BookOpenCheck className="size-4 text-primary" aria-hidden />
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((course) => {
          const added = termLines.some(
            (line) =>
              line.courseCode === course.courseCode &&
              line.status !== "Dropped",
          );
          return (
            <li
              key={course.courseCode}
              className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
            >
              <div>
                <p className="text-sm font-semibold">
                  {course.courseCode} · {course.courseTitle}
                </p>
                <p className="text-xs text-lms-muted">
                  {course.creditUnits} credit units · {course.classification}
                </p>
              </div>
              <Button size="sm" disabled={added} onClick={() => onAdd(course)}>
                {added ? (
                  "Added"
                ) : (
                  <>
                    <Plus className="size-3.5" aria-hidden /> Add
                  </>
                )}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <GraduationCap className="size-5 text-primary" aria-hidden />
      <p className="mt-4 text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-lms-muted">{label}</p>
    </article>
  );
}
