import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { TranscriptRequests } from "./transcript-requests";

export const metadata: Metadata = generatePageMetadata({
  title: "Transcript Requests",
  description: "Request an official transcript, pay securely and track its production and delivery.",
  path: "/alumni/transcripts",
  noIndex: true,
});

export default function TranscriptRequestsPage() {
  return <TranscriptRequests />;
}
