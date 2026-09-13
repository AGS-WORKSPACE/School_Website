'use client';

import { use, useState, useTransition } from 'react';
import Link from 'next/link';
import { useAdmissions, validateRefereeToken } from '@tau/admissions';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Lock } from 'lucide-react';

interface Props {
  params: Promise<{ token: string }>;
}

export default function ConfidentialRefereePortalPage({ params }: Props) {
  const { token } = use(params);
  const { refereeRequests, applications, mutations } = useAdmissions();
  const [isPending, startTransition] = useTransition();

  const [relationship, setRelationship] = useState('Former Academic Lecturer / Supervisor');
  const [yearsKnown, setYearsKnown] = useState(3);
  const [academicRating, setAcademicRating] = useState<
    'Exceptional (Top 5%)' | 'Very Good (Top 15%)' | 'Good' | 'Average' | 'Below Average'
  >('Exceptional (Top 5%)');
  const [characterRating, setCharacterRating] = useState<
    'Exemplary' | 'Good' | 'Satisfactory' | 'Questionable'
  >('Exemplary');
  const [researchRating, setResearchRating] = useState<
    'High' | 'Moderate' | 'Low' | 'Not Assessed'
  >('High');
  const [narrative, setNarrative] = useState('');
  const [decision, setDecision] = useState<
    'Strongly Recommend' | 'Recommend with Confidence' | 'Recommend with Reservations' | 'Do Not Recommend'
  >('Strongly Recommend');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find request and validate token
  const refereeRequest = refereeRequests.find((r) => r.singleUseToken === token);
  const tokenValidation = refereeRequest
    ? validateRefereeToken(refereeRequest, token)
    : { valid: false, status: 'Revoked' as const, error: 'Invalid referee recommendation security token.' };

  const app = refereeRequest ? applications.find((a) => a.id === refereeRequest.applicationId) : null;
  const applicant = app?.applicant;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) {
      setError('Please provide a confidential narrative assessment of the candidate.');
      return;
    }

    startTransition(() => {
      try {
        const res = mutations.submitRefereeRecommendation(token, {
          relationshipToApplicant: relationship,
          knownDurationYears: yearsKnown,
          academicAbilityRating: academicRating,
          moralCharacterRating: characterRating,
          researchPotentialRating: researchRating,
          confidentialNarrative: narrative,
          recommendationDecision: decision,
        });

        if (res.ok) {
          setSubmitted(true);
        } else {
          setError(res.error ?? 'Failed to submit recommendation.');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to submit recommendation.');
      }
    });
  };

  if (!tokenValidation.valid || !refereeRequest) {
    return (
      <div className="mx-auto max-w-xl py-20 px-4">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-8" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">
            Confidential Link Invalid or Expired
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {tokenValidation.error ??
              'This recommendation link is no longer active, has expired, or has already been used to record a confidential evaluation.'}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center text-xs font-semibold text-primary underline"
            >
              Return to Transatlantic University Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl py-20 px-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-card p-8 shadow-xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">
            Confidential Recommendation Received
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you, <strong className="text-foreground">{refereeRequest.refereeName}</strong>. Your evaluation for{' '}
            <strong className="text-foreground">
              {applicant ? `${applicant.firstName} ${applicant.lastName}` : refereeRequest.applicantName}
            </strong>{' '}
            has been securely encrypted and sealed into the Admissions CRM dossier.
          </p>
          <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Lock className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>Single-use cryptographic token has been permanently invalidated.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-12 px-4 sm:px-6">
      {/* Top Badge */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-medical" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-medical">
            Confidential Referee Assessment Portal
          </span>
        </div>
        <span className="rounded bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
          Single-Use Token Valid
        </span>
      </div>

      <div className="mt-6">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Academic & Professional Recommendation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You have been nominated by{' '}
          <strong className="text-foreground">
            {applicant ? `${applicant.firstName} ${applicant.lastName}` : refereeRequest.applicantName}
          </strong>{' '}
          for admission into Transatlantic University. This report is strictly confidential and will never be shared with the applicant.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Candidate Context Box */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Candidate:</span>{' '}
              <strong className="text-foreground">
                {applicant ? `${applicant.firstName} ${applicant.lastName}` : refereeRequest.applicantName}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Application:</span>{' '}
              <strong className="font-mono text-foreground">{app?.applicationNumber ?? 'TAU-APP'}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Referee:</span>{' '}
              <strong className="text-foreground">{refereeRequest.refereeName}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>{' '}
              <strong className="text-foreground">{refereeRequest.refereeEmail}</strong>
            </div>
          </div>
        </div>

        {/* Association */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-foreground">Your Relationship to Candidate *</label>
            <input
              type="text"
              required
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground">Years Known *</label>
            <input
              type="number"
              min="0"
              max="50"
              required
              value={yearsKnown}
              onChange={(e) => setYearsKnown(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
            />
          </div>
        </div>

        {/* Ratings */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground text-sm">Competence & Character Ratings</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-medium text-foreground block mb-1">Academic Aptitude & Intellectual Capacity *</label>
              <select
                value={academicRating}
                onChange={(e) => setAcademicRating(e.target.value as typeof academicRating)}
                className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
              >
                <option value="Exceptional (Top 5%)">Exceptional (Top 5%)</option>
                <option value="Very Good (Top 15%)">Very Good (Top 15%)</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Below Average">Below Average</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Moral Integrity & Professional Ethics *</label>
              <select
                value={characterRating}
                onChange={(e) => setCharacterRating(e.target.value as typeof characterRating)}
                className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
              >
                <option value="Exemplary">Exemplary</option>
                <option value="Good">Good</option>
                <option value="Satisfactory">Satisfactory</option>
                <option value="Questionable">Questionable</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Research Potential / Practical Grit</label>
              <select
                value={researchRating}
                onChange={(e) => setResearchRating(e.target.value as typeof researchRating)}
                className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
              >
                <option value="High">High</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
                <option value="Not Assessed">Not Assessed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Narrative */}
        <div>
          <label className="block text-xs font-semibold text-foreground">
            Confidential Assessment & Appraisal *
          </label>
          <textarea
            required
            rows={5}
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="Please detail your candid evaluation of the candidate's strengths, academic performance, diligence, and suitability for rigorous university study..."
            className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
          />
        </div>

        {/* Final Recommendation */}
        <div>
          <label className="block text-xs font-semibold text-foreground">Overall Recommendation *</label>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
            {(
              [
                'Strongly Recommend',
                'Recommend with Confidence',
                'Recommend with Reservations',
                'Do Not Recommend',
              ] as const
            ).map((opt) => (
              <label
                key={opt}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 ${
                  decision === opt
                    ? 'border-medical bg-medical/5 font-semibold text-foreground dark:bg-medical/10'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value={opt}
                  checked={decision === opt}
                  onChange={() => setDecision(opt)}
                  className="text-medical"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-medical py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Sealing Recommendation...' : 'Submit Confidential Recommendation'}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
