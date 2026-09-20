import Image from "next/image";
import Link from "next/link";
import { SocialIcon, type SocialPlatform } from "@/components/layout/social-icon";

const quickLinks = [
  { label: "About", href: "/" },
  { label: "Faculties", href: "/#faculties" },
  { label: "Programmes", href: "/programs" },
  { label: "Courses", href: "/#faculties" },
];

const userLinks = [
  { label: "Student Login", href: "/login/student" },
  { label: "Lecturer Login", href: "/login/lecturer" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Condition", href: "/terms" },
];

const socialLinks: { label: string; href: string; platform: SocialPlatform }[] = [
  { label: "Facebook", href: "https://facebook.com", platform: "facebook" },
  { label: "Twitter", href: "https://twitter.com", platform: "twitter" },
  { label: "Instagram", href: "https://instagram.com", platform: "instagram" },
  { label: "YouTube", href: "https://youtube.com", platform: "youtube" },
];

export function SiteFooter() {
  return (
    <footer className="bg-primary">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 py-16 lg:px-[80px]">
        <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
          <div className="flex flex-col items-start gap-6">
            <Image src="/brand/nau-logo.png" alt="Nnamdi Azikiwe University" width={56} height={56} className="size-14 object-contain" />
            <p className="text-sm leading-relaxed text-white/80">
              Nnamdi Azikiwe University is founded on the philosophy that knowledge should be propagated and
              disseminated to individuals without let or hindrance. Teaching and Research would be anchored on the
              needs of the Nigerian and International society generally. The future begins here.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-lg font-medium text-white">Quick Links</h3>
              <ul className="flex flex-col gap-3 text-sm text-white/80">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-display text-lg font-medium text-white">Users</h3>
              <ul className="flex flex-col gap-3 text-sm text-white/80">
                {userLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-display text-lg font-medium text-white">Support</h3>
              <div className="flex flex-col gap-3 text-sm text-white/80">
                <a href="mailto:lms@unizik.edu.ng" className="transition-colors hover:text-white">
                  lms@unizik.edu.ng
                </a>
                <p>
                  Nnamdi Azikiwe University
                  <br />
                  PMB 5025, Awka, Anambra State
                </p>
                <div className="flex gap-4 pt-1">
                  {socialLinks.map(({ label, href, platform }) => (
                    <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer" className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                      <SocialIcon platform={platform} className="size-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-display text-lg font-medium text-white">Legal</h3>
              <ul className="flex flex-col gap-3 text-sm text-white/80">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-lms-blue px-6 py-5 text-center text-sm font-medium text-white lg:px-[70px]">
        © 1991 - 2026 • All rights reserved. Nnamdi Azikiwe University
      </div>
    </footer>
  );
}
