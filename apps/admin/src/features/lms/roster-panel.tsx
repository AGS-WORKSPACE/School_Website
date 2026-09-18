"use client";

import { pendingRegistrationEvents, rosterSyncSlaMinutes, useLms, type CourseOffering } from "@tau/lms";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { formatDateTime, statusKey } from "@/lib/format";
import { useLmsActor } from "./acting-as";

export function RosterPanel({ offering }: { offering: CourseOffering }) {
  const { enrolments, registrationFeed, processedEventIds, syncRuns, mutations } = useLms();
  const actor = useLmsActor();
  const { notice, announce } = useNotice();
  const roster = enrolments.filter((item) => item.offeringId === offering.id);
  const pending = pendingRegistrationEvents(registrationFeed, processedEventIds, offering.id);
  const runs = syncRuns.filter((run) => run.offeringId === offering.id);

  function sync() {
    const result = mutations.syncRoster(offering.id, actor);
    const run = result.data;
    announce(result, run ? `Sync complete: ${run.added} added, ${run.dropped} dropped, ${run.alreadyApplied} already applied${run.stale ? `, ${run.stale} stale` : ""}. ${run.withinSla ? "Within" : "Outside"} the ${rosterSyncSlaMinutes}-minute target.` : "");
  }

  return (
    <div className="space-y-6">
      <NoticeBanner notice={notice} />
      <Section
        title="SIS registration feed"
        description={`The class list is a projection of SIS add/drop events. Each event applies once, however often it is delivered; target lag ${rosterSyncSlaMinutes} minutes.`}
        actions={<>
          <Button size="sm" variant="outline" onClick={() => announce(mutations.receiveSisChanges(offering.id), "SIS sent a new add, a drop and a redelivered event. Sync to apply them.")}>Receive SIS changes (demo)</Button>
          <Button size="sm" onClick={sync}>Sync roster</Button>
        </>}
      >
        {pending.length === 0 ? <EmptyState message="No SIS changes waiting. Syncing again is safe and changes nothing." /> : (
          <ul className="divide-y text-sm">
            {pending.map((event, index) => (
              <li key={`${event.id}-${index}`} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span><Badge variant={event.action === "Add" ? "success" : "warning"}>{event.action}</Badge> <span className="ml-1 font-medium">{event.studentName}</span> <span className="font-mono text-xs text-muted-foreground">{event.matriculationNumber}</span></span>
                <span className="font-mono text-xs text-muted-foreground">{event.id} · {formatDateTime(event.occurredAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Class list" description={`${roster.filter((item) => item.status === "Active").length} active of ${roster.length} ever registered. One row per student, reactivated if they re-register.`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Status</TableHead><TableHead>Enrolled</TableHead><TableHead>Dropped</TableHead><TableHead>Last SIS event</TableHead></TableRow></TableHeader>
            <TableBody>
              {roster.map((row) => (
                <TableRow key={row.studentId}>
                  <TableCell><div className="font-medium">{row.studentName}</div><div className="font-mono text-xs text-muted-foreground">{row.matriculationNumber}</div></TableCell>
                  <TableCell><StatusBadge status={statusKey(row.status)} /></TableCell>
                  <TableCell className="text-xs">{formatDateTime(row.enrolledAt)}</TableCell>
                  <TableCell className="text-xs">{row.droppedAt ? formatDateTime(row.droppedAt) : "—"}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.lastEventId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section title="Sync runs" description="What each run changed, and whether the slowest event arrived within the target.">
        {runs.length === 0 ? <EmptyState message="No syncs run in this session yet." /> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Ran</TableHead><TableHead>Added</TableHead><TableHead>Dropped</TableHead><TableHead>Already applied</TableHead><TableHead>Stale</TableHead><TableHead>Lag</TableHead></TableRow></TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="text-xs">{formatDateTime(run.ranAt)}<div className="text-muted-foreground">{run.ranBy}</div></TableCell>
                    <TableCell>{run.added}</TableCell>
                    <TableCell>{run.dropped}</TableCell>
                    <TableCell>{run.alreadyApplied}</TableCell>
                    <TableCell>{run.stale}</TableCell>
                    <TableCell>{run.maxLagMinutes} min {run.withinSla ? <Badge variant="success">On target</Badge> : <Badge variant="destructive">Late</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>
    </div>
  );
}
