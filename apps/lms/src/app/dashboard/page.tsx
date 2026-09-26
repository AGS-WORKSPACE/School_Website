import type { Metadata } from "next";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "Your classes, coursework, tasks and student services in one place.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <div className="bg-lms-mist">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <StudentDashboard />
      </div>
    </div>
  );
}
