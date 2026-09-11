import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { ArrowRight, BriefcaseBusiness, CalendarClock, Check, MapPin } from "lucide-react";
import Link from "next/link";
import { jobs } from "@/data/people";

export const metadata: Metadata = generatePageMetadata({
  title: "Careers at TAU",
  description:
    "Join a community of educators, researchers, and healthcare professionals at Transatlantic University.",
  path: "/careers",
});

const benefits = [
  "Competitive remuneration and pension",
  "Healthcare and dependant coverage",
  "Research time and seed funding",
  "Professional development budget",
  "International collaboration opportunities",
  "Supportive, mission-driven culture",
];

export default function CareersPage() {
  const openJobs = [...jobs].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  return (
    <>
      <PageHero image="/images/placeholders/hero-students.jpg"
        eyebrow="Careers"
        title="Build Your Career at TAU"
        description="Join Nigeria's fastest-growing university of medicine and health sciences."
        crumbs={[{ label: "Careers" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Open Positions"
            title="Current Vacancies"
            description="Applications are reviewed on a rolling basis until each deadline."
          />
          <StaggerContainer className="space-y-5">
            {openJobs.map((job) => (
              <StaggerItem key={job.id}>
                <div className="group rounded-3xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-navy/10 sm:p-8">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="accent">{job.type}</Badge>
                        <Badge variant="muted">{job.employmentType}</Badge>
                      </div>
                      <h2 className="mt-3 font-display text-xl font-bold transition-colors group-hover:text-primary">
                        {job.title}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-medical">{job.department}</p>
                      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{job.description}</p>
                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-medical" aria-hidden="true" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarClock className="size-3.5 text-medical" aria-hidden="true" />
                          Apply by {new Date(job.deadline).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <BriefcaseBusiness className="size-3.5 text-medical" aria-hidden="true" />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="shrink-0 lg:ml-6">
                      <Link href="/contact">
                        Apply
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-medical/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-medical">
                  Why TAU
                </span>
                <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                  A Career With Purpose
                </h2>
                <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
                  Work alongside faculty trained at the world&apos;s leading institutions, with the freedom to
                  build something new — a university shaping the future of African healthcare.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="grid gap-4 rounded-3xl border border-border bg-card p-8 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-sm font-medium">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                      <Check aria-hidden="true" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Don't See Your Role?"
        description="We're always looking for exceptional people. Send your CV — we'll be in touch when the right role opens."
        primary={{ label: "Send an Expression of Interest", href: "/contact" }}
        secondary={{ label: "Explore Research", href: "/research" }}
      />
    </>
  );
}
