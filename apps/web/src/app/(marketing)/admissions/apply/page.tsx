import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { Reveal } from "@/components/common/motion";
import { ApplicationForm } from "@/components/sections/application-form";
import { Clock3, FileCheck2, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = generatePageMetadata({
  title: "Apply Now",
  description:
    "Apply to Transatlantic University for the 2026/2027 intake. A simple, transparent online application.",
  path: "/admissions/apply",
});

const support = [
  { Icon: Phone, title: "Call Admissions", value: siteConfig.contact.phone, href: `tel:${siteConfig.contact.phone.replace(/\s/g, "")}` },
  { Icon: MessageCircle, title: "Email Us", value: siteConfig.contact.admissionsEmail, href: `mailto:${siteConfig.contact.admissionsEmail}` },
  { Icon: Clock3, title: "Response Time", value: "Within 24 hours on business days" },
  { Icon: FileCheck2, title: "Application Fee", value: "₦15,000 – ₦25,000 (non-refundable)" },
];

export default function ApplyPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-campus.jpg"
        eyebrow="Apply Now"
        title="Online Application Portal"
        description="Complete your application in under 10 minutes. Our admissions team will guide you through every step."
        crumbs={[{ label: "Admissions", href: "/admissions" }, { label: "Apply" }]}
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <ApplicationForm />

            <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-display text-lg font-extrabold">Application Support</h2>
                  <ul className="mt-5 space-y-5">
                    {support.map(({ Icon, title, value, href }) => (
                      <li key={title} className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-medical/10 text-medical">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-bold">{title}</p>
                          {href ? (
                            <a href={href} className="text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                              {value}
                            </a>
                          ) : (
                            <p className="text-xs text-muted-foreground">{value}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <div className="rounded-2xl bg-gradient-to-br from-navy to-medical p-6 text-white">
                  <h2 className="font-display text-lg font-extrabold">What Happens Next?</h2>
                  <ol className="mt-4 space-y-3 text-sm text-white/80">
                    <li className="flex gap-3"><span className="font-display font-extrabold text-gold">1.</span> Our team verifies your documents.</li>
                    <li className="flex gap-3"><span className="font-display font-extrabold text-gold">2.</span> You&apos;re invited to post-UTME screening.</li>
                    <li className="flex gap-3"><span className="font-display font-extrabold text-gold">3.</span> Offers are released within six weeks.</li>
                  </ol>
                </div>
              </Reveal>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
