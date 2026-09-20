import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardCheck, FileText, Globe2, GraduationCap } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Button } from "@tau/ui/button";
import { Badge } from "@tau/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@tau/ui/accordion";
import { Card, CardContent } from "@tau/ui/card";
import { faqs } from "@/data/campus";

export const metadata: Metadata = generatePageMetadata({
  title: "Admissions",
  description:
    "Admissions at Nnamdi Azikiwe University — entry requirements, deadlines, how to apply, and frequently asked questions.",
  path: "/admissions",
});

const routes = [
  {
    Icon: GraduationCap,
    title: "Undergraduate Admissions",
    description: "MBBS, BDS, BSc Nursing, BPharm, and more — for school leavers and transfer students.",
    href: "/admissions#requirements",
  },
  {
    Icon: FileText,
    title: "Postgraduate Admissions",
    description: "Master's, PhD, residency, and fellowship applications for graduates and professionals.",
    href: "/postgraduate",
  },
  {
    Icon: Globe2,
    title: "International Students",
    description: "Visa guidance, English requirements, and support for students from abroad.",
    href: "/international",
  },
  {
    Icon: ClipboardCheck,
    title: "Entry Requirements",
    description: "O'Level, UTME, and post-UTME requirements for every programme.",
    href: "/admissions#requirements",
  },
];

const deadlines = [
  { intake: "2026/2027 Session", event: "Applications open", date: "1 May 2026", status: "Open" },
  { intake: "2026/2027 Session", event: "Early application deadline", date: "15 August 2026", status: "Open" },
  { intake: "2026/2027 Session", event: "Post-UTME screening", date: "22–26 August 2026", status: "Open" },
  { intake: "2026/2027 Session", event: "Final application deadline", date: "30 September 2026", status: "Open" },
  { intake: "2026/2027 Session", event: "Orientation week", date: "8 September 2026", status: "Upcoming" },
];

export default function AdmissionsPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-campus.jpg"
        eyebrow="Admissions"
        title="Your Journey Starts Here"
        description="A clear, transparent admissions process designed to help you take the next step toward a career in the health sciences."
        crumbs={[{ label: "Admissions" }]}
      >
        <Button asChild size="lg" variant="accent">
          <Link href="/admissions/apply">
            Start Your Application
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </PageHero>

      <Section>
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {routes.map(({ Icon, title, description, href }, index) => (
              <Reveal key={title} delay={index * 0.05}>
                <a
                  href={href}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-lg font-bold">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-medical">
                    Learn more
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="requirements" className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Requirements"
            title="Entry Requirements by Level"
            description="What you need to apply, whether you're coming from secondary school, a first degree, or professional practice."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            <Reveal>
              <Card className="h-full">
                <CardContent className="p-7">
                  <Badge variant="default" className="mb-4">Undergraduate</Badge>
                  <h3 className="font-display text-lg font-bold">School Leavers</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <li>• Five O&apos;Level credit passes (English, Maths, Biology, Chemistry, Physics)</li>
                    <li>• Competitive UTME score with programme as first choice</li>
                    <li>• NAU post-UTME screening and interview</li>
                    <li>• Medical fitness assessment</li>
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
            <Reveal delay={0.06}>
              <Card className="h-full">
                <CardContent className="p-7">
                  <Badge variant="accent" className="mb-4">Postgraduate</Badge>
                  <h3 className="font-display text-lg font-bold">Graduates & Professionals</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <li>• Relevant bachelor&apos;s degree (min. Second Class Lower)</li>
                    <li>• Academic transcripts and two references</li>
                    <li>• Research proposal for research degrees</li>
                    <li>• Departmental interview</li>
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
            <Reveal delay={0.12}>
              <Card className="h-full">
                <CardContent className="p-7">
                  <Badge variant="success" className="mb-4">International</Badge>
                  <h3 className="font-display text-lg font-bold">International Students</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <li>• Equivalent qualifications from recognised bodies</li>
                    <li>• English proficiency (IELTS 6.0 / equivalent)</li>
                    <li>• Valid passport and visa guidance</li>
                    <li>• International Excellence Award (25% tuition)</li>
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Deadlines"
            title="Key Dates — 2026/2027 Intake"
            description="Plan your application around these important dates."
          />
          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border bg-card">
            <div className="grid gap-4 border-b bg-muted/50 p-5 text-xs font-bold uppercase tracking-widest text-muted-foreground sm:grid-cols-[1fr_1fr_auto_auto]">
              <span>Intake</span>
              <span>Stage</span>
              <span>Date</span>
              <span>Status</span>
            </div>
            {deadlines.map((deadline) => (
              <div key={deadline.event} className="grid items-center gap-2 border-b p-5 text-sm last:border-0 sm:grid-cols-[1fr_1fr_auto_auto]">
                <span className="font-semibold">{deadline.intake}</span>
                <span className="text-muted-foreground">{deadline.event}</span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <CalendarDays className="size-4 text-medical" aria-hidden="true" />
                  {deadline.date}
                </span>
                <span>
                  <Badge variant={deadline.status === "Open" ? "success" : "outline"}>{deadline.status}</Badge>
                </span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="FAQs"
            title="Frequently Asked Questions"
            description="Answers to the questions we hear most often."
          />
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Questions? We're Here to Help"
        description="Our admissions team responds within 24 hours on business days."
        primary={{ label: "Contact Admissions", href: "/contact" }}
        secondary={{ label: "Apply Now", href: "/admissions/apply" }}
      />
    </>
  );
}
