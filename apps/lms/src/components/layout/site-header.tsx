"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Mail, MapPin, Menu, Search, X } from "lucide-react";
import { Button } from "@tau/ui/button";
import { cn } from "@/lib/utils";
import { faculties } from "@/data/faculties";

const navLinks = [
  { label: "Programs", href: "/programs" },
  { label: "FAQs", href: "/#faqs" },
  { label: "Support", href: "/support" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [facultiesOpen, setFacultiesOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isHome = pathname === "/";
  const solid = !isHome || scrolled || mobileOpen;

  React.useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <a href="#main-content" className="sr-only z-[100] rounded-full bg-primary px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to main content
      </a>

      <header className={cn("sticky top-0 z-50 transition-all duration-300", solid ? "bg-white/95 shadow-lg shadow-navy/5 backdrop-blur-md" : "bg-transparent")}>
        {!solid ? (
          <div className="border-b border-white/10 bg-navy/60 text-white backdrop-blur-md">
            <div className="container-site flex h-10 items-center justify-between gap-4 text-xs">
              <div className="hidden items-center gap-5 md:flex">
                <a href="mailto:lms@unizik.edu.ng" className="inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white">
                  <Mail className="size-3" aria-hidden="true" />
                  lms@unizik.edu.ng
                </a>
                <span className="inline-flex items-center gap-1.5 text-white/70">
                  <MapPin className="size-3" aria-hidden="true" />
                  Awka, Anambra State, Nigeria
                </span>
              </div>
              <span className="ml-auto text-white/70">Discipline · Self Reliance · Excellence</span>
            </div>
          </div>
        ) : null}

        <div className="container-site">
          <div className="flex h-[84px] items-center justify-between gap-4 transition-all duration-300 lg:h-24">
            <Link href="/" aria-label="Nnamdi Azikiwe University LMS home" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className={cn("inline-flex items-center rounded-lg", solid && "bg-navy px-2")}>
                <Image src="/brand/nau-logo.png" alt="Nnamdi Azikiwe University" width={300} height={80} className="h-14 w-auto sm:h-16" loading="eager" />
              </span>
            </Link>

            <nav className="hidden items-center gap-0.5 xl:flex" aria-label="LMS navigation">
              <Link href="/" className={navClass(solid, pathname === "/")}>Home</Link>
              <div className="relative" onMouseEnter={() => setFacultiesOpen(true)} onMouseLeave={() => setFacultiesOpen(false)}>
                <button type="button" onClick={() => setFacultiesOpen((open) => !open)} className={navClass(solid, pathname.startsWith("/faculties"))} aria-expanded={facultiesOpen}>
                  Faculties
                  <ChevronDown className={cn("size-3.5 transition-transform", facultiesOpen && "rotate-180")} />
                </button>
                {facultiesOpen ? (
                  <div className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3">
                    <div className="grid grid-cols-2 gap-1.5 rounded-3xl border border-border bg-white p-3 shadow-2xl shadow-navy/20">
                      <Link href="/faculties" className="col-span-2 rounded-2xl bg-gradient-to-r from-navy to-navy-light px-4 py-4 text-sm font-bold text-white hover:from-navy-light hover:to-medical">
                        Browse all faculties
                      </Link>
                      {faculties.map((faculty) => (
                        <Link key={faculty.slug} href={`/faculties/${faculty.slug}`} className="rounded-xl px-3.5 py-3 text-sm font-semibold text-navy transition-colors hover:bg-muted hover:text-medical">
                          {faculty.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navClass(solid, pathname === link.href)}>{link.label}</Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 xl:flex">
              <Button asChild variant="ghost" size="icon" className={solid ? "text-navy hover:bg-muted" : "text-white hover:bg-white hover:text-navy"}>
                <Link href="/faculties" aria-label="Search courses"><Search className="size-5" /></Link>
              </Button>
              <Button asChild variant="accent"><Link href="/login/student">Student Login</Link></Button>
              <Button asChild variant={solid ? "secondary" : "outlineLight"}><Link href="/login/lecturer">Lecturer Login</Link></Button>
            </div>

            <Button type="button" variant="ghost" size="icon" className={cn("xl:hidden", solid ? "text-navy hover:bg-muted" : "text-white hover:bg-white/10")} onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>
              {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </Button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="absolute inset-x-0 top-full max-h-[calc(100dvh-84px)] overflow-y-auto border-t border-white/10 bg-navy text-white shadow-2xl xl:hidden">
            <nav className="container-site py-5" aria-label="Mobile LMS navigation">
              <Link href="/" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white/10">Home</Link>
              <p className="mt-3 px-4 pb-1 text-xs font-bold uppercase tracking-widest text-gold">Faculties</p>
              <div className="grid sm:grid-cols-2">
                {faculties.map((faculty) => (
                  <Link key={faculty.slug} href={`/faculties/${faculty.slug}`} onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white">{faculty.name}</Link>
                ))}
              </div>
              <div className="my-3 border-t border-white/10" />
              {navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white/10">{link.label}</Link>)}
              <div className="mt-4 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2">
                <Button asChild variant="accent" size="lg"><Link href="/login/student" onClick={() => setMobileOpen(false)}>Student Login</Link></Button>
                <Button asChild variant="outlineLight" size="lg"><Link href="/login/lecturer" onClick={() => setMobileOpen(false)}>Lecturer Login</Link></Button>
              </div>
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}

function navClass(solid: boolean, active: boolean) {
  return cn(
    "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    solid ? "text-navy hover:bg-muted" : "text-white hover:bg-white hover:text-navy",
    active && solid && "bg-muted text-medical",
  );
}
