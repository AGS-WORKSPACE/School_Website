import Image from "next/image";
import Link from "next/link";
import { BookOpen, Mail, MapPin } from "lucide-react";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Faculties", href: "/faculties" },
      { label: "Programmes", href: "/programs" },
      { label: "Course catalogue", href: "/faculties" },
    ],
  },
  {
    title: "Access",
    links: [
      { label: "Verify account", href: "/login/student?verify=1" },
      { label: "Student Login", href: "/login/student" },
      { label: "Lecturer Login", href: "/login/lecturer" },
      { label: "LMS Support", href: "/support" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "Frequently asked questions", href: "/#faqs" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      <div className="bg-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="absolute -left-32 top-0 size-96 rounded-full bg-medical/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-32 bottom-0 size-96 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

      <div className="container-site relative">
        <div className="grid gap-12 border-b border-white/10 py-14 lg:grid-cols-[1.2fr_2fr] lg:py-16">
          <div>
            <span className="inline-flex rounded-lg bg-navy px-2">
              <Image src="/brand/nau-logo.png" alt="Nnamdi Azikiwe University" width={300} height={80} className="h-16 w-auto" />
            </span>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70">
              Access NAU courses, learning materials and academic support from one place.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-gold" />Nnamdi Azikiwe University, Awka, Anambra State</li>
              <li><a href="mailto:lms@unizik.edu.ng" className="flex items-center gap-3 transition-colors hover:text-white"><Mail className="size-4 shrink-0 text-gold" />lms@unizik.edu.ng</a></li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <nav key={column.title} aria-label={`${column.title} footer links`}>
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white/90">{column.title}</h3>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-gold">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="grid gap-5 py-9 sm:grid-cols-[auto_1fr] sm:items-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-gold/15 text-gold"><BookOpen className="size-5" /></span>
          <div>
            <h3 className="font-display text-lg font-bold">Need help with a course?</h3>
            <p className="mt-1 text-sm text-white/65">Contact LMS support for access, enrolment and learning material issues.</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Nnamdi Azikiwe University. All rights reserved.</p>
          <div className="flex items-center gap-6"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link></div>
        </div>
      </div>
    </footer>
  );
}
