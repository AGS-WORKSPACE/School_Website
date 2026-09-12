"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { Textarea } from "@tau/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tau/ui/card";
import { cn } from "@/lib/utils";
import { publishedPrograms } from "@/data/programs";
import { faculties } from "@/data/faculties";
import { trackEvent } from "@/lib/analytics";

const contactSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(10, "Enter a valid phone number"),
  country: z.string().min(2, "Country is required"),
});

const educationSchema = z.object({
  programme: z.string().min(1, "Select a programme"),
  faculty: z.string().min(1, "Select a faculty"),
  qualification: z.string().min(2, "Enter your highest qualification"),
  grades: z.string().min(2, "Enter a brief summary of your grades"),
});

type ContactValues = z.infer<typeof contactSchema>;
type EducationValues = z.infer<typeof educationSchema>;

const steps = ["Contact Details", "Programme Choice", "Review"] as const;

export function ApplicationForm({ initialProgramme }: { initialProgramme?: string }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snapshot, setSnapshot] = useState<{ contact: ContactValues; education: EducationValues } | null>(null);

  const contact = useForm<ContactValues>({ resolver: zodResolver(contactSchema), mode: "onBlur", shouldFocusError: true });
  const selectedProgramme = publishedPrograms.find((program) => program.id === initialProgramme || program.slug === initialProgramme);
  const education = useForm<EducationValues>({
    resolver: zodResolver(educationSchema),
    mode: "onBlur",
    shouldFocusError: true,
    defaultValues: { programme: selectedProgramme?.id },
  });

  useEffect(() => {
    trackEvent("application_started", { surface: "application", programmeSlug: initialProgramme ?? "none" });
  }, [initialProgramme]);

  const handleNext = async () => {
    if (step === 0) {
      const valid = await contact.trigger();
      if (!valid) return;
    }
    if (step === 1) {
      const valid = await education.trigger();
      if (!valid) return;
    }
    setSnapshot({ contact: contact.getValues(), education: education.getValues() });
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("Application submitted!", {
        description: "Our admissions team will contact you within 24 hours.",
      });
    }, 1200);
  };

  if (submitted) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center p-10 text-center">
          <CheckCircle2 className="size-16 text-success" aria-hidden="true" />
          <CardTitle className="mt-6 text-2xl">Application Received</CardTitle>
          <CardDescription className="mt-3 max-w-md">
            Thank you, {snapshot?.contact.firstName}. Your application for the 2026/2027 session has been
            received. Our admissions team will be in touch within 24 hours with next steps.
          </CardDescription>
          <Button asChild className="mt-8" onClick={() => { window.location.reload(); }}>
            <a href="/admissions/apply">Submit Another Application</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Online Application</CardTitle>
        <CardDescription>
          2026/2027 intake · Transatlantic University of Medicine and Health Sciences
        </CardDescription>

        <ol className="mt-6 flex items-center gap-2" aria-label="Application progress">
          {steps.map((label, index) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  index < step ? "bg-success text-white" : index === step ? "bg-medical text-white" : "bg-muted text-muted-foreground",
                )}
                aria-current={index === step ? "step" : undefined}
              >
                {index < step ? <CheckCircle2 className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              <span className={cn("hidden text-xs font-semibold sm:block", index === step ? "text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
              {index < steps.length - 1 ? <span className="h-px flex-1 bg-border" aria-hidden="true" /> : null}
            </li>
          ))}
        </ol>
      </CardHeader>

      <CardContent className="p-6 pt-2 sm:p-8 sm:pt-4">
        {step === 0 ? (
          <form noValidate onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" placeholder="Ada" {...contact.register("firstName")} aria-invalid={!!contact.formState.errors.firstName} aria-describedby={contact.formState.errors.firstName ? "first-name-error" : undefined} />
                {contact.formState.errors.firstName ? (
                  <p id="first-name-error" className="text-xs font-medium text-destructive" role="alert">{contact.formState.errors.firstName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" placeholder="Okafor" {...contact.register("lastName")} aria-invalid={!!contact.formState.errors.lastName} aria-describedby={contact.formState.errors.lastName ? "last-name-error" : undefined} />
                {contact.formState.errors.lastName ? (
                  <p id="last-name-error" className="text-xs font-medium text-destructive" role="alert">{contact.formState.errors.lastName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...contact.register("email")} aria-invalid={!!contact.formState.errors.email} aria-describedby={contact.formState.errors.email ? "application-email-error" : undefined} />
                {contact.formState.errors.email ? (
                  <p id="application-email-error" className="text-xs font-medium text-destructive" role="alert">{contact.formState.errors.email.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" placeholder="+234 800 000 0000" {...contact.register("phone")} aria-invalid={!!contact.formState.errors.phone} aria-describedby={contact.formState.errors.phone ? "application-phone-error" : undefined} />
                {contact.formState.errors.phone ? (
                  <p id="application-phone-error" className="text-xs font-medium text-destructive" role="alert">{contact.formState.errors.phone.message}</p>
                ) : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="country">Country of Residence *</Label>
                <Input id="country" placeholder="Nigeria" {...contact.register("country")} aria-invalid={!!contact.formState.errors.country} aria-describedby={contact.formState.errors.country ? "country-error" : undefined} />
                {contact.formState.errors.country ? (
                  <p id="country-error" className="text-xs font-medium text-destructive" role="alert">{contact.formState.errors.country.message}</p>
                ) : null}
              </div>
            </div>
          </form>
        ) : null}

        {step === 1 ? (
          <form noValidate onSubmit={(event) => event.preventDefault()}>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="programme">Choose a Programme *</Label>
                <select
                  id="programme"
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...education.register("programme")}
                  aria-invalid={!!education.formState.errors.programme} aria-describedby={education.formState.errors.programme ? "application-programme-error" : undefined}
                >
                  <option value="">Select a programme…</option>
                  {publishedPrograms.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.degree} — {program.title}
                    </option>
                  ))}
                </select>
                {education.formState.errors.programme ? (
                  <p id="application-programme-error" className="text-xs font-medium text-destructive" role="alert">{education.formState.errors.programme.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty *</Label>
                <select
                  id="faculty"
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...education.register("faculty")}
                  aria-invalid={!!education.formState.errors.faculty} aria-describedby={education.formState.errors.faculty ? "application-faculty-error" : undefined}
                >
                  <option value="">Select a faculty…</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                  ))}
                </select>
                {education.formState.errors.faculty ? (
                  <p id="application-faculty-error" className="text-xs font-medium text-destructive" role="alert">{education.formState.errors.faculty.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Highest Qualification *</Label>
                <Input id="qualification" placeholder="e.g. WAEC, NECO, Bachelor's degree" {...education.register("qualification")} aria-invalid={!!education.formState.errors.qualification} aria-describedby={education.formState.errors.qualification ? "qualification-error" : undefined} />
                {education.formState.errors.qualification ? (
                  <p id="qualification-error" className="text-xs font-medium text-destructive" role="alert">{education.formState.errors.qualification.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="grades">Grades / Academic Summary *</Label>
                <Textarea id="grades" placeholder="Briefly summarise your results, e.g. 5 distinctions in…" {...education.register("grades")} aria-invalid={!!education.formState.errors.grades} aria-describedby={education.formState.errors.grades ? "grades-error" : undefined} />
                {education.formState.errors.grades ? (
                  <p id="grades-error" className="text-xs font-medium text-destructive" role="alert">{education.formState.errors.grades.message}</p>
                ) : null}
              </div>
            </div>
          </form>
        ) : null}

        {step === 2 ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-muted/40 p-6">
              <h3 className="font-display text-base font-bold">Review Your Application</h3>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-muted-foreground">Name</dt>
                  <dd className="mt-0.5 font-medium">{snapshot?.contact.firstName} {snapshot?.contact.lastName}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted-foreground">Email</dt>
                  <dd className="mt-0.5 font-medium">{snapshot?.contact.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted-foreground">Phone</dt>
                  <dd className="mt-0.5 font-medium">{snapshot?.contact.phone}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted-foreground">Country</dt>
                  <dd className="mt-0.5 font-medium">{snapshot?.contact.country}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted-foreground">Programme</dt>
                  <dd className="mt-0.5 font-medium">
                    {publishedPrograms.find((p) => p.id === snapshot?.education.programme)?.degree ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted-foreground">Faculty</dt>
                  <dd className="mt-0.5 font-medium">
                    {faculties.find((f) => f.id === snapshot?.education.faculty)?.name ?? "—"}
                  </dd>
                </div>
              </dl>
              <p className="mt-5 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
                By submitting this application you agree to be contacted by Transatlantic University admissions
                about your application. Documents will be requested in the next stage.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            disabled={step === 0}
          >
            <ArrowLeft aria-hidden="true" />
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Continue
              <ArrowRight aria-hidden="true" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
              {submitting ? "Submitting…" : "Submit Application"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
