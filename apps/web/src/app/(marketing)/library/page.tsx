import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Card, CardContent } from "@tau/ui/card";
import { Button } from "@tau/ui/button";
import { BookOpen, BookMarked, Clock3, ExternalLink, Library as LibraryIcon, Laptop, Search, Users } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata({
  title: "Medical Library",
  description:
    "NAU's 24/7 medical library — 80,000+ e-journals, 40,000 print volumes, research support, and quiet study spaces.",
  path: "/library",
});

const services = [
  { Icon: Laptop, title: "E-Journals & Databases", description: "Unlimited access to PubMed, Cochrane, ScienceDirect, and 80,000+ e-journals from any device on campus or off." },
  { Icon: BookOpen, title: "Course Textbooks", description: "Core and recommended texts for every programme, with a 2-hour loan collection for high-demand titles." },
  { Icon: BookMarked, title: "Rare & Historical Collections", description: "A growing archive of medical texts, faculty theses, and the founding documents of the University." },
  { Icon: Search, title: "Research Support", description: "Librarians specialising in systematic reviews, reference management, and literature searching by appointment." },
  { Icon: Users, title: "Study Rooms & Carrels", description: "Bookable group study rooms, quiet floors, and 40 individual research carrels for deep work." },
  { Icon: Clock3, title: "24/7 Access", description: "Registered students enjoy round-the-clock access with secure entry, staffed helpdesk, and after-hours study." },
];

const stats = [
  { value: "80,000+", label: "E-journals" },
  { value: "40,000", label: "Print volumes" },
  { value: "24/7", label: "Access hours" },
  { value: "40", label: "Research carrels" },
];

export default function LibraryPage() {
  return (
    <>
      <PageHero image="/images/placeholders/campus-library.jpg"
        eyebrow="Medical Library"
        title="The Heart of Academic Life"
        description="A digital-first, 24/7 library built for deep study, groundbreaking research, and lifelong learning."
        crumbs={[{ label: "Medical Library" }]}
      />

      <Section>
        <Container>
          <Reveal>
            <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
              <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="font-display text-3xl font-extrabold text-medical sm:text-4xl">{stat.value}</dd>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <div className="mt-14">
            <SectionHeader
              eyebrow="Services & Resources"
              title="Everything You Need to Succeed"
              description="From your first anatomy textbook to your final systematic review — we're with you at every stage."
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
            </StaggerContainer>
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-medical/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-medical">
                  <LibraryIcon className="size-4" aria-hidden="true" />
                  Library Catalogue
                </span>
                <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Search the Catalogue
                </h2>
                <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
                  Search 120,000+ physical and digital resources from anywhere. Place holds, extend loans,
                  and access full-text e-resources with your student credentials.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/search">
                      Search the Catalogue
                      <ExternalLink aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/downloads">Library Guides & Downloads</Link>
                  </Button>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-white sm:p-10">
                <h3 className="font-display text-xl font-bold">Opening Hours</h3>
                <dl className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between border-b border-white/15 pb-4">
                    <dt>Monday – Saturday</dt>
                    <dd className="font-semibold">24 hours</dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/15 pb-4">
                    <dt>Sunday</dt>
                    <dd className="font-semibold">12:00 PM – 10:00 PM</dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/15 pb-4">
                    <dt>Helpdesk</dt>
                    <dd className="font-semibold">7:00 AM – 10:00 PM</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Exam Periods</dt>
                    <dd className="font-semibold">Extended 24/7</dd>
                  </div>
                </dl>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Ready to Begin?"
        description="Your library card is your gateway to a world-class medical education."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Student Life", href: "/student-life" }}
      />
    </>
  );
}
