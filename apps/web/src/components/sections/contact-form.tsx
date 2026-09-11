"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { Textarea } from "@tau/ui/textarea";

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email address"),
  topic: z.string().min(1, "Please choose a topic"),
  message: z.string().min(10, "Please write a message of at least 10 characters"),
});

type Values = z.infer<typeof schema>;

export function ContactForm() {
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur" });

  const onSubmit = (values: Values) => {
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      toast.success("Message sent!", {
        description: `Thank you, ${values.name}. Our team will reply within 24 hours.`,
      });
      reset();
    }, 1200);
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" placeholder="Ada Okafor" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name ? <p className="text-xs font-medium text-destructive" role="alert">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email ? <p className="text-xs font-medium text-destructive" role="alert">{errors.email.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic">Topic *</Label>
        <select
          id="topic"
          className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register("topic")}
          aria-invalid={!!errors.topic}
        >
          <option value="">Choose a topic…</option>
          <option value="Admissions">Admissions & Applications</option>
          <option value="Tuition">Tuition & Scholarships</option>
          <option value="Research">Research & Partnerships</option>
          <option value="Careers">Careers</option>
          <option value="Giving">Giving & Donations</option>
          <option value="Other">Other Enquiry</option>
        </select>
        {errors.topic ? <p className="text-xs font-medium text-destructive" role="alert">{errors.topic.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          placeholder="How can we help you?"
          rows={5}
          {...register("message")}
          aria-invalid={!!errors.message}
        />
        {errors.message ? <p className="text-xs font-medium text-destructive" role="alert">{errors.message.message}</p> : null}
      </div>

      <Button type="submit" size="lg" disabled={sending} className="w-full sm:w-auto">
        {sending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
        {sending ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
