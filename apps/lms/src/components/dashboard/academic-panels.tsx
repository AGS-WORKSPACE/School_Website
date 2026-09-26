"use client";

import { ArrowUpRight, BookMarked, CalendarRange, CheckCircle2, CircleAlert, Clock3, FileCheck2, IdCard, Mail, MapPin, Phone, ShieldAlert } from "lucide-react";
import { derivePlacement, useStudents } from "@tau/students";
import type { StudentContext } from "@tau/student-dashboard";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Progress } from "@tau/ui/progress";

const portalBase = process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL ?? "http://localhost:3000";

function verificationVariant(state: string) {
  return state === "Verified" ? "success" as const : state === "Disputed" ? "destructive" as const : "warning" as const;
}

export function AcademicPanels({ context }: { context: StudentContext }) {
  const { students, lifecycleEvents, holds, transfers } = useStudents();
  const student = students.find((item) => item.id === context.sisStudentId);
  const placement = derivePlacement(lifecycleEvents, context.sisStudentId);
  const activeHolds = holds.filter((hold) => hold.studentId === context.sisStudentId && !hold.releasedAt);
  const transfer = transfers.find((item) => item.studentId === context.sisStudentId && item.status === "In_Review");
  const hasRegistrationRecord = Boolean(context.recordsStudentId);

  if (!student) {
    return <div className="rounded-2xl border border-border bg-card p-6 text-sm text-lms-muted">Your student record is not available. Contact Registry for help.</div>;
  }

  const details = [
    { label: "University email", key: "email" as const, icon: Mail },
    { label: "Phone", key: "phone" as const, icon: Phone },
    { label: "Contact address", key: "address" as const, icon: MapPin },
    { label: "Nationality", key: "nationality" as const, icon: IdCard },
  ];
  const registrationBlocked = activeHolds.some((hold) => hold.effects.includes("Registration"));
  const transferStages = ["Releasing Department", "Receiving Department", "Faculty", "Registry"];
  const completedStages = transfer?.approvals.length ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Academic profile</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">Your academic journey</h2>
        <p className="mt-2 max-w-2xl text-sm text-lms-muted">Review the student-safe information held by Registry and open the approved registration and correction journeys.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-2xl border border-border bg-card shadow-card" aria-labelledby="profile-title">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
            <div>
              <h3 id="profile-title" className="font-display text-lg font-bold">Personal details</h3>
              <p className="mt-1 text-sm text-lms-muted">Releasable fields from your SIS record.</p>
            </div>
            <Button asChild variant="outline" size="sm"><a href={`${portalBase}/student-portal/my-record`}>Request a correction <ArrowUpRight aria-hidden /></a></Button>
          </div>
          <dl className="grid gap-px bg-border sm:grid-cols-2">
            {details.map((detail) => {
              const field = student.fields[detail.key];
              const Icon = detail.icon;
              return (
                <div key={detail.key} className="bg-card p-5">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lms-muted"><Icon className="size-4" aria-hidden />{detail.label}</dt>
                  <dd className="mt-2 break-words text-sm font-semibold text-foreground">{field.value}</dd>
                  <Badge className="mt-2" variant={verificationVariant(field.provenance.verification)}>{field.provenance.verification}</Badge>
                </div>
              );
            })}
          </dl>
          <div className="border-t border-border bg-muted/25 px-5 py-3 text-xs text-lms-muted">Protected fields can only be changed through the evidence-based Registry workflow.</div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="standing-title">
          <div className="flex items-center justify-between gap-3">
            <h3 id="standing-title" className="font-display text-lg font-bold">Current standing</h3>
            <Badge variant="success">{context.enrolmentStatus}</Badge>
          </div>
          <div className="mt-5 rounded-2xl bg-[#10102d] p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/55">Programme</p>
            <p className="mt-2 font-display text-xl font-bold">{placement?.programmeName ?? context.programmeName}</p>
            <p className="mt-1 text-sm text-white/65">{placement?.level ?? context.level} level · {context.mode.replaceAll("_", " ")}</p>
            <div className="mt-5 flex flex-wrap gap-2"><Badge className="border-white/20 bg-white/10 text-white">{context.academicSession}</Badge><Badge className="border-white/20 bg-white/10 text-white">{context.standing.replaceAll("_", " ")}</Badge></div>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-lms-muted">Matriculation number</dt><dd className="font-mono font-semibold">{student.matriculationNumber}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-lms-muted">Cohort</dt><dd className="font-semibold">{context.cohort}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-lms-muted">Curriculum</dt><dd className="font-semibold">{placement?.curriculumVersion ?? "From SIS"}</dd></div>
          </dl>
        </section>
      </div>

      {transfer ? (
        <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5" aria-labelledby="transfer-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Open academic request</p><h3 id="transfer-title" className="mt-1 font-display text-lg font-bold">Programme transfer to {transfer.toProgrammeName}</h3><p className="mt-1 text-sm text-blue-950/70">The source workflow is in review. Your current SIS programme remains unchanged until final approval.</p></div>
            <Badge variant="warning">{transfer.status.replaceAll("_", " ")}</Badge>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2" aria-label={`${completedStages} of ${transferStages.length} transfer stages complete`}>
            {transferStages.map((stage, index) => <div key={stage}><div className={`h-2 rounded-full ${index < completedStages ? "bg-blue-700" : "bg-blue-200"}`} /><p className="mt-2 hidden text-[10px] font-semibold text-blue-900/70 sm:block">{stage}</p></div>)}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="registration-title">
          <div className="flex items-start justify-between gap-3"><div><h3 id="registration-title" className="font-display text-lg font-bold">Course registration</h3><p className="mt-1 text-sm text-lms-muted">Dates, proposals, add/drop and frozen statements.</p></div><CalendarRange className="size-5 text-primary" aria-hidden /></div>
          {registrationBlocked ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"><p className="flex items-center gap-2 text-sm font-bold text-red-800"><ShieldAlert className="size-4" aria-hidden /> Registration restricted</p><p className="mt-1 text-sm text-red-700">An applicable hold must be resolved through its owning service.</p></div>
          ) : hasRegistrationRecord ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="flex items-center gap-2 text-sm font-bold text-emerald-800"><CheckCircle2 className="size-4" aria-hidden /> Registration record linked</p><p className="mt-1 text-sm text-emerald-700">Open Registration to review the current proposal and statement.</p></div>
          ) : (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="flex items-center gap-2 text-sm font-bold text-amber-900"><Clock3 className="size-4" aria-hidden /> Awaiting registration record</p><p className="mt-1 text-sm text-amber-800">Registration has no linked record for this student yet. The dashboard will not substitute an empty or invented record.</p></div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/45 p-3"><p className="text-xs text-lms-muted">Registration status</p><p className="mt-1 text-sm font-bold">{hasRegistrationRecord ? "Available" : "No record"}</p></div>
            <div className="rounded-xl bg-muted/45 p-3"><p className="text-xs text-lms-muted">Applicable holds</p><p className="mt-1 text-sm font-bold">{activeHolds.filter((hold) => hold.effects.includes("Registration")).length}</p></div>
          </div>
          <Button asChild className="mt-5 w-full"><a href={`${portalBase}/student-portal/registration`}>Open registration service <ArrowUpRight aria-hidden /></a></Button>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="progress-title">
          <div className="flex items-start justify-between gap-3"><div><h3 id="progress-title" className="font-display text-lg font-bold">Degree progress</h3><p className="mt-1 text-sm text-lms-muted">Approved curriculum, results and substitutions.</p></div><BookMarked className="size-5 text-primary" aria-hidden /></div>
          {hasRegistrationRecord ? (
            <><div className="mt-5 flex items-end justify-between"><div><p className="text-3xl font-bold">View audit</p><p className="text-xs text-lms-muted">Calculated by the degree-audit service</p></div></div><Progress className="mt-4" value={0} /></>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border p-5 text-center"><FileCheck2 className="mx-auto size-6 text-lms-muted" aria-hidden /><p className="mt-2 text-sm font-semibold">No degree audit is linked yet</p><p className="mt-1 text-xs text-lms-muted">The dashboard does not calculate progress with dashboard-only rules.</p></div>
          )}
          <Button asChild variant="outline" className="mt-5 w-full"><a href={`${portalBase}/student-portal/degree-audit`}>Open degree progress <ArrowUpRight aria-hidden /></a></Button>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="holds-title">
        <div className="flex items-center justify-between"><div><h3 id="holds-title" className="font-display text-lg font-bold">Holds and next actions</h3><p className="mt-1 text-sm text-lms-muted">Only active, student-facing restrictions are shown.</p></div><Badge variant={activeHolds.length ? "warning" : "success"}>{activeHolds.length ? `${activeHolds.length} active` : "No active holds"}</Badge></div>
        {activeHolds.length ? <ul className="mt-4 space-y-3">{activeHolds.map((hold) => <li key={hold.id} className="flex gap-3 rounded-xl border border-border p-4"><CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden /><div><p className="font-semibold">{hold.type} hold · {hold.ownerUnit}</p><p className="mt-1 text-sm text-lms-muted">{hold.releasableReason}</p><p className="mt-2 text-xs font-medium text-primary">Next action: {hold.appealRoute}</p></div></li>)}</ul> : <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">There are no active SIS holds on this student record.</p>}
      </section>
    </div>
  );
}
