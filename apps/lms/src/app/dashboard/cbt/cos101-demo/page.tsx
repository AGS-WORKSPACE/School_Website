import type { Metadata } from "next";
import { CbtExamScreen } from "@/components/dashboard/cbt-exam-screen";

export const metadata: Metadata = {
  title: "COS 101 CBT",
  description: "Authorised browser-based examination workspace.",
  robots: { index: false, follow: false },
};

export default function Cos101DemoExamPage() {
  return <CbtExamScreen />;
}
