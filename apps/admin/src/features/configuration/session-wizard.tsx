"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@tau/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@tau/ui/dialog";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { cn } from "@tau/ui/lib/utils";
import { useConfiguration } from "./configuration-store";
import type { AcademicSession } from "./types";

const steps = ["Session identity", "Terms", "Teaching weeks", "Milestones", "Variations", "Review"];

export function SessionWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { createSession, sessions } = useConfiguration();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("2027/2028");
  const [start, setStart] = useState("2027-09-20");
  const [end, setEnd] = useState("2028-07-22");
  const [termCount, setTermCount] = useState("2");
  const [teachingWeeks, setTeachingWeeks] = useState("14");
  const [mode, setMode] = useState("Full-time");

  function close(value: boolean) {
    if (!value) setStep(0);
    onOpenChange(value);
  }

  function complete() {
    if (sessions.some((session) => session.name === name)) {
      toast.error("A session with this name already exists.");
      return;
    }
    const count = Number(termCount);
    const session: AcademicSession = {
      id: name.replace("/", "-"), name, start, end, status: "Draft", version: "v0.1", lastModified: "Just now",
      terms: Array.from({ length: count }, (_, index) => ({ id: `term-${Date.now()}-${index}`, name: `${index === 0 ? "First" : index === 1 ? "Second" : "Third"} Semester`, start, end, teachingWeeks: Number(teachingWeeks), examWeeks: 3 })),
      milestones: [{ id: `milestone-${Date.now()}`, name: "Course registration", type: "Registration", start, audience: "All students", status: "Draft" }],
      variations: mode === "Full-time" ? [] : [{ id: `variation-${Date.now()}`, programme: "All postgraduate programmes", deliveryMode: mode, change: "Alternative teaching pattern" }],
    };
    createSession(session);
    toast.success(`${name} created as a draft.`);
    close(false);
  }

  return <Dialog open={open} onOpenChange={close}><DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>Create academic session</DialogTitle><DialogDescription>Build a complete draft in six reviewable steps.</DialogDescription></DialogHeader>
    <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Session workflow">{steps.map((label, index) => <li key={label} className="text-center"><span className={cn("mx-auto grid size-8 place-items-center rounded-full border text-xs font-bold", index < step ? "border-primary bg-primary text-white" : index === step ? "border-primary text-primary ring-4 ring-primary/10" : "border-border text-muted-foreground")}>{index < step ? <Check className="size-4" /> : index + 1}</span><span className="mt-1 hidden text-[0.65rem] text-muted-foreground sm:block">{label}</span></li>)}</ol>
    <div className="min-h-52 rounded-xl border border-border bg-muted/20 p-5">
      {step === 0 ? <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="session-name">Session name</Label><Input id="session-name" value={name} onChange={(event) => setName(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="session-start">Starts</Label><Input id="session-start" type="date" value={start} onChange={(event) => setStart(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="session-end">Ends</Label><Input id="session-end" type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></div></div> : null}
      {step === 1 ? <div className="space-y-3"><Label htmlFor="terms">Academic periods</Label><NativeSelect id="terms" value={termCount} onChange={(event) => setTermCount(event.target.value)}><option value="2">Two semesters</option><option value="3">Three terms</option></NativeSelect><p className="text-sm text-muted-foreground">You can rearrange and date each period from the session detail after this draft is created.</p></div> : null}
      {step === 2 ? <div className="space-y-3"><Label htmlFor="weeks">Teaching weeks per period</Label><Input id="weeks" type="number" min="1" max="20" value={teachingWeeks} onChange={(event) => setTeachingWeeks(event.target.value)} /><p className="text-sm text-muted-foreground">Three examination weeks are added to each period by default.</p></div> : null}
      {step === 3 ? <div><h3 className="font-semibold">Initial milestones</h3><div className="mt-3 rounded-lg border border-border bg-card p-4"><strong className="text-sm">Course registration</strong><p className="mt-1 text-xs text-muted-foreground">Starts with the session · all students · Draft</p></div><p className="mt-3 text-sm text-muted-foreground">Deadlines, holidays, Senate dates and graduation dates can be added later.</p></div> : null}
      {step === 4 ? <div className="space-y-3"><Label htmlFor="delivery">Default delivery mode</Label><NativeSelect id="delivery" value={mode} onChange={(event) => setMode(event.target.value)}><option>Full-time</option><option>Weekend</option><option>Blended</option><option>Clinical rotation</option></NativeSelect><p className="text-sm text-muted-foreground">Programme-specific variations never overwrite the institutional calendar.</p></div> : null}
      {step === 5 ? <dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase text-muted-foreground">Session</dt><dd className="mt-1 font-semibold">{name}</dd></div><div><dt className="text-xs font-bold uppercase text-muted-foreground">Dates</dt><dd className="mt-1">{start} → {end}</dd></div><div><dt className="text-xs font-bold uppercase text-muted-foreground">Structure</dt><dd className="mt-1">{termCount} periods · {teachingWeeks} teaching weeks</dd></div><div><dt className="text-xs font-bold uppercase text-muted-foreground">Delivery</dt><dd className="mt-1">{mode}</dd></div></dl> : null}
    </div>
    <DialogFooter><Button variant="ghost" onClick={() => step === 0 ? close(false) : setStep((value) => value - 1)}>{step === 0 ? "Cancel" : "Back"}</Button>{step < steps.length - 1 ? <Button onClick={() => setStep((value) => value + 1)}>Continue</Button> : <Button onClick={complete}>Create draft session</Button>}</DialogFooter>
  </DialogContent></Dialog>;
}
