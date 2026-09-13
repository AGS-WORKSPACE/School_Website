"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEventName } from "@/lib/analytics";

export function ContentViewTracker({ event, slug, category }: { event: Extract<AnalyticsEventName, "programme_view" | "news_view" | "event_view">; slug: string; category?: string }) {
  useEffect(() => {
    trackEvent(event, { slug, category, surface: "detail" });
  }, [event, slug, category]);
  return null;
}
