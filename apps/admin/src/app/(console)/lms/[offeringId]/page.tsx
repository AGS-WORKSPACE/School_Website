"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLms } from "@tau/lms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { PageHeader } from "@/components/console/page-header";
import { LmsActorSwitcher } from "@/features/lms/acting-as";
import { AssessmentPanel } from "@/features/lms/assessment-panel";
import { CommunityPanel } from "@/features/lms/community-panel";
import { ContentPanel } from "@/features/lms/content-panel";
import { RosterPanel } from "@/features/lms/roster-panel";
import { StructurePanel } from "@/features/lms/structure-panel";
import { humanise } from "@/lib/format";

export default function OfferingPage({ params }: { params: Promise<{ offeringId: string }> }) {
  const { offeringId } = use(params);
  const { offerings } = useLms();
  const offering = offerings.find((item) => item.id === offeringId);
  if (!offering) return notFound();

  return (
    <div className="space-y-6">
      <Link href="/lms" className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="size-4" /> Course delivery</Link>
      <PageHeader
        eyebrow={`${offering.courseCode} · ${offering.session} semester ${offering.semester} · ${humanise(offering.deliveryMode)}`}
        title={offering.courseTitle}
          description={`Taught by ${offering.lecturers.map((item) => item.name).join(", ")}.`}
        actions={<LmsActorSwitcher />}
      />
      <Tabs defaultValue="roster" className="min-w-0">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <TabsList className="inline-flex min-w-max">
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="structure">Outcomes &amp; template</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
        </TabsList>
        </div>
        <TabsContent value="roster" className="mt-6"><RosterPanel offering={offering} /></TabsContent>
        <TabsContent value="structure" className="mt-6"><StructurePanel offering={offering} /></TabsContent>
        <TabsContent value="content" className="mt-6"><ContentPanel offering={offering} /></TabsContent>
        <TabsContent value="community" className="mt-6"><CommunityPanel offering={offering} /></TabsContent>
        <TabsContent value="assessment" className="mt-6"><AssessmentPanel offering={offering} /></TabsContent>
      </Tabs>
    </div>
  );
}
