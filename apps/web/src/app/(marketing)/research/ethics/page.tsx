import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Card, CardContent } from "@tau/ui/card";
import { ClipboardCheck, FileCheck2, ScrollText, ShieldCheck, UsersRound } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Research Ethics Board",
  description:
    "Independent ethical oversight for all human and animal research at Nnamdi Azikiwe University.",
  path: "/research/ethics",
});

const principles = [
  { Icon: ShieldCheck, title: "Respect for Persons", description: "Autonomy, informed consent, and special protections for vulnerable participants." },
  { Icon: ClipboardCheck, title: "Beneficence", description: "Research that maximises benefit and minimises harm for participants and communities." },
  { Icon: UsersRound, title: "Justice", description: "Fair distribution of the benefits and burdens of research across populations." },
  { Icon: FileCheck2, title: "Integrity", description: "Honest reporting, transparent methods, and no fabrication or falsification." },
  { Icon: ScrollText, title: "Compliance", description: "Full alignment with the NHREC Code and Nigerian research regulations." },
];

export default function EthicsPage() {
  return (
    <>
      <PageHero image="/images/placeholders/research-lab.jpg"
        eyebrow="Research Governance"
        title="Research Ethics Board"
        description="Independent, rigorous, and human-centred oversight for every research project at NAU."
        crumbs={[{ label: "Research", href: "/research" }, { label: "Research Ethics Board" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Our Mandate"
            title="Ethics Before Everything"
            description="No research involving human participants or animals proceeds without ethical approval."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map(({ Icon, title, description }) => (
              <StaggerItem key={title}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="p-7">
                    <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <Reveal>
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Submission Process</h2>
                <ol className="mt-6 space-y-5">
                  {[
                    "Prepare your protocol, participant documents, and consent forms.",
                    "Submit through the online ethics portal with all supporting documents.",
                    "The board reviews at its monthly sitting; expedited review for minimal-risk studies.",
                    "Receive a decision and an approval certificate valid for one year.",
                  ].map((step, index) => (
                    <li key={step} className="flex items-start gap-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-medical font-display text-sm font-extrabold text-white">
                        {index + 1}
                      </span>
                      <p className="pt-1 text-sm leading-relaxed text-muted-foreground">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-white sm:p-10">
                <h2 className="font-display text-xl font-extrabold">Board at a Glance</h2>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between border-b border-white/15 pb-4">
                    <span>Board sittings</span>
                    <span className="font-semibold">Monthly</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/15 pb-4">
                    <span>Review turnaround</span>
                    <span className="font-semibold">2–4 weeks</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/15 pb-4">
                    <span>Expedited review</span>
                    <span className="font-semibold">Available</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Registration</span>
                    <span className="font-semibold">NHREC-registered</span>
                  </div>
                </div>
                <p className="mt-6 text-sm text-white/75">Questions? Contact the ethics secretariat at registrar@unizik.edu.ng</p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Start Your Ethics Application"
        description="Our secretariat supports researchers through every step of the approval process."
        primary={{ label: "Contact the Board", href: "/contact" }}
        secondary={{ label: "Funding Opportunities", href: "/research/funding" }}
      />
    </>
  );
}
