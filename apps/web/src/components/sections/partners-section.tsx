import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { partners } from "@/data/people";

export function PartnersSection() {
  const doubled = [...partners, ...partners];

  return (
    <Section className="py-16 sm:py-20">
      <Container>
        <SectionHeader
          eyebrow="Global Network"
          title="Trusted by Partners Worldwide"
          description="Academic, clinical, and research partnerships that extend TAU's reach across four continents."
          className="mb-10"
        />
      </Container>

      <div className="relative overflow-hidden py-4" aria-label="Global partners">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" aria-hidden="true" />
        <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused]">
          {doubled.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              className="flex min-w-56 items-center justify-center gap-3 rounded-2xl border border-border bg-card px-7 py-5 shadow-sm transition-colors hover:border-medical/30"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-medical to-navy font-display text-xs font-extrabold text-white">
                {partner.name
                  .split(" ")
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")}
              </span>
              <span>
                <span className="block font-display text-sm font-bold leading-tight">{partner.name}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {partner.location} · {partner.type}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
