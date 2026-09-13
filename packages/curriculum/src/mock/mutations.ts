/**
 * Controlled mutations for the curriculum demonstration store.
 * Enforces policy invariants, validation, and maker-checker segregation of duties.
 */

import type { Course, CourseVersion, CourseLevel } from "../domain/course";
import type { CurriculumProposal, ProposalStage } from "../domain/proposal";
import type { CourseEquivalency } from "../domain/equivalency";
import type { CapacityScenario } from "../domain/capacity";
import { validateCourseCode, normalizeCourseCode } from "../policy/code-policy";
import { generateCurriculumImpactAnalysis } from "../policy/impact-analyzer";
import { curriculumStore } from "./store";

export interface MutationActor {
  personId: string;
  name: string;
  roleId?: string;
}

export interface MutationResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

export const curriculumMutations = {
  createCourse(
    data: {
      code: string;
      title: string;
      level: CourseLevel;
      semester: 1 | 2;
      departmentId: string;
      departmentName: string;
      facultyId: string;
      classification: Course["classification"];
      credits: CourseVersion["credits"];
      synopsis: string;
      prerequisites: { courseCode: string; courseId: string }[];
    },
    actor: MutationActor
  ): MutationResult<Course> {
    const state = curriculumStore.getSnapshot();
    const validation = validateCourseCode(data.code, state.courses);

    if (!validation.valid) {
      return { ok: false, error: validation.error };
    }

    const versionId = `ver-${data.code.toLowerCase().replace(/\s+/g, "-")}-v1`;
    const newVersion: CourseVersion = {
      id: versionId,
      versionNumber: "v1.0",
      effectiveSessionFrom: "2026/2027",
      credits: data.credits,
      synopsis: data.synopsis,
      syllabusOutline: [data.synopsis],
      learningOutcomes: [
        {
          id: `clo-${Date.now()}-1`,
          code: "CLO-1",
          description: `Demonstrate mastery of core concepts in ${data.title}`,
          bloomLevel: "Applying",
        },
      ],
      prerequisites: data.prerequisites,
      assessmentScheme: { continuousAssessmentPercent: 30, practicalPercent: data.credits.practicalHours > 0 ? 20 : 0, finalExamPercent: data.credits.practicalHours > 0 ? 50 : 70 },
      recommendedTextbooks: ["Approved University Reading List"],
      status: "Published",
      createdAt: new Date().toISOString(),
      createdBy: actor.name,
    };

    const newCourse: Course = {
      id: `c-${data.code.toLowerCase().replace(/\s+/g, "")}`,
      code: validation.normalizedCode,
      title: data.title,
      level: data.level,
      semester: data.semester,
      departmentId: data.departmentId,
      departmentName: data.departmentName,
      facultyId: data.facultyId,
      classification: data.classification,
      deliveryMode: data.credits.practicalHours > 0 ? "Clinical/Lab" : "In-Person",
      activeVersionId: versionId,
      versions: [newVersion],
    };

    curriculumStore.update((draft) => {
      draft.courses.push(newCourse);
    });

    return { ok: true, data: newCourse };
  },

  submitProposal(
    data: {
      title: string;
      type: CurriculumProposal["type"];
      programmeId: string;
      programmeName: string;
      departmentId: string;
      departmentName: string;
      facultyId: string;
      facultyName: string;
      targetEffectiveSession: string;
      rationale: string;
      summaryOfChanges: string[];
      targetCourseCode?: string;
      newCredits?: number;
      replacementCourseCode?: string;
    },
    actor: MutationActor
  ): MutationResult<CurriculumProposal> {
    const state = curriculumStore.getSnapshot();

    const analysis = generateCurriculumImpactAnalysis({
      targetCourseCode: data.targetCourseCode ?? "CSC 201",
      targetCourseTitle: data.title,
      targetEffectiveSession: data.targetEffectiveSession,
      isCreditChanged: Boolean(data.newCredits),
      oldCredits: 3,
      newCredits: data.newCredits ?? 3,
      isDeletedOrPhasedOut: data.type === "Course Archival",
      replacementCourseCode: data.replacementCourseCode,
      allCourses: state.courses,
      currentSpecialistStaffCount: 3,
    });

    const proposalNumber = `CCP-2026-${String(state.proposals.length + 1).padStart(3, "0")}`;
    const newProposal: CurriculumProposal = {
      id: `prop-${Date.now()}`,
      proposalNumber,
      title: data.title,
      type: data.type,
      programmeId: data.programmeId,
      programmeName: data.programmeName,
      departmentId: data.departmentId,
      departmentName: data.departmentName,
      facultyId: data.facultyId,
      facultyName: data.facultyName,
      targetEffectiveSession: data.targetEffectiveSession,
      rationale: data.rationale,
      summaryOfChanges: data.summaryOfChanges,
      stage: "Department Board Recommended",
      proposedByPersonId: actor.personId,
      proposedByName: actor.name,
      proposedAt: new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }),
      impactAnalysis: analysis,
      reviewHistory: [
        {
          stage: "Department Board Recommended",
          decidedAt: new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }),
          decidedByPersonId: actor.personId,
          decidedByName: actor.name,
          decision: "Recommended",
          comments: "Proposed by Department Head for Faculty Board consideration.",
        },
      ],
    };

    curriculumStore.update((draft) => {
      draft.proposals.unshift(newProposal);
    });

    return { ok: true, data: newProposal };
  },

  advanceProposalStage(
    proposalId: string,
    action: "Faculty Board Approved" | "DAP Technical Review" | "Senate Approved" | "Rejected",
    comments: string,
    minuteRef: string,
    actor: MutationActor
  ): MutationResult<CurriculumProposal> {
    const state = curriculumStore.getSnapshot();
    const proposal = state.proposals.find((p) => p.id === proposalId);

    if (!proposal) {
      return { ok: false, error: "Proposal not found" };
    }

    // Maker-checker segregation of duties enforcement!
    if (proposal.proposedByPersonId === actor.personId && action !== "Rejected") {
      return {
        ok: false,
        error: `Segregation-of-duties violation: ${actor.name} proposed this curriculum change and cannot act as its approver. Review must be conducted by an independent authority (Product Principle 4).`,
      };
    }

    let nextStage: ProposalStage = "Department Board Recommended";
    if (action === "Rejected") {
      nextStage = "Rejected";
    } else if (action === "Faculty Board Approved") {
      nextStage = "Faculty Board Approved";
    } else if (action === "DAP Technical Review") {
      nextStage = "DAP Technical Review";
    } else if (action === "Senate Approved") {
      nextStage = "Senate Approved";
    }

    curriculumStore.update((draft) => {
      const p = draft.proposals.find((item) => item.id === proposalId);
      if (p) {
        p.stage = nextStage;
        p.reviewHistory.push({
          stage: nextStage,
          decidedAt: new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }),
          decidedByPersonId: actor.personId,
          decidedByName: actor.name,
          decision: action === "Rejected" ? "Rejected" : "Approved",
          comments,
          minuteReference: minuteRef,
        });
        if (action === "Senate Approved") {
          p.senateResolutionRef = minuteRef;
          p.senateApprovalDate = new Date().toISOString().split("T")[0];
        }
      }
    });

    return { ok: true, data: proposal };
  },

  addCourseEquivalency(
    data: Omit<CourseEquivalency, "id">,
    actor: MutationActor
  ): MutationResult<CourseEquivalency> {
    const newEq: CourseEquivalency = {
      id: `eq-${Date.now()}`,
      ...data,
      sourceCourseCode: normalizeCourseCode(data.sourceCourseCode),
      replacementCourseCode: normalizeCourseCode(data.replacementCourseCode),
    };

    curriculumStore.update((draft) => {
      draft.equivalencies.push(newEq);
    });

    return { ok: true, data: newEq };
  },

  updateCapacityScenario(
    modelId: string,
    scenario: CapacityScenario,
    actor: MutationActor
  ): MutationResult {
    curriculumStore.update((draft) => {
      const model = draft.capacityModels.find((m) => m.id === modelId);
      if (model) {
        const existingIdx = model.scenarios.findIndex((s) => s.id === scenario.id);
        if (existingIdx >= 0) {
          model.scenarios[existingIdx] = scenario;
        } else {
          model.scenarios.push(scenario);
        }
        model.selectedScenarioId = scenario.id;
        model.lastUpdated = new Date().toISOString().split("T")[0];
        model.updatedBy = actor.name;
      }
    });

    return { ok: true };
  },
};
