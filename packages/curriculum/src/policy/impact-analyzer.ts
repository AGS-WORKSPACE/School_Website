/**
 * Curriculum change proposal impact analysis engine (CUR-04).
 *
 * Automatically calculates:
 * 1. Cohort impact: which graduating classes and entry cohorts are affected
 * 2. Prerequisite ripple: identifies downstream courses that list the changed course as prerequisite
 * 3. Academic staffing impact: evaluates teaching load against available qualified lecturers
 * 4. Teach-out requirements: computes transition rules for carryover or returning students
 */

import type { Course } from "../domain/course";
import type { ImpactAnalysis } from "../domain/proposal";
import { normalizeCourseCode } from "./code-policy";

export interface ImpactAnalysisRequest {
  targetCourseCode: string;
  targetCourseTitle: string;
  targetEffectiveSession: string; // e.g. "2026/2027"
  isCreditChanged: boolean;
  oldCredits: number;
  newCredits: number;
  isDeletedOrPhasedOut: boolean;
  replacementCourseCode?: string;
  allCourses: Course[];
  currentSpecialistStaffCount: number;
}

export function generateCurriculumImpactAnalysis(
  req: ImpactAnalysisRequest
): ImpactAnalysis {
  const normalizedTarget = normalizeCourseCode(req.targetCourseCode);

  // 1. Prerequisite Ripple: Find which other courses depend on this course
  const ripples: ImpactAnalysis["prerequisiteRipple"] = [];

  for (const course of req.allCourses) {
    if (normalizeCourseCode(course.code) === normalizedTarget) continue;

    const activeVersion = course.versions.find((v) => v.id === course.activeVersionId);
    if (!activeVersion) continue;

    const hasDependency = activeVersion.prerequisites.some(
      (p) => normalizeCourseCode(p.courseCode) === normalizedTarget
    );

    if (hasDependency) {
      let nature = "Depends on prerequisite knowledge.";
      let remedy = "Maintain existing syllabus sequencing.";

      if (req.isDeletedOrPhasedOut) {
        nature = `Direct prerequisite will be phased out. Enrolled students will encounter registration block.`;
        remedy = req.replacementCourseCode
          ? `Update prerequisite definition to substitute with ${req.replacementCourseCode}.`
          : `Remove dependency or specify an approved substitute in curriculum version.`;
      } else if (req.isCreditChanged) {
        nature = `Prerequisite credit weight shifted (${req.oldCredits} -> ${req.newCredits} CU), altering student background mastery.`;
        remedy = `Review first 4 weeks of ${course.code} outline to ensure smooth conceptual onboarding.`;
      }

      ripples.push({
        affectedCourseCode: course.code,
        affectedCourseTitle: course.title,
        natureOfImpact: nature,
        recommendedRemedy: remedy,
      });
    }
  }

  // 2. Cohort Impact: Freshmen vs Continuing Students
  const [sessionStartYear] = req.targetEffectiveSession.split("/").map(Number);
  const nextYear = sessionStartYear + 1;

  const impactedCohorts: ImpactAnalysis["impactedCohorts"] = [
    {
      cohortName: `${sessionStartYear}/${nextYear} Freshmen and Direct Entry`,
      effectDescription: `Admitted directly onto the new curriculum schedule with updated course specifications.`,
      actionRequired: "Enrol on revised course schedule at matriculation onboarding.",
    },
    {
      cohortName: `Continuing Cohorts (${sessionStartYear - 1} and earlier entries)`,
      effectDescription: req.isDeletedOrPhasedOut
        ? `Students with outstanding carryovers must take approved equivalent course.`
        : `Continue on their matriculation curriculum version (grandfathered).`,
      actionRequired: req.isDeletedOrPhasedOut
        ? "Publish automatic substitution rule before semester registration opens."
        : "No change to degree audit requirements.",
    },
  ];

  // 3. Staffing Impact
  const teachingHoursPerWeek = req.newCredits * 2; // Approximate lecture + practical load
  const isStaffingAdequate = req.currentSpecialistStaffCount >= 2;
  const additionalStaffNeeded = isStaffingAdequate ? 0 : 1;

  const staffingImpact: ImpactAnalysis["staffingImpact"] = {
    specialisationRequired: `${req.targetCourseCode} subject matter domain`,
    currentQualifiedStaffCount: req.currentSpecialistStaffCount,
    additionalStaffNeeded,
    projectedWeeklyTeachingHours: teachingHoursPerWeek,
    isStaffingAdequate,
  };

  // 4. Resource Requirements
  const resourceRequirements: ImpactAnalysis["resourceRequirements"] = {
    labEquipmentNeeded: req.newCredits >= 3 ? ["Dedicated computing workstation / laboratory bench space"] : [],
    softwareLicensesNeeded: ["Standard academic software repository access"],
    estimatedBudgetNaira: additionalStaffNeeded > 0 ? 3500000 : 500000,
    facilitiesReadiness: isStaffingAdequate ? "Ready" : "Upgrade Required",
  };

  // 5. Transition & Teach-Out Plan
  const transitionPlan: ImpactAnalysis["transitionPlan"] = {
    carryoverHandling: req.replacementCourseCode
      ? `Students with carryover in ${req.targetCourseCode} will take ${req.replacementCourseCode}; credit earned will satisfy graduation requirement without GPA penalty.`
      : `Two remedial resit examinations will be administered prior to syllabus sunset.`,
    teachOutPeriodYears: 3,
    substitutionRulesProposed: req.replacementCourseCode
      ? [`${req.targetCourseCode} -> ${req.replacementCourseCode} (Exact Equivalent)`]
      : [],
  };

  return {
    impactedCohorts,
    prerequisiteRipple: ripples,
    staffingImpact,
    resourceRequirements,
    transitionPlan,
  };
}
