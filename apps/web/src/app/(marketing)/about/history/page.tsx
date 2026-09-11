import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal } from "@/components/common/motion";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { Timeline } from "@/components/common/timeline";
import { CTASection } from "@/components/common/cta-section";

export const metadata: Metadata = generatePageMetadata({
  title: "History & Mission",
  description:
    "The history, founding, mission, and vision of Transatlantic University of Medicine and Health Sciences in Umuchukwu, Anambra State, Nigeria.",
  path: "/about/history",
});

const historyBlocks = [
  {
    title: "The Founding Vision",
    paragraphs: [
      "Transatlantic University was established in 2015 by Dr. Godwin Maduka, a Nigerian-American physician and philanthropist. After decades of practice and study across the United States, Dr. Maduka returned to Nigeria with a singular ambition: to build a medical university where Nigerian students would receive training comparable to the world's finest institutions — without leaving home.",
      "The University was founded in Umuchukwu, Anambra State, in the heartland of southeastern Nigeria. Its name reflects its ambition: 'Transatlantic' symbolises the bridge between African and Western traditions of excellence in medicine and science.",
    ],
  },
  {
    title: "Growth Into a Full University",
    paragraphs: [
      "TAU began with the Faculties of Medicine, Dentistry, and Nursing & Health Sciences. It has since grown into six faculties spanning the full spectrum of the health sciences, supported by high-fidelity simulation and research facilities, and an Innovation Hub.",
      "Today, more than 8,000 students from across Nigeria and the African continent call TAU home, guided by over 400 academic staff — many of them trained at leading universities worldwide.",
    ],
  },
  {
    title: "A Mission of Public Health",
    paragraphs: [
      "Beyond the classroom, TAU is deeply committed to the communities that surround it. Students and faculty regularly lead health screenings, vaccination drives, and health education programmes across Anambra State, bringing the University's mission to life.",
      "This commitment to community health is one of the reasons TAU has earned the trust of families, partner institutions, and health authorities across the region.",
    ],
  },
];

const milestones = [
  { date: "2015", title: "University Established", description: "TAU opens its doors in Umuchukwu." },
  { date: "2016", title: "Biomedical Sciences Launched", description: "The faculty and first research laboratories open." },
  { date: "2017", title: "Faculty of Pharmacy", description: "BPharm and PharmD programmes commence." },
  { date: "2018", title: "Faculty of Public Health", description: "The Faculty of Public Health is established." },
  { date: "2022", title: "Simulation & Innovation", description: "Simulation centre and innovation hub inaugurated." },
  { date: "2026", title: "Global Recognition", description: "Landmark research and 100% licensure pass rates." },
];

export default function HistoryPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-campus.jpg"
        eyebrow="History"
        title="From Vision to World-Class Institution"
        description="The story of how Transatlantic University grew from a founder's dream into one of Nigeria's leading private medical universities."
        crumbs={[{ label: "About TAU", href: "/about" }, { label: "History & Mission" }]}
      />

      <Section>
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-10">
              {historyBlocks.map((block, index) => (
                <Reveal key={block.title} delay={index * 0.05}>
                  <h2 className="font-display text-2xl font-extrabold tracking-tight">{block.title}</h2>
                  <div className="prose-brand mt-3 text-sm leading-relaxed sm:text-base">
                    {block.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="lg:sticky lg:top-28">
              <div className="rounded-3xl border border-border bg-ice p-6 dark:bg-muted/20">
                <h2 className="font-display text-lg font-extrabold">Key Milestones</h2>
                <Timeline items={milestones} />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <SectionHeader
                align="left"
                eyebrow="Mission & Vision"
                title="Why TAU Exists"
                className="mb-6"
              />
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-7">
                  <h3 className="font-display text-lg font-bold text-medical">Our Mission</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    To advance medical education, research, and innovation that transforms healthcare across
                    Nigeria, Africa, and the world — producing compassionate, clinically excellent, and
                    globally mobile health professionals.
                  </p>
                </div>
                <div className="rounded-2xl border border-gold/30 bg-gold/5 p-7">
                  <h3 className="font-display text-lg font-bold text-gold">Our Vision</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    To be Africa&apos;s leading institution for the health sciences — globally recognised for
                    excellence in education, discovery, and patient care.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <PlaceholderImage
                src="/images/placeholders/hero-students.jpg"
                alt="Students at Transatlantic University"
                aspect="video"
                className="shadow-2xl shadow-navy/20"
              />
            </Reveal>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Be Part of the TAU Story"
        description="Join a university founded on vision and built for the future of healthcare."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Meet Our Leadership", href: "/leadership" }}
      />
    </>
  );
}
