"use client";

/**
 * The delegation register and the form that creates one (IAM-04).
 *
 * The form narrows as you go — pick whose authority, then which of their
 * assignments, then a subset of its actions, then a unit at or below its scope —
 * so the ceiling is visible in the UI as well as enforced in the engine. The
 * engine is still the authority: nothing here is trusted at submission.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateDelegation,
  useDelegations,
  useOrgUnits,
  usePerson,
  usePersons,
  useRevokeDelegation,
} from "@tau/identity/react";
import {
  delegatablePermissions,
  descendantUnitIds,
  getPermission,
  maxDelegationDays,
} from "@tau/identity";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Skeleton } from "@tau/ui/skeleton";
import { Textarea } from "@tau/ui/textarea";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { useActor } from "@/providers/session-provider";

function toLocalInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function DelegationsPage() {
  const actor = useActor();
  const { data: delegations, isPending } = useDelegations();
  const { data: people } = usePersons();
  const { data: units } = useOrgUnits();
  const createDelegation = useCreateDelegation();
  const revokeDelegation = useRevokeDelegation();

  const [open, setOpen] = useState(false);
  const [delegatorId, setDelegatorId] = useState(actor.personId);
  const [delegateId, setDelegateId] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [permissionIds, setPermissionIds] = useState<string[]>([]);
  const [unitId, setUnitId] = useState("");
  const [reason, setReason] = useState("");
  const [startsAt, setStartsAt] = useState(() => toLocalInput(new Date(Date.now() + 60 * 60 * 1000)));
  const [endsAt, setEndsAt] = useState(() =>
    toLocalInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  );
  const [errors, setErrors] = useState<string[]>([]);

  const { data: delegator } = usePerson(delegatorId);

  const delegatableAssignments = useMemo(
    () =>
      (delegator?.assignments ?? []).filter(
        (view) => view.status === "active" && delegatablePermissions(view.assignment).length > 0,
      ),
    [delegator],
  );

  const selected = delegatableAssignments.find((view) => view.assignment.id === assignmentId);
  const offeredPermissions = selected ? delegatablePermissions(selected.assignment) : [];

  /** Only the delegator's own unit and everything beneath it may be chosen. */
  const inScopeUnitIds =
    selected && units ? new Set(descendantUnitIds(units, selected.assignment.scope.unitId)) : null;
  const scopeOptions = inScopeUnitIds
    ? (units ?? []).filter((unit) => inScopeUnitIds.has(unit.id))
    : [];

  function resetForm() {
    setDelegateId("");
    setAssignmentId("");
    setPermissionIds([]);
    setUnitId("");
    setReason("");
    setErrors([]);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !unitId) return;

    const unit = scopeOptions.find((candidate) => candidate.id === unitId);
    if (!unit) return;

    const result = await createDelegation.mutateAsync({
      draft: {
        delegatorPersonId: delegatorId,
        delegatePersonId: delegateId,
        sourceAssignmentId: selected.assignment.id,
        permissionIds,
        scope: { dimension: unit.dimension, unitId: unit.id },
        reason,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      },
      actorPersonId: actor.personId,
    });

    if (!result.ok) {
      setErrors(result.errors ?? [result.message]);
      toast.error(result.message);
      return;
    }

    setErrors([]);
    for (const warning of result.warnings ?? []) toast.warning(warning);
    toast.success(result.message);
    resetForm();
    setOpen(false);
  }

  return (
    <>
      <PageHeader
        eyebrow="IAM-04"
        title="Delegated authority"
        description={`Cover during absence, with both ends of the window fixed. A delegation draws on one assignment the delegator already holds and can never exceed it — not in actions, not in scope, and not beyond ${maxDelegationDays} days.`}
        actions={
          <Button onClick={() => setOpen((value) => !value)}>
            <Plus className="size-4" aria-hidden />
            {open ? "Close form" : "Record a delegation"}
          </Button>
        }
      />

      {open ? (
        <Section
          title="New delegation"
          description="Each choice narrows the next. If nothing can be chosen at a step, the delegator has nothing there to give."
        >
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="delegator">Delegating their authority</Label>
                <NativeSelect
                  id="delegator"
                  value={delegatorId}
                  onChange={(event) => {
                    setDelegatorId(event.target.value);
                    setAssignmentId("");
                    setPermissionIds([]);
                    setUnitId("");
                  }}
                >
                  {(people ?? []).map((row) => (
                    <option key={row.person.id} value={row.person.id}>
                      {row.displayName}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delegate">Acting on their behalf</Label>
                <NativeSelect
                  id="delegate"
                  value={delegateId}
                  onChange={(event) => setDelegateId(event.target.value)}
                  required
                >
                  <option value="">Choose a person…</option>
                  {(people ?? [])
                    .filter((row) => row.person.id !== delegatorId)
                    .map((row) => (
                      <option key={row.person.id} value={row.person.id}>
                        {row.displayName}
                      </option>
                    ))}
                </NativeSelect>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment">Authority being drawn on</Label>
              <NativeSelect
                id="assignment"
                value={assignmentId}
                onChange={(event) => {
                  setAssignmentId(event.target.value);
                  setPermissionIds([]);
                  setUnitId("");
                }}
                required
              >
                <option value="">Choose one of their assignments…</option>
                {delegatableAssignments.map((view) => (
                  <option key={view.assignment.id} value={view.assignment.id}>
                    {view.role?.name} — {view.scopeLabel}
                  </option>
                ))}
              </NativeSelect>
              {delegatableAssignments.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  This person holds no active assignment that can be delegated. Emergency roles are
                  never delegable.
                </p>
              ) : null}
            </div>

            {selected ? (
              <>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-semibold">Permitted actions</legend>
                  <p className="text-muted-foreground text-xs">
                    Only actions the delegator holds through this assignment are listed.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {offeredPermissions.map((id) => {
                      const definition = getPermission(id);
                      const checked = permissionIds.includes(id);
                      return (
                        <label
                          key={id}
                          className="border-border hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            className="accent-primary mt-1 size-4"
                            checked={checked}
                            onChange={(event) =>
                              setPermissionIds((current) =>
                                event.target.checked
                                  ? [...current, id]
                                  : current.filter((entry) => entry !== id),
                              )
                            }
                          />
                          <span className="min-w-0">
                            <span className="block font-semibold">
                              {definition?.label ?? id}
                              {definition?.risk === "high" ? (
                                <Badge variant="destructive" className="ml-2">
                                  high risk
                                </Badge>
                              ) : null}
                            </span>
                            <span className="text-muted-foreground block font-mono text-xs">
                              {id}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="space-y-2">
                  <Label htmlFor="scope">Scope</Label>
                  <NativeSelect
                    id="scope"
                    value={unitId}
                    onChange={(event) => setUnitId(event.target.value)}
                    required
                  >
                    <option value="">Choose a unit…</option>
                    {scopeOptions.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.dimension})
                      </option>
                    ))}
                  </NativeSelect>
                  <p className="text-muted-foreground text-xs">
                    Limited to {selected.scopeLabel} and the units beneath it.
                  </p>
                </div>
              </>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="starts">Starts</Label>
                <Input
                  id="starts"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ends">Ends</Label>
                <Input
                  id="ends"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={2}
                placeholder="e.g. Head of Department on research leave for the first half of the semester"
                required
              />
              <p className="text-muted-foreground text-xs">
                Shown to the delegate and written to the audit trail.
              </p>
            </div>

            {errors.length > 0 ? (
              <ul className="border-destructive/40 bg-destructive/5 space-y-1 rounded-lg border p-3 text-sm">
                {errors.map((error) => (
                  <li key={error} className="flex items-start gap-2">
                    <AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" aria-hidden />
                    {error}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={createDelegation.isPending || permissionIds.length === 0}>
                {createDelegation.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : null}
                Record delegation
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Clear
              </Button>
            </div>
          </form>
        </Section>
      ) : null}

      <Section
        title="Delegation register"
        description="Every delegation ever recorded, live or not. Revoking one removes the actions from the delegate immediately."
      >
        {isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : (delegations ?? []).length === 0 ? (
          <EmptyState message="No delegations have been recorded." />
        ) : (
          <ul className="divide-border divide-y">
            {(delegations ?? []).map((view) => (
              <li key={view.delegation.id} className="flex flex-wrap gap-4 py-4 first:pt-0">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {view.delegatorLabel} → {view.delegateLabel}
                    <StatusBadge status={view.status} />
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {view.permissionLabels.join(", ")} · {view.scopeLabel}
                  </p>
                  <p className="text-muted-foreground/80 mt-1 text-xs">
                    {new Date(view.delegation.startsAt).toLocaleString("en-NG")} →{" "}
                    {new Date(view.delegation.endsAt).toLocaleString("en-NG")}
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">{view.delegation.reason}</p>
                  {view.delegation.revokedReason ? (
                    <p className="text-muted-foreground/80 mt-1 text-xs">
                      Revoked: {view.delegation.revokedReason}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/people/${view.delegation.delegatePersonId}`}>View delegate</Link>
                  </Button>
                  {view.status === "active" || view.status === "scheduled" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={revokeDelegation.isPending}
                      onClick={async () => {
                        const result = await revokeDelegation.mutateAsync({
                          delegationId: view.delegation.id,
                          reason: "Revoked from the delegation register.",
                          actorPersonId: actor.personId,
                        });
                        if (result.ok) toast.success(result.message);
                        else toast.error(result.message);
                      }}
                    >
                      Revoke
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
