"use client";

/**
 * Periodic access review (IAM-02).
 *
 * Sorted by what is most likely to be wrong rather than alphabetically: never
 * reviewed first, then privileged, then everything else. A reviewer who works
 * top-down gets the risk out of the way before their attention runs out.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAssignments, useReviewAssignment } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Skeleton } from "@tau/ui/skeleton";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { useActor } from "@/providers/session-provider";

type Scope = "outstanding" | "privileged" | "all";

export default function AccessReviewPage() {
  const actor = useActor();
  const { data, isPending } = useAssignments();
  const reviewAssignment = useReviewAssignment();
  const [scope, setScope] = useState<Scope>("outstanding");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const rows = useMemo(() => {
    const active = (data ?? []).filter((view) => view.status === "active");
    const filtered = active.filter((view) => {
      if (scope === "outstanding") return view.assignment.lastReviewedAt === null;
      if (scope === "privileged") return view.role?.privileged ?? false;
      return true;
    });

    return filtered.sort((a, b) => {
      const unreviewed =
        Number(a.assignment.lastReviewedAt !== null) - Number(b.assignment.lastReviewedAt !== null);
      if (unreviewed !== 0) return unreviewed;
      const privileged = Number(b.role?.privileged ?? false) - Number(a.role?.privileged ?? false);
      if (privileged !== 0) return privileged;
      return a.personLabel.localeCompare(b.personLabel);
    });
  }, [data, scope]);

  const outstanding = (data ?? []).filter(
    (view) => view.status === "active" && view.assignment.lastReviewedAt === null,
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Assurance"
        title="Access review"
        description="Standing access is the access nobody remembers granting. Confirming keeps it and stamps who checked; withdrawing ends it immediately and records why."
        actions={
          <div className="w-full sm:w-56">
            <Label htmlFor="review-scope" className="sr-only">
              Review scope
            </Label>
            <NativeSelect
              id="review-scope"
              value={scope}
              onChange={(event) => setScope(event.target.value as Scope)}
            >
              <option value="outstanding">Never reviewed ({outstanding})</option>
              <option value="privileged">Privileged roles</option>
              <option value="all">All active assignments</option>
            </NativeSelect>
          </div>
        }
      />

      <Section
        title={`${rows.length} to look at`}
        description="A person cannot review their own access. Attempting it is refused and written to the audit trail."
      >
        {isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState message="Nothing outstanding in this view." />
        ) : (
          <ul className="divide-border divide-y">
            {rows.map((view) => {
              const isSelf = view.assignment.personId === actor.personId;
              return (
                <li key={view.assignment.id} className="py-4 first:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/people/${view.assignment.personId}`}
                      className="hover:text-primary text-sm font-semibold"
                    >
                      {view.personLabel}
                    </Link>
                    <Badge variant="outline">{view.role?.name ?? view.assignment.roleId}</Badge>
                    {view.role?.privileged ? <Badge variant="accent">Privileged</Badge> : null}
                    {view.assignment.lastReviewedAt === null ? (
                      <Badge variant="warning">
                        <AlertTriangle className="size-3.5" aria-hidden />
                        Never reviewed
                      </Badge>
                    ) : (
                      <StatusBadge status="confirmed" />
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {view.scopeLabel} · granted by {view.grantedByLabel} on{" "}
                    {new Date(view.assignment.grantedAt).toLocaleDateString("en-NG")}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">{view.assignment.reason}</p>

                  {isSelf ? (
                    <p className="text-muted-foreground border-border mt-3 rounded-lg border border-dashed p-3 text-xs">
                      This is your own access. Somebody else must review it.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <Label htmlFor={`note-${view.assignment.id}`} className="text-xs">
                        Note (required to withdraw)
                      </Label>
                      <Input
                        id={`note-${view.assignment.id}`}
                        value={notes[view.assignment.id] ?? ""}
                        onChange={(event) =>
                          setNotes((current) => ({
                            ...current,
                            [view.assignment.id]: event.target.value,
                          }))
                        }
                        placeholder="e.g. Still required for the 2026/2027 session"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          disabled={reviewAssignment.isPending}
                          onClick={async () => {
                            const result = await reviewAssignment.mutateAsync({
                              assignmentId: view.assignment.id,
                              decision: "confirm",
                              note: notes[view.assignment.id] ?? "",
                              actorPersonId: actor.personId,
                            });
                            if (result.ok) toast.success(result.message);
                            else toast.error(result.message);
                          }}
                        >
                          {reviewAssignment.isPending ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                          ) : null}
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reviewAssignment.isPending}
                          onClick={async () => {
                            const result = await reviewAssignment.mutateAsync({
                              assignmentId: view.assignment.id,
                              decision: "withdraw",
                              note: notes[view.assignment.id] ?? "",
                              actorPersonId: actor.personId,
                            });
                            if (result.ok) toast.success(result.message);
                            else toast.error(result.message);
                          }}
                        >
                          Withdraw
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
    </>
  );
}
