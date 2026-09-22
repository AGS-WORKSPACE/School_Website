import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Target } from "lucide-react";
import { Button } from "@tau/ui/button";
import { SectionHeader } from "@/components/common/section-header";

export function AboutSection() {
  return (
    <section className="overflow-hidden py-20 sm:py-24 lg:py-28">
      <div className="container-site">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 lg:order-1">
            <div className="relative">
              <div className="relative aspect-video overflow-hidden rounded-2xl shadow-2xl shadow-navy/20">
                <Image src="/images/lecture-theatre.jpg" alt="Students learning at Nnamdi Azikiwe University" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-6 -right-4 hidden rounded-2xl border border-border bg-card p-5 shadow-xl sm:block lg:-right-8">
                <p className="font-display text-3xl font-extrabold text-medical">24/7</p>
                <p className="text-xs font-semibold text-muted-foreground">Learning access</p>
              </div>
              <div className="absolute -left-4 -top-5 hidden rounded-2xl bg-navy p-4 text-white shadow-xl lg:block">
                <p className="font-display text-2xl font-extrabold text-gold">One portal</p>
                <p className="text-xs font-semibold text-white/70">All your courses</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeader align="left" eyebrow="Welcome to NAU LMS" title="Learning built around your day" description="Access your registered courses, materials and academic updates from one place." className="mb-8" />
            <div className="space-y-6">
              <div className="flex gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-medical/10 text-medical"><Target className="size-6" /></span>
                <div><h3 className="font-display text-lg font-bold">Stay organised</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">See course materials, assignments and deadlines together.</p></div>
              </div>
              <div className="flex gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold"><Eye className="size-6" /></span>
                <div><h3 className="font-display text-lg font-bold">Learn at your pace</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Review available lessons and readings whenever you need them.</p></div>
              </div>
            </div>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild size="lg"><Link href="/faculties">Browse courses <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/support">Get LMS support</Link></Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
