"use client";

import { toast } from "sonner";
import { BookOpen, FileDown, FileText, Landmark, Map, Receipt, ScrollText, ShieldCheck } from "lucide-react";
import { Button } from "@tau/ui/button";
import { Badge } from "@tau/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@tau/ui/tabs";
import { Card, CardContent } from "@tau/ui/card";

interface DownloadItem {
  title: string;
  description: string;
  meta: string;
  badge: string;
  Icon: typeof FileText;
}

const groups: { value: string; label: string; Icon: typeof FileText; items: DownloadItem[] }[] = [
  {
    value: "admissions",
    label: "Admissions",
    Icon: ScrollText,
    items: [
      {
        title: "Undergraduate Application Form",
        description: "Official application for the MBBS, BDS, Nursing, Pharmacy, and allied health programmes.",
        meta: "PDF · 1.2 MB · Updated for 2026/2027",
        badge: "Updated",
        Icon: FileText,
      },
      {
        title: "Postgraduate Application Form",
        description: "Applications for MSc, MD, and PhD programmes across all faculties.",
        meta: "PDF · 960 KB · Updated for 2026/2027",
        badge: "PDF",
        Icon: FileText,
      },
      {
        title: "Transcript Request Form",
        description: "For current and former students requesting official academic transcripts.",
        meta: "PDF · 410 KB",
        badge: "PDF",
        Icon: ScrollText,
      },
      {
        title: "Admissions Checklist",
        description: "Everything to prepare, from JAMB and WAEC results to medical fitness certificates.",
        meta: "PDF · 230 KB",
        badge: "Checklist",
        Icon: ShieldCheck,
      },
    ],
  },
  {
    value: "fees",
    label: "Tuition & Fees",
    Icon: Receipt,
    items: [
      {
        title: "Tuition Fee Schedule 2026/2027",
        description: "Full breakdown of tuition and fees for every faculty and level.",
        meta: "PDF · 540 KB",
        badge: "PDF",
        Icon: Receipt,
      },
      {
        title: "Scholarship & Bursary Guide",
        description: "Merit scholarships, need-based bursaries, and how to apply.",
        meta: "PDF · 610 KB",
        badge: "New",
        Icon: Landmark,
      },
      {
        title: "Hostel Fee Schedule",
        description: "Accommodation options and fee structure for all hostels on campus.",
        meta: "PDF · 320 KB",
        badge: "PDF",
        Icon: Landmark,
      },
    ],
  },
  {
    value: "library",
    label: "Library & Resources",
    Icon: BookOpen,
    items: [
      {
        title: "Medical Library Guide",
        description: "Collections, borrowing rules, opening hours, and how to access e-journals.",
        meta: "PDF · 780 KB",
        badge: "PDF",
        Icon: BookOpen,
      },
      {
        title: "E-Resources & Databases",
        description: "Step-by-step access to PubMed, Cochrane, and our journal subscriptions.",
        meta: "PDF · 500 KB",
        badge: "Guide",
        Icon: FileText,
      },
      {
        title: "Library Card Application",
        description: "Apply for your campus library card as a new student or staff member.",
        meta: "PDF · 290 KB",
        badge: "Form",
        Icon: FileText,
      },
    ],
  },
  {
    value: "campus",
    label: "Campus & Life",
    Icon: Map,
    items: [
      {
        title: "Campus Map",
        description: "Every building, hostel, and facility across the Awka campus.",
        meta: "PDF · 1.8 MB · Printable A3",
        badge: "Map",
        Icon: Map,
      },
      {
        title: "Student Handbook 2026/2027",
        description: "Academic regulations, student conduct, and campus services in one document.",
        meta: "PDF · 2.4 MB",
        badge: "Updated",
        Icon: BookOpen,
      },
      {
        title: "Academic Calendar 2026/2027",
        description: "Semester dates, examinations, and public holidays for the academic year.",
        meta: "PDF · 350 KB",
        badge: "PDF",
        Icon: FileDown,
      },
    ],
  },
];

export function DownloadsClient() {
  const handleDownload = (title: string) => {
    toast.success(`Download link sent`, {
      description: `${title} — a secure link has been emailed to you and expires in 24 hours.`,
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-8 rounded-3xl border border-gold/30 bg-gold/5 p-6 sm:p-8">
        <h2 className="font-display text-xl font-extrabold tracking-tight">Official NAU documents</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Browse the official 2026/2027 forms, schedules, and guides. Documents are issued securely on request — each
          download link is emailed to you and expires after 24 hours.
        </p>
      </div>

      <Tabs defaultValue="admissions">
        <TabsList className="h-auto flex-wrap justify-start rounded-2xl p-2">
          {groups.map((group) => (
            <TabsTrigger key={group.value} value={group.value} className="gap-2 py-2.5">
              <group.Icon className="size-4" aria-hidden="true" />
              {group.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {groups.map((group) => (
          <TabsContent key={group.value} value={group.value}>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.items.map(({ title, description, meta, badge, Icon }) => (
                <Card key={title} className="flex flex-col">
                  <CardContent className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-medical/10 text-medical">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <Badge variant="muted">{badge}</Badge>
                    </div>
                    <h3 className="mt-4 font-display font-bold leading-snug">{title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                    <p className="mt-3 text-xs text-muted-foreground">{meta}</p>
                    <Button
                      variant="outline"
                      className="mt-5 w-full"
                      onClick={() => handleDownload(title)}
                      aria-label={`Download ${title}`}
                    >
                      <FileDown aria-hidden="true" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { Icon: ShieldCheck, title: "Verified copies", text: "Documents carry the university seal and are reviewed each session." },
          { Icon: FileText, title: "Accessible formats", text: "Request large-print or screen-reader versions via the help desk." },
          { Icon: Landmark, title: "Verified originals", text: "Need a certified hard copy? Collect one at the registry office." },
        ].map(({ Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-6">
            <Icon className="size-6 text-medical" aria-hidden="true" />
            <h3 className="mt-3 font-display font-bold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
