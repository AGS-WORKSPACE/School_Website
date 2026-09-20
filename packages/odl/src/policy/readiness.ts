/**
 * Readiness scoring (ODL-01).
 */

import type { ReadinessGap, ReadinessQuestion, ReadinessResponse } from "../domain/readiness";

const answerScore: Record<ReadinessResponse["answer"], number> = { Confident: 2, Somewhat_Confident: 1, Not_Confident: 0 };

export function scoreReadiness(questions: ReadinessQuestion[], responses: ReadinessResponse[]): { gaps: ReadinessGap[]; readinessScore: number } {
  const gaps: ReadinessGap[] = [];
  let total = 0;
  let max = 0;

  for (const question of questions) {
    const response = responses.find((item) => item.questionId === question.id);
    max += 2;
    if (!response) continue;
    total += answerScore[response.answer];
    if (response.answer !== "Confident") {
      gaps.push({ questionId: question.id, category: question.category, supportResourceTitle: question.supportResourceTitle, supportResourceUrl: question.supportResourceUrl });
    }
  }

  return { gaps, readinessScore: max === 0 ? 0 : Math.round((total / max) * 100) };
}

/**
 * A readiness result is always advisory. There is deliberately no function
 * anywhere in this policy that turns a low score into a block: the result
 * only ever produces gaps to act on, for the learner to read and choose from.
 */
export function isAdvisoryOnly(): true {
  return true;
}
