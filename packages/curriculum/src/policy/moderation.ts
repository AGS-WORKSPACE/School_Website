import type { AssessmentConfiguration } from "../domain/assessment";
import type { CourseRegistrationRecord, MarkEntryRecord } from "../domain/mark-entry";
import type { GradeDistributionBand, ModerationAnomaly, ModerationSummary } from "../domain/moderation";

const gradeBands = [
  { label: "A", minimum: 70, maximum: 100 },
  { label: "B", minimum: 60, maximum: 69 },
  { label: "C", minimum: 50, maximum: 59 },
  { label: "D", minimum: 45, maximum: 49 },
  { label: "E", minimum: 40, maximum: 44 },
  { label: "F", minimum: 0, maximum: 39 },
];

export function calculateModerationSummary(input: {
  entries: MarkEntryRecord[];
  registrations: CourseRegistrationRecord[];
  configuration: AssessmentConfiguration;
  componentId: string;
}): ModerationSummary {
  const registrations = input.registrations.filter((registration) => registration.status === "Registered" && registration.courseCode === input.configuration.courseCode);
  const entries = input.entries.filter((entry) => entry.componentId === input.componentId && entry.courseCode === input.configuration.courseCode);
  const submitted = entries.filter((entry) => entry.mark !== null);
  const outOfRange = submitted.filter((entry) => entry.mark !== null && (entry.mark < 0 || entry.mark > entry.maximumMark));
  const validMarks = submitted.filter((entry) => entry.mark !== null && entry.mark >= 0 && entry.mark <= entry.maximumMark).map((entry) => entry.mark as number);
  const sorted = [...validMarks].sort((a, b) => a - b);
  const passCount = validMarks.filter((mark) => mark >= 40).length;
  const average = validMarks.length ? validMarks.reduce((sum, mark) => sum + mark, 0) / validMarks.length : null;
  const distribution: GradeDistributionBand[] = gradeBands.map((band) => {
    const count = validMarks.filter((mark) => mark >= band.minimum && mark <= band.maximum).length;
    return { ...band, count, percentage: validMarks.length ? (count / validMarks.length) * 100 : 0 };
  });

  return {
    classSize: registrations.length,
    submittedMarks: submitted.length,
    average,
    minimum: sorted[0] ?? null,
    maximum: sorted[sorted.length - 1] ?? null,
    median: sorted.length ? sorted.length % 2 ? sorted[Math.floor(sorted.length / 2)] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : null,
    passCount,
    failCount: validMarks.length - passCount,
    missingMarks: Math.max(registrations.length - submitted.length, 0),
    outOfRangeCount: outOfRange.length,
    gradeDistribution: distribution,
  };
}

export function detectModerationAnomalies(input: {
  summary: ModerationSummary;
  previousApprovedAverage?: number;
}): ModerationAnomaly[] {
  const anomalies: ModerationAnomaly[] = [];
  const passRate = input.summary.submittedMarks ? (input.summary.passCount / input.summary.submittedMarks) * 100 : 0;
  const largestBand = [...input.summary.gradeDistribution].sort((a, b) => b.count - a.count)[0];

  if (input.summary.missingMarks > 0) anomalies.push({ id: "missing-marks", type: "Missing marks", severity: "Warning", message: `${input.summary.missingMarks} registered student${input.summary.missingMarks === 1 ? " has" : "s have"} no submitted mark.`, isEvidenceOfWrongdoing: false });
  if (input.summary.outOfRangeCount > 0) anomalies.push({ id: "out-of-range", type: "Out-of-range values", severity: "Error", message: `${input.summary.outOfRangeCount} submitted mark${input.summary.outOfRangeCount === 1 ? " is" : "s are"} outside the configured range.`, isEvidenceOfWrongdoing: false });
  if (input.summary.submittedMarks > 0 && passRate < 50) anomalies.push({ id: "high-failure-rate", type: "High failure rate", severity: "Warning", message: `The current failure rate is ${(100 - passRate).toFixed(1)}%, which is above the review threshold.`, isEvidenceOfWrongdoing: false });
  if (largestBand && largestBand.percentage >= 70) anomalies.push({ id: "grade-concentration", type: "Grade concentration", severity: "Info", message: `${largestBand.percentage.toFixed(1)}% of valid marks are in grade band ${largestBand.label}.`, isEvidenceOfWrongdoing: false });
  if (input.summary.submittedMarks >= 3 && input.summary.average !== null && input.summary.maximum !== null && input.summary.minimum !== null && input.summary.maximum - input.summary.minimum < 5) anomalies.push({ id: "unusual-distribution", type: "Unusual distribution", severity: "Info", message: "Submitted marks have a narrow spread and should be reviewed in context.", isEvidenceOfWrongdoing: false });
  if (input.previousApprovedAverage !== undefined && input.summary.average !== null && Math.abs(input.summary.average - input.previousApprovedAverage) >= 10) anomalies.push({ id: "version-change", type: "Version change", severity: "Warning", message: `Average changed by ${Math.abs(input.summary.average - input.previousApprovedAverage).toFixed(1)} points from the previous approved version.`, isEvidenceOfWrongdoing: false });
  return anomalies;
}
