import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { ArrowRight, Dna, HeartPulse, Leaf, Radiation, Stethoscope, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata({
  title: "Research Centres & Institutes",
  description:
    "TAU's research centres and institutes — dedicated hubs advancing neglected tropical diseases, cardiovascular health, nutrition, and more.",
  path: "/research/centres",
});

const centres = [
  {
    Icon: Dna,
    name: "Centre for Neglected Tropical Diseases",
    tagline: "Eliminating NTDs in West Africa",
    description:
      "Epidemiological surveillance, mass drug administration research, and community engagement targeting schistosomiasis, onchocerciasis, and lymphatic filariasis.",
    focus: ["Field epidemiology", "Genomic surveillance", "Health systems"],
  },
  {
    Icon: HeartPulse,
    name: "Institute of Cardiovascular & Metabolic Research",
    tagline: "From genes to heart health",
    description:
      "Investigating the genetic and lifestyle drivers of hypertension and diabetes in Igbo and broader Nigerian populations.",
    focus: ["Cardiovascular genomics", "Precision medicine", "Clinical trials"],
  },
  {
    Icon: Leaf,
    name: "Centre for Natural Products & Drug Discovery",
    tagline: "New leads from Nigerian biodiversity",
    description:
      "Screening medicinal plants for activity against drug-resistant pathogens and identifying novel compounds for chronic disease.",
    focus: ["Pharmacognosy", "Antimicrobial resistance", "Synthetic chemistry"],
  },
  {
    Icon: Radiation,
    name: "Centre for Health Data Science",
    tagline: "Turning data into decisions",
    description:
      "Machine learning, bioinformatics, and health informatics applied to clinical and public health data across Nigeria.",
    focus: ["AI in diagnostics", "Health informatics", "Predictive modelling"],
  },
  {
    Icon: UtensilsCrossed,
    name: "Centre for Nutrition & Maternal Health",
    tagline: "Nourishing mothers and children",
    description:
      "Community-based nutrition programmes, micronutrient research, and maternal health interventions in rural Anambra.",
    focus: ["Child nutrition", "Maternal outcomes", "Food fortification"],
  },
  {
    Icon: Stethoscope,
    name: "Centre for Simulation & Clinical Education Research",
    tagline: "Evidence for better training",
    description:
      "Studying how simulation, feedback, and assessment translate into safer clinical practice in low-resource settings.",
    focus: ["Simulation research", "Assessment science", "Patient safety"],
  },
];

export default function ResearchCentresPage() {
  return (
    <>
      <PageHero image="/images/placeholders/research-lab.jpg"
        eyebrow="Research Centres"
        title="Hubs of Discovery"
        description="Focused institutes where interdisciplinary teams pursue answers to the region's most pressing health challenges."
        crumbs={[{ label: "Research", href: "/research" }, { label: "Centres & Institutes" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Centres & Institutes"
            title="Research Groups That Deliver"
            description="Each centre combines basic science, clinical insight, and community partnership."
          />
          <StaggerContainer className="grid gap-6 lg:grid-cols-2">
            {centres.map(({ Icon, name, tagline, description, focus }) => (
              <StaggerItem key={name}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                        <Icon className="size-7" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-display text-xl font-bold leading-snug">{name}</h3>
                        <p className="mt-1 text-sm font-semibold text-medical">{tagline}</p>
                      </div>
                    </div>
                    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{description}</p>
                    <div className="mt-5 flex flex-wrap gap-2 border-t pt-5">
                      {focus.map((item) => (
                        <Badge key={item} variant="muted">{item}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <Reveal className="mt-12">
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-border bg-card p-8 sm:flex-row sm:items-center sm:p-10">
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight">Establish a Centre?</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Faculty-led proposals for new research centres are welcome and supported by the Office of Research.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-medical px-6 text-sm font-semibold text-white transition-all hover:bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Talk to the Research Office
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Join a Research Centre"
        description="Students, postdocs, and faculty collaborate across centres from day one."
        primary={{ label: "Funding Opportunities", href: "/research/funding" }}
        secondary={{ label: "Core Facilities", href: "/research/facilities" }}
      />
    </>
  );
}
