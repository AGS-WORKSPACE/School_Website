"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Plus,
  Sparkles,
} from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@tau/ui/dialog";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useCurriculum, EquivalencyType } from "@tau/curriculum";
import { resolveCourseSubstitution } from "@tau/curriculum";
import { useSession } from "@/providers/session-provider";

export default function EquivalenciesPage() {
  const { equivalencies, teachOutSchedules, mutations } = useCurriculum();
  const { session } = useSession();

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [srcCode, setSrcCode] = useState("");
  const [srcTitle, setSrcTitle] = useState("");
  const [srcCredits, setSrcCredits] = useState(3);
  const [repCode, setRepCode] = useState("");
  const [repTitle, setRepTitle] = useState("");
  const [repCredits, setRepCredits] = useState(3);
  const [eqType, setEqType] = useState<EquivalencyType>("Exact Equivalent");
  const [senateRef, setSenateRef] = useState("");
  const [note, setNote] = useState("");

  // Audit Simulator State
  const [simSourceCourse, setSimSourceCourse] = useState("CSC 203");
  const [simVersion, setSimVersion] = useState("2019-BMAS-v1.0");

  const simResult = resolveCourseSubstitution(
    simSourceCourse,
    simVersion,
    equivalencies
  );

  const handleCreateEquivalency = (e: React.FormEvent) => {
    e.preventDefault();

    mutations.addCourseEquivalency(
      {
        sourceCourseCode: srcCode,
        sourceCourseTitle: srcTitle,
        sourceCreditUnits: srcCredits,
        replacementCourseCode: repCode,
        replacementCourseTitle: repTitle,
        replacementCreditUnits: repCredits,
        type: eqType,
        applicableCurriculumVersions: ["*"],
        conditionsNote: note,
        senateApprovalRef: senateRef,
        effectiveDate: new Date().toISOString().split("T")[0],
      },
      {
        personId: session?.personId ?? "per-officer",
        name: session?.displayName ?? "Academic Records Officer",
      }
    );

    setIsOpen(false);
    setSrcCode("");
    setSrcTitle("");
    setRepCode("");
    setRepTitle("");
    setSenateRef("");
    setNote("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CUR-06 · Course Substitutions & Teach-Out Governance"
        title="Course equivalencies & teach-out rules"
        description="Deterministic course substitutions and phase-out schedules applied during registration and graduation degree audits."
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 size-3.5" />
                Register equivalency rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleCreateEquivalency}>
                <DialogHeader>
                  <DialogTitle>Register Approved Course Substitution</DialogTitle>
                  <DialogDescription>
                    Requires official Senate resolution reference and credit parity verification.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground block">
                      Source (Legacy / Discontinued Course)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Course Code (e.g. CSC 203)"
                        value={srcCode}
                        onChange={(e) => setSrcCode(e.target.value)}
                        required
                      />
                      <Input
                        type="number"
                        min={1}
                        placeholder="Credits (CU)"
                        value={srcCredits}
                        onChange={(e) => setSrcCredits(Number(e.target.value))}
                        required
                      />
                    </div>
                    <Input
                      placeholder="Course Title (e.g. Discrete Structures)"
                      value={srcTitle}
                      onChange={(e) => setSrcTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-2">
                    <span className="text-xs font-bold uppercase text-primary block">
                      Replacement (New Curriculum Course)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Course Code (e.g. COS 201)"
                        value={repCode}
                        onChange={(e) => setRepCode(e.target.value)}
                        required
                      />
                      <Input
                        type="number"
                        min={1}
                        placeholder="Credits (CU)"
                        value={repCredits}
                        onChange={(e) => setRepCredits(Number(e.target.value))}
                        required
                      />
                    </div>
                    <Input
                      placeholder="Course Title (e.g. Discrete Mathematics)"
                      value={repTitle}
                      onChange={(e) => setRepTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="eq-type" className="text-xs">Equivalency Type</Label>
                      <NativeSelect
                        id="eq-type"
                        value={eqType}
                        onChange={(e) => setEqType(e.target.value as EquivalencyType)}
                        className="text-xs"
                      >
                        <option value="Exact Equivalent">Exact Equivalent</option>
                        <option value="One-Way Substitution">One-Way Substitution</option>
                        <option value="Conditional Substitution">Conditional</option>
                      </NativeSelect>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="senate-ref" className="text-xs">Senate Resolution Ref</Label>
                      <Input
                        id="senate-ref"
                        placeholder="SEN/RES/26/088"
                        value={senateRef}
                        onChange={(e) => setSenateRef(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="note" className="text-xs">Conditions / Guidance Note</Label>
                    <Input
                      id="note"
                      placeholder="e.g. Full credit mapping; satisfies prerequisites"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Substitution Rule</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Interactive Degree Audit Simulator */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">
            Interactive Degree Audit & Registration Substitution Tester
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Simulate how course registration and graduation audit engines evaluate legacy courses for a student on a specific curriculum version.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
          <div className="space-y-1.5">
            <Label htmlFor="sim-course" className="text-xs font-semibold">Test Course Code</Label>
            <Input
              id="sim-course"
              value={simSourceCourse}
              onChange={(e) => setSimSourceCourse(e.target.value)}
              placeholder="e.g. CSC 203 or CHM 101"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sim-ver" className="text-xs font-semibold">Student Curriculum Version</Label>
            <NativeSelect
              id="sim-ver"
              value={simVersion}
              onChange={(e) => setSimVersion(e.target.value)}
              className="text-xs"
            >
              <option value="2019-BMAS-v1.0">2019-BMAS-v1.0 (Legacy Cohort)</option>
              <option value="2022-MDCN-v2.0">2022-MDCN-v2.0 (Medicine)</option>
              <option value="2023-CCMAS-v1.0">2023-CCMAS-v1.0 (CCMAS Cohort)</option>
            </NativeSelect>
          </div>
        </div>

        {/* Evaluation Output */}
        <div
          className={`p-4 rounded-lg border text-xs space-y-1.5 ${
            simResult.matched
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
              : "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200"
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {simResult.matched ? (
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            )}
            <span>
              {simResult.matched ? "Approved Substitution Resolved" : "Direct Registration Required"}
            </span>
          </div>
          <p className="leading-relaxed">{simResult.message}</p>
        </div>
      </div>

      {/* Equivalency Rules Matrix */}
      <div className="space-y-6">
        <Section
          title="Approved Course Equivalency & Substitution Matrix"
          description="Governed by Senate resolutions; valid across registration and graduation clearance."
        >
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 py-3">Source Course (Legacy)</th>
                  <th className="px-4 py-3 text-center">➔</th>
                  <th className="px-4 py-3">Replacement Course</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Senate Resolution</th>
                  <th className="px-4 py-3">Effective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {equivalencies.map((rule) => (
                  <tr key={rule.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono font-bold text-foreground">
                      {rule.sourceCourseCode} ({rule.sourceCreditUnits} CU)
                      <span className="text-[0.68rem] text-muted-foreground font-normal block">
                        {rule.sourceCourseTitle}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-primary font-bold">
                      <ArrowRight className="size-4 mx-auto" />
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-primary">
                      {rule.replacementCourseCode} ({rule.replacementCreditUnits} CU)
                      <span className="text-[0.68rem] text-muted-foreground font-normal block">
                        {rule.replacementCourseTitle}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[0.68rem]">
                        {rule.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-[0.7rem] text-muted-foreground">
                      {rule.senateApprovalRef}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {rule.effectiveDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Legacy Teach-Out Schedules */}
        <Section
          title="Active Curriculum Teach-Out Schedules"
          description="Monitoring phased-out curriculum versions to sunset without residual students."
        >
          <div className="space-y-4">
            {teachOutSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-5 rounded-xl border border-border bg-card space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      {schedule.programmeName}
                    </span>
                    <h3 className="font-bold text-base text-foreground">
                      {schedule.phasingOutVersionNumber} (Phasing Out)
                    </h3>
                  </div>
                  <Badge variant="warning">{schedule.status}</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 rounded-lg bg-muted/20 border border-border">
                  <div>
                    <span className="text-muted-foreground block">Last Freshmen Cohort</span>
                    <span className="font-bold">{schedule.lastFreshmenCohort}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Sunset Session</span>
                    <span className="font-bold text-destructive">{schedule.sunsetSession}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Final Resit Date</span>
                    <span className="font-bold">{schedule.remedialExamsFinalDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Active Students Remaining</span>
                    <span className="font-bold text-primary">{schedule.activeEnrolledStudentsInTeachOut} Students</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded border border-border">
                  <strong>Guidance for Academic Advisers:</strong> {schedule.guidanceForAdvisers}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
