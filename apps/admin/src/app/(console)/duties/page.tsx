"use client";

/**
 * Segregation of duties (IAM-05).
 *
 * Three things on one page because they are one conversation: the rules, who is
 * currently in breach of them, and the exceptions that have been argued for.
 * An exception is only ever an exception — the conflict stays visible underneath
 * it, with the compensating control attached.
 */

import Link from "next/link";
import { useState } from "react";
import { Loader2, ScaleIcon, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import {
  useConflicts,
  useDecideSodException,
  useRequestSodException,
  useRevokeSodException,
  useSodExceptions,
  useSodRules,
} from "@tau/identity/react";
import type { ConflictView } from "@tau/identity";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { Skeleton } from "@tau/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { Textarea } from "@tau/ui/textarea";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { useActor } from "@/providers/session-provider";

function ExceptionRequestForm({
  view,
  onDone,
}: {
  view: ConflictView;
  onDone: () => void;
}) {
  const actor = useActor();
  const request = useRequestSodException();
  const [reason, setReason] = useState("");
  const [control, setControl] = useState("");
  const [validUntil, setValidUntil] = useState(() =>
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );

  return (
    <form
      className="border-border bg-muted/40 mt-3 space-y-3 rounded-lg border p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await request.mutateAsync({
          ruleId: view.conflict.rule.id,
          personId: view.conflict.personId,
          scope: view.conflict.scope,
          reason,
          compensatingControl: control,
          validUntil: new Date(validUntil).toISOString(),
          actorPersonId: actor.personId,
        });
        if (result.ok) {
          toast.success(result.message);
          onDone();
        } else {
          toast.error(result.message);
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor={`reason-${view.conflict.rule.id}`}>
          Why can these duties not be separated?
        </Label>
        <Textarea
          id={`reason-${view.conflict.rule.id}`}
          rows={2}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. The exams officer post is vacant mid-session and results cannot be entered otherwise"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`control-${view.conflict.rule.id}`}>Compensating control</Label>
        <Textarea
          id={`control-${view.conflict.rule.id}`}
          rows={2}
          value={control}
          onChange={(event) => setControl(event.target.value)}
          placeholder="e.g. Every result set entered under this exception is re-checked by the Faculty Officer before release"
          required
        />
        <p className="text-muted-foreground text-xs">
          Required. An exception without a compensating control is an unmanaged risk, not a control.
        </p>
      </div>
      <div className="space-y-2 sm:max-w-xs">
        <Label htmlFor={`until-${view.conflict.rule.id}`}>Valid until</Label>
        <Input
          id={`until-${view.conflict.rule.id}`}
          type="date"
          value={validUntil}
          onChange={(event) => setValidUntil(event.target.value)}
          required
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={request.isPending}>
          {request.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Submit for approval
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function DutiesPage() {
  const actor = useActor();
  const { data: rules } = useSodRules();
  const { data: conflicts, isPending } = useConflicts();
  const { data: exceptions } = useSodExceptions();
  const decide = useDecideSodException();
  const revoke = useRevokeSodException();

  const [requesting, setRequesting] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const blocking = (conflicts ?? []).filter((view) => view.blocking);
  const tolerated = (conflicts ?? []).filter((view) => !view.blocking);
  const pending = (exceptions ?? []).filter((view) => view.status === "requested");

  return (
    <>
      <PageHeader
        eyebrow="IAM-05"
        title="Segregation of duties"
        description="No one person should prepare and approve the same high-risk item. Conflicts are detected against effective access, so cover arranged last week counts the same as a role granted last year."
      />

      <Tabs defaultValue="conflicts">
        <TabsList>
          <TabsTrigger value="conflicts">
            Conflicts
            {blocking.length > 0 ? (
              <Badge variant="destructive" className="ml-2">
                {blocking.length}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="exceptions">
            Exceptions
            {pending.length > 0 ? (
              <Badge variant="warning" className="ml-2">
                {pending.length}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="conflicts" className="space-y-6">
          <Section
            title={`Blocking (${blocking.length})`}
            description="Submissions covered by these rules are refused until a separate authority approves a documented exception."
          >
            {isPending ? (
              <Skeleton className="h-32 rounded-lg" />
            ) : blocking.length === 0 ? (
              <EmptyState message="Nobody currently holds both halves of a blocking rule." />
            ) : (
              <ul className="divide-border divide-y">
                {blocking.map((view, index) => {
                  const key = `${view.conflict.rule.id}-${view.conflict.personId}-${index}`;
                  return (
                    <li key={key} className="py-4 first:pt-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <ShieldAlert className="text-destructive size-4" aria-hidden />
                        <Link
                          href={`/people/${view.conflict.personId}`}
                          className="hover:text-primary"
                        >
                          {view.personLabel}
                        </Link>
                        <StatusBadge status="blocking" />
                      </p>
                      <p className="mt-1 text-sm font-semibold">{view.conflict.rule.label}</p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {view.conflict.rule.description}
                      </p>
                      <p className="text-muted-foreground/80 mt-2 text-xs">
                        {view.permissionALabel} via {view.conflict.sourceA.label} ·{" "}
                        {view.permissionBLabel} via {view.conflict.sourceB.label} · both cover{" "}
                        {view.scopeLabel}
                      </p>
                      <p className="text-muted-foreground/80 mt-1 text-xs italic">
                        {view.conflict.rule.basis}
                      </p>

                      {requesting === key ? (
                        <ExceptionRequestForm view={view} onDone={() => setRequesting(null)} />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => setRequesting(key)}
                        >
                          Request an exception
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section
            title={`Recorded for review (${tolerated.length})`}
            description="Either a lower-severity rule, or a blocking one already covered by a live exception. Neither is ignored."
          >
            {tolerated.length === 0 ? (
              <EmptyState message="Nothing recorded for review." />
            ) : (
              <ul className="divide-border divide-y">
                {tolerated.map((view, index) => (
                  <li key={`${view.conflict.rule.id}-${index}`} className="py-4 first:pt-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      <Link href={`/people/${view.conflict.personId}`} className="hover:text-primary">
                        {view.personLabel}
                      </Link>
                      <StatusBadge
                        status={view.conflict.exception ? "approved" : view.conflict.rule.severity}
                      />
                    </p>
                    <p className="mt-1 text-sm">{view.conflict.rule.label}</p>
                    <p className="text-muted-foreground/80 mt-1 text-xs">
                      {view.permissionALabel} + {view.permissionBLabel} · {view.scopeLabel}
                    </p>
                    {view.conflict.exception ? (
                      <p className="border-success/40 bg-success/5 mt-2 rounded-lg border p-2 text-xs">
                        Control: {view.conflict.exception.compensatingControl}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="exceptions">
          <Section
            title="Exception register"
            description="An exception cannot be approved by the person it covers, nor by whoever requested it. Attempts to do either are refused and logged."
          >
            {(exceptions ?? []).length === 0 ? (
              <EmptyState message="No exceptions have been requested." />
            ) : (
              <ul className="divide-border divide-y">
                {(exceptions ?? []).map((view) => {
                  const isSubject = view.exception.personId === actor.personId;
                  const isRequester = view.exception.requestedBy === actor.personId;
                  const canDecide = view.status === "requested" && !isSubject && !isRequester;

                  return (
                    <li key={view.exception.id} className="py-4 first:pt-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <Link
                          href={`/people/${view.exception.personId}`}
                          className="hover:text-primary"
                        >
                          {view.personLabel}
                        </Link>
                        <StatusBadge status={view.status} />
                      </p>
                      <p className="mt-1 text-sm font-semibold">{view.ruleLabel}</p>
                      <p className="text-muted-foreground mt-1 text-sm">{view.exception.reason}</p>
                      <p className="text-muted-foreground mt-2 text-sm">
                        <span className="font-semibold">Compensating control: </span>
                        {view.exception.compensatingControl}
                      </p>
                      <p className="text-muted-foreground/80 mt-1 text-xs">
                        {view.scopeLabel} · requested by {view.requestedByLabel} · valid until{" "}
                        {new Date(view.exception.validUntil).toLocaleDateString("en-NG")}
                        {view.approvedByLabel ? ` · approved by ${view.approvedByLabel}` : ""}
                      </p>

                      {view.status === "requested" ? (
                        canDecide ? (
                          <div className="mt-3 space-y-2">
                            <Label htmlFor={`note-${view.exception.id}`} className="text-xs">
                              Decision note
                            </Label>
                            <Input
                              id={`note-${view.exception.id}`}
                              value={notes[view.exception.id] ?? ""}
                              onChange={(event) =>
                                setNotes((current) => ({
                                  ...current,
                                  [view.exception.id]: event.target.value,
                                }))
                              }
                              placeholder="Recorded against the decision"
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                disabled={decide.isPending}
                                onClick={async () => {
                                  const result = await decide.mutateAsync({
                                    exceptionId: view.exception.id,
                                    decision: "approve",
                                    note: notes[view.exception.id] ?? "",
                                    actorPersonId: actor.personId,
                                  });
                                  if (result.ok) toast.success(result.message);
                                  else toast.error(result.message);
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={decide.isPending}
                                onClick={async () => {
                                  const result = await decide.mutateAsync({
                                    exceptionId: view.exception.id,
                                    decision: "reject",
                                    note: notes[view.exception.id] ?? "",
                                    actorPersonId: actor.personId,
                                  });
                                  if (result.ok) toast.success(result.message);
                                  else toast.error(result.message);
                                }}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground border-border mt-3 rounded-lg border border-dashed p-3 text-xs">
                            {isSubject
                              ? "You cannot approve an exception that covers you."
                              : "You requested this exception, so somebody else must decide it."}
                          </p>
                        )
                      ) : null}

                      {view.status === "approved" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3"
                          disabled={revoke.isPending}
                          onClick={async () => {
                            const result = await revoke.mutateAsync({
                              exceptionId: view.exception.id,
                              reason: "Withdrawn from the exception register.",
                              actorPersonId: actor.personId,
                            });
                            if (result.ok) toast.success(result.message);
                            else toast.error(result.message);
                          }}
                        >
                          Withdraw exception
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="rules">
          <Section
            title="Rules in force"
            description="Each rule names two duties that must stay apart, and the policy it implements."
          >
            <ul className="divide-border divide-y">
              {(rules ?? []).map((rule) => (
                <li key={rule.id} className="py-4 first:pt-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <ScaleIcon className="size-4" aria-hidden />
                    {rule.label}
                    <StatusBadge status={rule.severity} />
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">{rule.description}</p>
                  <p className="text-muted-foreground/80 mt-2 font-mono text-xs">
                    {rule.permissionA} ⊗ {rule.permissionB}
                  </p>
                  <p className="text-muted-foreground/80 mt-1 text-xs italic">{rule.basis}</p>
                </li>
              ))}
            </ul>
          </Section>
        </TabsContent>
      </Tabs>
    </>
  );
}
