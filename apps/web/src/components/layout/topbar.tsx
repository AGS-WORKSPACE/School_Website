"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/constants/site";
import { utilityNav } from "@/constants/navigation";

export function TopBar() {
  return (
    <div className="border-b border-white/10 bg-navy/60 text-white backdrop-blur-md">
      <div className="container-site flex h-10 items-center justify-between gap-4 text-xs">
        <div className="hidden items-center gap-5 md:flex">
          <a
            href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Phone className="size-3" aria-hidden="true" />
            {siteConfig.contact.phone}
          </a>
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Mail className="size-3" aria-hidden="true" />
            {siteConfig.contact.email}
          </a>
          <span className="inline-flex items-center gap-1.5 text-white/70">
            <MapPin className="size-3" aria-hidden="true" />
            {siteConfig.location.town}, {siteConfig.location.state}, {siteConfig.location.country}
          </span>
        </div>
        <nav aria-label="Utility navigation" className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-end">
          <span className="hidden text-white/70 sm:inline-flex">A private medical university of excellence</span>
          <ul className="flex items-center gap-4">
            {utilityNav.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="font-medium text-white/80 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
