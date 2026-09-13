import test from "node:test";
import assert from "node:assert/strict";

import {
  validateCourseCode,
  normalizeCourseCode,
  requiresNewCourseVersion,
} from "./code-policy";
import {
  detectPrerequisiteCycles,
  evaluatePrerequisites,
} from "./prerequisite";
import {
  calculateCCMASDistribution,
  auditCCMASCompliance,
} from "./ccmas-engine";
import { generateCurriculumImpactAnalysis } from "./impact-analyzer";
import {
  getNUCMandatedRatio,
  evaluateAcademicStaffRankMix,
  simulateCapacityScenario,
} from "./capacity-model";
import {
  resolveCourseSubstitution,
  satisfiesDegreeRequirement,
} from "./equivalency-resolver";
import type { Course, CourseVersion } from "../domain/course";
import type { CourseCCMASMapping, CCMASBenchmark } from "../domain/ccmas";
import type { CourseEquivalency } from "../domain/equivalency";

test("CUR-02: Course Code Policy & Normalization", async (t) => {
  await t.test("normalizes course codes correctly", () => {
    assert.equal(normalizeCourseCode("csc201"), "CSC 201");
    assert.equal(normalizeCourseCode("  mth 101 "), "MTH 101");
    assert.equal(normalizeCourseCode("GST111"), "GST 111");
  });

  await t.test("rejects invalid course code formats", () => {
    const res = validateCourseCode("INVALID", []);
    assert.equal(res.valid, false);
    assert.match(res.error ?? "", /Invalid course code format/);
  });

  await t.test("enforces course code uniqueness across catalogue", () => {
    const catalogue = [{ id: "c-1", code: "CSC 201" }];
    const duplicate = validateCourseCode("csc 201", catalogue);
    assert.equal(duplicate.valid, false);
    assert.match(duplicate.error ?? "", /already allocated/);

    const sameCourseEdit = validateCourseCode("CSC 201", catalogue, "c-1");
    assert.equal(sameCourseEdit.valid, true);

    const freshCode = validateCourseCode("CSC 202", catalogue);
    assert.equal(freshCode.valid, true);
  });

  await t.test("detects breaking credit changes requiring a new course version", () => {
    const version: CourseVersion = {
      id: "v1",
      versionNumber: "v1.0",
      effectiveSessionFrom: "2023/2024",
      credits: { lectureHours: 2, tutorialHours: 0, practicalHours: 3, creditUnits: 3 },
      synopsis: "Intro to programming",
      syllabusOutline: [],
      learningOutcomes: [
        { id: "clo1", code: "CLO-1", description: "Write loops", bloomLevel: "Applying" },
      ],
      prerequisites: [],
      assessmentScheme: { continuousAssessmentPercent: 30, practicalPercent: 20, finalExamPercent: 50 },
      recommendedTextbooks: [],
      status: "Published",
      createdAt: "2023-09-01",
      createdBy: "staff",
    };

    const editSameCredits = requiresNewCourseVersion(version, {
      synopsis: "Updated intro text",
    });
    assert.equal(editSameCredits.requiresNewVersion, false);

    const editCredits = requiresNewCourseVersion(version, {
      credits: { lectureHours: 3, tutorialHours: 0, practicalHours: 3, creditUnits: 4 },
    });
    assert.equal(editCredits.requiresNewVersion, true);
    assert.match(editCredits.reason ?? "", /Changing credit units mandates a new version/);
  });
});

test("CUR-02: Prerequisite Cycles and Satisfaction", async (t) => {
  const dummyVersion = (prereqs: string[]): CourseVersion => ({
    id: "v1",
    versionNumber: "v1.0",
    effectiveSessionFrom: "2023/2024",
    credits: { lectureHours: 2, tutorialHours: 0, practicalHours: 0, creditUnits: 2 },
    synopsis: "",
    syllabusOutline: [],
    learningOutcomes: [],
    prerequisites: prereqs.map((code) => ({ courseCode: code, courseId: `id-${code}` })),
    assessmentScheme: { continuousAssessmentPercent: 30, practicalPercent: 0, finalExamPercent: 70 },
    recommendedTextbooks: [],
    status: "Published",
    createdAt: "2023-09-01",
    createdBy: "staff",
  });

  await t.test("passes when prerequisite chain is acyclic", () => {
    const courses: Course[] = [
      {
        id: "c1",
        code: "MTH 101",
        title: "Calculus I",
        level: 100,
        semester: 1,
        departmentId: "d1",
        departmentName: "Mathematics",
        facultyId: "f1",
        classification: "Core",
        deliveryMode: "In-Person",
        activeVersionId: "v1",
        versions: [dummyVersion([])],
      },
      {
        id: "c2",
        code: "MTH 201",
        title: "Calculus II",
        level: 200,
        semester: 1,
        departmentId: "d1",
        departmentName: "Mathematics",
        facultyId: "f1",
        classification: "Core",
        deliveryMode: "In-Person",
        activeVersionId: "v1",
        versions: [dummyVersion(["MTH 101"])],
      },
    ];

    const res = detectPrerequisiteCycles(courses);
    assert.equal(res.hasCycle, false);
  });

  await t.test("detects circular prerequisite loops", () => {
    const cyclicCourses: Course[] = [
      {
        id: "c1",
        code: "CSC 201",
        title: "Data Structures",
        level: 200,
        semester: 1,
        departmentId: "d1",
        departmentName: "CS",
        facultyId: "f1",
        classification: "Core",
        deliveryMode: "In-Person",
        activeVersionId: "v1",
        versions: [dummyVersion(["CSC 301"])],
      },
      {
        id: "c2",
        code: "CSC 301",
        title: "Algorithms",
        level: 300,
        semester: 1,
        departmentId: "d1",
        departmentName: "CS",
        facultyId: "f1",
        classification: "Core",
        deliveryMode: "In-Person",
        activeVersionId: "v1",
        versions: [dummyVersion(["CSC 201"])],
      },
    ];

    const res = detectPrerequisiteCycles(cyclicCourses);
    assert.equal(res.hasCycle, true);
    assert.match(res.message ?? "", /Circular prerequisite detected/);
  });

  await t.test("evaluates student prerequisite clearance correctly", () => {
    const prereqs = [{ courseCode: "MTH 101", courseId: "m1" }];

    const studentMissing = evaluatePrerequisites(prereqs, []);
    assert.equal(studentMissing.satisfied, false);
    assert.match(studentMissing.reasons[0], /Missing mandatory prerequisite/);

    const studentFailed = evaluatePrerequisites(prereqs, [
      { courseCode: "MTH 101", grade: "F", passed: false },
    ]);
    assert.equal(studentFailed.satisfied, false);
    assert.match(studentFailed.reasons[0], /Failed prerequisite/);

    const studentPassed = evaluatePrerequisites(prereqs, [
      { courseCode: "MTH 101", grade: "B", passed: true },
    ]);
    assert.equal(studentPassed.satisfied, true);
  });
});

test("CUR-03: CCMAS 70/30 Distribution and Gap Audit", async (t) => {
  const sampleMappings: CourseCCMASMapping[] = [
    {
      courseId: "1",
      courseCode: "CSC 101",
      courseTitle: "Intro",
      creditUnits: 3,
      origin: "NUC_CCMAS_CORE",
      benchmarkKnowledgeAreaId: "ka-fnd",
      satisfiedCompetencies: ["Programming basics"],
    },
    {
      courseId: "2",
      courseCode: "CSC 102",
      courseTitle: "Prog II",
      creditUnits: 4,
      origin: "NUC_CCMAS_CORE",
      benchmarkKnowledgeAreaId: "ka-fnd",
      satisfiedCompetencies: ["Object-oriented principles"],
    },
    {
      courseId: "3",
      courseCode: "TAU 101",
      courseTitle: "African Leadership & Tech",
      creditUnits: 3,
      origin: "INSTITUTIONAL_LOCAL",
      satisfiedCompetencies: [],
    },
  ];

  await t.test("calculates core vs local percentage accurately", () => {
    // Core = 7, Local = 3, Total = 10 -> Core 70%, Local 30%
    const dist = calculateCCMASDistribution(sampleMappings);
    assert.equal(dist.totalCredits, 10);
    assert.equal(dist.coreCredits, 7);
    assert.equal(dist.localCredits, 3);
    assert.equal(dist.corePercentage, 70);
    assert.equal(dist.localPercentage, 30);
    assert.equal(dist.isCompliant, true);
  });

  await t.test("flags deficiency if core credits drop below statutory threshold", () => {
    const lowCoreMappings: CourseCCMASMapping[] = [
      {
        courseId: "1",
        courseCode: "CSC 101",
        courseTitle: "Intro",
        creditUnits: 5,
        origin: "NUC_CCMAS_CORE",
        satisfiedCompetencies: [],
      },
      {
        courseId: "2",
        courseCode: "TAU 101",
        courseTitle: "Local",
        creditUnits: 5,
        origin: "INSTITUTIONAL_LOCAL",
        satisfiedCompetencies: [],
      },
    ];

    const dist = calculateCCMASDistribution(lowCoreMappings);
    assert.equal(dist.corePercentage, 50);
    assert.equal(dist.isCompliant, false);
    assert.match(dist.complianceMessage, /below the statutory 70% NUC minimum/);
  });

  await t.test("audits knowledge area gaps and expected competencies", () => {
    const benchmark: CCMASBenchmark = {
      id: "bm-cs",
      disciplineCode: "COMP-01",
      disciplineName: "Computer Science",
      nucReleaseYear: 2023,
      nucDocumentRef: "NUC/CCMAS/2023",
      mandatedCoreCreditTotal: 7,
      minimumDurationYears: 4,
      knowledgeAreas: [
        {
          id: "ka-fnd",
          code: "FND",
          name: "Foundations",
          description: "Foundations of computing",
          minimumCoreCredits: 8, // Requires 8, but sample has 7
          expectedCompetencies: ["Programming basics", "Object-oriented principles", "Memory management"],
        },
      ],
    };

    const audit = auditCCMASCompliance(benchmark, sampleMappings, "Dr. DAP Director");
    assert.equal(audit.gaps.length, 1);
    assert.equal(audit.gaps[0].deficitCredits, 1);
    assert.deepEqual(audit.gaps[0].missingCompetencies, ["Memory management"]);
    assert.equal(audit.auditStatus, "Deficiencies Flagged");
  });
});

test("CUR-04: Curriculum Change Impact Analyzer", async (t) => {
  const allCourses: Course[] = [
    {
      id: "c1",
      code: "CSC 201",
      title: "Computer Programming I",
      level: 200,
      semester: 1,
      departmentId: "d1",
      departmentName: "CS",
      facultyId: "f1",
      classification: "Core",
      deliveryMode: "In-Person",
      activeVersionId: "v1",
      versions: [
        {
          id: "v1",
          versionNumber: "v1.0",
          effectiveSessionFrom: "2023/2024",
          credits: { lectureHours: 2, tutorialHours: 0, practicalHours: 3, creditUnits: 3 },
          synopsis: "",
          syllabusOutline: [],
          learningOutcomes: [],
          prerequisites: [],
          assessmentScheme: { continuousAssessmentPercent: 30, practicalPercent: 20, finalExamPercent: 50 },
          recommendedTextbooks: [],
          status: "Published",
          createdAt: "2023-09-01",
          createdBy: "staff",
        },
      ],
    },
    {
      id: "c2",
      code: "CSC 301",
      title: "Algorithms and Complexities",
      level: 300,
      semester: 1,
      departmentId: "d1",
      departmentName: "CS",
      facultyId: "f1",
      classification: "Core",
      deliveryMode: "In-Person",
      activeVersionId: "v1",
      versions: [
        {
          id: "v1",
          versionNumber: "v1.0",
          effectiveSessionFrom: "2023/2024",
          credits: { lectureHours: 3, tutorialHours: 0, practicalHours: 0, creditUnits: 3 },
          synopsis: "",
          syllabusOutline: [],
          learningOutcomes: [],
          prerequisites: [{ courseCode: "CSC 201", courseId: "c1" }],
          assessmentScheme: { continuousAssessmentPercent: 30, practicalPercent: 0, finalExamPercent: 70 },
          recommendedTextbooks: [],
          status: "Published",
          createdAt: "2023-09-01",
          createdBy: "staff",
        },
      ],
    },
  ];

  await t.test("identifies downstream ripple effect when prerequisite course is phased out", () => {
    const analysis = generateCurriculumImpactAnalysis({
      targetCourseCode: "CSC 201",
      targetCourseTitle: "Computer Programming I",
      targetEffectiveSession: "2026/2027",
      isCreditChanged: false,
      oldCredits: 3,
      newCredits: 3,
      isDeletedOrPhasedOut: true,
      replacementCourseCode: "COS 201",
      allCourses,
      currentSpecialistStaffCount: 3,
    });

    assert.equal(analysis.prerequisiteRipple.length, 1);
    assert.equal(analysis.prerequisiteRipple[0].affectedCourseCode, "CSC 301");
    assert.match(analysis.prerequisiteRipple[0].natureOfImpact, /Direct prerequisite will be phased out/);
    assert.match(analysis.prerequisiteRipple[0].recommendedRemedy, /substitute with COS 201/);
    assert.equal(analysis.impactedCohorts.length, 2);
    assert.equal(analysis.staffingImpact.isStaffingAdequate, true);
  });
});

test("CUR-05: Carrying Capacity & Staff Ratios", async (t) => {
  await t.test("provides NUC discipline ratio benchmarks", () => {
    assert.equal(getNUCMandatedRatio("Medicine"), 10);
    assert.equal(getNUCMandatedRatio("Computing"), 15);
    assert.equal(getNUCMandatedRatio("Engineering"), 15);
    assert.equal(getNUCMandatedRatio("Management Sciences"), 30);
  });

  await t.test("evaluates academic staff rank pyramid", () => {
    const healthyProfile = {
      totalAcademicStaff: 20,
      professors: 3,
      readersAssociateProfessors: 2, // 5 Professorial = 25% (>=15%)
      seniorLecturers: 7, // 35%
      lecturersI: 4,
      lecturersII: 3,
      assistantLecturers: 1, // 8 Junior = 40% (<=60%)
    };

    const healthyRes = evaluateAcademicStaffRankMix(healthyProfile);
    assert.equal(healthyRes.isRankMixHealthy, true);

    const invertedProfile = {
      totalAcademicStaff: 10,
      professors: 0,
      readersAssociateProfessors: 0,
      seniorLecturers: 2,
      lecturersI: 2,
      lecturersII: 3,
      assistantLecturers: 3,
    };

    const invertedRes = evaluateAcademicStaffRankMix(invertedProfile);
    assert.equal(invertedRes.isRankMixHealthy, false);
    assert.match(invertedRes.notes[0], /Professorial cadre .* is below NUC 20% target/);
  });

  await t.test("simulates carrying capacity scenario bottlenecks", () => {
    const staffProfile = {
      totalAcademicStaff: 10,
      professors: 2,
      readersAssociateProfessors: 1,
      seniorLecturers: 3,
      lecturersI: 2,
      lecturersII: 2,
      assistantLecturers: 0,
    };

    const benchmark = {
      discipline: "Computing",
      nucMandatedStaffStudentRatio: 15,
      maxClassSizeLecture: 100,
      maxLabBatchSize: 40,
      minPhdPercentage: 60,
    };

    // 10 staff can support at most 150 students.
    // An intake of 100 per year over 4 years yields ~380 students -> breaches ratio!
    const scenario = simulateCapacityScenario(
      "High Intake",
      100,
      4,
      staffProfile,
      benchmark,
      50, // lab limit 50 < intake 100
      120
    );

    assert.equal(scenario.isRatioCompliant, false);
    assert.equal(scenario.bottlenecksIdentified.length >= 2, true);
    assert.match(scenario.bottlenecksIdentified[0], /breaches NUC ceiling/);
    assert.match(scenario.bottlenecksIdentified[1], /exceeds physical laboratory seating limit/);
  });
});

test("CUR-06: Course Equivalencies and Teach-Out", async (t) => {
  const rules: CourseEquivalency[] = [
    {
      id: "eq-1",
      sourceCourseCode: "CSC 203",
      sourceCourseTitle: "Discrete Structures",
      sourceCreditUnits: 3,
      replacementCourseCode: "COS 201",
      replacementCourseTitle: "Discrete Mathematics",
      replacementCreditUnits: 3,
      type: "Exact Equivalent",
      applicableCurriculumVersions: ["2019-BMAS-v1.0", "2021-BMAS-v1.2"],
      senateApprovalRef: "SEN/RES/23/089",
      effectiveDate: "2023-09-01",
    },
    {
      id: "eq-2",
      sourceCourseCode: "CHM 101",
      sourceCourseTitle: "General Chemistry I",
      sourceCreditUnits: 3,
      replacementCourseCode: "BCH 101",
      replacementCourseTitle: "Foundations of Biomolecules",
      replacementCreditUnits: 2,
      type: "One-Way Substitution",
      applicableCurriculumVersions: ["*"],
      senateApprovalRef: "SEN/RES/24/012",
      effectiveDate: "2024-01-01",
    },
  ];

  await t.test("matches equivalent course for legacy student version", () => {
    const match = resolveCourseSubstitution("csc 203", "2019-BMAS-v1.0", rules);
    assert.equal(match.matched, true);
    assert.equal(match.replacementCode, "COS 201");
    assert.equal(match.creditDeficit, 0);

    const nonApplicableVersion = resolveCourseSubstitution("CSC 203", "2025-CCMAS-v2.0", rules);
    assert.equal(nonApplicableVersion.matched, false);
  });

  await t.test("warns when replacement course results in credit deficit", () => {
    const match = resolveCourseSubstitution("CHM 101", "2022/2023", rules);
    assert.equal(match.matched, true);
    assert.equal(match.creditDeficit, 1);
    assert.match(match.message, /fewer credit unit/);
  });

  await t.test("confirms degree requirement satisfaction via substitution", () => {
    assert.equal(
      satisfiesDegreeRequirement("CSC 203", "COS 201", "2019-BMAS-v1.0", rules),
      true
    );
    assert.equal(
      satisfiesDegreeRequirement("CSC 203", "CSC 203", "2019-BMAS-v1.0", rules),
      true
    );
    assert.equal(
      satisfiesDegreeRequirement("CSC 203", "PHY 101", "2019-BMAS-v1.0", rules),
      false
    );
  });
});
