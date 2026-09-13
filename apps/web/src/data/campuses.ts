import type { Campus } from "@/types";

/** Temporary typed fixture until campus records are backend-managed. */
export const campuses: Campus[] = [
  {
    id: "main-campus",
    slug: "umuchukwu-main-campus",
    name: "Umuchukwu Main Campus",
    location: "Umuchukwu, Anambra State, Nigeria",
    description:
      "TAU's main campus brings teaching, research, clinical simulation, student life, and residential facilities together in one connected setting.",
    image: "/images/placeholders/hero-campus.jpg",
    facilities: [
      "Medical Library",
      "Clinical Simulation Centre",
      "Main Lecture Theatre Complex",
      "Student Hostels",
      "Sports Complex",
      "Cafeteria & Dining Halls",
      "Research Laboratories",
    ],
    highlights: [
      "Purpose-built health sciences campus",
      "Campus tours available Monday to Friday",
      "Regular shuttle connections to major transport hubs",
    ],
    contactEmail: "info@tau.edu.ng",
    contactPhone: "+234 700 828 6337",
    accessibility:
      "Step-free routes are available across the principal public buildings. Contact the University before visiting so access arrangements can be confirmed.",
  },
];

export function getCampus(slug: string) {
  return campuses.find((campus) => campus.slug === slug);
}
