import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { ProgramFinder } from "@/components/sections/program-finder";
import { CheckCircle2, ClipboardList, FileText, SearchCheck } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Undergraduate Programs",
  description:
    "Explore undergraduate programmes at Transatlantic University — MBBS, BDS, BSc Nursing, BPharm, and more. Find entry requirements and how to apply.",
  path: "/undergraduate-programs",
});

const applySteps = [
  { Icon: ClipboardList, title: "1. Submit Application", description: "Complete the online application and pay a non-refundable application fee." },
  { Icon: SearchCheck, title: "2. Screening & Interview", description: "Sit the post-UTME screening and attend an interview with your faculty." },
  { Icon: FileText, title: "3. Admission Offer", description: "Successful candidates receive an admission letter and registration details." },
  { Icon: CheckCircle2, title: "4. Resume & Begin", description: "Complete registration, move into halls, and begin your TAU journey." },
];

export default function UndergraduateProgramsPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-students.jpg"
        eyebrow="Study"
        title="Undergraduate Programs"
        description="Six faculties, one standard of excellence. Find the degree that starts your journey in the health sciences."
        crumbs={[{ label: "Undergraduate Programs" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Program Finder"
            title="Find Your Programme"
            description="Search, filter, and explore every programme TAU offers."
          />
          <ProgramFinder />
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="How to Apply"
            title="Four Steps to Admission"
            description="A transparent admissions process designed to help you succeed."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {applySteps.map(({ Icon, title, description }) => (
              <StaggerItem key={title}>
                <div className="relative h-full rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-medical to-navy text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-base font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <Reveal className="mt-10">
            <div className="rounded-3xl border border-border bg-card p-8">
              <h2 className="font-display text-xl font-extrabold">General Entry Requirements</h2>
              <div className="mt-4 grid gap-6 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
                <div>
                  <h3 className="font-bold text-foreground">O&apos;Level Requirements</h3>
                  <p className="mt-2">
                    Five credit passes in English Language, Mathematics, Biology, Chemistry, and Physics —
                    at one sitting for MBBS/BDS, and within two sittings for other programmes.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">UTME & Screening</h3>
                  <p className="mt-2">
                    A competitive UTME score with the programme as first choice, followed by the TAU
                    post-UTME screening and, where required, an interview and medical fitness assessment.
                  </p>
                </div>
              </div>
              <a
                href="/admissions"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Full Admissions Guide
              </a>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Ready to Start Your Degree?"
        description="Applications for the 2026/2027 session are open."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Tuition & Scholarships", href: "/tuition" }}
      />
    </>
  );
}
