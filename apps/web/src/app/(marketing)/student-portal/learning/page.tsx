import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { Learning } from "./learning";

export const metadata: Metadata = generatePageMetadata({
  title: "My Courses",
  description: "Your courses: materials sized for your connection, discussions, coursework deadlines and feedback.",
  path: "/student-portal/learning",
  noIndex: true,
});

export default function LearningPage() {
  return <Learning />;
}
