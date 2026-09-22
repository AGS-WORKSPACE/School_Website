import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@tau/ui/button";

export function CtaSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-light to-medical px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="bg-grid absolute inset-0 opacity-70" aria-hidden="true" />
          <div className="absolute -left-20 -top-20 size-72 rounded-full bg-medical/40 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -right-20 size-72 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">Ready to start learning?</h2>
            <p className="mt-5 text-pretty text-base leading-relaxed text-white/75 sm:text-lg">Verify your account or sign in to access your registered courses.</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" variant="accent"><Link href="/login/student">Student Login <ArrowRight aria-hidden="true" /></Link></Button>
              <Button asChild size="lg" variant="outlineLight"><Link href="/login/student?verify=1">Verify account</Link></Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
