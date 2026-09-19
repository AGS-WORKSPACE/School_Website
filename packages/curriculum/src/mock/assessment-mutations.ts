import type { AssessmentComponent, AssessmentConfiguration } from "../domain/assessment";
import { validateAssessmentConfiguration } from "../policy/assessment";
import { curriculumStore } from "./store";

export interface AssessmentMutationActor {
  personId: string;
  name: string;
}

export interface AssessmentMutationResult<T = AssessmentConfiguration> {
  ok: boolean;
  data?: T;
  error?: string;
  requiresVersioning?: boolean;
}

export function saveAssessmentConfiguration(input: {
  configurationId: string;
  components: AssessmentComponent[];
  effectiveDate: string;
  changeSummary?: string;
  permissions: string[];
  actor: AssessmentMutationActor;
}): AssessmentMutationResult {
  const canEdit = input.permissions.includes("academics:curriculum:propose") || input.permissions.includes("academics:curriculum:review");
  if (!canEdit) return { ok: false, error: "You do not have permission to configure assessment structures." };

  const current = curriculumStore.getSnapshot().assessmentConfigurations.find((item) => item.id === input.configurationId);
  if (!current) return { ok: false, error: "Assessment configuration not found." };

  const candidate = { ...current, components: input.components };
  const validation = validateAssessmentConfiguration(candidate);
  if (!validation.valid) return { ok: false, error: validation.issues.map((issue) => issue.message).join(" ") };

  if (current.marksExist) {
    if (!input.changeSummary?.trim()) return { ok: false, error: "A change summary is required when marks already exist.", requiresVersioning: true };

    const majorVersion = Number(current.version.replace("v", "").split(".")[0]);
    const next: AssessmentConfiguration = {
      ...current,
      id: `${current.courseId}-${current.academicSessionId}-assessment-v${majorVersion + 1}.0`,
      components: structuredClone(input.components),
      version: `v${majorVersion + 1}.0`,
      effectiveDate: input.effectiveDate,
      status: "In Review",
      approvalStatus: "Pending Approval",
      changeSummary: input.changeSummary,
      previousVersionId: current.id,
      // This is a frontend mock proposal; backend marks are not changed.
      marksExist: false,
    };
    curriculumStore.update((draft) => {
      draft.assessmentConfigurations.push(next);
    });
    return { ok: true, data: next, requiresVersioning: true };
  }

  curriculumStore.update((draft) => {
    const item = draft.assessmentConfigurations.find((candidateItem) => candidateItem.id === current.id);
    if (item) {
      item.components = structuredClone(input.components);
      item.effectiveDate = input.effectiveDate;
      item.status = "Draft";
      item.approvalStatus = "Not Required";
    }
  });
  return { ok: true, data: { ...current, components: input.components, effectiveDate: input.effectiveDate, status: "Draft", approvalStatus: "Not Required" } };
}

export function approveAssessmentConfiguration(input: {
  configurationId: string;
  permissions: string[];
}): AssessmentMutationResult {
  if (!input.permissions.includes("academics:curriculum:approve")) return { ok: false, error: "You do not have permission to approve assessment configurations." };
  const current = curriculumStore.getSnapshot().assessmentConfigurations.find((item) => item.id === input.configurationId);
  if (!current) return { ok: false, error: "Assessment configuration not found." };
  if (current.status !== "In Review") return { ok: false, error: "Only configurations in review can be approved." };
  curriculumStore.update((draft) => {
    const item = draft.assessmentConfigurations.find((candidate) => candidate.id === current.id);
    if (item) {
      item.status = "Approved";
      item.approvalStatus = "Approved";
    }
  });
  return { ok: true, data: { ...current, status: "Approved", approvalStatus: "Approved" } };
}
