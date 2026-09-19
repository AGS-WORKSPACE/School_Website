'use client';

import { use, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdmissions, canAutoMerge, DiscrepancyStatus } from '@tau/admissions';
import { useActor } from '@/providers/session-provider';
import { PageHeader } from '@/components/console/page-header';

interface Props {
  params: Promise<{ id: string }>;
}

export default function DeduplicationCasePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { deduplicationCases, applications, mutations } = useAdmissions();
  const [isPending, startTransition] = useTransition();

  // Actor from session
  let actor = { personId: 'usr-admissions-lead', name: 'Mrs. Amina Yusuf', role: 'Admissions Lead' };
  try {
    const session = useActor();
    actor = { personId: session.personId, name: session.displayName, role: 'Admissions Officer' };
  } catch {
    // Fallback if not guarded
  }

  const [decision, setDecision] = useState<DiscrepancyStatus>('Confirmed_Duplicate');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const dCase = deduplicationCases.find((c) => c.id === id);

  if (!dCase) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-900 dark:text-amber-200">
          <h2 className="text-lg font-semibold">Case Not Found</h2>
          <p className="mt-1 text-sm">No deduplication case found matching ID {id}.</p>
          <Link
            href="/admissions/deduplication"
            className="mt-4 inline-flex items-center text-sm font-medium text-amber-700 underline dark:text-amber-300"
          >
            ← Back to Deduplication Workbench
          </Link>
        </div>
      </div>
    );
  }

  const primaryApp = applications.find((a) => a.id === dCase.primaryApplicationId);
  const matchedApp = applications.find((a) => a.id === dCase.matchedApplicationId);
  const primaryApplicant = primaryApp?.applicant;
  const matchedApplicant = matchedApp?.applicant;

  const autoMergeCheck = canAutoMerge(dCase.matchFactors);

  const handleAdjudicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please provide thorough adjudication notes detailing your decision rationale.');
      return;
    }

    startTransition(() => {
      const res = mutations.resolveDeduplicationCase(
        dCase.id,
        decision,
        notes,
        actor
      );
      if (res.ok) {
        router.push('/admissions/deduplication');
      } else {
        setError(res.error ?? 'Failed to resolve case');
      }
    });
  };

  return (
    <div className="space-y-6">
      <Link href="/admissions/deduplication" className="inline-flex text-xs font-medium text-muted-foreground hover:text-primary">
        ← Deduplication Workbench
      </Link>
      <PageHeader
        eyebrow={`ADM-06 · ${dCase.id}`}
        title="Identity Discrepancy Adjudication"
        description="Side-by-side comparison of suspected duplicate applicants. Policy strictly forbids automatic merging on name alone."
        actions={<div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              dCase.status !== 'Open_Under_Review'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
            }`}
          >
            {dCase.status.replace(/_/g, ' ')}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Composite Score: <strong className="text-slate-800 dark:text-slate-200">{dCase.compositeScore}%</strong>
          </span>
        </div>}
      />

      {/* Safety Invariant Notice */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5 text-blue-900 dark:text-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <h3 className="text-sm font-semibold">ADM-06 Invariant: Human-in-the-Loop Adjudication</h3>
            <p className="mt-1 text-xs text-blue-800/90 dark:text-blue-200/90">
              Auto-merge status:{' '}
              <strong className={autoMergeCheck.allowed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {autoMergeCheck.allowed ? 'Permitted' : autoMergeCheck.reason}
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* Matched Factors Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Detected Matching Factors</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {dCase.matchFactors.map((f, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-3 ${
                f.isExactMatch
                  ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10'
                  : 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {f.attribute.replace(/_/g, ' ')}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    f.isExactMatch
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {f.isExactMatch ? 'EXACT' : 'FUZZY'} ({f.weight} pts)
                </span>
              </div>
              <div className="mt-2 text-xs">
                <div className="text-slate-500 dark:text-slate-400">
                  Primary: <span className="font-mono font-medium text-slate-900 dark:text-white">{f.primaryValue}</span>
                </div>
                <div className="mt-1 text-slate-500 dark:text-slate-400">
                  Matched: <span className="font-mono font-medium text-slate-900 dark:text-white">{f.matchedValue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Candidate A (Primary) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Primary Applicant
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {primaryApplicant ? `${primaryApplicant.firstName} ${primaryApplicant.lastName}` : dCase.primaryApplicantName}
              </h3>
            </div>
            {primaryApp && (
              <Link
                href={`/admissions/applications/${primaryApp.id}`}
                className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                View Dossier →
              </Link>
            )}
          </div>

          <dl className="mt-4 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Application ID</dt>
              <dd className="font-mono font-medium text-slate-900 dark:text-white">{primaryApp?.id ?? 'N/A'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Application Number</dt>
              <dd className="font-mono font-medium text-slate-900 dark:text-white">{primaryApp?.applicationNumber ?? 'N/A'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Route</dt>
              <dd className="font-medium text-slate-900 dark:text-white">{primaryApp?.routeCode ?? 'N/A'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Email</dt>
              <dd className="font-medium text-slate-900 dark:text-white">{primaryApplicant?.email ?? 'N/A'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Phone</dt>
              <dd className="font-mono font-medium text-slate-900 dark:text-white">{primaryApplicant?.phone ?? 'N/A'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Date of Birth</dt>
              <dd className="font-medium text-slate-900 dark:text-white">{primaryApplicant?.dateOfBirth ?? 'N/A'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">National ID (NIN)</dt>
              <dd className="font-mono font-medium text-slate-900 dark:text-white">{primaryApplicant?.nationalIdNumber ?? 'None'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">JAMB Reg No</dt>
              <dd className="font-mono font-medium text-slate-900 dark:text-white">{primaryApplicant?.jambRegistrationNumber ?? 'None'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Programme Choice</dt>
              <dd className="font-medium text-slate-900 dark:text-white">{primaryApp?.firstChoiceProgramme ?? 'None'}</dd>
            </div>
          </dl>
        </div>

        {/* Candidate B (Matched) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Matched Applicant
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {matchedApplicant ? `${matchedApplicant.firstName} ${matchedApplicant.lastName}` : dCase.matchedApplicantName}
              </h3>
            </div>
            {matchedApp && (
              <Link
                href={`/admissions/applications/${matchedApp.id}`}
                className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                View Dossier →
              </Link>
            )}
          </div>

          <dl className="mt-4 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Application ID</dt>
              <dd className="font-mono font-medium text-slate-900 dark:text-white">{matchedApp?.id ?? 'N/A'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Application Number</dt>
              <dd className="font-mono font-medium text-slate-900 dark:text-white">{matchedApp?.applicationNumber ?? 'N/A'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Route</dt>
              <dd className="font-medium text-slate-900 dark:text-white">{matchedApp?.routeCode ?? 'N/A'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Email</dt>
              <dd className="font-medium text-slate-900 dark:text-white">{matchedApplicant?.email ?? 'N/A'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Phone</dt>
              <dd className="font-mono font-medium text-slate-900 dark:text-white">{matchedApplicant?.phone ?? 'N/A'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Date of Birth</dt>
              <dd className="font-medium text-slate-900 dark:text-white">{matchedApplicant?.dateOfBirth ?? 'N/A'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">National ID (NIN)</dt>
              <dd className="font-mono font-medium text-slate-900 dark:text-white">{matchedApplicant?.nationalIdNumber ?? 'None'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">JAMB Reg No</dt>
              <dd className="font-mono font-medium text-slate-900 dark:text-white">{matchedApplicant?.jambRegistrationNumber ?? 'None'}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Programme Choice</dt>
              <dd className="font-medium text-slate-900 dark:text-white">{matchedApp?.firstChoiceProgramme ?? 'None'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Adjudication Form / Previous Resolution Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Adjudication Action</h2>
        {dCase.status !== 'Open_Under_Review' ? (
          <div className="mt-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Resolved as: <span className="font-bold text-slate-900 dark:text-white">{dCase.status.replace(/_/g, ' ')}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              By: {dCase.resolvedBy?.name ?? 'Admissions Lead'} on {dCase.resolvedAt ? new Date(dCase.resolvedAt).toLocaleString() : 'N/A'}
            </p>
            <div className="mt-3 rounded border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <strong>Notes:</strong> {dCase.investigationNotes}
            </div>
          </div>
        ) : (
          <form onSubmit={handleAdjudicate} className="mt-4 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Resolution Decision
              </label>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                    decision === 'Confirmed_Duplicate'
                      ? 'border-red-500 bg-red-50/30 dark:border-red-500/50 dark:bg-red-500/10'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="Confirmed_Duplicate"
                    checked={decision === 'Confirmed_Duplicate'}
                    onChange={() => setDecision('Confirmed_Duplicate')}
                    className="mt-1 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Confirmed Duplicate</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Both records represent the same individual applicant. Flag secondary for merge or closure.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                    decision === 'Confirmed_Separate_Person'
                      ? 'border-emerald-500 bg-emerald-50/30 dark:border-emerald-500/50 dark:bg-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="Confirmed_Separate_Person"
                    checked={decision === 'Confirmed_Separate_Person'}
                    onChange={() => setDecision('Confirmed_Separate_Person')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Confirmed Separate Person</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Incidental phonetic or family similarity. Validated as distinct independent applicants.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Adjudication Notes & Evidence
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Detail verification steps performed (e.g., identity verification call, distinct passport inspection, JAMB portal cross-reference)..."
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link
                href="/admissions/deduplication"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {isPending ? 'Recording Adjudication...' : 'Record Human Adjudication'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
