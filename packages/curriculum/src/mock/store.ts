/**
 * Authoritative in-memory demonstration store for curriculum & academic planning.
 */

import type { Programme, ProgrammeVersion } from "../domain/programme";
import type { Course, CourseVersion } from "../domain/course";
import type { CCMASBenchmark, CourseCCMASMapping } from "../domain/ccmas";
import type { CurriculumProposal } from "../domain/proposal";
import type { CapacityModel, CapacityScenario } from "../domain/capacity";
import type { CourseEquivalency, TeachOutSchedule } from "../domain/equivalency";
import type { AssessmentConfiguration } from "../domain/assessment";
import {
  initialProgrammes,
  initialCourses,
  initialCCMASBenchmarks,
  initialCCMASMappings,
  initialProposals,
  initialCapacityModels,
  initialEquivalencies,
  initialTeachOutSchedules,
} from "./seed";
import { initialAssessmentConfigurations } from "./assessment-seed";

export interface CurriculumStoreState {
  programmes: Programme[];
  courses: Course[];
  benchmarks: CCMASBenchmark[];
  ccmasMappings: CourseCCMASMapping[];
  proposals: CurriculumProposal[];
  capacityModels: CapacityModel[];
  equivalencies: CourseEquivalency[];
  teachOutSchedules: TeachOutSchedule[];
  assessmentConfigurations: AssessmentConfiguration[];
}

let state: CurriculumStoreState = {
  programmes: structuredClone(initialProgrammes),
  courses: structuredClone(initialCourses),
  benchmarks: structuredClone(initialCCMASBenchmarks),
  ccmasMappings: structuredClone(initialCCMASMappings),
  proposals: structuredClone(initialProposals),
  capacityModels: structuredClone(initialCapacityModels),
  equivalencies: structuredClone(initialEquivalencies),
  teachOutSchedules: structuredClone(initialTeachOutSchedules),
  assessmentConfigurations: structuredClone(initialAssessmentConfigurations),
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export const curriculumStore = {
  getSnapshot(): CurriculumStoreState {
    return state;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  reset() {
    state = {
      programmes: structuredClone(initialProgrammes),
      courses: structuredClone(initialCourses),
      benchmarks: structuredClone(initialCCMASBenchmarks),
      ccmasMappings: structuredClone(initialCCMASMappings),
      proposals: structuredClone(initialProposals),
      capacityModels: structuredClone(initialCapacityModels),
      equivalencies: structuredClone(initialEquivalencies),
      teachOutSchedules: structuredClone(initialTeachOutSchedules),
      assessmentConfigurations: structuredClone(initialAssessmentConfigurations),
    };
    notify();
  },

  update(fn: (draft: CurriculumStoreState) => void) {
    fn(state);
    notify();
  },
};
