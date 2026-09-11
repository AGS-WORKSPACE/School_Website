import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { Building2, FlaskConical, Handshake, Lightbulb, Rocket, Stethoscope } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata({
  title: "Innovation & Partnerships",
  description:
    "Translate TAU research into real-world impact — devices, diagnostics, startups, and clinical partnerships.",
  path: "/research/innovation",
});

const stories = [
  { Icon: Stethoscope, title: "NeoWatch", description: "A low-cost neonatal monitor for rural clinics, developed by students and faculty and now in field trials across Anambra.", status: "Field trials" },
  { Icon: Lightbulb, title: "NTD Surveillance Platform", description: "A data platform transforming community NTD surveillance into national policy guidance.", status: "Policy adoption" },
  { Icon: FlaskConical, title: "Antimicrobial Screening Library", description: "A screened library of Nigerian medicinal plants, licensed to pharmaceutical partners.", status: "Licensed" },
];

export default function InnovationPage() {
  return (
    <>
      <PageHero image="/images/placeholders/innovation-center.jpg"
        eyebrow="Innovation & Partnerships"
        title="From Lab to Life"
        description="We don't just publish — we translate. TAU innovations are changing practice in clinics and communities."
        crumbs={[{ label: "Research", href: "/research" }, { label: "Innovation Partnerships" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Innovation Stories"
            title="Ideas Making Impact"
            description="Flagship innovations born from TAU research and now moving toward the real world."
          />
          <StaggerContainer className="grid gap-6 md:grid-cols-3">
            {stories.map(({ Icon, title, description, status }) => (
              <StaggerItem key={title}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="flex h-full flex-col p-7">
                    <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-lg font-bold">{title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                    <Badge variant="accent" className="mt-4 w-fit">{status}</Badge>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="How We Partner"
            title="Collaboration Models"
            description="Flexible pathways for industry, government, and academia to work with TAU."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { Icon: Building2, title: "Sponsored Research", description: "Commission targeted research on your most pressing questions with dedicated TAU teams." },
              { Icon: Handshake, title: "Technology Licensing", description: "License TAU-owned IP — from screening libraries to medical devices — for commercial development." },
              { Icon: Rocket, title: "Startup Incubation", description: "Spin out TAU research through the Innovation Hub's incubation and accelerator programmes." },
            ].map(({ Icon, title, description }) => (
              <StaggerItem key={title}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="p-7 text-center">
                    <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-medical to-navy text-white">
                      <Icon className="size-7" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <Reveal className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full bg-medical px-8 text-sm font-semibold text-white transition-all hover:bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Propose a Partnership
            </Link>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Partner With the Innovation Hub"
        description="Together, we can bring the next breakthrough to the patients who need it most."
        primary={{ label: "Get in Touch", href: "/contact" }}
        secondary={{ label: "Research Centres", href: "/research/centres" }}
      />
    </>
  );
}
