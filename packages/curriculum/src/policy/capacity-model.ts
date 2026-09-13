/**
 * Carrying capacity and staff-to-student ratio policy engine (CUR-05).
 *
 * Implements statutory NUC carrying capacity standards,
 * discipline-specific staff-to-student ratios and academic rank mix benchmarks.
 */

import type {
  AcademicStaffProfile,
  CapacityBenchmark,
  CapacityScenario,
} from "../domain/capacity";

export const NUC_DISCIPLINE_RATIOS: Record<string, number> = {
  Medicine: 10, // 1:10
  Dentistry: 10, // 1:10
  Nursing: 12, // 1:12
  Pharmacy: 12, // 1:12
  Computing: 15, // 1:15
  Engineering: 15, // 1:15
  Sciences: 15, // 1:15
  Law: 20, // 1:20
  "Management Sciences": 30, // 1:30
  "Social Sciences": 30, // 1:30
  Arts: 30, // 1:30
  Education: 30, // 1:30
};

export function getNUCMandatedRatio(discipline: string): number {
  return NUC_DISCIPLINE_RATIOS[discipline] ?? 20;
}

export function evaluateAcademicStaffRankMix(profile: AcademicStaffProfile): {
  professorialPercent: number;
  seniorLecturerPercent: number;
  juniorLecturerPercent: number;
  isRankMixHealthy: boolean;
  notes: string[];
} {
  const total = profile.totalAcademicStaff;
  if (total === 0) {
    return {
      professorialPercent: 0,
      seniorLecturerPercent: 0,
      juniorLecturerPercent: 0,
      isRankMixHealthy: false,
      notes: ["No academic staff recorded."],
    };
  }

  const professorial = profile.professors + profile.readersAssociateProfessors;
  const senior = profile.seniorLecturers;
  const junior = profile.lecturersI + profile.lecturersII + profile.assistantLecturers;

  const professorialPercent = Math.round((professorial / total) * 100);
  const seniorLecturerPercent = Math.round((senior / total) * 100);
  const juniorLecturerPercent = Math.round((junior / total) * 100);

  const notes: string[] = [];

  // NUC Pyramid Guidelines: ~20% Professorial, ~35% Senior Lecturer, ~45% Lecturer I & below
  if (professorialPercent < 15) {
    notes.push(
      `Professorial cadre (${professorialPercent}%) is below NUC 20% target. Requires senior academic leadership recruitment.`
    );
  }
  if (juniorLecturerPercent > 55) {
    notes.push(
      `Junior lecturer cadre (${juniorLecturerPercent}%) exceeds 50%, risking high teaching load on early-career faculty.`
    );
  }

  const isRankMixHealthy = professorialPercent >= 15 && juniorLecturerPercent <= 60;
  if (isRankMixHealthy) {
    notes.push("Academic staff rank distribution complies with NUC pyramid benchmarks.");
  }

  return {
    professorialPercent,
    seniorLecturerPercent,
    juniorLecturerPercent,
    isRankMixHealthy,
    notes,
  };
}

export function simulateCapacityScenario(
  scenarioName: string,
  targetIntake: number,
  programmeDurationYears: number,
  staffProfile: AcademicStaffProfile,
  benchmark: CapacityBenchmark,
  labCapacity: number,
  classroomCapacity: number
): CapacityScenario {
  // Steady state total enrollment = target intake * duration (accounting for minor attrition 5%)
  const totalEnrolmentProjected = Math.round(targetIntake * programmeDurationYears * 0.95);

  // Staff needed to maintain NUC ratio
  const staffRequired = Math.ceil(totalEnrolmentProjected / benchmark.nucMandatedStaffStudentRatio);
  const staffAvailable = staffProfile.totalAcademicStaff;

  const resultingStaffStudentRatio =
    staffAvailable > 0
      ? Math.round((totalEnrolmentProjected / staffAvailable) * 10) / 10
      : totalEnrolmentProjected;

  const isRatioCompliant = resultingStaffStudentRatio <= benchmark.nucMandatedStaffStudentRatio;

  const bottlenecks: string[] = [];

  if (!isRatioCompliant) {
    bottlenecks.push(
      `Staff-to-student ratio (1:${resultingStaffStudentRatio}) breaches NUC ceiling (1:${benchmark.nucMandatedStaffStudentRatio}). Need ${staffRequired - staffAvailable} additional lecturers.`
    );
  }

  if (targetIntake > labCapacity) {
    bottlenecks.push(
      `Freshman lab intake (${targetIntake}) exceeds physical laboratory seating limit (${labCapacity}). Requires dual laboratory shifts.`
    );
  }

  if (targetIntake > classroomCapacity) {
    bottlenecks.push(
      `Target intake (${targetIntake}) exceeds largest assigned lecture theatre (${classroomCapacity}).`
    );
  }

  const staffDeficit = Math.max(0, staffRequired - staffAvailable);
  const additionalBudgetEstimateNaira = staffDeficit * 6000000; // ~6M Naira per annum lecturer compensation

  return {
    id: `scen-${scenarioName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    scenarioName,
    targetIntake,
    totalEnrolmentProjected,
    staffRequired,
    staffAvailable,
    resultingStaffStudentRatio,
    isRatioCompliant,
    labCapacityLimit: labCapacity,
    classroomCapacityLimit: classroomCapacity,
    bottlenecksIdentified: bottlenecks,
    additionalBudgetEstimateNaira,
  };
}
