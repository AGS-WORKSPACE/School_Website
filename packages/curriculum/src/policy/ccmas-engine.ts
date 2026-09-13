/**
 * NUC CCMAS 70/30 distribution rule and QA gap engine (CUR-03).
 *
 * In Nigerian Universities under NUC CCMAS:
 * - Minimum 70% of curriculum credits must derive from NUC Core Benchmark standards.
 * - Up to 30% of credits represent University-specific innovation / local specialisation.
 * - Knowledge areas must meet or exceed the statutory minimum credit thresholds.
 */

import type {
  CCMASBenchmark,
  CCMASGap,
  CCMASProgramAudit,
  CourseCCMASMapping,
} from "../domain/ccmas";

export interface CCMASDistributionResult {
  totalCredits: number;
  coreCredits: number;
  localCredits: number;
  corePercentage: number;
  localPercentage: number;
  isCompliant: boolean;
  complianceMessage: string;
}

export function calculateCCMASDistribution(
  mappings: CourseCCMASMapping[]
): CCMASDistributionResult {
  let coreCredits = 0;
  let localCredits = 0;

  for (const item of mappings) {
    if (item.origin === "NUC_CCMAS_CORE") {
      coreCredits += item.creditUnits;
    } else {
      localCredits += item.creditUnits;
    }
  }

  const totalCredits = coreCredits + localCredits;
  if (totalCredits === 0) {
    return {
      totalCredits: 0,
      coreCredits: 0,
      localCredits: 0,
      corePercentage: 0,
      localPercentage: 0,
      isCompliant: false,
      complianceMessage: "Curriculum has 0 mapped credits.",
    };
  }

  const corePercentage = Math.round((coreCredits / totalCredits) * 1000) / 10;
  const localPercentage = Math.round((localCredits / totalCredits) * 1000) / 10;

  // NUC tolerance: Core should be at least 68-72%
  const isCompliant = corePercentage >= 68 && corePercentage <= 75;
  let complianceMessage = "Compliant with NUC CCMAS 70/30 distribution formula.";

  if (corePercentage < 68) {
    complianceMessage = `Core curriculum credit ratio (${corePercentage}%) is below the statutory 70% NUC minimum benchmark. Add more core units or reclassify elective modules.`;
  } else if (corePercentage > 75) {
    complianceMessage = `Core curriculum credit ratio (${corePercentage}%) exceeds 75%, leaving insufficient headroom for institutional innovation / local content (${localPercentage}%).`;
  }

  return {
    totalCredits,
    coreCredits,
    localCredits,
    corePercentage,
    localPercentage,
    isCompliant,
    complianceMessage,
  };
}

export function auditCCMASCompliance(
  benchmark: CCMASBenchmark,
  mappings: CourseCCMASMapping[],
  officerInCharge: string
): {
  distribution: CCMASDistributionResult;
  gaps: CCMASGap[];
  auditStatus: "Accreditation Ready" | "Deficiencies Flagged" | "Non-Compliant";
} {
  const distribution = calculateCCMASDistribution(mappings);
  const gaps: CCMASGap[] = [];

  // Evaluate knowledge areas
  for (const ka of benchmark.knowledgeAreas) {
    const mappedToArea = mappings.filter(
      (m) => m.origin === "NUC_CCMAS_CORE" && m.benchmarkKnowledgeAreaId === ka.id
    );

    const creditsMapped = mappedToArea.reduce((sum, item) => sum + item.creditUnits, 0);
    const deficit = Math.max(0, ka.minimumCoreCredits - creditsMapped);

    const satisfiedCompetencies = new Set(
      mappedToArea.flatMap((m) => m.satisfiedCompetencies)
    );
    const missingCompetencies = ka.expectedCompetencies.filter(
      (comp) => !satisfiedCompetencies.has(comp)
    );

    if (deficit > 0 || missingCompetencies.length > 0) {
      const severity =
        deficit > 3 || missingCompetencies.length > 2
          ? "Critical Non-Compliance"
          : "Minor Deficiency";

      gaps.push({
        knowledgeAreaId: ka.id,
        knowledgeAreaName: ka.name,
        requiredCredits: ka.minimumCoreCredits,
        mappedCredits: creditsMapped,
        deficitCredits: deficit,
        missingCompetencies,
        severity,
        responsibleOfficer: officerInCharge,
      });
    }
  }

  let auditStatus: "Accreditation Ready" | "Deficiencies Flagged" | "Non-Compliant" =
    "Accreditation Ready";

  if (gaps.some((g) => g.severity === "Critical Non-Compliance") || !distribution.isCompliant) {
    auditStatus = "Non-Compliant";
  } else if (gaps.length > 0) {
    auditStatus = "Deficiencies Flagged";
  }

  return {
    distribution,
    gaps,
    auditStatus,
  };
}
