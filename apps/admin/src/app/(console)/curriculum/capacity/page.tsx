"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useCurriculum } from "@tau/curriculum";
import {
  evaluateAcademicStaffRankMix,
  simulateCapacityScenario,
} from "@tau/curriculum";

export default function CapacityModelingPage() {
  const { capacityModels } = useCurriculum();
  const [selectedModelId, setSelectedModelId] = useState(
    capacityModels[0]?.id ?? "cap-csc"
  );

  const model =
    capacityModels.find((m) => m.id === selectedModelId) ?? capacityModels[0];

  // Interactive scenario simulator state
  const [simIntake, setSimIntake] = useState(model.institutionalTargetIntake);
  const [simLabCap, setSimLabCap] = useState(model.benchmark.maxLabBatchSize * 2);
  const [simClassCap, setSimClassCap] = useState(model.benchmark.maxClassSizeLecture);

  const rankMix = evaluateAcademicStaffRankMix(model.staffProfile);

  const activeScenario = simulateCapacityScenario(
    `Custom Simulation (${simIntake} Intake)`,
    simIntake,
    4,
    model.staffProfile,
    model.benchmark,
    simLabCap,
    simClassCap
  );

  // Variance calculation
  const variance = model.currentActualEnrolment - model.nucApprovedCarryingCapacity;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CUR-05 · Academic Planning & Resource Governance"
        title="Carrying capacity & demand modeling"
        description="Review teaching capacity and intake limits."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Programme:</span>
            <NativeSelect
              value={selectedModelId}
              onChange={(e) => {
                setSelectedModelId(e.target.value);
                const next = capacityModels.find((m) => m.id === e.target.value);
                if (next) setSimIntake(next.institutionalTargetIntake);
              }}
              className="text-xs w-52"
            >
              {capacityModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.programmeName}
                </option>
              ))}
            </NativeSelect>
          </div>
        }
      />

      {/* Statutory Quota vs Actual Variance Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <span className="text-xs text-muted-foreground block font-medium">NUC Approved Quota</span>
          <span className="text-3xl font-extrabold text-foreground">
            {model.nucApprovedCarryingCapacity}
          </span>
          <span className="text-[0.68rem] text-muted-foreground block mt-1">Statutory Ceiling</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <span className="text-xs text-muted-foreground block font-medium">Institutional Target</span>
          <span className="text-3xl font-extrabold text-primary">
            {model.institutionalTargetIntake}
          </span>
          <span className="text-[0.68rem] text-muted-foreground block mt-1">DAP Senate Target</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <span className="text-xs text-muted-foreground block font-medium">Actual Enrolment</span>
          <span className="text-3xl font-extrabold text-foreground">
            {model.currentActualEnrolment}
          </span>
          <span className="text-[0.68rem] text-muted-foreground block mt-1">Matriculated Freshmen</span>
        </div>

        <div
          className={`rounded-xl border p-4 shadow-card ${
            variance > 0
              ? "border-destructive/40 bg-destructive/5 text-destructive"
              : "border-emerald-500/40 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
          }`}
        >
          <span className="text-xs font-semibold block">Intake Quota Variance</span>
          <span className="text-3xl font-extrabold">
            {variance > 0 ? `+${variance}` : variance}
          </span>
          <span className="text-[0.68rem] block mt-1">
            {variance > 0
              ? "Over-enrolled (NUC Sanction Risk)"
              : variance === 0
              ? "Exactly at statutory quota"
              : `${Math.abs(variance)} admissions below quota limit`}
          </span>
        </div>
      </div>

      {/* Main Grid: Staffing Pyramid vs Interactive Scenario Simulator */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        {/* Left: Academic Staff Rank Mix & NUC Benchmark */}
        <div className="space-y-6">
          <Section
            title="Academic Staff Rank Mix & Pyramid"
            description="NUC Standard: ~20% Professorial, ~35% Senior Lecturer, ~45% Lecturer I & Below."
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>Total Department Academic Staff</span>
                  <span className="text-primary font-bold text-sm">
                    {model.staffProfile.totalAcademicStaff} Faculty
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Professors & Readers</span>
                  <span>
                    {model.staffProfile.professors + model.staffProfile.readersAssociateProfessors} ({rankMix.professorialPercent}%)
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Senior Lecturers</span>
                  <span>
                    {model.staffProfile.seniorLecturers} ({rankMix.seniorLecturerPercent}%)
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Lecturers I, II & Assistant</span>
                  <span>
                    {model.staffProfile.lecturersI + model.staffProfile.lecturersII + model.staffProfile.assistantLecturers} ({rankMix.juniorLecturerPercent}%)
                  </span>
                </div>
              </div>

              {/* Health Notes */}
              <div className="space-y-2">
                {rankMix.notes.map((note, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                      rankMix.isRankMixHealthy
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {rankMix.isRankMixHealthy ? (
                      <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600" />
                    )}
                    <span>{note}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground space-y-1">
                <span className="font-bold text-foreground block">
                  Statutory Discipline Benchmark:
                </span>
                <p>NUC Mandated Staff-to-Student Ratio: <strong>1:{model.benchmark.nucMandatedStaffStudentRatio}</strong></p>
                <p>Maximum Lab Batch Size: <strong>{model.benchmark.maxLabBatchSize} students</strong></p>
                <p>Minimum PhD Faculty Ratio: <strong>{model.benchmark.minPhdPercentage}%</strong></p>
              </div>
            </div>
          </Section>
        </div>

        {/* Right: Interactive Scenario Simulator */}
        <div className="space-y-6">
          <Section
            title="Interactive Carrying Capacity Simulator"
            description="Model projected multi-year student bodies, faculty load, and facility bottlenecks."
          >
            <div className="space-y-5">
              {/* Sliders / Inputs */}
              <div className="grid gap-4 sm:grid-cols-3 p-4 rounded-lg bg-muted/30 border border-border">
                <div className="space-y-1.5">
                  <Label htmlFor="sim-intake" className="text-xs">Annual Intake Target</Label>
                  <Input
                    id="sim-intake"
                    type="number"
                    min={20}
                    max={300}
                    value={simIntake}
                    onChange={(e) => setSimIntake(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sim-lab" className="text-xs">Lab Seating Capacity</Label>
                  <Input
                    id="sim-lab"
                    type="number"
                    min={20}
                    max={200}
                    value={simLabCap}
                    onChange={(e) => setSimLabCap(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sim-class" className="text-xs">Lecture Hall Limit</Label>
                  <Input
                    id="sim-class"
                    type="number"
                    min={40}
                    max={300}
                    value={simClassCap}
                    onChange={(e) => setSimClassCap(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Simulation Results Card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground">
                    Projected Scenario Outcomes
                  </h3>
                  <Badge
                    variant={activeScenario.isRatioCompliant ? "success" : "destructive"}
                    className="font-bold"
                  >
                    Ratio: 1:{activeScenario.resultingStaffStudentRatio}{" "}
                    {activeScenario.isRatioCompliant ? "(Compliant)" : "(Breach)"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded bg-muted/20 border border-border">
                    <span className="text-muted-foreground block">Projected 4-Year Body</span>
                    <span className="text-xl font-bold text-foreground">
                      {activeScenario.totalEnrolmentProjected} Students
                    </span>
                  </div>

                  <div className="p-3 rounded bg-muted/20 border border-border">
                    <span className="text-muted-foreground block">Faculty Required (1:{model.benchmark.nucMandatedStaffStudentRatio})</span>
                    <span className="text-xl font-bold text-foreground">
                      {activeScenario.staffRequired} Lecturers
                    </span>
                  </div>

                  <div className="p-3 rounded bg-muted/20 border border-border">
                    <span className="text-muted-foreground block">Faculty Available</span>
                    <span className="text-xl font-bold text-foreground">
                      {activeScenario.staffAvailable} Lecturers
                    </span>
                  </div>
                </div>

                {/* Bottlenecks */}
                {activeScenario.bottlenecksIdentified.length > 0 ? (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-xs space-y-2">
                    <span className="font-bold text-destructive flex items-center gap-1.5">
                      <AlertTriangle className="size-4" />
                      Capacity Bottlenecks Identified:
                    </span>
                    <ul className="list-disc list-inside text-destructive space-y-1">
                      {activeScenario.bottlenecksIdentified.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                    <p className="text-[0.7rem] text-muted-foreground pt-1 border-t border-destructive/20">
                      Estimated compensation budget required: ₦
                      {(activeScenario.additionalBudgetEstimateNaira).toLocaleString()} per annum.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>
                      Zero bottlenecks! Staff-to-student ratio and physical lab limits are fully compliant with NUC standards.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
