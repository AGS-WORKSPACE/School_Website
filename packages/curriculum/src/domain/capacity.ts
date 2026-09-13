/**
 * Programme carrying capacity and demand modeling contracts (CUR-05).
 *
 * Models academic staff-to-student ratios against NUC benchmarks,
 * rank distribution pyramids, laboratory constraints and variance against actual intake.
 */

export interface AcademicStaffProfile {
  totalAcademicStaff: number;
  professors: number;
  readersAssociateProfessors: number;
  seniorLecturers: number;
  lecturersI: number;
  lecturersII: number;
  assistantLecturers: number;
}

export interface CapacityBenchmark {
  discipline: string; // e.g. "Computing", "Medicine", "Engineering"
  nucMandatedStaffStudentRatio: number; // e.g. 15 for 1:15
  maxClassSizeLecture: number;
  maxLabBatchSize: number;
  minPhdPercentage: number; // e.g. 60%
}

export interface CapacityScenario {
  id: string;
  scenarioName: string; // e.g. "Scenario A: Conservative (120 Quota)" vs "Scenario B: Aggressive (180 Quota)"
  targetIntake: number;
  totalEnrolmentProjected: number; // Across all 4-6 years
  staffRequired: number;
  staffAvailable: number;
  resultingStaffStudentRatio: number; // e.g. 18.5
  isRatioCompliant: boolean;
  labCapacityLimit: number;
  classroomCapacityLimit: number;
  bottlenecksIdentified: string[];
  additionalBudgetEstimateNaira: number;
}

export interface CapacityModel {
  id: string;
  programmeId: string;
  programmeName: string;
  session: string; // e.g. "2026/2027"
  nucApprovedCarryingCapacity: number; // Statutory ceiling set by NUC
  institutionalTargetIntake: number;
  currentActualEnrolment: number;
  varianceEnrolmentVsQuota: number; // Positive = Over-enrolled, Negative = Under-enrolled
  staffProfile: AcademicStaffProfile;
  benchmark: CapacityBenchmark;
  scenarios: CapacityScenario[];
  selectedScenarioId: string;
  lastUpdated: string;
  updatedBy: string;
  version: string;
}
