"use client";

import { useSyncExternalStore } from "react";

export type AnalyticsConsent = "unknown" | "granted" | "denied";

export type AnalyticsEventName =
  | "programme_view"
  | "programme_filter"
  | "programme_application_click"
  | "programme_enquiry_click"
  | "search"
  | "news_view"
  | "event_view"
  | "enquiry_started"
  | "enquiry_submitted"
  | "application_started";

export type AnalyticsPayload = Record<string, unknown>;
export type AnalyticsEvent = { name: AnalyticsEventName; payload: Record<string, string | number | boolean> };
export type AnalyticsProvider = (event: AnalyticsEvent) => void;

const consentStorageKey = "tau.analytics.consent";
const attributionStorageKey = "tau.analytics.attribution";
const listeners = new Set<() => void>();
const capturedEvents: AnalyticsEvent[] = [];
const allowedKeys: Record<AnalyticsEventName, string[]> = {
  programme_view: ["slug", "surface"],
  programme_filter: ["activeFilterCount", "filterKeys", "resultCount"],
  programme_application_click: ["programmeSlug", "surface"],
  programme_enquiry_click: ["programmeSlug", "surface"],
  search: ["queryLength", "resultCount", "hasResults", "surface", "resultType"],
  news_view: ["slug", "category"],
  event_view: ["slug", "category"],
  enquiry_started: ["surface", "programmeSlug"],
  enquiry_submitted: ["enquiryType", "hasProgramme", "success"],
  application_started: ["surface", "programmeSlug"],
};

let consent: AnalyticsConsent = "unknown";
let provider: AnalyticsProvider | undefined;

function readConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return consent;
  try {
    const stored = window.localStorage.getItem(consentStorageKey);
    return stored === "granted" || stored === "denied" ? stored : "unknown";
  } catch {
    return consent;
  }
}

export function getAnalyticsConsent(): AnalyticsConsent {
  consent = readConsent();
  return consent;
}

export function subscribeAnalyticsConsent(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAnalyticsConsent() {
  return useSyncExternalStore(subscribeAnalyticsConsent, getAnalyticsConsent, () => "unknown" as const);
}

export function setAnalyticsConsent(next: Exclude<AnalyticsConsent, "unknown">) {
  consent = next;
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(consentStorageKey, next);
  } catch {
    // A blocked storage area must not prevent the consent choice from applying in memory.
  }
  listeners.forEach((listener) => listener());
}

function cleanValue(value: unknown): string | number | boolean | undefined {
  if (typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, 120);
  return trimmed || undefined;
}

function readAttribution(): Record<string, string> {
  if (typeof window === "undefined" || getAnalyticsConsent() !== "granted") return {};
  const allowed = ["utm_source", "utm_medium", "utm_campaign", "source", "medium", "campaign"];
  const current = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  allowed.forEach((key) => {
    const value = current.get(key)?.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
    if (value) result[key.replace(/^utm_/, "")] = value;
  });
  if (Object.keys(result).length > 0) {
    try { window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(result)); } catch { /* storage is optional */ }
    return result;
  }
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(attributionStorageKey) ?? "null");
    return stored && typeof stored === "object" ? stored as Record<string, string> : {};
  } catch {
    return {};
  }
}

function sanitisePayload(name: AnalyticsEventName, payload: AnalyticsPayload): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  allowedKeys[name].forEach((key) => {
    const value = cleanValue(payload[key]);
    if (value !== undefined) safe[key] = value;
  });
  Object.entries(readAttribution()).forEach(([key, value]) => { safe[key] = value; });
  return safe;
}

export function trackEvent(name: AnalyticsEventName, payload: AnalyticsPayload = {}) {
  if (getAnalyticsConsent() !== "granted") return;
  const event = { name, payload: sanitisePayload(name, payload) };
  if (typeof window === "undefined") capturedEvents.push(event);
  provider?.(event);
}

export function configureAnalyticsProvider(next?: AnalyticsProvider) {
  provider = next;
}

export function getCapturedAnalyticsEvents() {
  return capturedEvents.map((event) => ({ ...event, payload: { ...event.payload } }));
}

export function resetAnalyticsForTests() {
  consent = "unknown";
  provider = undefined;
  capturedEvents.length = 0;
}
