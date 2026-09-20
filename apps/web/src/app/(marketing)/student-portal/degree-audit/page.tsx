import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { DegreeAudit } from "./degree-audit";

export const metadata: Metadata = generatePageMetadata({
  title: "Degree Audit",
  description: "Satisfied, in-progress and missing requirements explained from your curriculum and approved substitutions.",
  path: "/student-portal/degree-audit",
  noIndex: true,
});

export default function DegreeAuditPage() {
  return <DegreeAudit />;
}
