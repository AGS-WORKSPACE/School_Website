import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Card, CardContent } from "@tau/ui/card";
import { Button } from "@tau/ui/button";
import { BookOpen, Globe2, Handshake, Megaphone, Network } from "lucide-react";
import Link from "next/link";
import { testimonials } from "@/data/events";

export const metadata: Metadata = generatePageMetadata({
  title: "Alumni",
  description:
    "The TAU alumni network — a lifelong community of healers, leaders, and innovators across the world.",
  path: "/alumni",
});

const services = [
  { Icon: Network, title: "TAU Alumni Network", description: "A global directory and digital community connecting alumni across continents and cohorts." },
  { Icon: Handshake, title: "Mentorship Programme", description: "Current students are matched with alumni mentors in clinical, academic, and industry careers." },
  { Icon: BookOpen, title: "Lifelong Learning", description: "Free access to select online courses, lectures, and journal resources for life." },
  { Icon: Megaphone, title: "Career Services", description: "Job boards, interview coaching, and alumni-exclusive opportunities from partner employers." },
  { Icon: Globe2, title: "Regional Chapters", description: "Active alumni chapters across Nigeria, the UK, the US, and the Gulf region." },
];

const alumniStories = testimonials.filter((t) => t.type === "Alumni");

export default function AlumniPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-students.jpg"
        eyebrow="Alumni"
        title="The TAU Family, Forever"
        description="Our graduates are practising on every continent. Stay connected, give back, and grow with TAU."
        crumbs={[{ label: "Alumni" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Why Stay Connected"
            title="Benefits of the Network"
            description="Membership is automatic and lifelong — the moment you graduate, you become part of the TAU family."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ Icon, title, description }) => (
              <StaggerItem key={title}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="p-7">
                    <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
            <StaggerItem>
              <Card className="flex h-full flex-col items-start justify-center bg-gradient-to-br from-navy to-medical p-7 text-white">
                <h3 className="font-display text-lg font-bold">Update Your Details</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  Keep your contact information current so you never miss a reunion, newsletter, or opportunity.
                </p>
                <Button asChild variant="accent" size="sm" className="mt-5">
                  <Link href="/contact">Update Now</Link>
                </Button>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Alumni Stories"
            title="Where TAU Graduates Are"
            description="From Lagos to London, Houston to the Hague — hear from the people flying the TAU flag."
          />
          <StaggerContainer className="grid gap-6 md:grid-cols-2">
            {alumniStories.map((testimonial) => (
              <StaggerItem key={testimonial.id}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="p-8">
                    <div className="flex size-10 items-center justify-center rounded-full bg-gold/15 font-display text-lg font-extrabold text-gold">
                      &ldquo;
                    </div>
                    <blockquote className="mt-4 text-pretty text-base leading-relaxed text-foreground/85">
                      {testimonial.quote}
                    </blockquote>
                    <footer className="mt-5 border-t pt-4">
                      <p className="font-display text-base font-bold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </footer>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <CTASection
        title="Give Back to TAU"
        description="Support scholarships, research, and the next generation of healers."
        primary={{ label: "Make a Gift", href: "/giving" }}
        secondary={{ label: "Upcoming Events", href: "/events" }}
      />
    </>
  );
}
