"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { Textarea } from "@tau/ui/textarea";
import { publishedPrograms } from "@/data/programs";
import { submitEnquiry } from "@/services/enquiries";
import { trackEvent } from "@/lib/analytics";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().optional(),
  enquiryType: z.string().min(1, "Please choose an enquiry type"),
  programme: z.string().optional(),
  message: z.string().trim().min(10, "Please write a message of at least 10 characters"),
  consent: z.boolean().refine((value) => value, "Please agree to be contacted about your enquiry"),
  website: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function ContactForm({ initialProgramme }: { initialProgramme?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState<string>();
  const [submitError, setSubmitError] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    shouldFocusError: true,
    defaultValues: { programme: initialProgramme },
  });

  useEffect(() => {
    trackEvent("enquiry_started", { surface: "contact", programmeSlug: initialProgramme ?? "none" });
  }, [initialProgramme]);

  const onSubmit = async (values: Values) => {
    setSubmitError(false);
    try {
      const receipt = await submitEnquiry({
        name: values.name,
        email: values.email,
        phone: values.phone,
        enquiryType: values.enquiryType,
        programme: values.programme,
        message: values.message,
        consent: values.consent,
        spamToken: values.website,
      });
      setReference(receipt.reference);
      setSubmitted(true);
      trackEvent("enquiry_submitted", { enquiryType: values.enquiryType, hasProgramme: Boolean(values.programme), success: true });
      toast.success("Enquiry received", { description: "Our team will reply within 24 hours." });
      reset();
    } catch {
      setSubmitError(true);
      toast.error("We could not send your enquiry", { description: "Please try again or contact the relevant office directly." });
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-7" role="status" aria-live="polite">
        <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
        <h3 className="mt-4 font-display text-xl font-bold">Enquiry received</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Thank you. Our team will review your enquiry and reply within 24 hours.</p>
        <p className="mt-3 text-xs font-semibold text-muted-foreground">Reference: {reference}</p>
        <Button type="button" variant="outline" className="mt-6" onClick={() => { setSubmitted(false); setReference(undefined); }}>Send another enquiry</Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-describedby={submitError ? "enquiry-submit-error" : undefined}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name <span aria-hidden="true">*</span><span className="sr-only"> required</span></Label>
          <Input id="name" placeholder="Ada Okafor" {...register("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
          <FieldError id="name-error" message={errors.name?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address <span aria-hidden="true">*</span><span className="sr-only"> required</span></Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
          <FieldError id="email-error" message={errors.email?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number <span className="text-muted-foreground">(optional)</span></Label>
        <Input id="phone" type="tel" autoComplete="tel" placeholder="+234 800 000 0000" {...register("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} />
        <FieldError id="phone-error" message={errors.phone?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="enquiryType">Enquiry Type <span aria-hidden="true">*</span><span className="sr-only"> required</span></Label>
        <select id="enquiryType" className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...register("enquiryType")} aria-invalid={!!errors.enquiryType} aria-describedby={errors.enquiryType ? "enquiry-type-error" : undefined}>
          <option value="">Choose a topic…</option>
          <option value="Admissions">Admissions & Applications</option>
          <option value="Programme Enquiry">Programme enquiry</option>
          <option value="Tuition">Tuition & Scholarships</option>
          <option value="Research">Research & Partnerships</option>
          <option value="Careers">Careers</option>
          <option value="Giving">Giving & Donations</option>
          <option value="Other">Other enquiry</option>
        </select>
        <FieldError id="enquiry-type-error" message={errors.enquiryType?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="programme">Programme of Interest <span className="text-muted-foreground">(optional)</span></Label>
        <select id="programme" className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...register("programme")}>
          <option value="">Select a programme…</option>
          {publishedPrograms.map((program) => <option key={program.id} value={program.slug}>{program.degree} — {program.title}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message <span aria-hidden="true">*</span><span className="sr-only"> required</span></Label>
        <Textarea id="message" placeholder="How can we help you?" rows={5} {...register("message")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} />
        <FieldError id="message-error" message={errors.message?.message} />
      </div>

      <div className="hidden" aria-hidden="true"><Label htmlFor="website">Website</Label><Input id="website" tabIndex={-1} autoComplete="off" {...register("website")} /></div>
      <label htmlFor="consent" className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
        <input id="consent" type="checkbox" className="mt-1 size-4 rounded border-input accent-medical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...register("consent")} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-error" : undefined} />
        <span>I agree that the University may use my details to respond to this enquiry. <span aria-hidden="true">*</span><span className="sr-only"> required</span></span>
      </label>
      <FieldError id="consent-error" message={errors.consent?.message} />

      {submitError ? <p id="enquiry-submit-error" className="text-sm font-medium text-destructive" role="alert">We could not send your enquiry. Please try again.</p> : null}
      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
        {isSubmitting ? "Sending…" : "Send Enquiry"}
      </Button>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="text-xs font-medium text-destructive" role="alert">{message}</p> : null;
}
