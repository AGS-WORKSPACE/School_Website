"use client";

import Link from "next/link";
import { useState } from "react";
import {
  KeyRound,
  LifeBuoy,
  Loader2,
  MonitorSmartphone,
  ShieldAlert,
  ShieldCheck,
  UserRoundX,
} from "lucide-react";
import { toast } from "sonner";
import {
  useEnrolMfa,
  useIssueRecoveryCodes,
  usePerson,
  useRevokeMfa,
  useRevokeSession,
  useSetAccountStatus,
} from "@tau/identity/react";
import { getPermission } from "@tau/identity";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Skeleton } from "@tau/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Field, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { useActor } from "@/providers/session-provider";

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}

export function PersonRecord({ personId }: { personId: string }) {
  const actor = useActor();
  const { data: detail, isPending } = usePerson(personId);

  const setStatus = useSetAccountStatus();
  const revokeSession = useRevokeSession();
  const enrolMfa = useEnrolMfa();
  const revokeMfa = useRevokeMfa();
  const issueCodes = useIssueRecoveryCodes();

  const [statusReason, setStatusReason] = useState("");
  const [mfaLabel, setMfaLabel] = useState("Authenticator app");
  const [mfaKind, setMfaKind] = useState<"totp" | "security-key" | "sms">("totp");
  const [issuedCodes, setIssuedCodes] = useState<string[] | null>(null);

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!detail) {
    return <EmptyState message="That person record does not exist." />;
  }

  const account = detail.account;
  const activeMfa = account?.mfaEnrolments.filter((entry) => entry.status === "active") ?? [];
  const isSelf = detail.person.id === actor.personId;

  async function changeStatus(next: "active" | "suspended" | "disabled") {
    if (!account) return;
    const result = await setStatus.mutateAsync({
      accountId: account.id,
      status: next,
      reason: statusReason,
      actorPersonId: actor.personId,
    });
    if (result.ok) {
      toast.success(result.message);
      setStatusReason("");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="IAM-01"
        title={detail.displayName}
        description={`${detail.person.email} · ${detail.unitLabel}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {detail.privileged ? <Badge variant="accent">Privileged</Badge> : null}
            <StatusBadge status={account?.status ?? "pending-activation"} />
            <Button asChild variant="outline">
              <Link href="/people">All people</Link>
            </Button>
          </div>
        }
      />

      {detail.conflicts.some((view) => view.blocking) ? (
        <div className="border-destructive/40 bg-destructive/5 flex items-start gap-3 rounded-lg border p-4">
          <ShieldAlert className="text-destructive mt-0.5 size-5 shrink-0" aria-hidden />
          <div className="text-sm">
            <p className="font-semibold">This person holds conflicting duties.</p>
            <p className="text-muted-foreground">
              Submissions covered by the rules below are blocked until a separate authority approves
              a documented exception. See the Duties tab.
            </p>
          </div>
        </div>
      ) : null}

      <Tabs defaultValue="identity">
        <TabsList className="flex-wrap">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="security">Sign-in and MFA</TabsTrigger>
          <TabsTrigger value="delegation">Delegation</TabsTrigger>
          <TabsTrigger value="duties">Duties</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* --- Identity: one person, many relationships (IAM-01) --- */}
        <TabsContent value="identity" className="space-y-6">
          <Section
            title="Relationships with the university"
            description="Each row is a relationship held by this one person. A new one links here; it never creates a second identity."
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Owned by</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.person.affiliations.map((affiliation) => (
                    <TableRow key={affiliation.id}>
                      <TableCell className="font-semibold capitalize">{affiliation.type}</TableCell>
                      <TableCell className="tabular">{affiliation.reference}</TableCell>
                      <TableCell className="text-muted-foreground uppercase">
                        {affiliation.sourceModule}
                      </TableCell>
                      <TableCell className="tabular">{affiliation.startedAt}</TableCell>
                      <TableCell className="tabular">{affiliation.endedAt ?? "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={affiliation.status === "ended" ? "expired" : affiliation.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-muted-foreground mt-4 text-xs">
              The identity module does not own any of these facts. Admissions, SIS, HR and Alumni
              each remain the source for their own row.
            </p>
          </Section>

          <Section
            title="Account status"
            description="Suspending or disabling ends every live session in the same step, rather than letting them run out on their own."
          >
            {!account ? (
              <EmptyState message="This person has no account." />
            ) : (
              <div className="space-y-4">
                <dl className="grid gap-4 sm:grid-cols-3">
                  <Field label="Username">
                    <span className="tabular">{account.username}</span>
                  </Field>
                  <Field label="Last sign-in">{formatDateTime(account.lastSignInAt)}</Field>
                  <Field label="Live sessions">
                    <span className="tabular">
                      {detail.sessions.filter((session) => session.live).length}
                    </span>
                  </Field>
                </dl>

                {account.statusReason ? (
                  <p className="bg-muted text-muted-foreground rounded-lg p-3 text-sm">
                    {account.statusReason}
                  </p>
                ) : null}

                {isSelf ? (
                  <p className="text-muted-foreground border-border rounded-lg border border-dashed p-3 text-sm">
                    You cannot change the status of your own account.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="status-reason">Reason (recorded in the audit trail)</Label>
                      <Input
                        id="status-reason"
                        value={statusReason}
                        onChange={(event) => setStatusReason(event.target.value)}
                        placeholder="e.g. Employment ended; disabled during HR offboarding"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {account.status !== "active" ? (
                        <Button
                          variant="outline"
                          disabled={setStatus.isPending || statusReason.trim().length < 8}
                          onClick={() => void changeStatus("active")}
                        >
                          Reinstate
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            disabled={setStatus.isPending || statusReason.trim().length < 8}
                            onClick={() => void changeStatus("suspended")}
                          >
                            Suspend
                          </Button>
                          <Button
                            variant="destructive"
                            disabled={setStatus.isPending || statusReason.trim().length < 8}
                            onClick={() => void changeStatus("disabled")}
                          >
                            {setStatus.isPending ? (
                              <Loader2 className="size-4 animate-spin" aria-hidden />
                            ) : (
                              <UserRoundX className="size-4" aria-hidden />
                            )}
                            Disable account
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Section>
        </TabsContent>

        {/* --- Access: roles, scope and the resulting permissions (IAM-02) --- */}
        <TabsContent value="access" className="space-y-6">
          <Section
            title="Role assignments"
            description="A role carries no scope of its own. Scope arrives here, which is what keeps two holders of the same role apart."
          >
            {detail.assignments.length === 0 ? (
              <EmptyState message="No roles are assigned." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Granted by</TableHead>
                      <TableHead>Last reviewed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.assignments.map((view) => (
                      <TableRow key={view.assignment.id}>
                        <TableCell>
                          <span className="font-semibold">{view.role?.name ?? view.assignment.roleId}</span>
                          {view.role?.privileged ? (
                            <Badge variant="accent" className="ml-2">
                              Privileged
                            </Badge>
                          ) : null}
                          <p className="text-muted-foreground mt-1 max-w-md text-xs">
                            {view.assignment.reason}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">{view.scopeLabel}</TableCell>
                        <TableCell>
                          <StatusBadge status={view.status} />
                          {view.assignment.validUntil ? (
                            <p className="text-muted-foreground mt-1 text-xs">
                              Until {formatDateTime(view.assignment.validUntil)}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-sm">{view.grantedByLabel}</TableCell>
                        <TableCell className="text-sm">
                          {view.assignment.lastReviewedAt ? (
                            formatDateTime(view.assignment.lastReviewedAt)
                          ) : (
                            <Badge variant="warning">Never</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Section>

          <Section
            title={`Effective permissions (${detail.permissionIds.length})`}
            description="What this person can actually do right now, and which grant each one came from. A permission held twice is shown twice on purpose."
          >
            {detail.grants.length === 0 ? (
              <EmptyState message="This person holds no permissions." />
            ) : (
              <ul className="divide-border divide-y">
                {detail.grants.map((grant, index) => {
                  const definition = getPermission(grant.permissionId);
                  return (
                    <li key={`${grant.permissionId}-${index}`} className="py-3 first:pt-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">
                          {definition?.label ?? grant.permissionId}
                        </span>
                        {definition ? (
                          <Badge
                            variant={
                              definition.risk === "high"
                                ? "destructive"
                                : definition.risk === "elevated"
                                  ? "warning"
                                  : "muted"
                            }
                          >
                            {definition.risk}
                          </Badge>
                        ) : null}
                        {grant.requiresMfa ? <Badge variant="outline">MFA</Badge> : null}
                        <Badge
                          variant={
                            grant.source.kind === "break-glass"
                              ? "destructive"
                              : grant.source.kind === "delegation"
                                ? "warning"
                                : "muted"
                          }
                        >
                          {grant.source.label}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 font-mono text-xs">
                        {grant.permissionId}
                      </p>
                      <p className="text-muted-foreground/80 mt-1 text-xs">
                        Scoped to {grant.scope.dimension} · {grant.scope.unitId}
                        {grant.expiresAt ? ` · ends ${formatDateTime(grant.expiresAt)}` : ""}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </TabsContent>

        {/* --- Security: MFA and sessions (IAM-03) --- */}
        <TabsContent value="security" className="space-y-6">
          <Section
            title="Multi-factor authentication"
            description="Mandatory for privileged roles and for any high-risk permission, whether it came from a role, a delegation or emergency access."
          >
            {!account ? (
              <EmptyState message="This person has no account." />
            ) : (
              <div className="space-y-5">
                {detail.privileged && activeMfa.length === 0 ? (
                  <p className="border-destructive/40 bg-destructive/5 rounded-lg border p-3 text-sm">
                    This account holds a privileged role with no method enrolled. It cannot start a
                    session until one is added.
                  </p>
                ) : null}

                {account.mfaEnrolments.length === 0 ? (
                  <EmptyState message="No methods enrolled." />
                ) : (
                  <ul className="divide-border divide-y">
                    {account.mfaEnrolments.map((enrolment) => (
                      <li
                        key={enrolment.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"
                      >
                        <div>
                          <p className="flex items-center gap-2 text-sm font-semibold">
                            <ShieldCheck className="text-success size-4" aria-hidden />
                            {enrolment.label}
                            <StatusBadge status={enrolment.status === "active" ? "active" : "revoked"} />
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {enrolment.kind} · enrolled {formatDateTime(enrolment.enrolledAt)} · last
                            used {formatDateTime(enrolment.lastUsedAt)}
                          </p>
                        </div>
                        {enrolment.status === "active" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={revokeMfa.isPending}
                            onClick={async () => {
                              const result = await revokeMfa.mutateAsync({
                                accountId: account.id,
                                enrolmentId: enrolment.id,
                                reason: "Revoked from the identity console.",
                                actorPersonId: actor.personId,
                              });
                              if (result.ok) toast.success(result.message);
                              else toast.error(result.message);
                            }}
                          >
                            Revoke
                          </Button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="border-border grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
                  <div className="space-y-2">
                    <Label htmlFor="mfa-label">New method label</Label>
                    <Input
                      id="mfa-label"
                      value={mfaLabel}
                      onChange={(event) => setMfaLabel(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mfa-kind">Type</Label>
                    <NativeSelect
                      id="mfa-kind"
                      value={mfaKind}
                      onChange={(event) =>
                        setMfaKind(event.target.value as "totp" | "security-key" | "sms")
                      }
                    >
                      <option value="totp">Authenticator (TOTP)</option>
                      <option value="security-key">Security key</option>
                      <option value="sms">SMS</option>
                    </NativeSelect>
                  </div>
                  <Button
                    disabled={enrolMfa.isPending || mfaLabel.trim().length < 3}
                    onClick={async () => {
                      const result = await enrolMfa.mutateAsync({
                        accountId: account.id,
                        kind: mfaKind,
                        label: mfaLabel,
                        actorPersonId: actor.personId,
                      });
                      if (result.ok) toast.success(result.message);
                      else toast.error(result.message);
                    }}
                  >
                    <KeyRound className="size-4" aria-hidden />
                    Enrol
                  </Button>
                </div>

                <div className="border-accent/40 bg-accent/5 space-y-3 rounded-lg border p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <LifeBuoy className="size-4" aria-hidden />
                    Recovery codes
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {detail.recoveryCodesRemaining} unused code
                    {detail.recoveryCodesRemaining === 1 ? "" : "s"} remain. Issuing a new set
                    invalidates the old one, notifies the account holder and is audited as a
                    privileged event in its own right.
                  </p>
                  <Button
                    variant="outline"
                    disabled={issueCodes.isPending}
                    onClick={async () => {
                      const result = await issueCodes.mutateAsync({
                        accountId: account.id,
                        reason: "Reissued from the identity console at the account holder's request.",
                        actorPersonId: actor.personId,
                      });
                      if (result.ok) {
                        setIssuedCodes(result.data?.codes ?? null);
                        toast.success(result.message);
                      } else {
                        toast.error(result.message);
                      }
                    }}
                  >
                    Issue new codes
                  </Button>
                  {issuedCodes ? (
                    <div className="bg-background grid grid-cols-2 gap-2 rounded-lg p-3 sm:grid-cols-5">
                      {issuedCodes.map((code) => (
                        <code key={code} className="tabular text-xs font-semibold">
                          {code}
                        </code>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </Section>

          <Section
            title="Sessions"
            description="Every session this account has opened, and what ended it."
          >
            {detail.sessions.length === 0 ? (
              <EmptyState message="No sessions recorded." />
            ) : (
              <ul className="divide-border divide-y">
                {detail.sessions.map((session) => (
                  <li
                    key={session.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"
                  >
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <MonitorSmartphone className="size-4 shrink-0" aria-hidden />
                        {session.device}
                        <Badge variant="muted">{session.module}</Badge>
                        <StatusBadge status={session.live ? "active" : "revoked"} />
                        {session.mfaSatisfiedAt ? <Badge variant="success">MFA</Badge> : null}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {session.ipAddress} · started {formatDateTime(session.startedAt)} · last seen{" "}
                        {formatDateTime(session.lastSeenAt)}
                      </p>
                      {session.revokedReason ? (
                        <p className="text-muted-foreground/80 mt-1 text-xs">
                          Ended: {session.revokedReason}
                        </p>
                      ) : null}
                    </div>
                    {session.live ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={revokeSession.isPending}
                        onClick={async () => {
                          const result = await revokeSession.mutateAsync({
                            sessionId: session.id,
                            reason: "Ended by an identity administrator.",
                            actorPersonId: actor.personId,
                          });
                          if (result.ok) toast.success(result.message);
                      else toast.error(result.message);
                        }}
                      >
                        End session
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>

        {/* --- Delegation (IAM-04) --- */}
        <TabsContent value="delegation" className="space-y-6">
          <Section
            title="Authority delegated to others"
            description="Cover this person has handed out. None of it can exceed what they hold themselves."
            actions={
              <Button asChild variant="outline" size="sm">
                <Link href="/delegations">Delegation register</Link>
              </Button>
            }
          >
            {detail.delegationsGranted.length === 0 ? (
              <EmptyState message="This person has not delegated anything." />
            ) : (
              <ul className="divide-border divide-y">
                {detail.delegationsGranted.map((view) => (
                  <li key={view.delegation.id} className="py-3 first:pt-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      To {view.delegateLabel}
                      <StatusBadge status={view.status} />
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {view.permissionLabels.join(", ")} · {view.scopeLabel}
                    </p>
                    <p className="text-muted-foreground/80 mt-1 text-xs">
                      {formatDateTime(view.delegation.startsAt)} → {formatDateTime(view.delegation.endsAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            title="Authority received"
            description="Anything held on somebody else's behalf. It appears in this person's effective permissions but belongs to the delegator."
          >
            {detail.delegationsReceived.length === 0 ? (
              <EmptyState message="This person holds no delegated authority." />
            ) : (
              <ul className="divide-border divide-y">
                {detail.delegationsReceived.map((view) => (
                  <li key={view.delegation.id} className="py-3 first:pt-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      From {view.delegatorLabel}
                      <StatusBadge status={view.status} />
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {view.permissionLabels.join(", ")} · {view.scopeLabel}
                    </p>
                    <p className="text-muted-foreground/80 mt-1 text-xs">
                      {view.delegation.reason}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>

        {/* --- Duties (IAM-05) --- */}
        <TabsContent value="duties" className="space-y-6">
          <Section
            title="Segregation-of-duties position"
            description="Checked against effective access, so cover arranged last week counts just as much as a role granted last year."
            actions={
              <Button asChild variant="outline" size="sm">
                <Link href="/duties">Duties register</Link>
              </Button>
            }
          >
            {detail.conflicts.length === 0 ? (
              <EmptyState message="No conflicting duties." />
            ) : (
              <ul className="divide-border divide-y">
                {detail.conflicts.map((view, index) => (
                  <li key={`${view.conflict.rule.id}-${index}`} className="py-4 first:pt-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      {view.conflict.rule.label}
                      <StatusBadge status={view.blocking ? "blocking" : view.conflict.rule.severity} />
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {view.conflict.rule.description}
                    </p>
                    <p className="text-muted-foreground/80 mt-2 text-xs">
                      {view.permissionALabel} via {view.conflict.sourceA.label} · {view.permissionBLabel}{" "}
                      via {view.conflict.sourceB.label} · both cover {view.scopeLabel}
                    </p>
                    {view.conflict.exception ? (
                      <p className="border-success/40 bg-success/5 mt-2 rounded-lg border p-2 text-xs">
                        Exception approved until{" "}
                        {formatDateTime(view.conflict.exception.validUntil)}. Compensating control:{" "}
                        {view.conflict.exception.compensatingControl}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            title="Emergency access history"
            description="Break-glass grants this person has requested, and what was done with each."
          >
            {detail.breakGlass.length === 0 ? (
              <EmptyState message="This person has never requested emergency access." />
            ) : (
              <ul className="divide-border divide-y">
                {detail.breakGlass.map((view) => (
                  <li key={view.grant.id} className="py-3 first:pt-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      {view.grant.incidentRef}
                      <StatusBadge status={view.status} />
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">{view.grant.reason}</p>
                    <p className="text-muted-foreground/80 mt-1 text-xs">
                      {view.actionsTaken.length} action{view.actionsTaken.length === 1 ? "" : "s"}{" "}
                      recorded under this grant
                      {view.approvedByLabel ? ` · approved by ${view.approvedByLabel}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="history">
          <Section
            title="Recent audit entries"
            description="Actions taken by this person, and actions taken on their record."
            actions={
              <Button asChild variant="outline" size="sm">
                <Link href={`/audit?actor=${detail.person.id}`}>Full trail</Link>
              </Button>
            }
          >
            {detail.recentAudit.length === 0 ? (
              <EmptyState message="Nothing recorded yet." />
            ) : (
              <ul className="divide-border divide-y">
                {detail.recentAudit.map((event) => (
                  <li key={event.id} className="py-3 first:pt-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-mono text-xs font-semibold">{event.action}</span>
                      <StatusBadge status={event.outcome} />
                      <span className="text-muted-foreground text-xs">
                        {formatDateTime(event.at)}
                      </span>
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">{event.subjectLabel}</p>
                    {event.reason ? (
                      <p className="text-muted-foreground/80 mt-1 text-xs">{event.reason}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>
      </Tabs>
    </>
  );
}
