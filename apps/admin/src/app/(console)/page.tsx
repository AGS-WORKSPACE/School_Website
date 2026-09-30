"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  ClipboardCheck,
  FileClock,
  KeyRound,
  ScaleIcon,
  ShieldAlert,
  ShieldQuestion,
  Users,
} from "lucide-react";
import {
  useAccessOverview,
  useAuditVerification,
  useBreakGlassGrants,
  useConflicts,
  useDelegations,
  usePerson,
} from "@tau/identity/react";
import type { PersonDetail } from "@tau/identity";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Skeleton } from "@tau/ui/skeleton";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { Stat } from "@/components/console/stat";
import { StatusBadge } from "@/components/console/status-badge";
import { navigationForPermissions } from "@/components/console/navigation";
import { useSession } from "@/providers/session-provider";

const identityOverviewPermissions = [
  "identity:person:write",
  "identity:delegation:manage",
  "identity:sod-exception:approve",
  "identity:break-glass:review",
  "identity:audit:read",
  "identity:access-review:conduct",
];

export default function WorkspacePage() {
  const { session } = useSession();
  const { data: person, isPending } = usePerson(session?.personId ?? "");

  if (isPending || !person) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  const maySeeIdentityOverview = identityOverviewPermissions.every((permissionId) =>
    person.permissionIds.includes(permissionId),
  );

  return (
    <>
      <AssignedWorkspace person={person} />
      {maySeeIdentityOverview ? <AccessPositionDashboard /> : null}
    </>
  );
}

function AssignedWorkspace({ person }: { person: PersonDetail }) {
  const assignedGroups = navigationForPermissions(person.permissionIds)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.href !== "/" && item.href !== "/my-access"),
    }))
    .filter((group) => group.items.length > 0);
  const activeAssignments = person.assignments.filter((view) => view.status === "active");

  return (
    <>
      <PageHeader
        eyebrow="Assigned work"
        title={`Welcome, ${person.displayName}`}
        description="Only the workspaces granted by your current roles, delegations and approved emergency access are shown here."
        actions={
          <Button asChild variant="outline">
            <Link href="/my-access">Review my access</Link>
          </Button>
        }
      />

      <Section
        title="Your current roles"
        description="An additional approved role automatically adds its permitted workspaces; it does not replace your existing assignment."
      >
        <div className="flex flex-wrap gap-3">
          {activeAssignments.map((view) => (
            <div key={view.assignment.id} className="min-w-64 flex-1 rounded-xl border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <BriefcaseBusiness className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-semibold">{view.role?.name ?? "Assigned role"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{view.scopeLabel}</p>
                  {view.role?.description ? (
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{view.role.description}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <section aria-labelledby="assigned-workspaces-heading">
        <div className="mb-4">
          <h2 id="assigned-workspaces-heading" className="text-xl font-bold">Your workspaces</h2>
          <p className="mt-1 text-sm text-muted-foreground">Open a workspace to carry out the duties assigned to you.</p>
        </div>
        {assignedGroups.length === 0 ? (
          <EmptyState message="No operational workspace is assigned. Review your access or contact an access approver." />
        ) : (
          <div className="space-y-6">
            {assignedGroups.map((group) => (
              <div key={group.label}>
                <h3 className="mb-2 text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">{group.label}</h3>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href} className="group flex min-h-32 items-start gap-4 rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" aria-hidden /></span>
                        <span className="min-w-0 flex-1">
                          <span className="font-semibold">{item.label}</span>
                          <span className="mt-1 block text-sm leading-5 text-muted-foreground">{item.description}</span>
                        </span>
                        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function AccessPositionDashboard() {
  const { data: overview, isPending } = useAccessOverview();
  const { data: conflicts } = useConflicts();
  const { data: delegations } = useDelegations();
  const { data: grants } = useBreakGlassGrants();
  const { data: chain } = useAuditVerification();

  const blocking = (conflicts ?? []).filter((view) => view.blocking);
  const activeDelegations = (delegations ?? []).filter((view) => view.status === "active");
  const needsAttention = (grants ?? []).filter(
    (view) => view.status === "active" || view.status === "awaiting-review" || view.status === "requested",
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 border-t pt-7">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">Identity controls</p>
          <h2 className="mt-1 text-2xl font-bold">Access position</h2>
          <p className="mt-1 text-sm text-muted-foreground">Review access risks and pending identity decisions relevant to your role.</p>
        </div>
        <Button asChild variant="outline"><Link href="/audit">Open audit trail</Link></Button>
      </div>

      {isPending || !overview ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <section aria-label="Headline figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              label="People"
              value={overview.people}
              hint={`${overview.activeAccounts} active, ${overview.disabledAccounts} disabled`}
              icon={Users}
              href="/people"
            />
            <Stat
              label="Privileged without MFA"
              value={overview.privilegedWithoutMfa.length}
              hint={
                overview.privilegedWithoutMfa.length === 0
                  ? "Every privileged account has a second factor"
                  : overview.privilegedWithoutMfa.map((entry) => entry.label).join(", ")
              }
              icon={ShieldQuestion}
              tone={overview.privilegedWithoutMfa.length === 0 ? "good" : "danger"}
              href="/people"
            />
            <Stat
              label="Blocking duties conflicts"
              value={overview.blockingConflicts}
              hint={`${overview.reviewableConflicts} more recorded for review`}
              icon={ScaleIcon}
              tone={overview.blockingConflicts === 0 ? "good" : "danger"}
              href="/duties"
            />
            <Stat
              label="Emergency access live"
              value={overview.activeBreakGlass}
              hint={`${overview.breakGlassAwaitingReview} awaiting post-use review`}
              icon={ShieldAlert}
              tone={
                overview.activeBreakGlass > 0
                  ? "danger"
                  : overview.breakGlassAwaitingReview > 0
                    ? "warning"
                    : "good"
              }
              href="/break-glass"
            />
            <Stat
              label="Active assignments"
              value={overview.activeAssignments}
              hint={`${overview.assignmentsNeverReviewed} never reviewed`}
              icon={KeyRound}
              tone={overview.assignmentsNeverReviewed > 0 ? "warning" : "neutral"}
              href="/access-review"
            />
            <Stat
              label="Active delegations"
              value={overview.activeDelegations}
              hint={`${overview.expiringDelegations} end within seven days`}
              icon={FileClock}
              href="/delegations"
            />
            <Stat
              label="Awaiting a decision"
              value={overview.pendingExceptions + overview.pendingBreakGlassRequests}
              hint={`${overview.pendingExceptions} duties exceptions, ${overview.pendingBreakGlassRequests} emergency requests`}
              icon={ClipboardCheck}
              tone={
                overview.pendingExceptions + overview.pendingBreakGlassRequests > 0
                  ? "warning"
                  : "good"
              }
              href="/duties"
            />
            <Stat
              label="Audit entries"
              value={overview.auditEntries}
              hint={chain ? chain.message : "Verifying the chain…"}
              icon={FileClock}
              tone={chain && !chain.valid ? "danger" : "good"}
              href="/audit"
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <Section
              title="Conflicts blocking work right now"
              description="A blocking conflict stops the item being submitted until a separate authority approves a documented exception."
              actions={
                <Button asChild variant="outline" size="sm">
                  <Link href="/duties">All conflicts</Link>
                </Button>
              }
            >
              {blocking.length === 0 ? (
                <EmptyState message="No blocking segregation-of-duties conflicts." />
              ) : (
                <ul className="divide-border divide-y">
                  {blocking.slice(0, 5).map((view, index) => (
                    <li key={`${view.conflict.rule.id}-${index}`} className="py-3 first:pt-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{view.personLabel}</span>
                        <StatusBadge status="blocking" />
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {view.permissionALabel} + {view.permissionBLabel} · {view.scopeLabel}
                      </p>
                      <p className="text-muted-foreground/80 mt-1 text-xs">
                        Via {view.conflict.sourceA.label} and {view.conflict.sourceB.label}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section
              title="Emergency access"
              description="Nothing here closes on its own: a spent grant stays open until somebody has read what was done with it."
              actions={
                <Button asChild variant="outline" size="sm">
                  <Link href="/break-glass">Open</Link>
                </Button>
              }
            >
              {needsAttention.length === 0 ? (
                <EmptyState message="No live, pending or unreviewed emergency access." />
              ) : (
                <ul className="divide-border divide-y">
                  {needsAttention.map((view) => (
                    <li key={view.grant.id} className="py-3 first:pt-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{view.grant.incidentRef}</span>
                        <StatusBadge status={view.status} />
                        {view.status === "active" ? (
                          <Badge variant="destructive">{view.minutesRemaining} min left</Badge>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {view.requestedByLabel} · {view.scopeLabel}
                      </p>
                      <p className="text-muted-foreground/80 mt-1 line-clamp-2 text-xs">
                        {view.grant.reason}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section
              title="Delegated authority in force"
              description="Cover during absence. Each one ends on its own clock and can never exceed the person who granted it."
              actions={
                <Button asChild variant="outline" size="sm">
                  <Link href="/delegations">Manage</Link>
                </Button>
              }
            >
              {activeDelegations.length === 0 ? (
                <EmptyState message="No delegations are currently in force." />
              ) : (
                <ul className="divide-border divide-y">
                  {activeDelegations.map((view) => (
                    <li key={view.delegation.id} className="py-3 first:pt-0">
                      <p className="text-sm font-semibold">
                        {view.delegatorLabel} → {view.delegateLabel}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {view.permissionLabels.join(", ")} · {view.scopeLabel}
                      </p>
                      <p className="text-muted-foreground/80 mt-1 text-xs">
                        Ends {new Date(view.delegation.endsAt).toLocaleString("en-NG")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section
              title="Privileged accounts without a second factor"
              description="MFA is mandatory for privileged roles. Until a method is enrolled these accounts cannot start a session."
              actions={
                <Button asChild variant="outline" size="sm">
                  <Link href="/people">People</Link>
                </Button>
              }
            >
              {overview.privilegedWithoutMfa.length === 0 ? (
                <EmptyState message="Every privileged account has an active method enrolled." />
              ) : (
                <ul className="divide-border divide-y">
                  {overview.privilegedWithoutMfa.map((entry) => (
                    <li key={entry.personId} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                      <span className="text-sm font-semibold">{entry.label}</span>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/people/${entry.personId}`}>Enrol</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        </>
      )}
    </>
  );
}
