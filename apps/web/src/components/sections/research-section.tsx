import Link from "next/link";
import { ArrowRight, FlaskConical, Lightbulb, Microscope } from "lucide-react";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@tau/ui/button";
import { publications } from "@/data/people";

const researchHighlights = [
  {
    Icon: Microscope,
    title: "Core Facilities & Labs",
    description: "Molecular, cell culture, imaging, and analytical laboratories open to all researchers.",
  },
  {
    Icon: Lightbulb,
    title: "Innovation & Translation",
    description: "An innovation hub turning student and faculty ideas into medical technology.",
  },
  {
    Icon: FlaskConical,
    title: "Ethics-First Research",
    description: "Every study passes rigorous review by the NAU Research Ethics Board.",
  },
];

export function ResearchSection() {
  return (
    <Section className="relative overflow-hidden bg-navy text-white">
      <div className="bg-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="absolute -right-32 top-0 size-[28rem] rounded-full bg-medical/30 blur-3xl" aria-hidden="true" />
      <div className="absolute -left-32 bottom-0 size-[28rem] rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

      <Container className="relative">
        <SectionHeader
          light
          eyebrow="Research & Innovation"
          title="Discovery That Changes Lives"
          description="NAU researchers are addressing the health challenges that matter most — from neglected tropical diseases to affordable medical technology."
        />

        <StaggerContainer className="grid gap-4 sm:grid-cols-3">
          {[
            { value: 200, suffix: "+", label: "Peer-Reviewed Publications" },
            { value: 15, suffix: "+", label: "Active Research Centres" },
            { value: 45, suffix: "+", label: "Active Grants & Awards" },
            { value: 20, suffix: "+", label: "International Collaborations" },
          ].map((stat, index) => (
            <StaggerItem key={stat.label}>
              <StatCard {...stat} index={index} light className="bg-white/10" />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <Reveal>
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-2xl font-extrabold tracking-tight">Featured Publications</h3>
              <Button asChild variant="outlineLight" size="sm" className="shrink-0">
                <Link href="/research/publications">All Publications</Link>
              </Button>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {publications.slice(0, 4).map((publication) => (
                <div key={publication.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/10">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-gold/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-gold">
                      {publication.type}
                    </span>
                    <span className="text-xs text-white/50">{publication.year}</span>
                  </div>
                  <p className="font-display text-sm font-bold leading-snug">{publication.title}</p>
                  <p className="mt-2 text-xs font-medium text-gold-light">{publication.journal}</p>
                  <p className="mt-2 text-xs text-white/60">{publication.authors.join(", ")}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="space-y-4">
            <Reveal>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="font-display text-lg font-bold">Research Highlights</h3>
                <ul className="mt-4 space-y-4">
                  {researchHighlights.map(({ Icon, title, description }) => (
                    <li key={title} className="flex gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-medical/30 text-gold">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-white/60">{description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="accent" className="mt-6 w-full">
                  <Link href="/research">
                    Explore Research
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
