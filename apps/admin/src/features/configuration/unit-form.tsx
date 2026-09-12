"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@tau/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@tau/ui/dialog";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Textarea } from "@tau/ui/textarea";
import { useConfiguration } from "./configuration-store";
import type { OrganisationUnit } from "./types";

const emptyUnit = (): OrganisationUnit => ({
  id: `UNISITE-DEP-${String(Date.now()).slice(-3)}`,
  name: "",
  shortName: "",
  type: "Department",
  parentId: "UNISITE-FAC-001",
  reportingUnitId: "UNISITE-FAC-001",
  campus: "Umuchukwu",
  head: "",
  email: "",
  effectiveFrom: "2026-09-21",
  status: "Draft",
  reason: "",
  authority: "",
  notes: "",
  history: [],
});

export function UnitForm({ open, onOpenChange, initial }: { open: boolean; onOpenChange: (open: boolean) => void; initial?: OrganisationUnit | null }) {
  const { units, saveUnit } = useConfiguration();
  const [unit, setUnit] = useState<OrganisationUnit>(() => initial ? structuredClone(initial) : emptyUnit());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof OrganisationUnit>(key: K, value: OrganisationUnit[K]) => setUnit((current) => ({ ...current, [key]: value }));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!unit.name.trim()) next.name = "Enter a unit name.";
    if (!/^UNISITE-[A-Z]{3}-\d{3}$/.test(unit.id)) next.id = "Use the format UNISITE-XXX-000.";
    if (units.some((item) => item.id === unit.id && item.id !== initial?.id)) next.id = "This stable ID is already in use.";
    if (!unit.head.trim()) next.head = "Assign a head of unit.";
    if (!/^\S+@\S+\.\S+$/.test(unit.email)) next.email = "Enter a valid institutional email.";
    if (unit.reason.trim().length < 10) next.reason = "Give a reason of at least 10 characters.";
    if (!unit.authority.trim()) next.authority = "Record the supporting authority or reference.";
    setErrors(next);
    if (Object.keys(next).length) return;
    saveUnit(unit, initial?.id);
    toast.success(initial ? "Draft unit version updated." : "Draft organisation unit created.");
    onOpenChange(false);
  }

  const field = (id: string, label: string, content: React.ReactNode) => <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{content}{errors[id] ? <p id={`${id}-error`} className="text-xs text-destructive">{errors[id]}</p> : null}</div>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader><DialogTitle>{initial ? "Edit unit version" : "Create organisation unit"}</DialogTitle><DialogDescription>Stable IDs survive restructures. Published history is never overwritten.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("name", "Unit name", <Input id="name" value={unit.name} onChange={(event) => update("name", event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />)}
            {field("shortName", "Short name", <Input id="shortName" value={unit.shortName} onChange={(event) => update("shortName", event.target.value)} />)}
            {field("id", "Stable unit ID", <Input id="id" value={unit.id} onChange={(event) => update("id", event.target.value.toUpperCase())} disabled={Boolean(initial)} aria-invalid={Boolean(errors.id)} />)}
            {field("type", "Unit type", <NativeSelect id="type" value={unit.type} onChange={(event) => update("type", event.target.value)}>{["Campus", "College", "Faculty", "School", "Department", "Directorate", "Administrative unit"].map((type) => <option key={type}>{type}</option>)}</NativeSelect>)}
            {field("parent", "Parent unit", <NativeSelect id="parent" value={unit.parentId} onChange={(event) => update("parentId", event.target.value)}><option value="">No parent</option>{units.filter((item) => item.id !== unit.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</NativeSelect>)}
            {field("campus", "Campus", <NativeSelect id="campus" value={unit.campus} onChange={(event) => update("campus", event.target.value)}><option>Umuchukwu</option><option>University-wide</option></NativeSelect>)}
            {field("reportingUnit", "Reporting unit", <NativeSelect id="reportingUnit" value={unit.reportingUnitId} onChange={(event) => update("reportingUnitId", event.target.value)}><option value="">Same as parent</option>{units.filter((item) => item.id !== unit.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</NativeSelect>)}
            {field("head", "Head of unit", <Input id="head" value={unit.head} onChange={(event) => update("head", event.target.value)} aria-invalid={Boolean(errors.head)} />)}
            {field("email", "Contact email", <Input id="email" type="email" value={unit.email} onChange={(event) => update("email", event.target.value)} aria-invalid={Boolean(errors.email)} />)}
            {field("status", "Status", <NativeSelect id="status" value={unit.status} onChange={(event) => update("status", event.target.value as OrganisationUnit["status"])}><option>Draft</option><option>Scheduled</option><option>Active</option></NativeSelect>)}
            {field("effectiveFrom", "Effective from", <Input id="effectiveFrom" type="date" value={unit.effectiveFrom} onChange={(event) => update("effectiveFrom", event.target.value)} />)}
            {field("effectiveTo", "Effective to", <Input id="effectiveTo" type="date" value={unit.effectiveTo ?? ""} onChange={(event) => update("effectiveTo", event.target.value || undefined)} />)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("reason", "Reason for change", <Textarea id="reason" value={unit.reason} onChange={(event) => update("reason", event.target.value)} aria-invalid={Boolean(errors.reason)} />)}
            {field("authority", "Supporting authority/reference", <Textarea id="authority" value={unit.authority} onChange={(event) => update("authority", event.target.value)} aria-invalid={Boolean(errors.authority)} />)}
          </div>
          {field("notes", "Notes", <Textarea id="notes" value={unit.notes ?? ""} onChange={(event) => update("notes", event.target.value)} />)}
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit">Save draft unit</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
