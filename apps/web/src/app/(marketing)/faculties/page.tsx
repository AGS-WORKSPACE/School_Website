import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { FacultyCard } from "@/components/cards/faculty-card";
import { CTASection } from "@/components/common/cta-section";
import { faculties } from "@/data/faculties";

export const metadata: Metadata = generatePageMetadata({
  title: "Faculties",
  description:
    "Explore the six faculties of Transatlantic University — Medicine, Dentistry, Nursing & Health Sciences, Pharmacy, Public Health, and Biomedical Sciences.",
  path: "/faculties",
});

export default function FacultiesPage() {
  return (
    <>
      <PageHero image="/images/placeholders/faculty-medicine.jpg"
        eyebrow="Academics"
        title="Our Faculties"
        description="Six faculties spanning the full spectrum of the health sciences — united by one standard of excellence."
        crumbs={[{ label: "Faculties" }]}
      />

      <Section>
        <Container>
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {faculties.map((faculty) => (
              <StaggerItem key={faculty.id}>
                <FacultyCard faculty={faculty} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <Reveal>
            <div className="grid gap-8 rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-white sm:p-12 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Not Sure Which Faculty Fits You?</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
                  Our admissions advisors can help you find the programme that matches your passion and goals.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-accent-foreground transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Talk to an Advisor
                </a>
                <a
                  href="/undergraduate-programs"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Browse Programmes
                </a>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Find Your Faculty"
        description="Medicine, dentistry, nursing, pharmacy, public health, or biomedical sciences — your future starts here."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Tuition & Scholarships", href: "/tuition" }}
      />
    </>
  );
}
