"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Info, OctagonAlert, X } from "lucide-react";
import { Button } from "@tau/ui/button";
import type { EmergencyBannerMessage } from "@/types";

const severityContent = {
  info: { label: "Information", icon: Info, classes: "border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100" },
  warning: { label: "Important notice", icon: AlertTriangle, classes: "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100" },
  critical: { label: "Urgent notice", icon: OctagonAlert, classes: "border-red-300 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100" },
} as const;

export function EmergencyBanner({ message }: { message: EmergencyBannerMessage }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const content = severityContent[message.severity];
  const Icon = content.icon;

  return (
    <aside className={`border-b ${content.classes}`} role="alert" aria-label={`${content.label}: ${message.title}`}>
      <div className="container-site flex gap-3 py-3 text-sm">
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{content.label}: {message.title}</p>
          <p className="mt-0.5 leading-relaxed">{message.message}</p>
          {message.cta ? (
            <Link href={message.cta.href} className="mt-2 inline-flex rounded font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current">
              {message.cta.label}
            </Link>
          ) : null}
        </div>
        {message.dismissible ? (
          <Button type="button" variant="ghost" size="icon" className="shrink-0" aria-label="Dismiss notice" onClick={() => setDismissed(true)}>
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
