import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Accessibility, ArrowLeft, Clock, MapPin } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { CTASection } from "@/components/common/cta-section";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { Badge } from "@tau/ui/badge";
import { campusFacilities } from "@/data/campus";
import { campuses } from "@/data/campuses";

interface Props { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return campusFacilities.map((facility) => ({ slug: facility.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const facility = campusFacilities.find((item) => item.id === slug);
  return facility ? generatePageMetadata({ title: facility.name, description: facility.description, path: `/facilities/${facility.id}`, image: facility.image }) : {};
}

export default async function FacilityDetailPage({ params }: Props) {
  const { slug } = await params;
  const facility = campusFacilities.find((item) => item.id === slug);
  if (!facility) notFound();

  const campus = campuses.find((item) => item.id === facility.campusId);

  return (
    <>
      <PageHero image={facility.image} eyebrow={`${facility.category} Facility`} title={facility.name} description={facility.description} crumbs={[{ label: "Facilities", href: "/facilities" }, { label: facility.name }]}>
        <Badge variant="accent">{facility.category}</Badge>
      </PageHero>
      <Section>
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[1.25fr_1fr]">
            <PlaceholderImage src={facility.image} alt={facility.name} aspect="video" className="shadow-2xl shadow-navy/20" />
            <div className="space-y-5">
              <div className="rounded-3xl border border-border bg-card p-7">
                <h2 className="font-display text-xl font-extrabold">Facility information</h2>
                <dl className="mt-5 space-y-4 text-sm">
                  {campus ? <div className="flex gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-medical" aria-hidden="true" /><div><dt className="font-semibold">Campus</dt><dd><Link href={`/campuses/${campus.slug}`} className="rounded text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{campus.name}</Link></dd></div></div> : null}
                  {facility.hours ? <div className="flex gap-3"><Clock className="mt-0.5 size-5 shrink-0 text-medical" aria-hidden="true" /><div><dt className="font-semibold">Opening hours</dt><dd className="text-muted-foreground">{facility.hours}</dd></div></div> : null}
                </dl>
              </div>
              {facility.accessibility ? <div className="rounded-3xl border border-medical/20 bg-medical/5 p-7"><h2 className="flex items-center gap-2 font-display text-xl font-extrabold"><Accessibility className="size-5 text-medical" aria-hidden="true" />Accessibility</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{facility.accessibility}</p></div> : null}
            </div>
          </div>
        </Container>
      </Section>
      {facility.highlights?.length ? <Section className="bg-ice py-16 dark:bg-background sm:py-20"><Container><h2 className="font-display text-2xl font-extrabold tracking-tight">Highlights</h2><ul className="mt-8 grid gap-4 sm:grid-cols-3" aria-label={`${facility.name} highlights`}>{facility.highlights.map((highlight) => <li key={highlight} className="rounded-2xl border border-border bg-card p-5 text-sm font-semibold leading-relaxed">{highlight}</li>)}</ul></Container></Section> : null}
      <CTASection title="Ask About Access" description="Contact the University for bookings, directions, or specific accessibility arrangements." primary={{ label: "Contact Us", href: "/contact" }} secondary={{ label: "All Facilities", href: "/facilities" }} />
      <div className="container-site pb-12"><Link href="/facilities" className="inline-flex items-center gap-2 rounded text-sm font-semibold text-medical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="size-4" aria-hidden="true" />Back to facilities</Link></div>
    </>
  );
}
