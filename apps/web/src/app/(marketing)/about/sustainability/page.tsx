import type { Metadata } from "next";
import { Leaf, Recycle, Sun, Droplets } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = generatePageMetadata({
  title: "Sustainability",
  description:
    "Transatlantic University's commitment to environmental sustainability across its campus and operations.",
  path: "/about/sustainability",
});

const initiatives = [
  { Icon: Sun, title: "Solar-Powered Campus", description: "A growing solar array supplies a rising share of campus electricity, with backup for clinical facilities." },
  { Icon: Droplets, title: "Water Stewardship", description: "Rainwater harvesting, borehole treatment, and grey-water reuse across hostels and grounds." },
  { Icon: Recycle, title: "Waste & Recycling", description: "Segregated waste streams, clinical waste protocols, and a campus-wide recycling programme." },
  { Icon: Leaf, title: "Green Grounds", description: "Tree-lined walkways, community gardens, and landscaping that cools the campus and supports local biodiversity." },
];

export default function SustainabilityPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-campus.jpg"
        eyebrow="Sustainability"
        title="A Campus That Cares for Tomorrow"
        description="From solar power to water stewardship, TAU is building sustainability into the way the University operates."
        crumbs={[{ label: "About TAU", href: "/about" }, { label: "Sustainability" }]}
      />

      <Section>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <SectionHeader align="left" eyebrow="Our Charter" title="Sustainability at the Core" className="mb-4" />
              <div className="prose-brand text-sm leading-relaxed sm:text-base">
                <p>
                  The TAU Sustainability Charter commits the University to measurable reductions in energy use,
                  water consumption, and waste — while embedding environmental thinking in teaching, research,
                  and campus operations.
                </p>
                <p>
                  As a health sciences institution, we recognise the deep connection between the health of the
                  planet and the health of its people. Sustainability is not an add-on; it is part of how we
                  train the next generation of healthcare leaders.
                </p>
                <p>
                  Located in <strong>{siteConfig.location.town}, {siteConfig.location.state}</strong>, the campus
                  is designed around pedestrian-friendly pathways, natural ventilation, and green spaces.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="grid gap-6 sm:grid-cols-2">
                {initiatives.map(({ Icon, title, description }) => (
                  <div key={title} className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-success/10 text-success">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-base font-bold">{title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Progress"
            title="Sustainability by the Numbers"
            description="Tangible progress across our campus."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "35%", label: "of campus electricity from solar" },
              { value: "100%", label: "of clinical waste safely treated" },
              { value: "1,500+", label: "trees planted since 2019" },
              { value: "-40%", label: "water use per student since 2021" },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="rounded-2xl border border-border bg-card p-7 text-center">
                  <p className="font-display text-4xl font-extrabold text-success">{stat.value}</p>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <CTASection
        title="Learn in a Campus That Cares"
        description="Join a community committed to the health of people and planet."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Campus Map & Facilities", href: "/about/campus-map" }}
      />
    </>
  );
}
