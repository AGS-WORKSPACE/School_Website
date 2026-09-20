"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Mail, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/constants/site";
import { route } from "@/constants/site";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Badge } from "@tau/ui/badge";
import { BrandMark } from "@/components/common/container";

const columns = [
  {
    title: "About NAU",
    links: [
      { label: "Overview & History", href: route.about.history },
      { label: "Mission & Vision", href: route.about.mission },
      { label: "Leadership", href: route.about.leadership },
      { label: "Governance & Policies", href: route.about.governance },
      { label: "Accreditations & Rankings", href: route.about.accreditations },
      { label: "Campus Map & Facilities", href: route.about.campusMap },
    ],
  },
  {
    title: "Study",
    links: [
      { label: "Undergraduate Programs", href: route.study.undergraduate },
      { label: "Postgraduate School", href: route.study.postgraduate },
      { label: "Faculties", href: route.study.faculties },
      { label: "Departments", href: route.study.departments },
      { label: "Admissions", href: route.study.admissions },
      { label: "International Students", href: route.study.international },
    ],
  },
  {
    title: "Research & Community",
    links: [
      { label: "Research & Innovation", href: route.research.overview },
      { label: "Publications", href: route.research.publications },
      { label: "News", href: route.community.news },
      { label: "Announcements", href: "/announcements" },
      { label: "Events", href: route.community.events },
      { label: "Careers", href: route.community.careers },
    ],
  },
  {
    title: "Admissions & Support",
    links: [
      { label: "Tuition & Scholarships", href: route.study.tuition },
      { label: "How to Apply", href: route.study.admissions },
      { label: "Student Life", href: route.study.studentLife },
      { label: "Alumni", href: route.community.alumni },
      { label: "Medical Library", href: route.community.library },
      { label: "Contact", href: route.contact },
    ],
  },
];


export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    toast.success("You're subscribed!", {
      description: "Thank you for joining the Nnamdi Azikiwe University newsletter.",
    });
  };

  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      <div className="bg-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="absolute -left-32 top-0 size-96 rounded-full bg-medical/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-32 bottom-0 size-96 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

      <div className="container-site relative">
        <div className="grid gap-12 border-b border-white/10 py-16 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <BrandMark />

            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70">
              {siteConfig.officialName} is a federal university in {siteConfig.location.town},{" "}
              {siteConfig.location.state}.
            </p>

            <ul className="mt-7 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                {siteConfig.location.address}
              </li>
              <li>
                <a href={`tel:${siteConfig.contact.phone}`} className="flex items-center gap-3 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                  <Phone className="size-4 shrink-0 text-gold" aria-hidden="true" />
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-3 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                  <Mail className="size-4 shrink-0 text-gold" aria-hidden="true" />
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>

          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((column) => (
              <nav key={column.title} aria-label={`${column.title} footer links`}>
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white/90">{column.title}</h3>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label + link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="grid gap-10 py-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge variant="accent" className="mb-4">Stay Informed</Badge>
            <h3 className="font-display text-2xl font-extrabold tracking-tight">
              The NAU Newsletter
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
              Admissions updates, research breakthroughs, events, and campus news — delivered monthly.
            </p>
          </div>

          {subscribed ? (
            <div className="rounded-2xl border border-gold/40 bg-gold/10 p-6 text-center">
              <p className="font-display text-lg font-bold text-gold">Welcome to the NAU community!</p>
              <p className="mt-1 text-sm text-white/70">Your first newsletter arrives soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-gold"
              />
              <Button type="submit" variant="accent" size="lg">
                Subscribe
                <Send aria-hidden="true" />
              </Button>
            </form>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name} ({siteConfig.shortName}). All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/about/governance" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Privacy Policy</Link>
            <Link href="/about/governance" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Terms of Use</Link>
            <Link href="/sitemap.xml" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
