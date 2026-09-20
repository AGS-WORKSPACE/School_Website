"use client";

/**
 * The audit trail (OPS-05, and the evidence behind IAM-03 to IAM-06).
 *
 * Refusals are shown alongside successes, because "who was told no" is usually
 * the more interesting question. The chain verification banner is at the top: if
 * the trail cannot be trusted, nothing below it means anything.
 */

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { useAuditEvents, useAuditVerification } from "@tau/identity/react";
import type { AuditChannel } from "@tau/identity";
import { Badge } from "@tau/ui/badge";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Skeleton } from "@tau/ui/skeleton";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";

function AuditTrail() {
  const params = useSearchParams();
  const actorFromQuery = params.get("actor") ?? undefined;

  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState<AuditChannel | "all">("all");

  const { data: events, isPending } = useAuditEvents({
    search,
    channel,
    actorPersonId: actorFromQuery,
  });
  const { data: chain } = useAuditVerification();

  return (
    <>
      <PageHeader
        eyebrow="Evidence"
        title="Audit trail"
        description="Search and verify access activity."
      />

      {chain ? (
        <div
          className={
            chain.valid
              ? "border-success/40 bg-success/5 flex items-start gap-3 rounded-lg border p-4"
              : "border-destructive/40 bg-destructive/5 flex items-start gap-3 rounded-lg border p-4"
          }
        >
          {chain.valid ? (
            <CheckCircle2 className="text-success mt-0.5 size-5 shrink-0" aria-hidden />
          ) : (
            <ShieldAlert className="text-destructive mt-0.5 size-5 shrink-0" aria-hidden />
          )}
          <div className="text-sm">
            <p className="font-semibold">
              {chain.valid ? "Chain verified" : "Chain verification failed"}
            </p>
            <p className="text-muted-foreground">{chain.message}</p>
          </div>
        </div>
      ) : null}

      <Section
        title="Entries"
        description="Newest first. Refused and failed actions are recorded with the same weight as successful ones."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="sm:w-72">
              <Label htmlFor="audit-search" className="sr-only">
                Search the trail
              </Label>
              <Input
                id="audit-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search actor, action, subject or reason"
              />
            </div>
            <div className="sm:w-44">
              <Label htmlFor="audit-channel" className="sr-only">
                Channel
              </Label>
              <NativeSelect
                id="audit-channel"
                value={channel}
                onChange={(event) => setChannel(event.target.value as AuditChannel | "all")}
              >
                <option value="all">All channels</option>
                <option value="web">Web</option>
                <option value="api">API</option>
                <option value="batch">Batch</option>
                <option value="system">System</option>
              </NativeSelect>
            </div>
          </div>
        }
      >
        {actorFromQuery ? (
          <p className="text-muted-foreground mb-4 text-sm">
            Filtered to one actor.{" "}
            <a href="/audit" className="text-primary font-semibold">
              Show everyone
            </a>
          </p>
        ) : null}

        {isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (events ?? []).length === 0 ? (
          <EmptyState message="No entries match those filters." />
        ) : (
          <ol className="divide-border divide-y">
            {(events ?? []).map((event) => (
              <li key={event.id} className="py-4 first:pt-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tabular text-muted-foreground text-xs">#{event.seq}</span>
                  <span className="font-mono text-xs font-semibold">{event.action}</span>
                  <StatusBadge status={event.outcome} />
                  <Badge variant="muted">{event.channel}</Badge>
                  {event.viaGrantId ? (
                    <Badge variant="outline" title="The grant the actor relied on">
                      via {event.viaGrantId}
                    </Badge>
                  ) : null}
                </div>

                <p className="mt-2 text-sm">
                  <span className="font-semibold">{event.actorLabel}</span>
                  <span className="text-muted-foreground"> → {event.subjectLabel}</span>
                </p>

                {event.reason ? (
                  <p className="text-muted-foreground mt-1 text-sm">{event.reason}</p>
                ) : null}

                {event.before || event.after ? (
                  <p className="text-muted-foreground/80 mt-1 font-mono text-xs break-all">
                    {event.before ? `before ${JSON.stringify(event.before)}` : ""}
                    {event.before && event.after ? " · " : ""}
                    {event.after ? `after ${JSON.stringify(event.after)}` : ""}
                  </p>
                ) : null}

                <p className="text-muted-foreground/80 mt-2 flex flex-wrap gap-x-3 text-xs">
                  <span className="tabular">
                    {new Date(event.at).toLocaleString("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  <span className="tabular" title="This entry's seal">
                    hash {event.hash.slice(0, 12)}…
                  </span>
                  <span className="tabular" title="The seal of the entry before it">
                    prev {event.prevHash.slice(0, 12)}…
                  </span>
                </p>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </>
  );
}

export default function AuditPage() {
  // useSearchParams needs a Suspense boundary so the rest of the page can stream.
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
      <AuditTrail />
    </Suspense>
  );
}
