import type { AssessmentConfiguration } from "../domain/assessment";

export type AssessmentValidationCode =
  | "missing-weight"
  | "invalid-weight"
  | "duplicate-component"
  | "total-below-required"
  | "total-above-required";

export interface AssessmentValidationIssue {
  code: AssessmentValidationCode;
  componentId?: string;
  message: string;
}

export interface AssessmentValidationResult {
  valid: boolean;
  totalWeight: number;
  issues: AssessmentValidationIssue[];
}

export function validateAssessmentConfiguration(
  configuration: Pick<AssessmentConfiguration, "components" | "requiredTotalWeight">,
): AssessmentValidationResult {
  const issues: AssessmentValidationIssue[] = [];
  const seenTypes = new Set<string>();
  let totalWeight = 0;

  for (const component of configuration.components) {
    if (component.weight === null || component.weight === undefined) {
      issues.push({ code: "missing-weight", componentId: component.id, message: `${component.name} needs a weight.` });
    } else if (!Number.isFinite(component.weight) || component.weight < 0 || component.weight > 100) {
      issues.push({ code: "invalid-weight", componentId: component.id, message: `${component.name} must have a weight between 0 and 100.` });
    } else {
      totalWeight += component.weight;
    }

    if (seenTypes.has(component.type)) {
      issues.push({ code: "duplicate-component", componentId: component.id, message: `${component.type} can only appear once in this assessment structure.` });
    }
    seenTypes.add(component.type);
  }

  if (totalWeight < configuration.requiredTotalWeight) {
    issues.push({ code: "total-below-required", message: `Total weight is ${totalWeight}%. It must reach ${configuration.requiredTotalWeight}%.` });
  } else if (totalWeight > configuration.requiredTotalWeight) {
    issues.push({ code: "total-above-required", message: `Total weight is ${totalWeight}%. It must not exceed ${configuration.requiredTotalWeight}%.` });
  }

  return { valid: issues.length === 0, totalWeight, issues };
}
