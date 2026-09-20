import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { Biohazard, Dna, FlaskRound, Images, Microscope, Radio } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Core Facilities & Labs",
  description:
    "Shared research infrastructure at Nnamdi Azikiwe University — molecular labs, imaging suites, and the Clinical Simulation Centre.",
  path: "/research/facilities",
});

const labs = [
  { Icon: Dna, name: "Molecular Biology Lab", description: "PCR, sequencing, and genotyping platforms supporting genomics across all faculties.", equipment: ["Real-time PCR", "Sanger sequencing", "Nucleic acid extraction"] },
  { Icon: Microscope, name: "Cell Culture & Histology", description: "Clean-room cell culture facilities and full histopathology processing and microscopy.", equipment: ["Class II biosafety cabinets", "CO₂ incubators", "Cryostat & microtomes"] },
  { Icon: FlaskRound, name: "Analytical Chemistry Suite", description: "High-resolution analysis for drug discovery, natural products, and clinical chemistry.", equipment: ["HPLC / UPLC", "Mass spectrometry", "Spectrophotometry"] },
  { Icon: Biohazard, name: "Microbiology & BSL-3 Lab", description: "Biosafety level 3 containment for work with infectious agents and antimicrobial testing.", equipment: ["BSL-3 suites", "Antimicrobial susceptibility", "Culture & ID systems"] },
  { Icon: Images, name: "Imaging & 3D Facilities", description: "Preclinical imaging, digital pathology scanning, and 3D printing for research and training.", equipment: ["Digital slide scanner", "Ultrasound", "3D printers"] },
  { Icon: Radio, name: "Clinical Simulation Centre", description: "High-fidelity simulation and VR surgical suites used for both training and education research.", equipment: ["High-fidelity mannequins", "VR surgical suite", "Skill trainers"] },
];

export default function ResearchFacilitiesPage() {
  return (
    <>
      <PageHero image="/images/placeholders/research-lab.jpg"
        eyebrow="Research Infrastructure"
        title="World-Class Facilities"
        description="Shared core facilities that let any faculty member, postdoc, or student access serious science."
        crumbs={[{ label: "Research", href: "/research" }, { label: "Core Facilities & Labs" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Core Facilities"
            title="Infrastructure for Discovery"
            description="State-of-the-art laboratories and platforms, available to all six faculties."
          />
          <StaggerContainer className="grid gap-6 lg:grid-cols-2">
            {labs.map(({ Icon, name, description, equipment }) => (
              <StaggerItem key={name}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                        <Icon className="size-7" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-display text-xl font-bold leading-snug">{name}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2 border-t pt-5">
                      {equipment.map((item) => (
                        <Badge key={item} variant="muted">{item}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <Reveal className="mt-12">
            <div className="rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-white sm:p-10">
              <h2 className="font-display text-2xl font-extrabold">Access & Booking</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                Facilities are open to NAU researchers, students, and external collaborators through the core
                facility booking system. Instrument training is provided by our scientific officers.
              </p>
              <p className="mt-5 text-sm font-semibold text-gold">registrar@unizik.edu.ng</p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Book a Facility"
        description="Our scientific officers will match you with the right equipment and training."
        primary={{ label: "Contact the Lab Team", href: "/contact" }}
        secondary={{ label: "Research Centres", href: "/research/centres" }}
      />
    </>
  );
}
