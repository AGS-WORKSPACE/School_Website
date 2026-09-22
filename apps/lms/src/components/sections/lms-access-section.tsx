import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck, Headphones, ShieldCheck } from "lucide-react";
import { Button } from "@tau/ui/button";
import { SectionHeader } from "@/components/common/section-header";

const accessItems = [
  { Icon: CircleCheck, title: "Verify your account", description: "Activate access with your matriculation number and school email." },
  { Icon: BookOpen, title: "Open your courses", description: "Registered courses appear after your account is active." },
  { Icon: Headphones, title: "Get support", description: "Contact the LMS team when access or materials are missing." },
];

export function LmsAccessSection() {
  return (
    <section className="relative overflow-hidden bg-navy py-20 text-white sm:py-24 lg:py-28">
      <div className="bg-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="absolute -right-32 top-0 size-[28rem] rounded-full bg-medical/30 blur-3xl" aria-hidden="true" />
      <div className="absolute -left-32 bottom-0 size-[28rem] rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
      <div className="container-site relative">
        <SectionHeader light eyebrow="Getting started" title="Three steps to your course space" description="Activate your account, sign in and begin learning." />
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-5 sm:grid-cols-3">
            {accessItems.map(({ Icon, title, description }, index) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/10">
                <div className="flex items-center justify-between"><span className="flex size-11 items-center justify-center rounded-xl bg-medical/30 text-gold"><Icon className="size-5" /></span><span className="font-display text-3xl font-extrabold text-white/15">0{index + 1}</span></div>
                <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{description}</p>
              </article>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
            <ShieldCheck className="size-9 text-gold" aria-hidden="true" />
            <h3 className="mt-5 font-display text-2xl font-extrabold">Use your university account</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/65">Sign in with the details linked to your student or staff record.</p>
            <Button asChild variant="accent" className="mt-7 w-full"><Link href="/login/student">Continue to login <ArrowRight /></Link></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
