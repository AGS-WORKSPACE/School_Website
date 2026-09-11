import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { PublicationCard } from "@/components/cards/publication-card";
import { publications } from "@/data/people";
import { BookOpen, FileText, Quote } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Publications",
  description:
    "Peer-reviewed publications from Transatlantic University researchers — research shaping global health practice.",
  path: "/research/publications",
});

const highlights = [
  { Icon: FileText, value: "60+", label: "Publications in 2026" },
  { Icon: Quote, value: "1,400+", label: "Citations this year" },
  { Icon: BookOpen, value: "90%", label: "Peer-reviewed journals" },
];

export default function PublicationsPage() {
  const sorted = [...publications].sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <>
      <PageHero image="/images/placeholders/research-lab.jpg"
        eyebrow="Research Outputs"
        title="Publications & Scholarship"
        description="Peer-reviewed research from TAU investigators, published in leading international journals."
        crumbs={[{ label: "Research", href: "/research" }, { label: "Publications" }]}
      />

      <Section>
        <Container>
          <Reveal>
            <div className="grid gap-6 sm:grid-cols-3">
              {highlights.map(({ Icon, value, label }) => (
                <div key={label} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-medical/10 text-medical">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display text-2xl font-extrabold text-medical">{value}</p>
                    <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="mt-14">
            <SectionHeader
              eyebrow="Recent Publications"
              title="Latest Research Outputs"
              description="A selection of recent publications across our six faculties."
            />
            <StaggerContainer className="grid gap-6 md:grid-cols-2">
              {sorted.map((publication) => (
                <StaggerItem key={publication.id}>
                  <PublicationCard publication={publication} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          <Reveal className="mt-12">
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-border bg-card p-8 sm:flex-row sm:items-center sm:p-10">
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight">Submit Your Research</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Our research support team provides journal selection, formatting, and open-access guidance for every submission.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-medical px-6 text-sm font-semibold text-white transition-all hover:bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Research Support
              </Link>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Follow Our Research"
        description="Collaborate with our investigators on the questions shaping global health."
        primary={{ label: "Research Centres", href: "/research/centres" }}
        secondary={{ label: "Partner With Us", href: "/research/innovation" }}
      />
    </>
  );
}
