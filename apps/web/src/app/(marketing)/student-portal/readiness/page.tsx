import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { Readiness } from "./readiness";

export const metadata: Metadata = generatePageMetadata({
  title: "Orientation & Readiness Check",
  description: "A short, advisory readiness check for online learning, with support resources for any gaps.",
  path: "/student-portal/readiness",
  noIndex: true,
});

export default function ReadinessPage() {
  return <Readiness />;
}
