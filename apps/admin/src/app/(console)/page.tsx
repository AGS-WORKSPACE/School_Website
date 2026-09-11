"use client";

import Link from "next/link";
import {
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
} from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Skeleton } from "@tau/ui/skeleton";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { Stat } from "@/components/console/stat";
import { StatusBadge } from "@/components/console/status-badge";

export default function AccessPositionPage() {
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
      <PageHeader
        eyebrow="EP-01"
        title="Access position"
        description="Who holds what, where it came from and what needs a decision today. Every number here is the live result of the policy engine, not a stored counter."
        actions={
          <Button asChild variant="outline">
            <Link href="/audit">Open audit trail</Link>
          </Button>
        }
      />

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
