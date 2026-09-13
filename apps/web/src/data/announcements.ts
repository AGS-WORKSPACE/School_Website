import type { Announcement } from "@/types";

export const announcements: Announcement[] = [
  {
    id: "announcement-1",
    slug: "2026-2027-undergraduate-applications-open",
    title: "2026/2027 undergraduate applications are open",
    summary: "Applications are now open for selected undergraduate programmes for the 2026/2027 academic session.",
    content: [
      "Applications are now open for selected undergraduate programmes for the 2026/2027 academic session.",
      "Applicants should review the programme requirements and complete the online application before the published deadline. Admissions updates will be shared through the official University channels.",
    ],
    category: "Admissions",
    publishedAt: "2026-06-01",
    expiresAt: "2026-12-31",
    owner: "Admissions Office",
  },
  {
    id: "announcement-2",
    slug: "library-service-hours-during-examinations",
    title: "Extended library service hours during examinations",
    summary: "The University Library will operate extended hours during the examination period.",
    content: [
      "The University Library will operate extended hours during the examination period to support students preparing for assessments.",
      "Students should carry their University identification and follow the library's quiet-study and safety guidance while using the extended service.",
    ],
    category: "Student Services",
    publishedAt: "2026-08-15",
    expiresAt: "2026-10-15",
    owner: "University Library",
  },
  {
    id: "announcement-3",
    slug: "2026-student-health-screening-registration",
    title: "Student health screening registration",
    summary: "Students can register for the next round of routine health screening at the University clinic.",
    content: [
      "Students can register for the next round of routine health screening at the University clinic.",
      "Appointments are available through the clinic reception during working hours. Bring your University identification and any relevant medical information.",
    ],
    category: "Health & Safety",
    publishedAt: "2026-09-01",
    expiresAt: "2026-09-30",
    owner: "University Health Services",
  },
  {
    id: "announcement-expired",
    slug: "2026-campus-maintenance-notice",
    title: "Completed campus maintenance notice",
    summary: "This historical notice is retained for editorial testing and must not appear in public listings.",
    content: ["This notice has expired."],
    category: "Campus",
    publishedAt: "2026-01-05",
    expiresAt: "2026-01-12",
    owner: "Facilities Office",
  },
];

export const announcementCategories = ["All", "Admissions", "Student Services", "Health & Safety", "Campus"];

export function isAnnouncementActive(announcement: Announcement, now = new Date()) {
  const published = new Date(announcement.publishedAt).getTime() <= now.getTime();
  const notExpired = !announcement.expiresAt || new Date(announcement.expiresAt).getTime() >= now.getTime();
  return published && notExpired;
}

export const publicAnnouncements = announcements.filter((announcement) => isAnnouncementActive(announcement));

export function getAnnouncement(slug: string) {
  return publicAnnouncements.find((announcement) => announcement.slug === slug);
}
