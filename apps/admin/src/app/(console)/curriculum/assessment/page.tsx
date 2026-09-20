"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, LockKeyhole, Save, ShieldAlert } from "lucide-react";
import type { AssessmentComponent, AssessmentConfiguration } from "@tau/curriculum";
import { useCurriculum } from "@tau/curriculum";
import { approveAssessmentConfiguration, saveAssessmentConfiguration } from "@tau/curriculum";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

export default function AssessmentConfigurationPage() {
  const { assessmentConfigurations } = useCurriculum();
  const { session } = useSession();
  const { data: person, isPending: personLoading, isError: personError } = usePerson(session?.personId ?? "");
  const [selectedId, setSelectedId] = useState(assessmentConfigurations[0]?.id ?? "");
  const [draft, setDraft] = useState<AssessmentComponent[]>([]);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const selected = assessmentConfigurations.find((item) => item.id === selectedId) ?? assessmentConfigurations[0];
  const activeDraft = useMemo(() => draft.length > 0 && selected?.id === selectedId ? draft : selected?.components ?? [], [draft, selected, selectedId]);
  const currentEffectiveDate = effectiveDate || selected?.effectiveDate || "";
  const canEdit = Boolean(person?.permissionIds.some((permission) => ["academics:curriculum:propose", "academics:curriculum:review"].includes(permission)));
  const canApprove = Boolean(person?.permissionIds.includes("academics:curriculum:approve"));

  const total = useMemo(() => activeDraft.reduce((sum, component) => sum + (component.weight ?? 0), 0), [activeDraft]);
  const invalidDraft = activeDraft.some((component) => component.weight === null || component.weight < 0 || component.weight > 100);

  function selectConfiguration(id: string) {
    setSelectedId(id);
    setDraft([]);
    setEffectiveDate("");
    setChangeSummary("");
    setMessage(null);
  }

  function updateComponent(id: string, patch: Partial<AssessmentComponent>) {
    setDraft((current) => (current.length ? current : activeDraft).map((component) => component.id === id ? { ...component, ...patch } : component));
  }

  function save() {
    if (!selected || !person || !session) return;
    setSaving(true);
    setMessage({ tone: "info", text: "Saving assessment configuration…" });
    const result = saveAssessmentConfiguration({
      configurationId: selected.id,
      components: activeDraft,
      effectiveDate: currentEffectiveDate,
      changeSummary,
      permissions: person.permissionIds,
      actor: { personId: session.personId, name: session.displayName },
    });
    setSaving(false);
    if (!result.ok) {
      setMessage({ tone: "error", text: result.error ?? "Assessment configuration could not be saved." });
      return;
    }
    setDraft([]);
    setMessage({ tone: "success", text: result.requiresVersioning ? "Version proposal saved for approval. The current version remains unchanged." : "Assessment configuration saved." });
    if (result.data) setSelectedId(result.data.id);
  }

  function approve() {
    if (!selected) return;
    const result = approveAssessmentConfiguration({ configurationId: selected.id, permissions: person?.permissionIds ?? [] });
    setMessage(result.ok ? { tone: "success", text: "Assessment configuration approved." } : { tone: "error", text: result.error ?? "Approval failed." });
  }

  if (personLoading) return <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground" role="status">Loading assessment permissions…</div>;
  if (personError || !person) return <PermissionState title="Permission state unavailable" message="Your access could not be verified. No configuration actions are available." />;
  if (!assessmentConfigurations.length) return <EmptyState message="No assessment configurations are available for the configured academic sessions." />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-12 · RES-01"
        title="Assessment configuration"
        description="Set assessment rules for each course."
        actions={<Badge variant="outline">Preview</Badge>}
      />

      {message ? <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${message.tone === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : message.tone === "success" ? "border-success/30 bg-success/5 text-success" : "border-primary/20 bg-primary/5"}`} role={message.tone === "error" ? "alert" : "status"} aria-live={message.tone === "error" ? "assertive" : "polite"} aria-atomic="true"><StatusIcon tone={message.tone} />{message.text}</div> : null}

      <Section title="Assessment structures" description="Select a course to inspect its effective structure and version history.">
        <div className="grid gap-3 md:grid-cols-2">
          {assessmentConfigurations.map((configuration) => (
            <button key={configuration.id} type="button" onClick={() => selectConfiguration(configuration.id)} className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${configuration.id === selected?.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
              <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{configuration.courseCode} · {configuration.courseTitle}</p><p className="mt-1 text-xs text-muted-foreground">{configuration.academicSession} · Semester {configuration.semester} · {configuration.version}</p></div><StatusBadge status={configuration.status} /></div>
              <p className="mt-3 text-xs text-muted-foreground">Effective {configuration.effectiveDate} · {configuration.marksExist ? "Marks exist" : "No marks recorded"}</p>
            </button>
          ))}
        </div>
      </Section>

      {selected ? <>
        <Section title={`${selected.courseCode} · ${selected.courseTitle}`} description="Course/module, academic session, semester, status, version and effective date are sourced from the current configuration record.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Meta label="Academic session" value={selected.academicSession} />
            <Meta label="Semester" value={`Semester ${selected.semester}`} />
            <Meta label="Current version" value={selected.version} />
            <Meta label="Status" value={selected.status} />
          </div>
          {selected.marksExist ? <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-950"><LockKeyhole className="mt-0.5 size-5 shrink-0" aria-hidden /><div><p className="font-semibold">Marks already exist for this configuration</p><p className="mt-1">Changes must be submitted as an authorised version proposal. The current {selected.version} remains identifiable and is not presented as an unrestricted edit.</p></div></div> : null}
        </Section>

        <Section title="Assessment components" description={`The configured total must equal the policy value of ${selected.requiredTotalWeight}%. Supported component types come from the existing course assessment scheme.`} actions={<div className={`rounded-lg border px-4 py-2 text-right ${total === selected.requiredTotalWeight && !invalidDraft ? "border-success/30 bg-success/5" : "border-amber-300/60 bg-amber-50"}`}><span className="block text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground">Total weight</span><strong className="text-xl tabular">{total}%</strong><span className="text-xs text-muted-foreground"> / {selected.requiredTotalWeight}%</span></div>}>
          <div className="overflow-x-auto rounded-lg border border-border"><Table className="min-w-[760px]"><TableHeader><TableRow><TableHead>Assessment component</TableHead><TableHead>Component type</TableHead><TableHead>Maximum mark</TableHead><TableHead>Weight</TableHead><TableHead>State</TableHead></TableRow></TableHeader><TableBody>{activeDraft.map((component) => <TableRow key={component.id}><TableCell className="font-semibold">{component.name}</TableCell><TableCell><Badge variant="outline">{component.type}</Badge></TableCell><TableCell><Input aria-label={`${component.name} maximum mark`} type="number" min="0" value={component.maximumMark} disabled={!canEdit || selected.status === "Superseded"} onChange={(event) => updateComponent(component.id, { maximumMark: Number(event.target.value) })} className="w-28" /></TableCell><TableCell><div className="flex items-center gap-2"><Input aria-label={`${component.name} weight`} type="number" min="0" max="100" value={component.weight ?? ""} disabled={!canEdit || selected.status === "Superseded"} onChange={(event) => updateComponent(component.id, { weight: event.target.value === "" ? null : Number(event.target.value) })} className="w-24" /><span>%</span></div></TableCell><TableCell>{component.weight === null ? <Badge variant="destructive">Missing weight</Badge> : component.weight < 0 || component.weight > 100 ? <Badge variant="destructive">Invalid weight</Badge> : <Badge variant="success">Configured</Badge>}</TableCell></TableRow>)}</TableBody></Table></div>
          {activeDraft.length === 0 ? <div className="mt-4"><EmptyState message="This structure has no assessment components." /></div> : null}
          <div className="mt-4 grid gap-4 md:grid-cols-2"><label className="space-y-1 text-sm font-semibold">Effective date<input className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" type="date" value={currentEffectiveDate} disabled={!canEdit} onChange={(event) => setEffectiveDate(event.target.value)} /></label>{selected.marksExist ? <label className="space-y-1 text-sm font-semibold">Change summary required for versioning<textarea className="mt-1 min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal" value={changeSummary} disabled={!canEdit} onChange={(event) => setChangeSummary(event.target.value)} placeholder="Explain why this approved structure is changing" /></label> : null}</div>
          {!canEdit ? <PermissionState title="Configuration is read-only" message="Your current role can view this assessment structure but cannot edit it." compact /> : null}
          {canEdit ? <div className="mt-5 flex flex-wrap gap-2"><Button onClick={save} disabled={saving || invalidDraft || total !== selected.requiredTotalWeight || !currentEffectiveDate}><Save className="size-4" />{saving ? "Saving…" : selected.marksExist ? "Submit version proposal" : "Save configuration"}</Button>{selected.status === "In Review" ? <Button variant="outline" onClick={approve} disabled={!canApprove}><CheckCircle2 className="size-4" />Approve version</Button> : null}{selected.status === "In Review" && !canApprove ? <span className="self-center text-xs text-muted-foreground">Approval requires the existing curriculum approval permission.</span> : null}</div> : null}
        </Section>

        <Section title="Version history" description="Previous versions remain identifiable. This frontend demo does not claim backend immutability.">
          <div className="space-y-2">{assessmentConfigurations.filter((configuration) => configuration.courseId === selected.courseId).map((configuration) => <div key={configuration.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{configuration.version} <span className="font-normal text-muted-foreground">· effective {configuration.effectiveDate}</span></p><p className="text-xs text-muted-foreground">{configuration.changeSummary ?? "Initial assessment structure"}{configuration.previousVersionId ? ` · proposed from ${assessmentConfigurations.find((item) => item.id === configuration.previousVersionId)?.version ?? "previous version"}` : ""}</p></div><div className="flex items-center gap-2"><StatusBadge status={configuration.status} />{configuration.approvalStatus && <Badge variant="muted">{configuration.approvalStatus}</Badge>}</div></div>)}</div>
        </Section>
      </> : null}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
function StatusBadge({ status }: { status: AssessmentConfiguration["status"] }) { return <Badge variant={status === "Published" || status === "Approved" ? "success" : status === "In Review" ? "warning" : status === "Superseded" ? "muted" : "outline"}>{status}</Badge>; }
function StatusIcon({ tone }: { tone: "success" | "error" | "info" }) { return tone === "success" ? <CheckCircle2 className="size-4 shrink-0" aria-hidden /> : tone === "error" ? <ShieldAlert className="size-4 shrink-0" aria-hidden /> : <Clock3 className="size-4 shrink-0" aria-hidden />; }
function PermissionState({ title, message, compact = false }: { title: string; message: string; compact?: boolean }) { return <div className={`flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 text-amber-950 ${compact ? "mt-4 p-3" : "p-6"}`} role="status"><AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden /><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm">{message}</p>{!compact ? <Link href="/my-access" className="mt-3 inline-block text-sm font-semibold underline">Review my access</Link> : null}</div></div>; }
