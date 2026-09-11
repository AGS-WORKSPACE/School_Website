import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Gallery } from "@/components/common/gallery";
import { Card, CardContent } from "@tau/ui/card";
import { campusFacilities, gallery } from "@/data/campus";
import { Badge } from "@tau/ui/badge";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { Activity, Dumbbell, HeartHandshake, Music2, Newspaper, Palette, Users2 } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Student Life",
  description:
    "Clubs, societies, sports, and a vibrant campus community at Transatlantic University — where future healers become leaders.",
  path: "/student-life",
});

const clubs = [
  { Icon: HeartHandshake, name: "Medical Students' Association", description: "The student voice of the Faculty of Medicine — advocacy, welfare, and mentorship across all cohorts." },
  { Icon: Activity, name: "TAU Red Cross Society", description: "First aid training, blood drives, and community health outreaches across Anambra State." },
  { Icon: Microscope, name: "Biomedical Research Club", description: "Undergraduate-led research projects, journal clubs, and conference preparation." },
  { Icon: Music2, name: "Choir & Cultural Troupe", description: "Music, drama, and cultural performances that celebrate Nigeria's rich heritage." },
  { Icon: Palette, name: "Art & Design Society", description: "Visual arts, medical illustration, and design for students who think in pictures." },
  { Icon: Newspaper, name: "TAU Press & Media", description: "The student magazine, podcast, and campus newsroom telling the TAU story." },
  { Icon: Dumbbell, name: "Sports Clubs", description: "Football, basketball, athletics, volleyball, and table tennis teams that compete nationally." },
  { Icon: Users2, name: "International Students' Association", description: "A home away from home for students from across Africa and beyond." },
];

function Microscope(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className} aria-hidden="true">
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 1 0 0-14h-1" />
      <path d="M9 14h2" />
      <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
      <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
    </svg>
  );
}

export default function StudentLifePage() {
  const residential = campusFacilities.filter((f) => f.category === "Residential" || f.category === "Recreation");

  return (
    <>
      <PageHero image="/images/placeholders/hero-students.jpg"
        eyebrow="Student Life"
        title="Campus Life at TAU"
        description="Beyond the wards and lecture theatres lies a campus buzzing with sport, music, service, and friendship."
        crumbs={[{ label: "Student Life" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Clubs & Societies"
            title="Find Your People"
            description="With dozens of clubs and societies, every student can find — or found — a community."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {clubs.map(({ Icon, name, description }) => (
              <StaggerItem key={name}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="p-6">
                    <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-base font-bold">{name}</h3>
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
          <SectionHeader
            eyebrow="Recreation & Welfare"
            title="Life Beyond the Books"
            description="Facilities and services designed for your wellbeing, fitness, and rest."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {residential.map((facility) => (
              <Card key={facility.id} className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                <div className="relative overflow-hidden">
                  <PlaceholderImage
                    src={facility.image}
                    alt={facility.name}
                    aspect="auto"
                    className="h-52 rounded-none transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4">
                    <Badge variant="accent">{facility.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-bold">{facility.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{facility.description}</p>
                  {facility.hours ? <p className="mt-3 text-xs font-semibold text-medical">{facility.hours}</p> : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Campus Gallery"
            title="A Glimpse of Campus"
            description="Moments from everyday life at Transatlantic University."
          />
          <Gallery images={gallery} />
        </Container>
      </Section>

      <CTASection
        title="Begin Your TAU Story"
        description="Join a community that will shape who you become — as a clinician, a leader, and a person."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Campus Map", href: "/about/campus-map" }}
      />
    </>
  );
}
