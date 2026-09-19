import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { VerifyCredential } from "./verify-credential";

export const metadata: Metadata = generatePageMetadata({
  title: "Verify a Credential",
  description: "Confirm that a transcript or certificate issued by the University is genuine, using the verification code printed on it.",
  path: "/verify",
});

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ code?: string; sig?: string }> }) {
  const { code, sig } = await searchParams;
  return <VerifyCredential initialCode={code ?? ""} signature={sig} />;
}
