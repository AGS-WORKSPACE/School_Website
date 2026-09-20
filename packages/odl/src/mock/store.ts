/**
 * In-memory demonstration store for EP-15 online learner support.
 */

import type { ReadinessQuestion, ReadinessResult } from "../domain/readiness";
import type { EngagementAlert } from "../domain/engagement";
import type { ContactAttempt, TutorAssignment, CaseloadExportRecord } from "../domain/caseload";
import type { AssessmentIntegrityConfig, IntegrityNotice } from "../domain/integrity";
import type { CourseEvaluationResponse } from "../domain/evaluation";
import type { EvidenceAccessGrant, EvidenceAccessLogEntry } from "../domain/accreditation";
import {
  initialContactAttempts, initialEngagementAlerts, initialEvaluationResponses, initialEvidenceAccessLog,
  initialEvidenceGrants, initialIntegrityConfigs, initialIntegrityNotices, initialReadinessResults, initialTutorAssignments, readinessQuestions,
} from "./seed";

export interface OdlStoreState {
  readinessQuestions: ReadinessQuestion[];
  readinessResults: ReadinessResult[];
  engagementAlerts: EngagementAlert[];
  tutorAssignments: TutorAssignment[];
  contactAttempts: ContactAttempt[];
  caseloadExports: CaseloadExportRecord[];
  integrityConfigs: AssessmentIntegrityConfig[];
  integrityNotices: IntegrityNotice[];
  evaluationResponses: CourseEvaluationResponse[];
  evidenceGrants: EvidenceAccessGrant[];
  evidenceAccessLog: EvidenceAccessLogEntry[];
}

function initialState(): OdlStoreState {
  return {
    readinessQuestions: structuredClone(readinessQuestions),
    readinessResults: structuredClone(initialReadinessResults),
    engagementAlerts: structuredClone(initialEngagementAlerts),
    tutorAssignments: structuredClone(initialTutorAssignments),
    contactAttempts: structuredClone(initialContactAttempts),
    caseloadExports: [],
    integrityConfigs: structuredClone(initialIntegrityConfigs),
    integrityNotices: structuredClone(initialIntegrityNotices),
    evaluationResponses: structuredClone(initialEvaluationResponses),
    evidenceGrants: structuredClone(initialEvidenceGrants),
    evidenceAccessLog: structuredClone(initialEvidenceAccessLog),
  };
}

let state: OdlStoreState = initialState();

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) listener();
}

export const odlStore = {
  getSnapshot(): OdlStoreState {
    return state;
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  reset() {
    state = initialState();
    notify();
  },
  update(fn: (draft: OdlStoreState) => void) {
    fn(state);
    notify();
  },
};
