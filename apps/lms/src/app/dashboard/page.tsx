import type { Metadata } from "next";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";

export const metadata: Metadata = {
  title: "My Dashboard",
  description:
    "Your classes, coursework, tasks and student services in one place.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  return (
    <StudentDashboard initialView={view === "exams" ? "exams" : "overview"} />
  );
}
