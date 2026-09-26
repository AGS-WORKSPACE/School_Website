import type { Metadata } from "next";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "Your classes, coursework, tasks and student services in one place.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <StudentDashboard />;
}
