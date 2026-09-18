/**
 * Templates and outcome-aligned shells (LMS-02). A shell is built only from a
 * published curriculum course version and an approved template for its mode.
 */

import type { Course } from "@tau/curriculum/domain";
import type { Assignment } from "../domain/assessment";
import type { ContentItem } from "../domain/content";
import type { CourseOffering, DeliveryMode, OfferingOutcome, OfferingStaff } from "../domain/offering";
import type { CourseTemplate, TemplateSectionKind } from "../domain/template";
import { check, type PolicyCheck } from "./check";

export const requiredSectionKinds: TemplateSectionKind[] = ["Orientation", "Outcomes", "Activities", "Assessment", "Support", "Accessibility_Checklist"];

export function validateTemplate(template: CourseTemplate): PolicyCheck {
  const errors: string[] = [];
  const present = new Set(template.sections.map((section) => section.kind));
  const missing = requiredSectionKinds.filter((kind) => !present.has(kind));
  if (missing.length) errors.push(`Missing template sections: ${missing.map((kind) => kind.replaceAll("_", " ").toLowerCase()).join(", ")}.`);
  if (template.deliveryModes.length === 0) errors.push("Name at least one delivery mode the template supports.");
  if (template.accessibilityChecklist.length === 0) errors.push("The accessibility checklist cannot be empty.");
  return check(errors);
}

/** The newest approved template that supports the delivery mode. */
export function templateFor(templates: CourseTemplate[], mode: DeliveryMode): CourseTemplate | undefined {
  return templates
    .filter((template) => template.status === "Approved" && template.deliveryModes.includes(mode) && validateTemplate(template).allowed)
    .sort((a, b) => b.version - a.version)[0];
}

export function buildOfferingShell(input: {
  id: string;
  course: Course;
  courseVersionId: string;
  session: string;
  semester: 1 | 2;
  deliveryMode: DeliveryMode;
  lecturers: OfferingStaff[];
  template: CourseTemplate;
  createdBy: string;
  now: string;
}): { check: PolicyCheck; offering?: CourseOffering } {
  const errors: string[] = [];
  const version = input.course.versions.find((item) => item.id === input.courseVersionId);
  if (!version) errors.push("That course version does not exist in the curriculum catalogue.");
  else if (version.status !== "Published") errors.push(`${input.course.code} version ${version.versionNumber} is ${version.status.toLowerCase()}; only a published version can be taught.`);
  if (input.template.status !== "Approved") errors.push("Only an approved template can build a course shell.");
  if (!input.template.deliveryModes.includes(input.deliveryMode)) errors.push(`${input.template.name} does not support ${input.deliveryMode.replaceAll("_", " ").toLowerCase()} delivery.`);
  errors.push(...validateTemplate(input.template).errors);
  if (input.lecturers.length === 0) errors.push("Assign at least one lecturer.");
  if (errors.length || !version) return { check: check(errors) };

  const outcomes: OfferingOutcome[] = version.learningOutcomes.map((outcome) => ({ id: outcome.id, code: outcome.code, description: outcome.description }));
  return {
    check: check([]),
    offering: {
      id: input.id,
      courseId: input.course.id,
      courseVersionId: version.id,
      courseCode: input.course.code,
      courseTitle: input.course.title,
      session: input.session,
      semester: input.semester,
      deliveryMode: input.deliveryMode,
      lecturers: input.lecturers,
      outcomes,
      assessmentScheme: { ...version.assessmentScheme },
      templateId: input.template.id,
      templateVersion: input.template.version,
      status: "Shell_Created",
      createdAt: input.now,
      createdBy: input.createdBy,
    },
  };
}

export interface OutcomeCoverage {
  outcome: OfferingOutcome;
  activities: number;
  assessedBy: number;
  covered: boolean;
}

/** Every outcome should be taught by at least one activity and assessed by at least one rubric criterion. */
export function outcomeCoverage(offering: CourseOffering, content: ContentItem[], assignments: Assignment[]): OutcomeCoverage[] {
  return offering.outcomes.map((outcome) => {
    const activities = content.filter((item) => item.offeringId === offering.id && item.outcomeIds.includes(outcome.id)).length;
    const assessedBy = assignments.filter((item) => item.offeringId === offering.id).flatMap((item) => item.rubric).filter((criterion) => criterion.outcomeId === outcome.id).length;
    return { outcome, activities, assessedBy, covered: activities > 0 && assessedBy > 0 };
  });
}
