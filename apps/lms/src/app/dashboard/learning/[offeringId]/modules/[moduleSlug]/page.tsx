import type { Metadata } from "next";
import { ModuleLearningScreen } from "@/components/dashboard/module-learning-screen";

export const metadata: Metadata = {
  title: "Course module",
  description: "Authorised LMS module and learning materials.",
  robots: { index: false, follow: false },
};

export default async function ModulePage({
  params,
}: {
  params: Promise<{ offeringId: string; moduleSlug: string }>;
}) {
  const { offeringId, moduleSlug } = await params;
  return (
    <ModuleLearningScreen offeringId={offeringId} moduleSlug={moduleSlug} />
  );
}
