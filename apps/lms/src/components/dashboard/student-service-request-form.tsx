"use client";

import * as React from "react";
import { AlertTriangle, FileUp, LockKeyhole, Send } from "lucide-react";
import type { StudentContext } from "@tau/student-dashboard";
import { Button } from "@tau/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tau/ui/dialog";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Textarea } from "@tau/ui/textarea";
import type { StudentRequest, StudentServiceCategory } from "@/data/student-services";

interface RequestFormConfig {
  topicLabel: string;
  topics: string[];
  referenceLabel: string;
  referencePlaceholder: string;
  detailsLabel: string;
  detailsPlaceholder: string;
  owner: string;
  sla: string;
  sensitive?: boolean;
}

const requestFormConfigs: Record<string, RequestFormConfig> = {
  "academic-support": {
    topicLabel: "Academic issue",
    topics: [
      "Registration or course enrolment",
      "Academic record or result",
      "Programme or progression advice",
      "Lecturer or course support",
      "Other academic question",
    ],
    referenceLabel: "Related course or record (optional)",
    referencePlaceholder: "For example, COS 101 or 2025/2026 registration",
    detailsLabel: "What would you like the academic support team to review?",
    detailsPlaceholder: "Describe the issue, what you expected and any action already taken.",
    owner: "Academic Support Desk",
    sla: "3 working days",
  },
  welfare: {
    topicLabel: "Support area",
    topics: [
      "General student welfare",
      "Counselling appointment",
      "Accommodation support",
      "Financial wellbeing guidance",
      "Other personal support",
    ],
    referenceLabel: "Preferred appointment format (optional)",
    referencePlaceholder: "For example, online, phone or in person",
    detailsLabel: "How can the welfare team support you?",
    detailsPlaceholder: "Share only what the support team needs to arrange the right response.",
    owner: "Student Welfare Team",
    sla: "1 working day",
    sensitive: true,
  },
  "disability-support": {
    topicLabel: "Accessibility request",
    topics: [
      "Learning materials or digital access",
      "Teaching or classroom adjustment",
      "Assessment or examination adjustment",
      "Campus access",
      "Review an existing accommodation",
    ],
    referenceLabel: "Course, examination or service affected (optional)",
    referencePlaceholder: "For example, COS 101 CBT or online lectures",
    detailsLabel: "What adjustment or support would help?",
    detailsPlaceholder: "Describe the barrier and the practical adjustment requested. You do not need to include a diagnosis.",
    owner: "Accessibility Support Team",
    sla: "3 working days",
    sensitive: true,
  },
  "career-support": {
    topicLabel: "Career service",
    topics: [
      "Career guidance",
      "CV or cover-letter review",
      "Internship or placement support",
      "Interview preparation",
      "Entrepreneurship guidance",
    ],
    referenceLabel: "Career area or organisation (optional)",
    referencePlaceholder: "For example, software engineering internships",
    detailsLabel: "What outcome would you like from the careers team?",
    detailsPlaceholder: "Tell us what stage you are at and the guidance you need.",
    owner: "Careers and Employability Office",
    sla: "5 working days",
  },
};

export function StudentServiceRequestForm({
  service,
  context,
  open,
  onOpenChange,
  onSubmitted,
}: {
  service?: StudentServiceCategory;
  context: StudentContext;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: (request: StudentRequest) => void;
}) {
  const config = service ? requestFormConfigs[service.id] : undefined;
  const [topic, setTopic] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [urgency, setUrgency] = React.useState<StudentRequest["urgency"]>("Routine");
  const [preferredContact, setPreferredContact] = React.useState<NonNullable<StudentRequest["preferredContact"]>>("Portal message");
  const [attachmentName, setAttachmentName] = React.useState("");
  const [confirmed, setConfirmed] = React.useState(false);

  if (!service || !config) return null;

  const activeService = service;
  const activeConfig = config;
  const valid = Boolean(topic && details.trim().length >= 20 && confirmed);

  function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;

    const submittedAt = new Intl.DateTimeFormat("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    const referenceCode = `SR-DEMO-${Date.now().toString(36).toUpperCase()}`;

    onSubmitted({
      id: referenceCode,
      type: activeService.label,
      subject: reference ? `${topic} · ${reference}` : topic,
      submittedAt,
      status: "Open",
      owner: activeConfig.owner,
      sla: urgency === "Urgent" ? "Priority review" : activeConfig.sla,
      nextAction: "Wait for a response in My requests.",
      urgency,
      preferredContact,
      attachmentName: attachmentName || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-6 py-5 pr-14">
          <DialogTitle>{service.label} request</DialogTitle>
          <DialogDescription>
            Submit a demonstration request for {context.displayName}. It will be saved only in this browser session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitRequest} className="space-y-5 px-6 pb-6">
          <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div><dt className="text-xs text-lms-muted">Student number</dt><dd className="font-semibold">{context.matriculationNumber}</dd></div>
              <div><dt className="text-xs text-lms-muted">Programme</dt><dd className="font-semibold">{context.programmeName}</dd></div>
              <div><dt className="text-xs text-lms-muted">Academic session</dt><dd className="font-semibold">{context.academicSession}</dd></div>
              <div><dt className="text-xs text-lms-muted">Assigned team</dt><dd className="font-semibold">{config.owner}</dd></div>
            </dl>
          </div>

          {config.sensitive ? (
            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
              <LockKeyhole className="mt-0.5 size-5 shrink-0" aria-hidden />
              <p><strong>Private request.</strong> Use only the information needed to arrange support. Sensitive details should be handled by the restricted support team.</p>
            </div>
          ) : null}

          <Field label={config.topicLabel} htmlFor="service-topic" required>
            <NativeSelect id="service-topic" value={topic} onChange={(event) => setTopic(event.target.value)} required>
              <option value="">Choose an option</option>
              {config.topics.map((option) => <option key={option}>{option}</option>)}
            </NativeSelect>
          </Field>

          <Field label={config.referenceLabel} htmlFor="service-reference">
            <Input id="service-reference" value={reference} onChange={(event) => setReference(event.target.value)} placeholder={config.referencePlaceholder} />
          </Field>

          <Field label="Urgency" htmlFor="service-urgency" hint="Urgency helps route the request; it does not guarantee an immediate response." required>
            <NativeSelect id="service-urgency" value={urgency} onChange={(event) => setUrgency(event.target.value as StudentRequest["urgency"])} required>
              <option value="Routine">Routine</option>
              <option value="Priority">Priority — time-sensitive</option>
              <option value="Urgent">Urgent — needs prompt attention</option>
            </NativeSelect>
          </Field>

          {urgency === "Urgent" ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="status">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
              <p>This demonstration form is not monitored and must not be used for an emergency. Use the university’s approved emergency route when immediate help is required.</p>
            </div>
          ) : null}

          <Field label={config.detailsLabel} htmlFor="service-details" hint="Enter at least 20 characters." required>
            <Textarea id="service-details" rows={5} value={details} onChange={(event) => setDetails(event.target.value)} placeholder={config.detailsPlaceholder} minLength={20} required />
          </Field>

          <Field label="Preferred reply channel" htmlFor="service-contact" required>
            <NativeSelect id="service-contact" value={preferredContact} onChange={(event) => setPreferredContact(event.target.value as NonNullable<StudentRequest["preferredContact"]>)} required>
              <option>Portal message</option>
              <option>Institutional email</option>
              <option>Phone call</option>
            </NativeSelect>
          </Field>

          <Field label="Supporting file (optional)" htmlFor="service-attachment" hint="The demo stores the file name only; it does not upload the file.">
            <div className="relative">
              <FileUp className="pointer-events-none absolute left-3 top-3 size-4 text-lms-muted" aria-hidden />
              <Input id="service-attachment" type="file" className="h-auto pl-10 file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:font-semibold" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(event) => setAttachmentName(event.target.files?.[0]?.name ?? "")} />
            </div>
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 text-sm">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 size-4 accent-primary" required />
            <span>I confirm this request is accurate and may be routed to the appropriate university support team.</span>
          </label>

          <DialogFooter className="gap-2 border-t border-border pt-5">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!valid}><Send className="size-4" aria-hidden />Submit request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, htmlFor, hint, required, children }: { label: string; htmlFor: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor}>{label}{required ? <span className="text-red-700" aria-hidden> *</span> : null}</Label>{children}{hint ? <p className="text-xs text-lms-muted">{hint}</p> : null}</div>;
}
