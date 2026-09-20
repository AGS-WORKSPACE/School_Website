"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Mail, Menu, X } from "lucide-react";
import { Button } from "@tau/ui/button";
import { cn } from "@/lib/utils";
import { faculties } from "@/data/faculties";

const navLinks = [
  { label: "Programs", href: "/programs" },
  { label: "FAQs", href: "/#faqs" },
  { label: "Support", href: "/support" },
];

export function SiteHeader() {
  const [facultiesOpen, setFacultiesOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden bg-lms-blue px-6 text-white sm:block lg:px-[70px]">
        <div className="flex h-[46px] items-center justify-end gap-6 text-sm">
          <a href="mailto:lms@unizik.edu.ng" className="flex items-center gap-2 text-white/90 hover:text-white">
            <Mail className="size-3.5" />
            lms@unizik.edu.ng
          </a>
          <span className="text-white/90">Nnamdi Azikiwe University PMB 5025, Awka, Anambra State</span>
        </div>
      </div>

      <div className="bg-primary px-6 py-4 lg:px-[70px]">
        <div className="flex items-center justify-between gap-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image src="/brand/nau-logo.png" alt="Nnamdi Azikiwe University" width={44} height={44} className="size-11 object-contain" priority />
            <span className="hidden font-display text-base font-bold leading-tight text-white sm:block">
              Nnamdi Azikiwe
              <br />
              University LMS
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-end gap-6 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setFacultiesOpen(true)}
              onMouseLeave={() => setFacultiesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setFacultiesOpen((open) => !open)}
                className="flex items-center gap-1 py-2 text-[15px] font-medium text-white/70 transition-colors hover:text-white"
                aria-expanded={facultiesOpen}
              >
                Faculties
                <ChevronDown className={cn("size-4 transition-transform", facultiesOpen && "rotate-180")} />
              </button>
              {facultiesOpen ? (
                <div className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3">
                  <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-white p-3 shadow-card-hover">
                    {faculties.map((faculty) => (
                      <Link
                        key={faculty.slug}
                        href={`/faculties/${faculty.slug}`}
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        {faculty.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="py-2 text-[15px] font-medium text-white/70 transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button asChild variant="accent" className="text-primary">
              <Link href="/login/student">Student Login</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/login/lecturer">Lecturer Login</Link>
            </Button>
          </div>

          <button
            type="button"
            className="text-white lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-4 lg:hidden">
            <span className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white/50">Faculties</span>
            {faculties.map((faculty) => (
              <Link key={faculty.slug} href={`/faculties/${faculty.slug}`} className="rounded-lg px-2 py-2 text-sm font-medium text-white/85 hover:bg-white/10">
                {faculty.name}
              </Link>
            ))}
            <div className="my-2 border-t border-white/10" />
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg px-2 py-2 text-sm font-medium text-white/85 hover:bg-white/10">
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-3">
              <Button asChild variant="accent" className="flex-1 text-primary">
                <Link href="/login/student">Student Login</Link>
              </Button>
              <Button asChild variant="secondary" className="flex-1">
                <Link href="/login/lecturer">Lecturer Login</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
