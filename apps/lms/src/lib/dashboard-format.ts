import { institutionTimeZone } from "@tau/student-dashboard";

const locale = "en-NG";

export function formatDashboardDate(value: string | Date): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: institutionTimeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDashboardDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: institutionTimeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDashboardTime(value: string | Date): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: institutionTimeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDashboardShortDate(value: string | Date): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: institutionTimeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
