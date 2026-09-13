"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@tau/ui/dialog";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Textarea } from "@tau/ui/textarea";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useCurriculum } from "@tau/curriculum";
import { useSession } from "@/providers/session-provider";

type ReviewAction = "Faculty Board Approved" | "DAP Technical Review" | "Senate Approved" | "Rejected";

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { proposals, mutations } = useCurriculum();
  const { session } = useSession();

  const proposal = proposals.find((p) => p.id === id);

  // Review Dialog State - hooks called unconditionally
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<ReviewAction>(
    proposal?.stage === "Department Board Recommended"
      ? "Faculty Board Approved"
      : proposal?.stage === "Faculty Board Approved"
      ? "DAP Technical Review"
      : "Senate Approved"
  );
  const [comments, setComments] = useState("");
  const [minuteRef, setMinuteRef] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  if (!proposal) return notFound();

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const actor = {
      personId: session?.personId ?? "per-reviewer",
      name: session?.displayName ?? "Senate Reviewer",
    };

    const res = mutations.advanceProposalStage(
      proposal.id,
      reviewAction,
      comments,
      minuteRef,
      actor
    );

    if (!res.ok) {
      setActionError(res.error ?? "Failed to advance proposal");
    } else {
      setIsReviewOpen(false);
      setComments("");
      setMinuteRef("");
    }
  };

  const isFinalised = proposal.stage === "Senate Approved" || proposal.stage === "Rejected";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/curriculum/proposals"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary mb-3"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back to change proposals
        </Link>
        <PageHeader
          eyebrow={`${proposal.proposalNumber} · ${proposal.type}`}
          title={proposal.title}
          description={`${proposal.programmeName} · ${proposal.departmentName} · Target: ${proposal.targetEffectiveSession}`}
          actions={
            !isFinalised && (
              <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <ShieldCheck className="mr-1.5 size-3.5" />
                    Conduct maker-checker review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <form onSubmit={handleReview}>
                    <DialogHeader>
                      <DialogTitle>Maker-Checker Governance Review</DialogTitle>
                      <DialogDescription>
                        Separation of duties applies: the submitting departmental officer cannot approve this stage.
                      </DialogDescription>
                    </DialogHeader>

                    {actionError && (
                      <div className="mt-3 p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium flex items-start gap-2">
                        <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                        <span>{actionError}</span>
                      </div>
                    )}

                    <div className="grid gap-4 py-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="review-action" className="text-xs">Review Decision</Label>
                        <NativeSelect
                          id="review-action"
                          value={reviewAction}
                          onChange={(e) => setReviewAction(e.target.value as ReviewAction)}
                          className="text-xs"
                        >
                          {proposal.stage === "Department Board Recommended" && (
                            <option value="Faculty Board Approved">
                              Approve at Faculty Academic Board
                            </option>
                          )}
                          {proposal.stage === "Faculty Board Approved" && (
                            <option value="DAP Technical Review">
                              Pass DAP Technical Compliance Check
                            </option>
                          )}
                          {proposal.stage === "DAP Technical Review" && (
                            <option value="Senate Approved">
                              Ratify at University Senate (Final Approval)
                            </option>
                          )}
                          <option value="Rejected">Reject / Return to Department</option>
                        </NativeSelect>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="minute-ref" className="text-xs">
                          Meeting Minute / Resolution Reference
                        </Label>
                        <Input
                          id="minute-ref"
                          placeholder="e.g. SCI/FB/26/10 or SEN/RES/26/094"
                          value={minuteRef}
                          onChange={(e) => setMinuteRef(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="review-comments" className="text-xs">
                          Authorised Review Comments
                        </Label>
                        <Textarea
                          id="review-comments"
                          rows={3}
                          placeholder="Confirm that resource impact, staffing ratios, and prerequisite ripples were evaluated..."
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsReviewOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Submit Official Decision</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )
          }
        />
      </div>

      {/* Stage Progress Banner */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Current Stage
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-xl font-bold text-foreground">{proposal.stage}</h2>
              <Badge
                variant={
                  proposal.stage === "Senate Approved"
                    ? "success"
                    : proposal.stage === "Rejected"
                    ? "destructive"
                    : "warning"
                }
              >
                {proposal.stage === "Senate Approved" ? "Officially Ratified" : "In Governance"}
              </Badge>
            </div>
          </div>

          <div className="text-xs text-muted-foreground sm:text-right">
            <span>Proposed by: <strong>{proposal.proposedByName}</strong></span>
            <span className="block mt-0.5">Date: {proposal.proposedAt}</span>
          </div>
        </div>

        {/* Pipeline Bar */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/60 text-xs">
          {[
            { label: "1. Dept Board", active: true },
            {
              label: "2. Faculty Board",
              active: [
                "Faculty Board Approved",
                "DAP Technical Review",
                "Senate Approved",
              ].includes(proposal.stage),
            },
            {
              label: "3. DAP Review",
              active: ["DAP Technical Review", "Senate Approved"].includes(proposal.stage),
            },
            { label: "4. Senate Approval", active: proposal.stage === "Senate Approved" },
          ].map((step, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-center font-medium ${
                step.active
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-border/60 bg-muted/20 text-muted-foreground"
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>
      </div>

      {/* Impact Analysis Details (CUR-04 Acceptance Criteria) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Mandatory Curriculum Impact Analysis
            </h2>
            <p className="text-xs text-muted-foreground">
              Evaluated against student cohorts, downstream course ripples, academic staff, and teach-out rules.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-bold">
            CUR-04 Validated
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 1. Impacted Cohorts */}
          <Section
            title="1. Impacted Student Cohorts"
            description="Clear distinction between new entrants and continuing grandfathered cohorts."
          >
            <div className="space-y-3">
              {proposal.impactAnalysis.impactedCohorts.map((cohort, i) => (
                <div key={i} className="p-3 rounded-lg border border-border bg-card space-y-1 text-xs">
                  <span className="font-bold text-foreground block text-sm">
                    {cohort.cohortName}
                  </span>
                  <p className="text-muted-foreground">{cohort.effectDescription}</p>
                  <p className="text-[0.7rem] font-semibold text-primary">
                    Action: {cohort.actionRequired}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* 2. Prerequisite Ripple */}
          <Section
            title="2. Downstream Prerequisite Ripple Analysis"
            description="Identifies courses affected by syllabus, credit or sequencing shifts."
          >
            {proposal.impactAnalysis.prerequisiteRipple.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No downstream prerequisite dependencies affected by this change.
              </p>
            ) : (
              <div className="space-y-3">
                {proposal.impactAnalysis.prerequisiteRipple.map((ripple, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border bg-card space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-primary">
                        {ripple.affectedCourseCode}
                      </span>
                      <span className="text-[0.68rem] text-muted-foreground">
                        {ripple.affectedCourseTitle}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{ripple.natureOfImpact}</p>
                    <p className="text-[0.7rem] font-semibold text-emerald-600 dark:text-emerald-400">
                      Remedy: {ripple.recommendedRemedy}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* 3. Staffing & Workload */}
          <Section
            title="3. Academic Staffing & Workload Assessment"
            description="Ensuring qualified faculty exist before approving curriculum additions."
          >
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2 rounded bg-muted/40 border border-border">
                <span>Domain Specialisation Required</span>
                <span className="font-bold text-foreground">
                  {proposal.impactAnalysis.staffingImpact.specialisationRequired}
                </span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/40 border border-border">
                <span>Qualified Lecturers on Ground</span>
                <span className="font-bold text-foreground">
                  {proposal.impactAnalysis.staffingImpact.currentQualifiedStaffCount} Faculty
                </span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/40 border border-border">
                <span>Additional Staffing Needed</span>
                <span className="font-bold text-foreground">
                  {proposal.impactAnalysis.staffingImpact.additionalStaffNeeded} Lecturer(s)
                </span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/40 border border-border">
                <span>Weekly Teaching Load Addition</span>
                <span className="font-bold text-foreground">
                  {proposal.impactAnalysis.staffingImpact.projectedWeeklyTeachingHours} hrs/week
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>
                  {proposal.impactAnalysis.staffingImpact.isStaffingAdequate
                    ? "Existing department academic staff capacity is adequate for delivery."
                    : "Faculty recruitment must precede official launch."}
                </span>
              </div>
            </div>
          </Section>

          {/* 4. Transition & Teach-Out Plan */}
          <Section
            title="4. Transition & Teach-Out Plan"
            description="Protecting carryover students and preventing registration deadlocks."
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                <span className="font-bold text-foreground block">Carryover Handling</span>
                <p className="text-muted-foreground">
                  {proposal.impactAnalysis.transitionPlan.carryoverHandling}
                </p>
              </div>

              <div className="flex justify-between p-2 rounded bg-muted/40 border border-border">
                <span>Teach-out Window</span>
                <span className="font-bold text-foreground">
                  {proposal.impactAnalysis.transitionPlan.teachOutPeriodYears} Academic Years
                </span>
              </div>

              {proposal.impactAnalysis.transitionPlan.substitutionRulesProposed.length > 0 && (
                <div className="p-2 rounded border border-border space-y-1">
                  <span className="font-bold text-foreground">Proposed Substitution Rules:</span>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {proposal.impactAnalysis.transitionPlan.substitutionRulesProposed.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Governance & Review Trail */}
        <Section
          title="Staged Governance & Decision Audit Trail"
          description="Chronological record of maker-checker recommendations, minutes, and authorisations."
        >
          <div className="space-y-4">
            {proposal.reviewHistory.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card"
              >
                <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-sm text-foreground">{step.stage}</span>
                    <span className="text-muted-foreground">{step.decidedAt}</span>
                  </div>
                  <p className="text-muted-foreground">
                    Action taken by <strong>{step.decidedByName}</strong>:{" "}
                    <span className="font-semibold text-foreground">{step.decision}</span>
                  </p>
                  <p className="text-foreground/90 italic bg-muted/20 p-2 rounded border border-border/50">
                    &ldquo;{step.comments}&rdquo;
                  </p>
                  {step.minuteReference && (
                    <span className="text-[0.68rem] font-mono text-primary block">
                      Minute Ref: {step.minuteReference}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
