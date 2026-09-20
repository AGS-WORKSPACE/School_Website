"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAssignmentRequests, useDecideAssignment, useOrgUnits, usePerson, usePersons, usePrepareAssignment, useRoles } from "@tau/identity/react";
import { getPermission, isGrantDimensionAllowed } from "@tau/identity/policy";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useActor } from "@/providers/session-provider";

export default function RoleAssignmentsPage() {
  const actor = useActor();
  const { data: people } = usePersons();
  const { data: roles } = useRoles();
  const { data: units } = useOrgUnits();
  const { data: requests } = useAssignmentRequests();
  const { data: actorDetail } = usePerson(actor.personId);
  const prepare = usePrepareAssignment();
  const decide = useDecideAssignment();
  const [personId, setPersonId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [reason, setReason] = useState("");
  const [validFrom, setValidFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState("");
  const [decisionReasons, setDecisionReasons] = useState<Record<string, string>>({});

  const canPrepare = actorDetail?.permissionIds.includes("identity:role-assignment:prepare") ?? false;
  const canApprove = actor.mfaSatisfied && (actorDetail?.permissionIds.includes("identity:role-assignment:approve") ?? false);
  const role = roles?.find((entry) => entry.id === roleId);
  const availableUnits = useMemo(() => (units ?? []).filter((unit) =>
    (!role || role.assignableDimensions.includes(unit.dimension)) &&
    (!role || role.permissionIds.every((id) => {
      const permission = getPermission(id);
      return permission && isGrantDimensionAllowed(permission.maxGrantDimension, unit.dimension);
    })) && !unit.effectiveTo,
  ), [role, units]);
  const selectedUnit = availableUnits.find((unit) => unit.id === unitId);
  const pending = (requests ?? []).filter((request) => request.status === "pending");

  async function submitPreparation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUnit) return;
    const result = await prepare.mutateAsync({ sessionId: actor.sessionId, draft: {
      personId, roleId, scope: { dimension: selectedUnit.dimension, unitId },
      reason, validFrom, validUntil: validUntil || null,
    } });
    if (result.ok) {
      toast.success(result.message);
      setPersonId(""); setRoleId(""); setUnitId(""); setReason(""); setValidUntil("");
    } else toast.error(result.errors?.join(" ") ?? result.message);
  }

  async function submitDecision(requestId: string, decision: "approve" | "reject") {
    const result = await decide.mutateAsync({ requestId, decision,
      reason: decisionReasons[requestId] ?? "", sessionId: actor.sessionId });
    if (result.ok) toast.success(result.message);
    else toast.error(result.errors?.join(" ") ?? result.message);
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="Identity · IAM-02" title="Role assignments"
      description="Prepare and approve role access." />
    {canPrepare ? <Section title="Prepare an assignment" description="A request gives no access until a separate approver accepts it.">
      <form onSubmit={submitPreparation} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="assignment-person">Person</Label><NativeSelect id="assignment-person" required value={personId} onChange={(e) => setPersonId(e.target.value)}>
          <option value="">Select a person</option>{(people ?? []).map((entry) => <option key={entry.person.id} value={entry.person.id}>{entry.displayName}</option>)}
        </NativeSelect></div>
        <div className="space-y-2"><Label htmlFor="assignment-role">Role</Label><NativeSelect id="assignment-role" required value={roleId} onChange={(e) => { setRoleId(e.target.value); setUnitId(""); }}>
          <option value="">Select a role</option>{(roles ?? []).filter((entry) => !entry.breakGlassOnly).map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
        </NativeSelect></div>
        <div className="space-y-2"><Label htmlFor="assignment-unit">Organizational scope</Label><NativeSelect id="assignment-unit" required value={unitId} onChange={(e) => setUnitId(e.target.value)}>
          <option value="">Select a unit</option>{availableUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name} · {unit.dimension}</option>)}
        </NativeSelect></div>
        <div className="space-y-2"><Label htmlFor="assignment-reason">Reason</Label><Input id="assignment-reason" required minLength={8} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this access needed?" /></div>
        <div className="space-y-2"><Label htmlFor="assignment-from">Valid from</Label><Input id="assignment-from" type="date" required value={validFrom} onChange={(e) => setValidFrom(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="assignment-until">Valid until (optional)</Label><Input id="assignment-until" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></div>
        {role && <p className="text-muted-foreground text-sm md:col-span-2">{role.permissionIds.length} permissions: {role.permissionIds.join(", ")}</p>}
        <div className="md:col-span-2"><Button type="submit" disabled={prepare.isPending || !selectedUnit}>{prepare.isPending ? "Preparing…" : "Send for approval"}</Button></div>
      </form>
    </Section> : null}
    {(canPrepare || canApprove) ? <Section title={`Pending approval (${pending.length})`} description="A different access approver must decide each request. Approval requires MFA.">
      {pending.length === 0 ? <EmptyState message="No assignment requests are waiting for approval." /> :
        <div className="space-y-3">{pending.map((request) => {
          const self = request.preparedBy === actor.personId || request.personId === actor.personId;
          return <div key={request.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center gap-2"><strong>{people?.find((entry) => entry.person.id === request.personId)?.displayName ?? request.personId}</strong><Badge variant="outline">{roles?.find((entry) => entry.id === request.roleId)?.name ?? request.roleId}</Badge><Badge variant="warning">Pending</Badge></div>
            <p className="text-muted-foreground mt-1 text-sm">{units?.find((unit) => unit.id === request.scope.unitId)?.name ?? request.scope.unitId} · {request.reason}</p>
            <p className="text-muted-foreground mt-1 text-xs">Prepared by {people?.find((entry) => entry.person.id === request.preparedBy)?.displayName ?? request.preparedBy} · from {request.validFrom}{request.validUntil ? ` until ${request.validUntil}` : ""}</p>
            {canApprove && !self && <div className="mt-3 flex flex-wrap items-end gap-2"><div className="min-w-64 flex-1 space-y-1"><Label htmlFor={`decision-${request.id}`}>Decision note (required to reject)</Label><Input id={`decision-${request.id}`} value={decisionReasons[request.id] ?? ""} onChange={(e) => setDecisionReasons((current) => ({ ...current, [request.id]: e.target.value }))} /></div><Button disabled={decide.isPending} onClick={() => submitDecision(request.id, "approve")}>Approve</Button><Button variant="outline" disabled={decide.isPending || (decisionReasons[request.id]?.trim().length ?? 0) < 8} onClick={() => submitDecision(request.id, "reject")}>Reject</Button></div>}
            {self && canApprove && <p className="text-muted-foreground mt-2 text-xs">Another approver must decide this request.</p>}
          </div>;
        })}</div>}
    </Section> : <Section title="Role assignment access" description="Identity administrators prepare requests; access approvers decide them.">
      <p className="text-muted-foreground text-sm">Your current role does not include this workflow.</p>
    </Section>}
  </div>;
}
