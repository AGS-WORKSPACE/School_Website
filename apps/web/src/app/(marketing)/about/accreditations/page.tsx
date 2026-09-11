import type { Metadata } from "next";
import { BadgeCheck, FileCheck2, ShieldCheck, Trophy } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { accreditationBodies } from "@/data/leadership";

export const metadata: Metadata = generatePageMetadata({
  title: "Accreditations & Rankings",
  description:
    "The national accreditations, professional recognitions, and rankings of Transatlantic University of Medicine and Health Sciences.",
  path: "/about/accreditations",
});

const recognition = [
  { Icon: BadgeCheck, title: "NUC Fully Accredited", description: "All academic programmes hold full accreditation from the National Universities Commission." },
  { Icon: ShieldCheck, title: "MDCN Recognised", description: "The MBBS and BDS programmes satisfy the Medical and Dental Council of Nigeria for licensure." },
  { Icon: FileCheck2, title: "NMCN & PCN Recognised", description: "Nursing and pharmacy programmes align with national professional licensing requirements." },
  { Icon: Trophy, title: "Award-Winning Innovation", description: "TAU's Innovation Hub has won pan-African recognition for accessible medical technology." },
];

export default function AccreditationsPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-campus.jpg"
        eyebrow="Accreditations & Rankings"
        title="Recognition That Opens Doors"
        description="Full accreditation by Nigeria's national and professional regulatory bodies — so our degrees count everywhere."
        crumbs={[{ label: "About TAU", href: "/about" }, { label: "Accreditations & Rankings" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Regulatory Recognition"
            title="Accredited by the Bodies That Matter"
            description="TAU holds full institutional accreditation and its professional programmes are recognised by the responsible regulatory councils."
          />
          <div className="mx-auto max-w-4xl space-y-5">
            {accreditationBodies.map((body, index) => (
              <Reveal key={body.name} delay={index * 0.05}>
                <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold">{body.name}</h3>
                      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{body.scope}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge variant="success">{body.status}</Badge>
                      <span className="text-xs font-semibold text-muted-foreground">Since {body.year}</span>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Why Accreditation Matters"
            title="A Degree That Works for You"
            description="Accreditation protects your investment and your future."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recognition.map(({ Icon, title, description }) => (
              <StaggerItem key={title}>
                <div className="h-full rounded-2xl border border-border bg-card p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-medical to-navy text-white">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-base font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <div className="grid gap-8 rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-white sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                  Verification of Accreditation
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                  Employers and partner institutions can verify TAU&apos;s accreditation status directly with the
                  National Universities Commission or through our registrar&apos;s office.
                </p>
              </div>
              <a
                href="mailto:registrar@tau.edu.ng"
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-accent-foreground transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Request Verification
              </a>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Start on Accredited Ground"
        description="Join an institution whose degrees are recognised nationally and respected globally."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Tuition & Scholarships", href: "/tuition" }}
      />
    </>
  );
}
