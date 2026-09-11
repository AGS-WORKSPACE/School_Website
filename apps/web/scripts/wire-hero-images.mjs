import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(
  await readFile(path.join(ROOT, "public", "images", "placeholders", "manifest.json"), "utf8"),
);

const MAP = {
  tuition: "hero-campus",
  international: "hero-students",
  "student-life": "hero-students",
  admissions: "hero-campus",
  alumni: "hero-students",
  faculties: "faculty-medicine",
  "admissions/apply": "hero-campus",
  events: "event-conference",
  library: "campus-library",
  contact: "hero-campus",
  news: "news-1",
  postgraduate: "hero-students",
  leadership: "hero-campus",
  "undergraduate-programs": "hero-students",
  departments: "simulation-lab",
  giving: "hero-campus",
  careers: "hero-students",
  "about/accreditations": "hero-campus",
  "about/mission-vision": "hero-students",
  about: "hero-campus",
  "about/history": "hero-campus",
  "about/sustainability": "hero-campus",
  "about/governance": "hero-campus",
  "about/diversity": "hero-students",
  "about/campus-map": "hero-campus",
  "research/innovation": "innovation-center",
  research: "research-lab",
  "research/facilities": "research-lab",
  "research/funding": "research-lab",
  "research/centres": "research-lab",
  "research/ethics": "research-lab",
  "research/publications": "research-lab",
};

let changed = 0;
for (const [route, label] of Object.entries(MAP)) {
  const file = path.join(ROOT, "src", "app", "(marketing)", route, "page.tsx");
  const content = await readFile(file, "utf8");
  const target = manifest[label]?.file;
  if (!target) {
    console.warn(`missing manifest entry for ${label}`);
    continue;
  }
  const href = `/images/placeholders/${target}`;
  if (content.includes(`image="${href}"`) || content.includes(`image={${label}`)) continue;
  if (!content.includes("<PageHero")) {
    console.warn(`no <PageHero in ${route}`);
    continue;
  }
  const next = content.replace("<PageHero", `<PageHero image="${href}"`);
  await writeFile(file, next);
  changed += 1;
  console.log(`${route} -> ${href}`);
}

console.log(`\nDone. ${changed} heroes wired.`);
