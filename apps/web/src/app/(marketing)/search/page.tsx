import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { SearchPageClient } from "@/components/sections/search-page-client";

export const metadata: Metadata = generatePageMetadata({
  title: "Search",
  description:
    "Search programmes, faculties, departments, news, events, and pages across Transatlantic University.",
  path: "/search",
});

export default function SearchPage() {
  return (
    <>
      <PageHero
        image="/images/placeholders/campus-library.jpg"
        eyebrow="Search TAU"
        title="Search the University"
        description="Find programmes, faculties, news, events, and pages across Transatlantic University in one place."
        crumbs={[{ label: "Search" }]}
      />
      <SearchPageClient />
    </>
  );
}
