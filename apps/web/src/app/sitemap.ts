import type { MetadataRoute } from "next";
import { siteConfig } from "@/constants/site";
import { news } from "@/data/news";
import { events } from "@/data/events";
import { faculties } from "@/data/faculties";
import { departments } from "@/data/departments";
import { publishedPrograms } from "@/data/programs";
import { campuses } from "@/data/campuses";
import { campusFacilities } from "@/data/campus";
import { publicAnnouncements } from "@/data/announcements";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: string[] = [
    "",
    "/about",
    "/about/history",
    "/about/mission-vision",
    "/about/governance",
    "/about/accreditations",
    "/about/campus-map",
    "/campuses",
    "/facilities",
    "/about/diversity",
    "/about/sustainability",
    "/leadership",
    "/faculties",
    "/departments",
    "/undergraduate-programs",
    "/postgraduate",
    "/admissions",
    "/admissions/apply",
    "/tuition",
    "/international",
    "/student-life",
    "/research",
    "/research/centres",
    "/research/publications",
    "/research/facilities",
    "/research/funding",
    "/research/innovation",
    "/research/ethics",
    "/news",
    "/announcements",
    "/events",
    "/alumni",
    "/careers",
    "/library",
    "/giving",
    "/contact",
    "/search",
    "/ai-assistant",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : ("monthly" as const),
    priority: route === "" ? 1 : route.split("/").length <= 2 ? 0.8 : 0.6,
  }));

  const newsEntries: MetadataRoute.Sitemap = news.map((article) => ({
    url: `${siteConfig.url}/news/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${siteConfig.url}/events/${event.slug}`,
    lastModified: new Date(event.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const announcementEntries: MetadataRoute.Sitemap = publicAnnouncements.map((announcement) => ({
    url: `${siteConfig.url}/announcements/${announcement.slug}`,
    lastModified: new Date(announcement.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const facultyEntries: MetadataRoute.Sitemap = faculties.map((faculty) => ({
    url: `${siteConfig.url}/faculties/${faculty.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const departmentEntries: MetadataRoute.Sitemap = departments.map((department) => ({
    url: `${siteConfig.url}/departments/${department.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const programEntries: MetadataRoute.Sitemap = publishedPrograms.map((program) => ({
    url: `${siteConfig.url}/programs/${program.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const campusEntries: MetadataRoute.Sitemap = campuses.map((campus) => ({
    url: `${siteConfig.url}/campuses/${campus.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const facilityEntries: MetadataRoute.Sitemap = campusFacilities.map((facility) => ({
    url: `${siteConfig.url}/facilities/${facility.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...newsEntries,
    ...eventEntries,
    ...announcementEntries,
    ...facultyEntries,
    ...departmentEntries,
    ...programEntries,
    ...campusEntries,
    ...facilityEntries,
  ];
}
