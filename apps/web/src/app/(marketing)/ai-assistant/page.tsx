import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { AiAssistantChat } from "@/components/sections/ai-assistant-chat";
import { CalendarCheck2, FileSearch, FlaskConical, Languages, ShieldCheck, Timer } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "AI Assistant",
  description:
    "Meet the NAU Virtual Assistant — 24/7 answers on admissions, programmes, tuition, campus life, and research.",
  path: "/ai-assistant",
});

const capabilities = [
  { Icon: Timer, title: "Instant Answers", description: "Get accurate responses in seconds — no queues, no office hours." },
  { Icon: CalendarCheck2, title: "Admissions Guidance", description: "Deadlines, requirements, and application steps explained step by step." },
  { Icon: FileSearch, title: "Document Help", description: "Understand what to prepare, from WAEC results to international transcripts." },
  { Icon: FlaskConical, title: "Research Insights", description: "Discover research centres, publications, and funding opportunities." },
  { Icon: Languages, title: "Multilingual", description: "Conversations in English, Igbo, Yoruba, and Hausa." },
  { Icon: ShieldCheck, title: "Private by Design", description: "Your questions are handled confidentially and never shared with third parties." },
];

export default function AiAssistantPage() {
  return (
    <>
      <PageHero
        image="/images/placeholders/innovation-center.jpg"
        eyebrow="AI Assistant"
        title="Your Questions, Answered Instantly"
        description="Ask anything about NAU — from admissions deadlines to research funding — and get a clear answer, day or night."
        crumbs={[{ label: "AI Assistant" }]}
      >
        <div className="flex flex-wrap gap-3">
          <Badge variant="outlineLight">24/7 Availability</Badge>
          <Badge variant="outlineLight">Multilingual</Badge>
          <Badge variant="outlineLight">Free for Prospective Students</Badge>
        </div>
      </PageHero>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Try It Below"
            title="Ask the NAU Virtual Assistant"
            description="Type a question or tap a suggested prompt to begin a conversation."
          />
          <AiAssistantChat />
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="What It Can Do"
            title="A Smarter Way to Explore NAU"
            description="The assistant is trained on official university information so every answer is accurate and up to date."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(({ Icon, title, description }) => (
              <StaggerItem key={title}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="flex h-full flex-col p-7">
                    <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-lg font-bold">{title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Human Support Is Always a Click Away
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  The assistant handles the routine questions so our team can focus on what matters — your application,
                  your studies, and your care. When a conversation needs a human, it hands over seamlessly to the right
                  office.
                </p>
                <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <Badge variant="accent" className="mt-0.5 shrink-0">24h</Badge>
                    Human follow-up within one working day for complex enquiries.
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="accent" className="mt-0.5 shrink-0">Live</Badge>
                    Live chat with admissions during office hours (Monday–Friday, 8am–5pm).
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="accent" className="mt-0.5 shrink-0">Accessible</Badge>
                    Designed for screen readers, keyboard navigation, and low-bandwidth connections.
                  </li>
                </ul>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-white sm:p-10">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-light">Privacy First</span>
                <p className="mt-4 text-balance font-display text-2xl font-extrabold leading-snug">
                  &ldquo;Ask freely. Your questions stay between you and NAU.&rdquo;
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/75">
                  Conversations are never used for advertising, never sold, and are kept only to improve the accuracy of
                  our answers.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Still Have a Question?"
        description="Speak directly with the admissions team about your application, your programme, or your future at NAU."
        primary={{ label: "Contact Admissions", href: "/contact" }}
        secondary={{ label: "Browse Programmes", href: "/undergraduate-programs" }}
      />
    </>
  );
}
