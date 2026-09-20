import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { Registration } from "./registration";

export const metadata: Metadata = generatePageMetadata({
  title: "Course Registration",
  description: "Your required, outstanding and eligible elective courses, and add/drop for the current term.",
  path: "/student-portal/registration",
  noIndex: true,
});

export default function RegistrationPage() {
  return <Registration />;
}
