import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { CTASection } from "@/components/common/cta-section";
import { Target, Eye, HeartPulse, Users } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Mission & Vision",
  description:
    "The mission and vision of Transatlantic University of Medicine and Health Sciences.",
  path: "/about/mission-vision",
});

const values = [
  { Icon: HeartPulse, title: "Compassion", description: "Care that begins with empathy and ends with excellence." },
  { Icon: Users, title: "Integrity", description: "Ethical practice, honest research, and transparent governance." },
  { Icon: Target, title: "Excellence", description: "Rigorous standards in teaching, research, and patient care." },
  { Icon: Eye, title: "Innovation", description: "Courage to explore new ways of teaching, treating, and discovering." },
];

const strategicPillars = [
  {
    title: "Academic Excellence",
    description: "Internationally benchmarked curricula, world-class facilities, and a faculty that publishes, practises, and teaches.",
  },
  {
    title: "Research & Innovation",
    description: "A thriving research culture that translates discovery into health impact for Nigeria and the world.",
  },
  {
    title: "Global Engagement",
    description: "Partnerships, electives, and exchange that make TAU graduates citizens of the global health community.",
  },
  {
    title: "Community Service",
    description: "A covenant with our host communities to improve health access and outcomes across Anambra State.",
  },
];

export default function MissionVisionPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-students.jpg"
        eyebrow="Mission & Vision"
        title="Purpose That Guides Everything"
        description="Our mission and vision define who we are, what we do, and why it matters."
        crumbs={[{ label: "About TAU", href: "/about" }, { label: "Mission & Vision" }]}
      />

      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <Reveal>
              <div className="flex h-full flex-col rounded-3xl border border-medical/20 bg-gradient-to-br from-medical/5 to-transparent p-10">
                <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-medical/10 text-medical">
                  <Target className="size-7" aria-hidden="true" />
                </span>
                <h2 className="font-display text-2xl font-extrabold tracking-tight">Our Mission</h2>
                <p className="mt-4 flex-1 text-pretty leading-relaxed text-muted-foreground">
                  To advance medical education, research, and innovation that transforms healthcare across
                  Nigeria, Africa, and the world — producing compassionate, clinically excellent, and
                  globally mobile health professionals.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex h-full flex-col rounded-3xl border border-gold/30 bg-gold/5 p-10">
                <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                  <Eye className="size-7" aria-hidden="true" />
                </span>
                <h2 className="font-display text-2xl font-extrabold tracking-tight">Our Vision</h2>
                <p className="mt-4 flex-1 text-pretty leading-relaxed text-muted-foreground">
                  To be Africa&apos;s leading institution for the health sciences — globally recognised for
                  excellence in education, discovery, and patient care.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Our Values"
            title="The Principles That Shape Us"
            description="Four values underpin every decision at Transatlantic University."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ Icon, title, description }) => (
              <StaggerItem key={title}>
                <div className="h-full rounded-2xl border border-border bg-card p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-medical to-navy text-white">
                    <Icon className="size-7" aria-hidden="true" />
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
            eyebrow="Strategy 2026–2030"
            title="Strategic Pillars"
            description="How TAU intends to achieve its mission over the next four years."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {strategicPillars.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 0.06}>
                <div className="flex h-full gap-5 rounded-2xl border border-border bg-card p-7">
                  <span className="font-display text-4xl font-extrabold text-medical/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{pillar.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <PlaceholderImage
                src="/images/placeholders/hero-students.jpg"
                alt="Students collaborating on campus"
                aspect="video"
                className="shadow-2xl shadow-navy/20"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <SectionHeader align="left" eyebrow="Our People" title="Purpose in Practice" className="mb-4" />
              <div className="prose-brand text-sm leading-relaxed sm:text-base">
                <p>
                  Mission statements only matter when they are lived. At TAU, that means early patient contact,
                  simulation-based education from the first year, community health outreach as part of the
                  curriculum, and research that serves real-world health needs.
                </p>
                <p>
                  It means scholarships that keep talent in the classroom, mentorship that meets every student
                  by name, and clinical placements where learners train alongside experienced practitioners.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Carry the TAU Mission Forward"
        description="Join a community driven by compassion, integrity, excellence, and innovation."
        primary={{ label: "Apply Today", href: "/admissions/apply" }}
        secondary={{ label: "Meet the Leadership", href: "/leadership" }}
      />
    </>
  );
}
