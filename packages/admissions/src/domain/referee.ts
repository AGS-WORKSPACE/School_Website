/**
 * Confidential referee request and submission models (ADM-07).
 *
 * Provides single-use token links for referees.
 * Content is strictly segregated: the applicant can observe submission status
 * and timestamp, but CANNOT read the confidential ratings or narrative text.
 */

export interface RefereeRecommendationContent {
  relationshipToApplicant: string; // e.g. "Undergraduate Project Supervisor", "Employer"
  knownDurationYears: number;
  academicAbilityRating: "Exceptional (Top 5%)" | "Very Good (Top 15%)" | "Good" | "Average" | "Below Average";
  moralCharacterRating: "Exemplary" | "Good" | "Satisfactory" | "Questionable";
  researchPotentialRating?: "High" | "Moderate" | "Low" | "Not Assessed";
  confidentialNarrative: string;
  recommendationDecision: "Strongly Recommend" | "Recommend with Confidence" | "Recommend with Reservations" | "Do Not Recommend";
}

export interface RefereeRequest {
  id: string; // "ref-req-001"
  applicationId: string;
  applicantId: string;
  applicantName: string;
  programmeName: string;
  refereeName: string;
  refereeEmail: string;
  refereePhone?: string;
  refereeInstitution: string;
  refereeDesignation: string;
  singleUseToken: string; // Cryptographic single-use token
  tokenExpiresAt: string;
  status: "Pending" | "Submitted" | "Expired" | "Revoked";
  requestedAt: string;
  submittedAt?: string;
  // Segregated payload - only accessible to admissions officers, never exposed to applicant
  submission?: RefereeRecommendationContent;
  accessLogs: {
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    action: "Link_Opened" | "Form_Saved" | "Submitted";
  }[];
}
