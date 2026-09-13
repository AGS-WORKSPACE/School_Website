import type { EmergencyBannerMessage } from "@/types";

export const emergencyBanners: EmergencyBannerMessage[] = [
  {
    id: "emergency-1",
    severity: "warning",
    title: "Admissions support desk available",
    message: "Contact Admissions if you need help completing your 2026/2027 application.",
    cta: { label: "Contact Admissions", href: "/contact" },
    startsAt: "2026-09-01T00:00:00+01:00",
    expiresAt: "2026-09-30T23:59:59+01:00",
    approvalState: "approved",
    dismissible: true,
  },
  {
    id: "emergency-expired",
    severity: "critical",
    title: "Expired test alert",
    message: "This message must not be rendered publicly.",
    startsAt: "2026-01-01T00:00:00+01:00",
    expiresAt: "2026-01-02T00:00:00+01:00",
    approvalState: "approved",
  },
  {
    id: "emergency-pending",
    severity: "critical",
    title: "Pending editorial alert",
    message: "This message is awaiting approval and must not be rendered publicly.",
    startsAt: "2026-09-01T00:00:00+01:00",
    approvalState: "pending",
  },
];

export function isEmergencyBannerActive(message: EmergencyBannerMessage, now = new Date()) {
  const started = new Date(message.startsAt).getTime() <= now.getTime();
  const notExpired = !message.expiresAt || new Date(message.expiresAt).getTime() >= now.getTime();
  return message.approvalState === "approved" && started && notExpired;
}

export const publicEmergencyBanners = emergencyBanners.filter((message) => isEmergencyBannerActive(message));
