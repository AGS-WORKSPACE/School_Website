"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, BadgeCheck, CircleDollarSign, ExternalLink, GraduationCap, LockKeyhole, RefreshCw, UserRoundCheck } from "lucide-react";
import { useAdmissions } from "@tau/admissions";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Progress } from "@tau/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";

const actor = { personId: "usr-registry-01", name: "Mrs. Ada Nwosu", role: "Registry Officer" };

export default function OnboardingOperationsPage() {
  const { applications, offerTemplates, offers, acceptanceCharges, matriculationSchemes, students, onboardingTasks, provisioningEvents, onboardingAudit, mutations } = useAdmissions();
  const [message, setMessage] = useState<string>();
  const [activeView, setActiveView] = useState<"offers" | "students" | "provisioning" | "audit">("offers");

  const pendingDestinations = provisioningEvents.flatMap((event) => event.destinations.filter((item) => item.status !== "Succeeded"));
  const requiredTasks = onboardingTasks.filter((task) => task.required);
  const taskCompletion = requiredTasks.length ? Math.round((requiredTasks.filter((task) => ["Completed", "Excepted"].includes(task.status)).length / requiredTasks.length) * 100) : 0;
  const offerRows = useMemo(() => offers.map((offer) => ({ offer, charge: acceptanceCharges.find((item) => item.offerId === offer.id) })), [offers, acceptanceCharges]);
  const approvedCandidateQueue = applications.filter((application) => ["Screening_Passed", "Offer_Recommended"].includes(application.stage) && !offers.some((offer) => offer.applicationId === application.id && offer.status !== "Withdrawn"));

  function announce(result: { ok: boolean; error?: string }, success: string) {
    setMessage(result.ok ? success : result.error);
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="EP-07 · Offers & matriculation" title="Matriculation onboarding control room" description="Move approved candidates from verified offers to governed student records without re-keying their application data." />

      {message && <div role="status" className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium">{message}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={BadgeCheck} label="Offers issued" value={offers.length} detail={`${offers.filter((item) => item.status === "Accepted").length} accepted`} />
        <Metric icon={CircleDollarSign} label="Charges cleared" value={acceptanceCharges.filter((item) => ["Reconciled", "Waived", "Sponsored"].includes(item.status)).length} detail="Reconciled or approved relief" />
        <Metric icon={GraduationCap} label="Students created" value={students.length} detail="Sourced from candidate records" />
        <Metric icon={Activity} label="Provisioning attention" value={pendingDestinations.length} detail="Pending or failed destinations" />
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Onboarding views">
        {(["offers", "students", "provisioning", "audit"] as const).map((view) => <Button key={view} size="sm" variant={activeView === view ? "default" : "outline"} onClick={() => setActiveView(view)} className="capitalize">{view}</Button>)}
      </div>

      {activeView === "offers" && <div className="space-y-6">
        <Section title="Generate approved offers" description="Only screening-approved candidates and route-approved template versions appear here.">
          {approvedCandidateQueue.length === 0 ? <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">No approved candidates are awaiting an offer. Existing approved candidates already have active offers.</div> : <div className="grid gap-3 lg:grid-cols-2">{approvedCandidateQueue.map((application) => {
            const template = offerTemplates.find((item) => item.status === "Approved" && item.routeCodes.includes(application.routeCode));
            return <div key={application.id} className="flex items-center justify-between gap-4 rounded-lg border p-4"><div><div className="font-semibold">{application.applicant.firstName} {application.applicant.lastName}</div><div className="text-xs text-muted-foreground">{application.applicationNumber} · {application.programmeName}</div></div><Button size="sm" disabled={!template} onClick={() => template && announce(mutations.generateOffer(application.id, template.id, actor), "Verified offer generated from the approved template.")}>{template ? `Issue ${template.kind} offer` : "No route template"}</Button></div>;
          })}</div>}
        </Section>
        <Section title="Offer and acceptance register" description="Verification, admission conditions, CAPS, charges and matriculation remain separate gates.">
        <Table>
          <TableHeader><TableRow><TableHead>Candidate</TableHead><TableHead>Offer</TableHead><TableHead>Conditions / CAPS</TableHead><TableHead>Acceptance charge</TableHead><TableHead className="text-right">Controls</TableHead></TableRow></TableHeader>
          <TableBody>{offerRows.map(({ offer, charge }) => {
            const unresolved = offer.conditions.filter((item) => item.required && !["Satisfied", "Waived"].includes(item.status));
            return <TableRow key={offer.id}>
              <TableCell><div className="font-semibold">{offer.applicantName}</div><div className="text-xs text-muted-foreground">{offer.applicationNumber}<br />{offer.programmeName}</div></TableCell>
              <TableCell><Badge variant="outline">{offer.kind}</Badge><div className="mt-1 text-xs">{offer.status}</div><Link className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline" href={offer.verificationUrl}>Candidate view <ExternalLink className="size-3" /></Link></TableCell>
              <TableCell><div className="text-xs font-medium">{unresolved.length ? `${unresolved.length} outstanding` : "All satisfied"}</div><div className="text-xs text-muted-foreground">CAPS: {offer.capsStatus.replaceAll("_", " ")}</div></TableCell>
              <TableCell><div className="text-xs font-medium">{charge ? `₦${charge.amount.toLocaleString()}` : "Not assessed"}</div><div className="text-xs text-muted-foreground">{charge?.status.replaceAll("_", " ") ?? "—"}</div></TableCell>
              <TableCell><div className="flex flex-wrap justify-end gap-1.5">
                {unresolved[0] && <Button size="sm" variant="outline" onClick={() => announce(mutations.decideOfferCondition(offer.id, unresolved[0].id, "Satisfied", actor), "Condition marked satisfied.")}>Verify condition</Button>}
                {offer.capsRequired && offer.capsStatus === "Pending" && <Button size="sm" variant="outline" onClick={() => announce(mutations.recordCapsStatus(offer.id, "Accepted", actor), "CAPS acceptance recorded.")}>Confirm CAPS</Button>}
                {!charge && <Button size="sm" variant="outline" onClick={() => announce(mutations.assessAcceptanceCharge(offer.id, 50_000, actor), "Acceptance charge assessed.")}>Assess charge</Button>}
                {charge?.status === "Assessed" && <Button size="sm" variant="outline" onClick={() => announce(mutations.setAcceptanceChargeStatus(charge.id, "Reconciled", actor), "Charge reconciled.")}>Reconcile</Button>}
                {offer.status === "Accepted" && !students.some((item) => item.sourceOfferId === offer.id) && <Button size="sm" onClick={() => announce(mutations.matriculate(offer.id, matriculationSchemes[0]?.id ?? "", offer.conditions.some((item) => item.code === "IDENTITY" && ["Satisfied", "Waived"].includes(item.status)), actor), "Student record created and provisioning event emitted.")}>Create student</Button>}
              </div></TableCell>
            </TableRow>;
          })}</TableBody>
        </Table>
        </Section>
      </div>}

      {activeView === "students" && <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><Section title="Student records" description="Matriculation numbers are controlled, unique, and linked back to source offers."><Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Matriculation</TableHead><TableHead>Programme</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{students.map((student) => <TableRow key={student.id}><TableCell><div className="font-semibold">{student.fullName}</div><div className="text-xs text-muted-foreground">{student.id}</div></TableCell><TableCell className="font-mono text-xs font-semibold">{student.matriculationNumber}</TableCell><TableCell>{student.programmeName}<div className="text-xs text-muted-foreground">Entry level {student.entryLevel}</div></TableCell><TableCell><Badge variant="outline">{student.status}</Badge></TableCell></TableRow>)}</TableBody></Table></Section></div>
        <Section title="Required onboarding" description="Exceptions remain visible and sensitive forms have restricted roles."><div className="space-y-4"><div><div className="mb-2 flex justify-between text-xs font-medium"><span>Completion</span><span>{taskCompletion}%</span></div><Progress value={taskCompletion} /></div>{onboardingTasks.map((task) => <div key={task.id} className="rounded-lg border p-3"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-1.5 text-sm font-semibold">{task.sensitive && <LockKeyhole className="size-3.5 text-amber-600" />}{task.title}</div><div className="mt-1 text-xs text-muted-foreground">{task.sensitive ? `Restricted: ${task.accessRoles.join(", ")}` : "Standard student access"}</div>{task.exceptionReason && <div className="mt-2 rounded bg-amber-500/10 px-2 py-1.5 text-xs text-amber-900 dark:text-amber-200">Exception: {task.exceptionReason}</div>}</div><Badge variant="outline">{task.status.replaceAll("_", " ")}</Badge></div></div>)}</div></Section>
      </div>}

      {activeView === "provisioning" && <Section title="Downstream provisioning" description="One student-created event fans out to SIS, LMS, email and library; retries reuse the same idempotency key.">{provisioningEvents.map((event) => <div key={event.id} className="mb-4 rounded-xl border p-4 last:mb-0"><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="font-mono text-xs font-semibold">{event.idempotencyKey}</div><div className="text-xs text-muted-foreground">Emitted {new Date(event.occurredAt).toLocaleString()}</div></div><Badge variant="outline">Student created</Badge></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{event.destinations.map((destination) => <div key={destination.system} className="rounded-lg bg-muted/40 p-3"><div className="flex items-center justify-between"><span className="text-sm font-semibold">{destination.system}</span><Badge variant="outline">{destination.status}</Badge></div><div className="mt-2 text-xs text-muted-foreground">Attempts: {destination.attempts}</div>{destination.status !== "Succeeded" && <Button className="mt-3 w-full" size="sm" variant="outline" onClick={() => announce(mutations.retryProvisioning(event.id, destination.system), `${destination.system} retry completed without a duplicate account.`)}><RefreshCw className="mr-1.5 size-3.5" />Retry</Button>}</div>)}</div></div>)}</Section>}

      {activeView === "audit" && <Section title="Onboarding audit trail" description="Reservations, decisions, exceptions and retries remain attributable."><div className="divide-y">{onboardingAudit.map((entry) => <div key={entry.id} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr_auto]"><div><Badge variant="outline">{entry.entityType}</Badge></div><div><div className="text-sm font-semibold">{entry.action.replaceAll("_", " ")}</div><div className="text-xs text-muted-foreground">{entry.detail}</div></div><div className="text-right text-xs text-muted-foreground">{entry.actorName}<br />{new Date(entry.timestamp).toLocaleString()}</div></div>)}</div></Section>}
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof UserRoundCheck; label: string; value: number; detail: string }) {
  return <div className="rounded-xl border bg-card p-4"><div className="flex items-center justify-between text-xs font-medium text-muted-foreground"><span>{label}</span><Icon className="size-4 text-primary" /></div><div className="mt-2 text-2xl font-bold">{value}</div><div className="mt-1 text-xs text-muted-foreground">{detail}</div></div>;
}
