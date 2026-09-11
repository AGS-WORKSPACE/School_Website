import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Globe2, Landmark, Users } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { Button } from "@tau/ui/button";
import { CTASection } from "@/components/common/cta-section";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = generatePageMetadata({
  title: "Overview & History",
  description:
    "Learn about Transatlantic University — its founding, history, and evolution into a leading private medical university in Umuchukwu, Anambra State, Nigeria.",
  path: "/about",
});

const pillars = [
  {
    Icon: Landmark,
    title: "Founded on Vision",
    description:
      "Established in 2015 by Dr. Godwin Maduka — a Nigerian-American physician and philanthropist — to make world-class medical education accessible in Nigeria.",
  },
  {
    Icon: Users,
    title: "Built for Students",
    description:
      "Every policy, facility, and programme is designed around a single mission: developing compassionate, clinically excellent health professionals.",
  },
  {
    Icon: Globe2,
    title: "Global by Design",
    description:
      "International faculty, worldwide clinical electives, and research partnerships connect TAU students to the global health community.",
  },
  {
    Icon: BadgeCheck,
    title: "Accredited Excellence",
    description:
      "Fully accredited by the NUC, with professional programmes recognised by the MDCN, NMCN, and PCN.",
  },
];

const timeline = [
  { year: "2015", title: "University Founded", description: "TAU opens its doors in Umuchukwu with the Faculties of Medicine, Dentistry, and Nursing & Health Sciences." },
  { year: "2016", title: "Biomedical Sciences & Facilities Growth", description: "The Faculty of Biomedical Sciences launches alongside new research laboratories and the first student hostels." },
  { year: "2017", title: "Faculty of Pharmacy Established", description: "The BPharm and PharmD programmes commence, anchored by a network of pharmaceutical science laboratories." },
  { year: "2018", title: "Faculty of Public Health", description: "The Faculty of Public Health opens, broadening TAU's reach across the health sciences." },
  { year: "2022", title: "Simulation Centre & Innovation Hub", description: "A state-of-the-art Clinical Simulation Centre and the TAU Innovation Hub are inaugurated." },
  { year: "2026", title: "Global Recognition", description: "International partnerships, landmark research publications, and 100% licensure pass rates cement TAU's reputation." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-campus.jpg"
        eyebrow="About TAU"
        title="Transatlantic University of Medicine and Health Sciences"
        description="A private medical institution in Umuchukwu, Anambra State, Nigeria — founded by Nigerian-American physician and philanthropist Dr. Godwin Maduka."
        crumbs={[{ label: "About TAU" }]}
      />

      <Section>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <PlaceholderImage
                src="/images/placeholders/hero-campus.jpg"
                alt="Transatlantic University campus"
                aspect="video"
                className="shadow-2xl shadow-navy/20"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <SectionHeader
                align="left"
                eyebrow="Our Story"
                title="A University With a Mission of Healing"
                description=""
                className="mb-6"
              />
              <div className="prose-brand text-sm leading-relaxed sm:text-base">
                <p>
                  Transatlantic University was founded on a deeply held conviction: that Nigerian students
                  deserve a medical education that matches the best in the world. Established in {siteConfig.location.town},{" "}
                  {siteConfig.location.state}, the University bears the full name{" "}
                  <strong>{siteConfig.officialName}</strong>.
                </p>
                <p>
                  Its founder, <strong>Dr. Godwin Maduka</strong>, is a Nigerian-American physician and
                  philanthropist whose career spans continents. His vision for TAU is simple and bold —{" "}
                  <strong>train the next generation of African health leaders who can practise, teach, and lead anywhere on earth.</strong>
                </p>
                <p>
                  Today, TAU is home to more than 8,000 students across six faculties, supported by 400+
                  academic staff and state-of-the-art simulation and research facilities.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/about/mission-vision">
                    Mission & Vision
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/about/history">Full History</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Foundations"
            title="What TAU Stands For"
            description="Four pillars guide everything the University does."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map(({ Icon, title, description }) => (
              <StaggerItem key={title}>
                <div className="h-full rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Timeline"
            title="Milestones in Our Journey"
            description="From founding to global recognition — key moments in TAU's history."
          />
          <div className="mx-auto max-w-3xl">
            <ol className="relative space-y-10 border-l-2 border-medical/20 pl-8">
              {timeline.map((item) => (
                <Reveal key={item.year}>
                  <li className="relative">
                    <span className="absolute -left-[41px] top-1 size-4 rounded-full border-4 border-medical bg-card" aria-hidden="true" />
                    <span className="font-display text-sm font-extrabold text-medical">{item.year}</span>
                    <h3 className="mt-1 font-display text-lg font-bold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            <Reveal>
              <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-8">
                <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <Landmark className="size-6" aria-hidden="true" />
                </span>
                <h3 className="font-display text-2xl font-extrabold">Explore the University</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  Discover our faculties, programmes, research, and campus facilities.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/faculties">Faculties</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/undergraduate-programs">Programmes</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/about/campus-map">Campus Facilities</Link>
                  </Button>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex h-full flex-col rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-white">
                <h3 className="font-display text-2xl font-extrabold">Visit Our Campus</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/75">
                  {siteConfig.location.address}. Campus tours can be arranged through the admissions office.
                </p>
                <div className="mt-6">
                  <Button asChild variant="accent" size="sm">
                    <Link href="/contact">
                      Contact Us
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Begin Your Story at TAU"
        description="Join a community of 8,000+ students dedicated to advancing healthcare in Nigeria and beyond."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Explore Programmes", href: "/undergraduate-programs" }}
      />
    </>
  );
}
