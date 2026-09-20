"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@tau/ui/dialog";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Textarea } from "@tau/ui/textarea";
import { PageHeader } from "@/components/console/page-header";
import { useCurriculum, ProposalType } from "@tau/curriculum";
import { useSession } from "@/providers/session-provider";

export default function ProposalsPage() {
  const { proposals, programmes, mutations } = useCurriculum();
  const { session } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProposalType>("Programme Revision");
  const [programmeId, setProgrammeId] = useState(programmes[0]?.id ?? "prog-csc");
  const [targetSession, setTargetSession] = useState("2026/2027");
  const [rationale, setRationale] = useState("");
  const [changes, setChanges] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const prog = programmes.find((p) => p.id === programmeId);
    if (!prog) return;

    const res = mutations.submitProposal(
      {
        title,
        type,
        programmeId: prog.id,
        programmeName: prog.name,
        departmentId: prog.departmentId,
        departmentName: prog.departmentName,
        facultyId: prog.facultyId,
        facultyName: prog.facultyName,
        targetEffectiveSession: targetSession,
        rationale,
        summaryOfChanges: changes.split("\n").filter((l) => l.trim().length > 0),
      },
      {
        personId: session?.personId ?? "per-samuel",
        name: session?.displayName ?? "Dr. Samuel Okonkwo (HOD)",
      }
    );

    if (!res.ok) {
      setError(res.error ?? "Failed to create proposal");
    } else {
      setIsOpen(false);
      setTitle("");
      setRationale("");
      setChanges("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CUR-04 · Curriculum Governance & Senate Pipeline"
        title="Curriculum change proposals"
        description="Review and approve curriculum changes."
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 size-3.5" />
                Submit curriculum proposal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Submit Curriculum Change Proposal</DialogTitle>
                  <DialogDescription>
                    Requires comprehensive impact analysis and departmental board recommendation before Senate review.
                  </DialogDescription>
                </DialogHeader>

                {error && (
                  <div className="mt-3 p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
                    {error}
                  </div>
                )}

                <div className="grid gap-4 py-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="programme" className="text-xs">Programme</Label>
                    <NativeSelect
                      id="programme"
                      value={programmeId}
                      onChange={(e) => setProgrammeId(e.target.value)}
                      className="text-xs"
                    >
                      {programmes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </NativeSelect>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="type" className="text-xs">Proposal Type</Label>
                      <NativeSelect
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value as ProposalType)}
                        className="text-xs"
                      >
                        <option value="Programme Revision">Programme Revision</option>
                        <option value="New Course">New Course</option>
                        <option value="Course Revision">Course Revision</option>
                        <option value="Credit Adjustment">Credit Adjustment</option>
                        <option value="Course Archival">Course Archival</option>
                      </NativeSelect>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="session" className="text-xs">Target Effective Session</Label>
                      <Input
                        id="session"
                        value={targetSession}
                        onChange={(e) => setTargetSession(e.target.value)}
                        placeholder="2026/2027"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-xs">Proposal Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Realignment of 300-Level Software Engineering Tracks"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rationale" className="text-xs">Academic Rationale</Label>
                    <Textarea
                      id="rationale"
                      rows={3}
                      placeholder="Why is this change necessary? Mention industry trends, accreditation feedback, or pedagogical improvement..."
                      value={rationale}
                      onChange={(e) => setRationale(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="changes" className="text-xs">Summary of Proposed Changes (One per line)</Label>
                    <Textarea
                      id="changes"
                      rows={3}
                      placeholder="Add COS 201 as prerequisite to CSC 301&#10;Introduce 3 CU elective in Cloud Computing"
                      value={changes}
                      onChange={(e) => setChanges(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit for Faculty Review</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((proposal) => {
          const isSenateApproved = proposal.stage === "Senate Approved";
          const isRejected = proposal.stage === "Rejected";

          return (
            <div
              key={proposal.id}
              className="rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/40 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {proposal.proposalNumber}
                    </span>
                    <Badge variant="outline" className="text-[0.68rem]">
                      {proposal.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">· {proposal.programmeName}</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {proposal.title}
                  </h3>
                </div>

                <Badge
                  variant={isSenateApproved ? "success" : isRejected ? "destructive" : "warning"}
                  className="shrink-0 text-xs font-semibold"
                >
                  {proposal.stage}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {proposal.rationale}
              </p>

              {/* Summary of changes */}
              <div className="rounded-lg bg-muted/30 p-3 text-xs space-y-1 border border-border/60">
                <span className="font-semibold text-foreground text-[0.68rem] uppercase tracking-wider block">
                  Proposed Curriculum Adjustments:
                </span>
                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                  {proposal.summaryOfChanges.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span>Target: <strong>{proposal.targetEffectiveSession}</strong></span>
                  <span>Proposed by: <strong>{proposal.proposedByName}</strong> ({proposal.proposedAt})</span>
                  {proposal.senateResolutionRef && (
                    <span className="font-mono text-primary font-bold">
                      Senate: {proposal.senateResolutionRef}
                    </span>
                  )}
                </div>

                <Button asChild size="sm" variant="outline">
                  <Link href={`/curriculum/proposals/${proposal.id}`}>
                    Impact analysis & review <ArrowRight className="ml-1.5 size-3" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
