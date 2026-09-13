import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { CTASection } from "@/components/common/cta-section";
import { FacilityCard } from "@/components/cards/facility-card";
import { campusFacilities } from "@/data/campus";

export const metadata: Metadata = generatePageMetadata({
  title: "Facilities",
  description: "Explore TAU facilities for learning, research, residence, recreation, and student wellbeing.",
  path: "/facilities",
});

export default function FacilitiesPage() {
  return (
    <>
      <PageHero
        image="/images/placeholders/hero-campus.jpg"
        eyebrow="Facilities"
        title="Spaces That Support Your Whole Journey"
        description="From clinical simulation and research laboratories to residence, dining, and recreation, discover the facilities that make campus life possible."
        crumbs={[{ label: "Facilities" }]}
      />
      <Section>
        <Container>
          <SectionHeader eyebrow="Facility Directory" title="Explore TAU Facilities" description="Browse facilities by purpose and open each profile for access and accessibility information." />
          {campusFacilities.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {campusFacilities.map((facility) => <FacilityCard key={facility.id} facility={facility} />)}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-center" role="status">
              <h2 className="font-display text-xl font-bold">Facility information is being updated</h2>
              <p className="mt-2 text-sm text-muted-foreground">Please contact the University for current facility information.</p>
            </div>
          )}
        </Container>
      </Section>
      <CTASection title="Need Help Finding a Facility?" description="Our team can help with directions, bookings, access arrangements, and visitor questions." primary={{ label: "Contact Us", href: "/contact" }} secondary={{ label: "Explore Campuses", href: "/campuses" }} />
    </>
  );
}
