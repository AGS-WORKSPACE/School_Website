import assert from "node:assert/strict";
import test from "node:test";
import { generatePageMetadata } from "./seo";
import { articleStructuredData, eventStructuredData, programmeStructuredData } from "./structured-data";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { news } from "@/data/news";
import { events } from "@/data/events";
import { publishedPrograms } from "@/data/programs";
import { publicAnnouncements } from "@/data/announcements";

test("metadata uses deterministic canonical URLs without duplicating the site title", () => {
  const metadata = generatePageMetadata({ title: "Programme discovery", path: "/undergraduate-programs" });
  assert.equal(metadata.title, "Programme discovery");
  assert.equal(metadata.alternates?.canonical, "https://www.unizik.edu.ng/undergraduate-programs");
  assert.equal(metadata.openGraph?.url, "https://www.unizik.edu.ng/undergraduate-programs");
});

test("sitemap contains public content only", () => {
  const urls = sitemap().map((entry) => entry.url);
  for (const program of publishedPrograms) assert.ok(urls.includes(`https://www.unizik.edu.ng/programs/${program.slug}`));
  assert.equal(urls.some((url) => url.includes("/student-portal") || url.includes("/staff-portal") || url.includes("/admin")), false);
  assert.equal(urls.includes("https://www.unizik.edu.ng/announcements/2026-campus-maintenance-notice"), false);
  assert.equal(urls.includes(`https://www.unizik.edu.ng/announcements/${publicAnnouncements[0].slug}`), true);
});

test("structured data reflects the page records", () => {
  const programme = programmeStructuredData(publishedPrograms[0]);
  const article = articleStructuredData(news[0]);
  const event = eventStructuredData(events[0]);
  assert.equal(programme["@type"], "Course");
  assert.equal(programme.name, publishedPrograms[0].title);
  assert.equal(article["@type"], "Article");
  assert.equal(article.datePublished, news[0].publishedAt);
  assert.equal(event["@type"], "Event");
  assert.equal(event.startDate, events[0].date);
});

test("robots preserves public crawling while excluding private web areas", () => {
  const rules = robots().rules;
  const disallow = Array.isArray(rules) ? rules[0].disallow : rules.disallow;
  assert.ok(String(disallow).includes("/student-portal"));
  assert.ok(String(disallow).includes("/staff-portal"));
  assert.ok(String(disallow).includes("/api/"));
});
