import type { AssessmentConfiguration } from "../domain/assessment";
import type { CourseRegistrationRecord, MarkEntryRecord, MarkValidationIssue, MarkValidationResult } from "../domain/mark-entry";

export function validateMarkEntry(input: {
  mark: number | null;
  submittedValue?: string;
  studentNumber: string;
  courseCode: string;
  componentId: string;
  registration?: CourseRegistrationRecord;
  configuration?: AssessmentConfiguration;
  existingRecords?: MarkEntryRecord[];
  recordStatus?: MarkEntryRecord["recordStatus"];
}): MarkValidationResult {
  const issues: MarkValidationIssue[] = [];
  const component = input.configuration?.components.find((item) => item.id === input.componentId);

  if (!input.studentNumber.trim()) issues.push({ code: "invalid-format", severity: "Error", field: "studentNumber", message: "Student identifier is required." });
  if (input.submittedValue !== undefined && input.submittedValue.trim() !== "" && input.mark === null) issues.push({ code: "invalid-format", severity: "Error", field: "mark", message: "Mark must be a number or blank." });
  if (!component || input.courseCode !== input.configuration?.courseCode) issues.push({ code: "invalid-component", severity: "Error", field: "component", message: "The assessment component is not valid for this course configuration." });
  if (!input.registration || input.registration.courseCode !== input.courseCode) issues.push({ code: "invalid-student-course", severity: "Error", message: "The student and course combination is not valid." });
  if (input.registration && input.registration.status !== "Registered") issues.push({ code: "student-not-registered", severity: "Error", message: `Student is ${input.registration.status.toLowerCase()} for this course.` });
  if (input.mark === null) issues.push({ code: "missing-mark", severity: "Warning", field: "mark", message: "No mark has been entered yet." });
  if (input.mark !== null && (!Number.isFinite(input.mark) || input.mark < 0)) issues.push({ code: "below-minimum", severity: "Error", field: "mark", message: "Mark cannot be below 0." });
  if (input.mark !== null && component && input.mark > component.maximumMark) issues.push({ code: "above-maximum", severity: "Error", field: "mark", message: `Mark cannot exceed ${component.maximumMark}.` });
  if (input.existingRecords?.some((record) => record.studentNumber === input.studentNumber && record.id !== input.existingRecords?.[0]?.id)) issues.push({ code: "duplicate-student", severity: "Error", field: "studentNumber", message: "A mark record already exists for this student and component." });
  if (input.recordStatus === "Approved") issues.push({ code: "approved-result", severity: "Error", message: "Approved results cannot be overwritten from mark entry." });

  return { status: issues.some((issue) => issue.severity === "Error") ? "Error" : issues.length ? "Warning" : "Valid", issues };
}

export function parseMarkValue(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}
