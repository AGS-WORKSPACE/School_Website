"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, LockKeyhole, UserCheck } from "lucide-react";
import { useAdmissions, ScreeningType, canViewSensitiveAccommodation } from "@tau/admissions";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { NativeSelect } from "@tau/ui/native-select";
import { Input } from "@tau/ui/input";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { ScreeningStatusBadge } from "@/components/console/screening-status";
import { useSession } from "@/providers/session-provider";

const actorFallback = { personId: "usr-screening-demo", name: "Current screening officer", role: "Admissions officer" };

export default function ScreeningAppointmentsPage() {
  const { screeningRecords, screeningAppointments, screeningAccommodations, scoringRules, mutations } = useAdmissions();
  const { session } = useSession();
  const { data: person, isLoading: permissionLoading } = usePerson(session?.personId ?? "");
  const [selectedRecordId, setSelectedRecordId] = useState(screeningRecords[0]?.id ?? "");
  const [date, setDate] = useState("2026-09-19");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:45");
  const [venue, setVenue] = useState("Admissions Hall A");
  const [venueCapacity, setVenueCapacity] = useState("2");
  const [screeningType, setScreeningType] = useState<ScreeningType>("Physical_Screening");
  const [criterion, setCriterion] = useState("");
  const [score, setScore] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const actor = session ? { personId: session.personId, name: session.displayName, role: "Admissions officer" } : actorFallback;
  const canScore = person?.permissionIds.includes("admissions:screening:score") ?? false;
  const canViewSensitive = canViewSensitiveAccommodation(person?.permissionIds ?? []);
  const selectedRecord = screeningRecords.find((item) => item.id === selectedRecordId) ?? screeningRecords[0];
  const selectedRule = scoringRules.find((item) => item.programmeIds.includes(selectedRecord?.programmeId ?? "")) ?? scoringRules[0];
  const criteria = selectedRule?.conditions ?? [];
  const activeAppointments = screeningAppointments.filter((item) => ["Scheduled", "Confirmed", "Attended", "Rescheduled"].includes(item.status));
  const appointmentsByDate = useMemo(() => [...activeAppointments].sort((left, right) => `${left.date}${left.startTime}`.localeCompare(`${right.date}${right.startTime}`)), [activeAppointments]);

  function schedule() {
    if (!selectedRecord) return;
    const result = mutations.scheduleScreeningAppointment({ id: `appointment-${Date.now()}`, screeningRecordId: selectedRecord.id, applicationId: selectedRecord.applicationId, candidateName: selectedRecord.applicantName, date, startTime, endTime, venue, venueCapacity: Number(venueCapacity), screeningType, assignedOfficerIds: [actor.personId], assignedOfficerNames: [actor.name], status: "Scheduled" });
    setMessage(result.ok ? "Appointment scheduled in the frontend store." : result.error ?? "Appointment could not be scheduled.");
  }

  function recordScore() {
    if (!selectedRecord || !criterion) return;
    const condition = criteria.find((item) => item.id === criterion);
    if (!condition) return;
    const result = mutations.recordScreeningScore({ screeningRecordId: selectedRecord.id, criterion: condition.label, score: Number(score), maximum: condition.weight, source: "Manual", reviewer: actor.name });
    setMessage(result.ok ? "Screening score recorded." : result.error ?? "Score could not be recorded.");
  }

  if (permissionLoading) return <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground" role="status">Loading appointment workspace…</div>;

  return <div className="space-y-6"><Link href="/admissions/screening" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="mr-1.5 size-4" />Back to screening workspace</Link><PageHeader eyebrow="EP-06 · SCR-03" title="Screening appointments and attendance" description="Schedule candidates, record attendance, and enter authorized screening scores. Frontend capacity checks are convenience checks; final enforcement belongs to the backend." actions={<Badge variant="outline"><CalendarDays className="mr-1 size-3.5" />Frontend scheduling view</Badge>} />{message && <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm" role="status">{message}</div>}
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><Section title="Schedule screening" description="Obvious candidate, officer, venue, and capacity conflicts are blocked in this frontend preview."><div className="space-y-4"><label className="block space-y-1.5 text-sm font-medium">Candidate<NativeSelect value={selectedRecord?.id ?? ""} onChange={(event) => setSelectedRecordId(event.target.value)} aria-label="Candidate">{screeningRecords.map((item) => <option key={item.id} value={item.id}>{item.applicantName} · {item.applicationNumber}</option>)}</NativeSelect></label><div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium">Date<Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label className="space-y-1.5 text-sm font-medium">Screening type<NativeSelect value={screeningType} onChange={(event) => setScreeningType(event.target.value as ScreeningType)}><option value="Document_Review">Document review</option><option value="Written_Test">Written test</option><option value="Interview">Interview</option><option value="Physical_Screening">Physical screening</option></NativeSelect></label><label className="space-y-1.5 text-sm font-medium">Start time<Input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label><label className="space-y-1.5 text-sm font-medium">End time<Input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label></div><label className="block space-y-1.5 text-sm font-medium">Venue<Input value={venue} onChange={(event) => setVenue(event.target.value)} /></label><label className="block space-y-1.5 text-sm font-medium">Venue capacity<Input type="number" min="1" value={venueCapacity} onChange={(event) => setVenueCapacity(event.target.value)} /><span className="block text-xs font-normal text-muted-foreground">Convenience limit for concurrent appointments.</span></label><Button className="w-full sm:w-auto" onClick={schedule} disabled={!canScore}><CalendarDays className="mr-1.5 size-4" />Schedule appointment</Button>{!canScore && <p className="text-xs text-muted-foreground">Screening permission is required.</p>}</div></Section>
      <Section title={`Appointment register (${appointmentsByDate.length})`} description="Attendance timestamps and notes are retained with the appointment record."><div className="space-y-3">{appointmentsByDate.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No appointments scheduled.</p> : appointmentsByDate.map((appointment) => <AppointmentRow key={appointment.id} appointment={appointment} canScore={canScore} actor={actor} onAttendance={(status, note) => { const result = mutations.recordScreeningAttendance(appointment.id, status, actor, note); setMessage(result.ok ? `Attendance marked ${status.toLowerCase()}.` : result.error ?? "Attendance update failed."); }} />)}</div></Section></div>
    <div className="grid gap-6 xl:grid-cols-2"><Section title="Screening score entry" description="Only authorized screening officers can record scores; criteria come from the configured rule."><div className="grid gap-3 sm:grid-cols-3"><label className="space-y-1.5 text-sm font-medium sm:col-span-2">Criterion<NativeSelect value={criterion} onChange={(event) => setCriterion(event.target.value)} aria-label="Scoring criterion"><option value="">Choose criterion</option>{criteria.map((item) => <option key={item.id} value={item.id}>{item.label} · max {item.weight}</option>)}</NativeSelect></label><label className="space-y-1.5 text-sm font-medium">Score<Input type="number" min="0" value={score} onChange={(event) => setScore(event.target.value)} aria-label="Score" /></label></div><div className="mt-4 flex flex-wrap items-center gap-3"><Button onClick={recordScore} disabled={!canScore || !criterion || score === ""}><UserCheck className="mr-1.5 size-4" />Record score</Button><span className="text-xs text-muted-foreground">Reviewer: {actor.name}</span></div></Section>
      <Section title="Screening accommodation" description="Scorers see only the approved arrangement, never diagnosis or medical notes."><div className="space-y-3">{screeningAccommodations.length === 0 ? <p className="text-sm text-muted-foreground">No accommodation arrangements recorded.</p> : screeningAccommodations.map((accommodation) => <div key={accommodation.id} className="rounded-lg border p-3"><div className="flex items-start justify-between gap-3"><div><div className="font-semibold">{accommodation.candidateName}</div><div className="mt-1 text-sm">{accommodation.enabled ? accommodation.arrangement : "No active arrangement"}</div><div className="mt-1 text-xs text-muted-foreground">Valid from {accommodation.validFrom}{accommodation.validTo ? ` to ${accommodation.validTo}` : ""}</div></div><Badge variant={accommodation.enabled ? "success" : "muted"}>{accommodation.enabled ? "Accommodation enabled" : "Not enabled"}</Badge></div>{canViewSensitive ? <div className="mt-3 rounded-md bg-amber-500/10 p-2 text-xs text-amber-900 dark:text-amber-200"><LockKeyhole className="mr-1 inline size-3" />Restricted detail: {accommodation.sensitiveDetail}</div> : <div className="mt-3 text-xs text-muted-foreground">Scoring view intentionally excludes restricted accommodation detail.</div>}</div>)}</div></Section></div>
  </div>;
}

function AppointmentRow({ appointment, canScore, actor, onAttendance }: { appointment: import("@tau/admissions").ScreeningAppointment; canScore: boolean; actor: { personId: string; name: string; role: string }; onAttendance: (status: "Attended" | "Absent" | "Rescheduled", note?: string) => void }) {
  return <div className="rounded-lg border p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><div className="font-semibold">{appointment.candidateName}</div><div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground"><span><CalendarDays className="mr-1 inline size-3.5" />{appointment.date}</span><span><Clock3 className="mr-1 inline size-3.5" />{appointment.startTime}–{appointment.endTime}</span><span>{appointment.venue}</span><span>{appointment.screeningType.replaceAll("_", " ")}</span></div><div className="mt-2 text-xs text-muted-foreground">Officer: {appointment.assignedOfficerNames.join(", ")} · Capacity {appointment.venueCapacity}</div></div><ScreeningStatusBadge status={appointment.status === "Attended" ? "Completed" : appointment.status === "Absent" ? "Returned" : appointment.status === "Rescheduled" ? "Returned" : "In_Review"} /></div>{appointment.attendanceAt && <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">Attendance recorded {new Date(appointment.attendanceAt).toLocaleString()}. {appointment.attendanceNote}</p>}<div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={!canScore} onClick={() => onAttendance("Attended", "Candidate attended screening.")}>Mark attended</Button><Button size="sm" variant="outline" disabled={!canScore} onClick={() => onAttendance("Absent", "Candidate did not attend.")}>Mark absent</Button><Button size="sm" variant="ghost" disabled={!canScore} onClick={() => onAttendance("Rescheduled", `Reschedule requested by ${actor.name}.`)}>Reschedule</Button></div></div>;
}