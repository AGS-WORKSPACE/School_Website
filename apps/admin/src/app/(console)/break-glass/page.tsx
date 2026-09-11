"use client";

/**
 * Emergency access (IAM-06).
 *
 * The page is ordered by what needs a human: requests waiting on approval, then
 * grants currently live with the clock visible, then spent grants that nobody has
 * reviewed yet. History comes last, because it is the only part that is finished.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  useBreakGlassGrants,
  useDecideBreakGlass,
  useOrgUnits,
  useRequestBreakGlass,
  useReviewBreakGlass,
  useRevokeBreakGlass,
  useRoles,
} from "@tau/identity/react";
import { maxBreakGlassMinutes } from "@tau/identity";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Progress } from "@tau/ui/progress";
import { Skeleton } from "@tau/ui/skeleton";
import { Textarea } from "@tau/ui/textarea";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { useActor } from "@/providers/session-provider";

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}

export default function BreakGlassPage() {
  const actor = useActor();
  const { data: grants, isPending } = useBreakGlassGrants();
  const { data: roles } = useRoles();
  const { data: units } = useOrgUnits();

  const request = useRequestBreakGlass();
  const decide = useDecideBreakGlass();
  const revokeGrant = useRevokeBreakGlass();
  const review = useReviewBreakGlass();

  const [incidentRef, setIncidentRef] = useState("INC-");
  const [reason, setReason] = useState("");
  const [roleId, setRoleId] = useState("");
  const [unitId, setUnitId] = useState("inst-tau");
  const [minutes, setMinutes] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const emergencyRoles = useMemo(
    () => (roles ?? []).filter((role) => role.breakGlassOnly),
    [roles],
  );

  const pending = (grants ?? []).filter((view) => view.status === "requested");
  const active = (grants ?? []).filter((view) => view.status === "active");
  const awaiting = (grants ?? []).filter((view) => view.status === "awaiting-review");
  const closed = (grants ?? []).filter(
    (view) => view.status === "reviewed" || view.status === "rejected" || view.status === "expired",
  );

  return (
    <>
      <PageHeader
        eyebrow="IAM-06"
        title="Emergency access"
        description={`Break-glass is not a hidden super-user. It is tied to an incident, approved by somebody other than the requester, capped at ${maxBreakGlassMinutes} minutes, alerted on activation, and not closed until a reviewer has read what was done with it.`}
      />

      <Section
        title="Raise a request"
        description="Requesting grants nothing on its own. Ordinary work should go through role assignment and approval instead."
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const unit = (units ?? []).find((candidate) => candidate.id === unitId);
            if (!unit) return;

            const result = await request.mutateAsync({
              roleId,
              scope: { dimension: unit.dimension, unitId: unit.id },
              incidentRef,
              reason,
              actorPersonId: actor.personId,
            });

            if (result.ok) {
              toast.success(result.message);
              setIncidentRef("INC-");
              setReason("");
            } else {
              toast.error(result.message);
            }
          }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="incident">Incident reference</Label>
              <Input
                id="incident"
                value={incidentRef}
                onChange={(event) => setIncidentRef(event.target.value)}
                placeholder="INC-2026-0914"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bg-role">Emergency role</Label>
              <NativeSelect
                id="bg-role"
                value={roleId}
                onChange={(event) => setRoleId(event.target.value)}
                required
              >
                <option value="">Choose…</option>
                {emergencyRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bg-scope">Scope</Label>
              <NativeSelect
                id="bg-scope"
                value={unitId}
                onChange={(event) => setUnitId(event.target.value)}
                required
              >
                {(units ?? []).map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.dimension})
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bg-reason">What is broken, and why ordinary access will not do</Label>
            <Textarea
              id="bg-reason"
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. Registration queue stalled for the JUPEB cohort; result records must be inspected and corrected before tonight's deadline"
              required
            />
          </div>

          <Button type="submit" disabled={request.isPending}>
            {request.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Submit request
          </Button>
        </form>
      </Section>

      {isPending ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : (
        <>
          <Section
            title={`Awaiting approval (${pending.length})`}
            description="The approver sets the time box. They cannot be the person who asked."
          >
            {pending.length === 0 ? (
              <EmptyState message="Nothing is waiting on an approval decision." />
            ) : (
              <ul className="divide-border divide-y">
                {pending.map((view) => {
                  const isRequester = view.grant.requestedBy === actor.personId;
                  return (
                    <li key={view.grant.id} className="py-4 first:pt-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        {view.grant.incidentRef}
                        <StatusBadge status={view.status} />
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {view.requestedByLabel} · {view.scopeLabel} · requested{" "}
                        {formatDateTime(view.grant.requestedAt)}
                      </p>
                      <p className="mt-2 text-sm">{view.grant.reason}</p>

                      {isRequester ? (
                        <p className="text-muted-foreground border-border mt-3 rounded-lg border border-dashed p-3 text-xs">
                          You raised this request, so somebody else must approve it.
                        </p>
                      ) : (
                        <div className="mt-3 flex flex-wrap items-end gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`minutes-${view.grant.id}`} className="text-xs">
                              Minutes (15–{maxBreakGlassMinutes})
                            </Label>
                            <Input
                              id={`minutes-${view.grant.id}`}
                              type="number"
                              min={15}
                              max={maxBreakGlassMinutes}
                              className="tabular w-32"
                              value={minutes[view.grant.id] ?? 60}
                              onChange={(event) =>
                                setMinutes((current) => ({
                                  ...current,
                                  [view.grant.id]: Number(event.target.value),
                                }))
                              }
                            />
                          </div>
                          <Button
                            size="sm"
                            disabled={decide.isPending}
                            onClick={async () => {
                              const result = await decide.mutateAsync({
                                grantId: view.grant.id,
                                decision: "approve",
                                minutes: minutes[view.grant.id] ?? 60,
                                note: "",
                                actorPersonId: actor.personId,
                              });
                              if (result.ok) toast.success(result.message);
                              else toast.error(result.message);
                            }}
                          >
                            Approve and start the clock
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={decide.isPending}
                            onClick={async () => {
                              const result = await decide.mutateAsync({
                                grantId: view.grant.id,
                                decision: "reject",
                                note: "Ordinary access is sufficient for this incident.",
                                actorPersonId: actor.personId,
                              });
                              if (result.ok) toast.success(result.message);
                              else toast.error(result.message);
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section
            title={`Live now (${active.length})`}
            description="Time remaining cannot be extended in place. A longer incident needs a fresh request and a fresh approval."
          >
            {active.length === 0 ? (
              <EmptyState message="No emergency access is live." />
            ) : (
              <ul className="divide-border divide-y">
                {active.map((view) => {
                  const granted =
                    view.grant.activatedAt && view.grant.expiresAt
                      ? (new Date(view.grant.expiresAt).getTime() -
                          new Date(view.grant.activatedAt).getTime()) /
                        60_000
                      : 0;
                  const used = granted > 0 ? ((granted - view.minutesRemaining) / granted) * 100 : 0;

                  return (
                    <li key={view.grant.id} className="py-4 first:pt-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <ShieldAlert className="text-destructive size-4" aria-hidden />
                        {view.grant.incidentRef}
                        <StatusBadge status="active" />
                        <Badge variant="destructive">
                          <Clock className="size-3.5" aria-hidden />
                          {view.minutesRemaining} min remaining
                        </Badge>
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {view.requestedByLabel} · {view.scopeLabel} · approved by{" "}
                        {view.approvedByLabel ?? "—"}
                      </p>
                      <Progress value={used} className="mt-3" />
                      <p className="text-muted-foreground/80 mt-2 text-xs">
                        {view.grant.notified.length} people alerted on activation ·{" "}
                        {view.actionsTaken.length} action
                        {view.actionsTaken.length === 1 ? "" : "s"} recorded so far
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        disabled={revokeGrant.isPending}
                        onClick={async () => {
                          const result = await revokeGrant.mutateAsync({
                            grantId: view.grant.id,
                            reason: "Ended early from the emergency access console.",
                            actorPersonId: actor.personId,
                          });
                          if (result.ok) toast.success(result.message);
                          else toast.error(result.message);
                        }}
                      >
                        End now
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section
            title={`Awaiting post-use review (${awaiting.length})`}
            description="A grant is not finished when it expires. It is finished when somebody other than the user has read what was done with it."
          >
            {awaiting.length === 0 ? (
              <EmptyState message="Nothing is waiting to be reviewed." />
            ) : (
              <ul className="divide-border divide-y">
                {awaiting.map((view) => {
                  const isUser = view.grant.requestedBy === actor.personId;
                  return (
                    <li key={view.grant.id} className="py-4 first:pt-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        {view.grant.incidentRef}
                        <StatusBadge status={view.status} />
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {view.requestedByLabel} · {view.scopeLabel} · ran{" "}
                        {formatDateTime(view.grant.activatedAt)} →{" "}
                        {formatDateTime(view.grant.expiresAt)}
                      </p>

                      {view.actionsTaken.length === 0 ? (
                        <p className="text-muted-foreground mt-2 text-sm">
                          No actions were recorded under this grant.
                        </p>
                      ) : (
                        <ul className="border-border mt-3 space-y-1 rounded-lg border p-3">
                          {view.actionsTaken.map((event) => (
                            <li key={event.id} className="text-muted-foreground text-xs">
                              <span className="font-mono font-semibold">{event.action}</span> ·{" "}
                              {event.subjectLabel} · {formatDateTime(event.at)}
                            </li>
                          ))}
                        </ul>
                      )}

                      {isUser ? (
                        <p className="text-muted-foreground border-border mt-3 rounded-lg border border-dashed p-3 text-xs">
                          You used this access, so somebody else must review it.
                        </p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          <Label htmlFor={`review-${view.grant.id}`} className="text-xs">
                            What was this access used for?
                          </Label>
                          <Textarea
                            id={`review-${view.grant.id}`}
                            rows={2}
                            value={notes[view.grant.id] ?? ""}
                            onChange={(event) =>
                              setNotes((current) => ({
                                ...current,
                                [view.grant.id]: event.target.value,
                              }))
                            }
                            placeholder="e.g. Nine identity resets against the affected staff list, all proportionate to the incident"
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              disabled={review.isPending}
                              onClick={async () => {
                                const result = await review.mutateAsync({
                                  grantId: view.grant.id,
                                  outcome: "appropriate",
                                  notes: notes[view.grant.id] ?? "",
                                  actorPersonId: actor.personId,
                                });
                                if (result.ok) toast.success(result.message);
                                else toast.error(result.message);
                              }}
                            >
                              <ShieldCheck className="size-4" aria-hidden />
                              Proportionate — close
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={review.isPending}
                              onClick={async () => {
                                const result = await review.mutateAsync({
                                  grantId: view.grant.id,
                                  outcome: "escalated",
                                  notes: notes[view.grant.id] ?? "",
                                  actorPersonId: actor.personId,
                                });
                                if (result.ok) toast.success(result.message);
                                else toast.error(result.message);
                              }}
                            >
                              Escalate to internal audit
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section title="History" description="Closed, rejected and expired grants.">
            {closed.length === 0 ? (
              <EmptyState message="No closed grants." />
            ) : (
              <ul className="divide-border divide-y">
                {closed.map((view) => (
                  <li key={view.grant.id} className="py-3 first:pt-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      {view.grant.incidentRef}
                      <StatusBadge status={view.status} />
                      {view.grant.reviewOutcome ? (
                        <Badge
                          variant={view.grant.reviewOutcome === "appropriate" ? "success" : "destructive"}
                        >
                          {view.grant.reviewOutcome}
                        </Badge>
                      ) : null}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      <Link
                        href={`/people/${view.grant.requestedBy}`}
                        className="hover:text-primary"
                      >
                        {view.requestedByLabel}
                      </Link>{" "}
                      · {view.scopeLabel}
                    </p>
                    {view.grant.reviewNotes ? (
                      <p className="text-muted-foreground/80 mt-1 text-xs">{view.grant.reviewNotes}</p>
                    ) : null}
                    {view.grant.rejectionReason ? (
                      <p className="text-muted-foreground/80 mt-1 text-xs">
                        Rejected: {view.grant.rejectionReason}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </>
      )}
    </>
  );
}
