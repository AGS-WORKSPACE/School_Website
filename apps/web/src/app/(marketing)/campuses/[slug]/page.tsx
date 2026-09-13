import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Accessibility, Clock, Mail, MapPin, Phone } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { CTASection } from "@/components/common/cta-section";
import { FacilityCard } from "@/components/cards/facility-card";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { campuses, getCampus } from "@/data/campuses";
import { campusFacilities } from "@/data/campus";

interface Props { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return campuses.map((campus) => ({ slug: campus.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campus = getCampus(slug);
  return campus ? generatePageMetadata({ title: campus.name, description: campus.description, path: `/campuses/${campus.slug}`, image: campus.image }) : {};
}

export default async function CampusDetailPage({ params }: Props) {
  const { slug } = await params;
  const campus = getCampus(slug);
  if (!campus) notFound();

  const facilities = campusFacilities.filter((facility) => facility.campusId === campus.id);

  return (
    <>
      <PageHero
        image={campus.image}
        eyebrow="Campus Profile"
        title={campus.name}
        description={campus.description}
        crumbs={[{ label: "Campuses", href: "/campuses" }, { label: campus.name }]}
      />

      <Section>
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[1.25fr_1fr]">
            <PlaceholderImage src={campus.image} alt={`${campus.name} overview`} aspect="video" className="shadow-2xl shadow-navy/20" />
            <div className="space-y-5">
              <div className="rounded-3xl border border-border bg-card p-7">
                <h2 className="font-display text-xl font-extrabold">Visitor information</h2>
                <dl className="mt-5 space-y-4 text-sm">
                  <div className="flex gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-medical" aria-hidden="true" /><div><dt className="font-semibold">Location</dt><dd className="text-muted-foreground">{campus.location}</dd></div></div>
                  <div className="flex gap-3"><Clock className="mt-0.5 size-5 shrink-0 text-medical" aria-hidden="true" /><div><dt className="font-semibold">Tours</dt><dd className="text-muted-foreground">Monday–Friday, 9:00 AM–4:00 PM</dd></div></div>
                  <div className="flex gap-3"><Mail className="mt-0.5 size-5 shrink-0 text-medical" aria-hidden="true" /><div><dt className="font-semibold">Email</dt><dd><a className="rounded text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`mailto:${campus.contactEmail}`}>{campus.contactEmail}</a></dd></div></div>
                  <div className="flex gap-3"><Phone className="mt-0.5 size-5 shrink-0 text-medical" aria-hidden="true" /><div><dt className="font-semibold">Phone</dt><dd><a className="rounded text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`tel:${campus.contactPhone.replace(/\s/g, "")}`}>{campus.contactPhone}</a></dd></div></div>
                </dl>
              </div>
              <div className="rounded-3xl border border-medical/20 bg-medical/5 p-7">
                <h2 className="flex items-center gap-2 font-display text-xl font-extrabold"><Accessibility className="size-5 text-medical" aria-hidden="true" />Accessibility</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{campus.accessibility}</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader eyebrow="Campus Highlights" title="What You Will Find Here" description="A connected campus designed to support study, research, wellbeing, and community." />
          <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3" aria-label="Campus highlights">
            {campus.highlights.map((highlight) => <li key={highlight} className="rounded-2xl border border-border bg-card p-5 text-sm font-semibold leading-relaxed">{highlight}</li>)}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader eyebrow="Facilities" title="Explore Facilities on This Campus" description="Learn what each facility offers and how to arrange access." />
          {facilities.length > 0 ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{facilities.map((facility) => <FacilityCard key={facility.id} facility={facility} />)}</div> : <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground" role="status">Facility information is being updated.</p>}
        </Container>
      </Section>

      <CTASection title="Arrange a Campus Visit" description="Contact our team for directions, access arrangements, and tour availability." primary={{ label: "Contact Us", href: "/contact" }} secondary={{ label: "View All Campuses", href: "/campuses" }} />
    </>
  );
}
