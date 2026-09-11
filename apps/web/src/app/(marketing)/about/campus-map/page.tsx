import type { Metadata } from "next";
import { Clock, MapPin, School, UtensilsCrossed, Dumbbell } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { CTASection } from "@/components/common/cta-section";
import { campusFacilities } from "@/data/campus";

export const metadata: Metadata = generatePageMetadata({
  title: "Campus Map & Facilities",
  description:
    "Explore the Transatlantic University campus in Umuchukwu, Anambra State — libraries, simulation labs, hostels, sports, and research facilities.",
  path: "/about/campus-map",
});

const zones = [
  { Icon: School, label: "Academic Zone", description: "Lecture theatres, faculty buildings, library, and simulation centre." },
  { Icon: Dumbbell, label: "Recreation Zone", description: "Sports complex, fitness centre, and playing fields." },
  { Icon: UtensilsCrossed, label: "Residential Zone", description: "Student hostels, dining halls, and the student centre." },
];

export default function CampusMapPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-campus.jpg"
        eyebrow="Campus & Facilities"
        title="A Campus Built for Learning and Living"
        description="Umuchukwu, Anambra State — a purpose-built campus where 8,000+ students learn, live, and lead."
        crumbs={[{ label: "About TAU", href: "/about" }, { label: "Campus Map & Facilities" }]}
      />

      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            <Reveal>
              <div className="relative h-full min-h-[400px] overflow-hidden rounded-3xl border border-border">
                <div className="absolute inset-0 bg-gradient-to-br from-ice to-medical/10 p-8" aria-hidden="true" />
                <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden="true" />
                <div className="relative flex h-full flex-col p-8">
                  <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <MapPin className="size-4 text-medical" aria-hidden="true" />
                    Interactive Campus Map
                  </div>
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-medical/30 bg-white/60 p-6 text-center">
                    <div>
                      <MapPin className="mx-auto size-10 text-medical/60" aria-hidden="true" />
                      <p className="mt-3 text-sm font-semibold text-navy">Campus Map Placeholder</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Interactive map loading in the presentation environment.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    {zones.map(({ Icon, label, description }) => (
                      <div key={label} className="flex items-start gap-3 rounded-xl bg-white/80 p-3 shadow-sm">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-medical/10 text-medical">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-navy">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <div>
              <SectionHeader
                align="left"
                eyebrow="Facilities"
                title="World-Class Facilities, Under One Roof"
                description="Every facility on campus exists to support rigorous academics and a vibrant student life."
                className="mb-8"
              />
              <StaggerContainer className="grid gap-5 sm:grid-cols-2">
                {campusFacilities.map((facility) => (
                  <StaggerItem key={facility.id}>
                    <div className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                      <PlaceholderImage
                        src={facility.image}
                        alt={facility.name}
                        aspect="video"
                        className="rounded-none"
                      />
                      <div className="p-5">
                        <h3 className="font-display text-base font-bold transition-colors group-hover:text-primary">
                          {facility.name}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {facility.description}
                        </p>
                        {facility.hours ? (
                          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-medical">
                            <Clock className="size-3.5" aria-hidden="true" />
                            {facility.hours}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <Reveal>
            <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
              <h2 className="font-display text-2xl font-extrabold">Getting to Campus</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Transatlantic University is located in Umuchukwu, Anambra State — approximately 30 minutes
                from the Onitsha–Enugu expressway. Regular shuttle services run between campus and the
                nearest major transport hubs. Contact admissions for detailed directions and transport help.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
                  <MapPin className="size-3.5 text-medical" aria-hidden="true" />
                  Umuchukwu, Anambra State, Nigeria
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
                  <Clock className="size-3.5 text-medical" aria-hidden="true" />
                  Campus tours: Mon–Fri, 9 AM – 4 PM
                </span>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Visit TAU and See It for Yourself"
        description="Arrange a campus tour through the admissions office and experience Umuchukwu first-hand."
        primary={{ label: "Book a Tour", href: "/contact" }}
        secondary={{ label: "Apply Now", href: "/admissions/apply" }}
      />
    </>
  );
}
