import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { Card, CardContent } from "@tau/ui/card";
import { ContactForm } from "@/components/sections/contact-form";
import { siteConfig } from "@/constants/site";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Transatlantic University — admissions, research, careers, and general enquiries.",
  path: "/contact",
});

const offices = [
  {
    title: "Admissions Office",
    email: siteConfig.contact.admissionsEmail,
    phone: siteConfig.contact.phone,
    hours: "Mon – Fri, 8:00 AM – 5:00 PM",
  },
  {
    title: "Research Office",
    email: "research@tau.edu.ng",
    phone: siteConfig.contact.phoneAlt,
    hours: "Mon – Fri, 9:00 AM – 4:00 PM",
  },
  {
    title: "General Enquiries",
    email: siteConfig.contact.emailAlt,
    phone: siteConfig.contact.phone,
    hours: "Mon – Fri, 8:00 AM – 6:00 PM",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-campus.jpg"
        eyebrow="Contact Us"
        title="We'd Love to Hear From You"
        description="Questions about admissions, research, or partnership? Our team replies within 24 hours."
        crumbs={[{ label: "Contact" }]}
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <Reveal>
              <div className="rounded-3xl border border-border bg-card p-7 sm:p-10">
                <h2 className="font-display text-2xl font-extrabold tracking-tight">Send a Message</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fill in the form and we&apos;ll route your enquiry to the right team.
                </p>
                <div className="mt-8">
                  <ContactForm />
                </div>
              </div>
            </Reveal>

            <aside className="space-y-5">
              <Reveal>
                <div className="rounded-3xl border border-border bg-card p-7">
                  <h2 className="font-display text-lg font-extrabold">Reach Us Directly</h2>
                  <ul className="mt-5 space-y-4 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-medical/10 text-medical">
                        <MapPin className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold">Campus Address</p>
                        <p className="mt-0.5 leading-relaxed text-muted-foreground">{siteConfig.location.address}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-medical/10 text-medical">
                        <Phone className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold">Phone</p>
                        <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`} className="mt-0.5 block text-muted-foreground transition-colors hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          {siteConfig.contact.phone}
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-medical/10 text-medical">
                        <Mail className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold">Email</p>
                        <a href={`mailto:${siteConfig.contact.email}`} className="mt-0.5 block text-muted-foreground transition-colors hover:text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          {siteConfig.contact.email}
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-medical/10 text-medical">
                        <Clock className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold">Office Hours</p>
                        <p className="mt-0.5 text-muted-foreground">Mon – Fri, 8:00 AM – 6:00 PM (WAT)</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </Reveal>

              <StaggerContainer className="grid gap-5 sm:grid-cols-2">
                {offices.map((office) => (
                  <StaggerItem key={office.title}>
                    <Card className="h-full">
                      <CardContent className="p-5">
                        <h3 className="font-display text-base font-bold">{office.title}</h3>
                        <a href={`mailto:${office.email}`} className="mt-2 block text-xs text-medical transition-colors hover:text-navy dark:hover:text-gold rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          {office.email}
                        </a>
                        <p className="mt-1 text-xs text-muted-foreground">{office.phone}</p>
                        <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{office.hours}</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
