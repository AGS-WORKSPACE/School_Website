"use client";

import { Button } from "@tau/ui/button";
import { setAnalyticsConsent, useAnalyticsConsent } from "@/lib/analytics";

export function AnalyticsConsentBanner() {
  const consent = useAnalyticsConsent();
  if (consent !== "unknown" || typeof window === "undefined") return null;

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 rounded-2xl border border-border bg-card p-5 shadow-2xl sm:inset-x-auto sm:right-6 sm:max-w-md" role="dialog" aria-label="Analytics preferences" aria-describedby="analytics-consent-description">
      <h2 className="font-display text-base font-bold">Help us improve the website</h2>
      <p id="analytics-consent-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Allow anonymous usage analytics to help us understand which public pages are useful. Enquiry details and form contents are never tracked.
      </p>
      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => setAnalyticsConsent("denied")}>Decline analytics</Button>
        <Button type="button" onClick={() => setAnalyticsConsent("granted")}>Allow analytics</Button>
      </div>
    </aside>
  );
}
