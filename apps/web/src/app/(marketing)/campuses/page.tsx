import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { CTASection } from "@/components/common/cta-section";
import { CampusCard } from "@/components/cards/campus-card";
import { campuses } from "@/data/campuses";

export const metadata: Metadata = generatePageMetadata({
  title: "Campuses",
  description: "Explore Nnamdi Azikiwe University's campuses, locations, facilities, and visitor information.",
  path: "/campuses",
});

export default function CampusesPage() {
  return (
    <>
      <PageHero
        image="/images/placeholders/hero-campus.jpg"
        eyebrow="Our Campuses"
        title="Places Built for Learning and Living"
        description="Explore the locations where NAU students learn, research, connect, and grow."
        crumbs={[{ label: "Campuses" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Campus Directory"
            title="Find Your Place at NAU"
            description="Each campus profile includes location, facilities, accessibility information, and visitor contacts."
          />
          {campuses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {campuses.map((campus) => <CampusCard key={campus.id} campus={campus} />)}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-center" role="status">
              <h2 className="font-display text-xl font-bold">Campus information is being updated</h2>
              <p className="mt-2 text-sm text-muted-foreground">Please contact the University for current location information.</p>
            </div>
          )}
        </Container>
      </Section>

      <CTASection
        title="Plan a Visit to NAU"
        description="Our team can help arrange a campus tour and answer questions about visiting Awka."
        primary={{ label: "Contact Us", href: "/contact" }}
        secondary={{ label: "Apply Now", href: "/admissions/apply" }}
      />
    </>
  );
}
