"use client";

/**
 * "What can I do, and why?" (IAM-02).
 *
 * The simulator at the bottom is the point of this page. Asking the engine a
 * question and getting back the same sentence it would write to the audit trail
 * is how a person checks their own position without filing a ticket — and how an
 * administrator explains a refusal to somebody who thinks it is a bug.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, ShieldQuestion, XCircle } from "lucide-react";
import { useOrgUnits, usePerson, usePermissionCatalogue } from "@tau/identity/react";
import { can, getPermission, scopePath, indexUnits } from "@tau/identity";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Skeleton } from "@tau/ui/skeleton";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Field, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { useActor } from "@/providers/session-provider";

export default function MyAccessPage() {
  const actor = useActor();
  const { data: detail, isPending } = usePerson(actor.personId);
  const { data: units } = useOrgUnits();
  const { data: permissions } = usePermissionCatalogue();

  const [permissionId, setPermissionId] = useState("");
  const [unitId, setUnitId] = useState("");

  const decision = useMemo(() => {
    if (!detail || !units || !permissionId || !unitId) return null;
    const unit = units.find((candidate) => candidate.id === unitId);
    if (!unit) return null;

    return can({
      grants: detail.grants,
      permissionId,
      targetScope: { dimension: unit.dimension, unitId: unit.id },
      units,
      mfaSatisfied: actor.mfaSatisfied,
      now: new Date(),
    });
  }, [detail, units, permissionId, unitId, actor.mfaSatisfied]);

  if (isPending || !detail || !units) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const unitIndex = indexUnits(units);
  const bySource = {
    assignment: detail.grants.filter((grant) => grant.source.kind === "assignment"),
    delegation: detail.grants.filter((grant) => grant.source.kind === "delegation"),
    "break-glass": detail.grants.filter((grant) => grant.source.kind === "break-glass"),
  };

  return (
    <>
      <PageHeader
        eyebrow="IAM-02"
        title="My access"
        description="Everything you can do right now, where it applies, and which grant it came from."
        actions={
          <Button asChild variant="outline">
            <Link href={`/people/${actor.personId}`}>Full record</Link>
          </Button>
        }
      />

      <Section title="This session">
        <dl className="grid gap-4 sm:grid-cols-4">
          <Field label="Signed in as">{detail.displayName}</Field>
          <Field label="Second factor">
            <StatusBadge status={actor.mfaSatisfied ? "active" : "requested"} />
          </Field>
          <Field label="Distinct permissions">
            <span className="tabular">{detail.permissionIds.length}</span>
          </Field>
          <Field label="Conflicting duties">
            {detail.conflicts.length === 0 ? (
              <span className="text-muted-foreground">None</span>
            ) : (
              <Badge variant="destructive">{detail.conflicts.length}</Badge>
            )}
          </Field>
        </dl>
        {!actor.mfaSatisfied ? (
          <p className="border-accent/40 bg-accent/10 mt-4 rounded-lg border p-3 text-sm">
            This session has not satisfied a second factor, so high-risk actions will be refused even
            where you hold the permission. Sign in again with an account that has a method enrolled
            to see the difference.
          </p>
        ) : null}
      </Section>

      <div className="grid gap-6 xl:grid-cols-3">
        {(
          [
            ["assignment", "Held through a role", "Standing access from your own assignments."],
            ["delegation", "Held on somebody's behalf", "Borrowed authority that ends on its own."],
            ["break-glass", "Emergency access", "Time-boxed, alerted and reviewed after use."],
          ] as const
        ).map(([kind, title, description]) => (
          <Section key={kind} title={`${title} (${bySource[kind].length})`} description={description}>
            {bySource[kind].length === 0 ? (
              <EmptyState message="Nothing here." />
            ) : (
              <ul className="divide-border divide-y">
                {bySource[kind].map((grant, index) => {
                  const definition = getPermission(grant.permissionId);
                  return (
                    <li key={`${grant.permissionId}-${index}`} className="py-3 first:pt-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        {definition?.label ?? grant.permissionId}
                        {grant.requiresMfa ? <Badge variant="outline">MFA</Badge> : null}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {scopePath(unitIndex, grant.scope)}
                      </p>
                      <p className="text-muted-foreground/80 mt-1 text-xs">
                        {grant.source.label}
                        {grant.expiresAt
                          ? ` · until ${new Date(grant.expiresAt).toLocaleString("en-NG")}`
                          : ""}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        ))}
      </div>

      <Section
        title="Check a specific action"
        description="Ask the policy engine directly. The answer is the same one it writes to the audit trail when an action is refused."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sim-permission">Action</Label>
            <NativeSelect
              id="sim-permission"
              value={permissionId}
              onChange={(event) => setPermissionId(event.target.value)}
            >
              <option value="">Choose an action…</option>
              {(permissions ?? []).map((permission) => (
                <option key={permission.id} value={permission.id}>
                  {permission.label} ({permission.module})
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sim-unit">Acting on</Label>
            <NativeSelect
              id="sim-unit"
              value={unitId}
              onChange={(event) => setUnitId(event.target.value)}
            >
              <option value="">Choose a unit…</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} ({unit.dimension})
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        {decision ? (
          <div
            className={
              decision.allowed
                ? "border-success/40 bg-success/5 mt-4 flex items-start gap-3 rounded-lg border p-4"
                : decision.mfaRequired
                  ? "border-accent/50 bg-accent/10 mt-4 flex items-start gap-3 rounded-lg border p-4"
                  : "border-destructive/40 bg-destructive/5 mt-4 flex items-start gap-3 rounded-lg border p-4"
            }
          >
            {decision.allowed ? (
              <CheckCircle2 className="text-success mt-0.5 size-5 shrink-0" aria-hidden />
            ) : decision.mfaRequired ? (
              <ShieldQuestion className="mt-0.5 size-5 shrink-0" aria-hidden />
            ) : (
              <XCircle className="text-destructive mt-0.5 size-5 shrink-0" aria-hidden />
            )}
            <div className="min-w-0 text-sm">
              <p className="font-semibold">
                {decision.allowed
                  ? "Allowed"
                  : decision.mfaRequired
                    ? "Allowed, after a second factor"
                    : "Refused"}
              </p>
              <p className="text-muted-foreground">{decision.reason}</p>
              <p className="text-muted-foreground/80 mt-2 font-mono text-xs">
                {decision.policyVersion} · evaluated {new Date(decision.evaluatedAt).toLocaleString("en-NG")}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            Choose an action and a unit to see the decision and its explanation.
          </p>
        )}
      </Section>
    </>
  );
}
