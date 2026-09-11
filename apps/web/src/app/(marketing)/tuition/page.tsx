import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Badge } from "@tau/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { scholarships, tuitionFees } from "@/data/campus";
import { Banknote, Building2, CreditCard, Wallet } from "lucide-react";
import { Card, CardContent } from "@tau/ui/card";

export const metadata: Metadata = generatePageMetadata({
  title: "Tuition & Scholarships",
  description:
    "Tuition fees, scholarships, financial aid, and payment methods at Transatlantic University.",
  path: "/tuition",
});

const paymentMethods = [
  { Icon: Banknote, title: "Bank Transfer", description: "Direct transfers to the University's official bank accounts with unique payment references." },
  { Icon: Building2, title: "Bank Deposit", description: "Deposits at any of our partner banks across Nigeria using your application ID." },
  { Icon: CreditCard, title: "Card Payment", description: "Secure online payments with Visa, Mastercard, and Verve cards through the portal." },
  { Icon: Wallet, title: "Instalment Plan", description: "Approved students may split tuition into two to four instalments per session." },
];

export default function TuitionPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-campus.jpg"
        eyebrow="Fees & Funding"
        title="Tuition & Scholarships"
        description="Transparent fees, generous scholarships, and flexible payment plans — because excellence should be accessible."
        crumbs={[{ label: "Tuition & Scholarships" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Fee Schedule"
            title="Tuition by Programme — 2026/2027"
            description="Tuition is payable per session. Miscellaneous fees cover accommodation, ICT, and student services where applicable."
          />
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-navy hover:bg-navy [&_th]:text-white">
                    <TableHead className="text-white">Programme</TableHead>
                    <TableHead className="text-white">Faculty</TableHead>
                    <TableHead className="text-white">Application Fee</TableHead>
                    <TableHead className="text-white">Tuition / Year</TableHead>
                    <TableHead className="text-white">Miscellaneous</TableHead>
                    <TableHead className="text-white">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tuitionFees.map((row) => (
                    <TableRow key={row.programme} className="hover:bg-muted/50">
                      <TableCell className="font-semibold">{row.programme}</TableCell>
                      <TableCell className="text-muted-foreground">{row.faculty}</TableCell>
                      <TableCell>{row.application}</TableCell>
                      <TableCell className="font-semibold text-medical">{row.tuition}</TableCell>
                      <TableCell className="text-muted-foreground">{row.miscellaneous}</TableCell>
                      <TableCell>{row.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Fees are reviewed annually and are subject to change. All figures are in Nigerian Naira (₦).
              International students may pay equivalent fees in US Dollars at the prevailing CBN rate.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Scholarships & Aid"
            title="Funding Your Education"
            description="TAU invests millions in scholarships every session. Find the award that fits you."
          />
          <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((scholarship) => (
              <StaggerItem key={scholarship.id}>
                <Card className="group flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="flex flex-1 flex-col p-7">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-lg font-bold transition-colors group-hover:text-primary">
                        {scholarship.name}
                      </h3>
                      <Badge variant="accent" className="shrink-0">{scholarship.amount}</Badge>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-medical">{scholarship.coverage}</p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{scholarship.description}</p>
                    <div className="mt-5 border-t pt-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Eligibility</p>
                      <p className="mt-1.5 text-sm">{scholarship.eligibility}</p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Payment Methods"
            title="How to Pay"
            description="Secure, flexible, and clearly documented payment options."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {paymentMethods.map(({ Icon, title, description }) => (
              <StaggerItem key={title}>
                <div className="h-full rounded-2xl border border-border bg-card p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-medical to-navy text-white">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-base font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <Reveal className="mt-12">
            <div className="rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-white sm:p-10">
              <h2 className="font-display text-2xl font-extrabold">Financial Aid Advising</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                Not sure how to fund your studies? Book a free session with our financial aid advisors — we&apos;ll
                help you find scholarships, payment plans, and external funding opportunities.
              </p>
              <a
                href="/contact"
                className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-accent-foreground transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Talk to an Advisor
              </a>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Invest in Your Future"
        description="With scholarships covering up to 100% of tuition, TAU is closer than you think."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Explore Scholarships", href: "/tuition" }}
      />
    </>
  );
}
