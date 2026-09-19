"use client";

import { useState } from "react";
import { clearanceStatus, unitGraduationHolds, useGraduation, type ClearanceCase, type ClearanceUnit } from "@tau/graduation";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { StatusBadge } from "@/components/console/status-badge";
import { formatDateTime, statusKey } from "@/lib/format";
import { useGraduationActor } from "./acting-as";

/**
 * One graduand's clearance case. The acting unit can decide its own checkpoint;
 * holds from the EP-08 student record are shown against the unit that owns them.
 */
export function ClearanceCard({ clearance, name, announce }: { clearance: ClearanceCase; name: string; announce: (result: { ok: boolean; error?: string }, success: string) => boolean }) {
  const grad = useGraduation();
  const actor = useGraduationActor();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const key = (unit: ClearanceUnit) => `${clearance.studentId}:${unit}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">{name}</span>
        <StatusBadge status={statusKey(clearanceStatus(clearance))} />
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {clearance.checkpoints.map((checkpoint) => {
          const holds = unitGraduationHolds(grad.context.holds, clearance.studentId, checkpoint.unit, grad.now);
          const mine = actor.unit === checkpoint.unit;
          return (
            <div key={checkpoint.unit} className={`space-y-2 rounded-lg border p-3 ${mine ? "border-primary" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{checkpoint.unit}</span>
                <StatusBadge status={statusKey(checkpoint.status === "Not_Applicable" ? "not-applicable" : checkpoint.status)} />
              </div>
              {checkpoint.reason && <p className="text-xs">{checkpoint.reason}</p>}
              {checkpoint.decidedByName && <p className="text-xs text-muted-foreground">{checkpoint.decidedByName} · {formatDateTime(checkpoint.decidedAt)}</p>}
              {holds.length > 0 && <p className="text-xs font-medium text-destructive">Student-record hold: {holds[0].releasableReason}</p>}
              {checkpoint.appeal && (
                <div className="rounded bg-muted/50 p-2 text-xs">
                  <span className="font-semibold">Appeal ({checkpoint.appeal.status.toLowerCase()}):</span> {checkpoint.appeal.grounds}
                  {checkpoint.appeal.decisionNote && <div className="mt-1 text-muted-foreground">{checkpoint.appeal.decidedByName}: {checkpoint.appeal.decisionNote}</div>}
                </div>
              )}
              {checkpoint.required && (mine || checkpoint.appeal?.status === "Open") && (
                <div className="space-y-2">
                  <Input placeholder={checkpoint.appeal?.status === "Open" ? "Appeal decision note" : "What is outstanding (required to block)"} value={reasons[key(checkpoint.unit)] ?? ""} onChange={(e) => setReasons({ ...reasons, [key(checkpoint.unit)]: e.target.value })} aria-label={`${checkpoint.unit} note for ${name}`} />
                  <div className="flex flex-wrap gap-1.5">
                    {checkpoint.appeal?.status === "Open" ? <>
                      <Button size="sm" onClick={() => announce(grad.mutations.decideAppeal(clearance.studentId, checkpoint.unit, "Upheld", reasons[key(checkpoint.unit)] ?? "", actor), `Appeal upheld; ${checkpoint.unit} checkpoint cleared.`)}>Uphold appeal</Button>
                      <Button size="sm" variant="outline" onClick={() => announce(grad.mutations.decideAppeal(clearance.studentId, checkpoint.unit, "Dismissed", reasons[key(checkpoint.unit)] ?? "", actor), "Appeal dismissed; the block stands.")}>Dismiss</Button>
                    </> : <>
                      <Button size="sm" onClick={() => announce(grad.mutations.decideCheckpoint(clearance.studentId, checkpoint.unit, "Cleared", "", actor), `${checkpoint.unit} cleared ${name}.`)}>Clear</Button>
                      <Button size="sm" variant="outline" onClick={() => announce(grad.mutations.decideCheckpoint(clearance.studentId, checkpoint.unit, "Blocked", reasons[key(checkpoint.unit)] ?? "", actor), `${checkpoint.unit} blocked ${name}.`)}>Block</Button>
                    </>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
