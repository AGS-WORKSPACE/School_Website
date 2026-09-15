import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { MyRecord } from "./my-record";

export const metadata: Metadata = generatePageMetadata({
  title: "My Record",
  description: "Your student record timeline, open requests and identity corrections.",
  path: "/student-portal/my-record",
  noIndex: true,
});

export default function MyRecordPage() {
  return <MyRecord />;
}
