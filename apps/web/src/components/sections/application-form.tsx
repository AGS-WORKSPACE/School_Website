'use client';

import { useState } from 'react';
import {
  useAdmissions,
  validateUploadedDocument,
  AdmissionRouteConfig,
  DocumentRequirement,
  UploadedDocument,
  ProviderCallback,
  PaymentGatewayProvider,
} from '@tau/admissions';
import { publishedPrograms } from '@/data/programs';
import { faculties } from '@/data/faculties';
import { trackEvent } from '@/lib/analytics';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Upload,
  CreditCard,
  UserCheck,
  Save,
  RotateCcw,
} from 'lucide-react';

function createUploadedDocument(req: DocumentRequirement, file: File): UploadedDocument {
  const ts = Date.now();
  const iso = new Date(ts).toISOString();
  return {
    id: `doc-${ts}`,
    requirementId: req.id,
    requirementCode: req.code,
    fileName: file.name,
    fileSizeBytes: file.size,
    mimeType: file.type || 'application/pdf',
    fileUrl: `/evidence/${file.name}`,
    checksumSha256: `sha256_${ts}`,
    uploadedAt: iso,
    securityScan: {
      passed: true,
      scannedAt: iso,
      scannerEngine: 'ClamAV-TAU',
      signatureHash: `sha256_${ts}`,
      detectedMimeType: file.type || 'application/pdf',
      flags: [],
    },
    replacementHistory: [],
  };
}

function createQualification(summary: string) {
  const ts = Date.now();
  return {
    id: `q-${ts}`,
    type: 'O_LEVEL_WAEC' as const,
    examYear: 2025,
    examRegistrationNumber: 'WAEC-2025-APP',
    gradeScoreSummary: summary,
    verifiedOnline: false,
  };
}

function createProviderCallback(
  inv: { invoiceReference: string; amount: number; currency: 'NGN' | 'USD' },
  gateway: PaymentGatewayProvider
): ProviderCallback {
  const ts = Date.now();
  return {
    provider: gateway,
    transactionReference: inv.invoiceReference,
    gatewayReference: `gw_${gateway.toLowerCase()}_${ts}`,
    amountKobo: inv.amount * 100,
    currency: inv.currency,
    paidAt: new Date(ts).toISOString(),
    signatureHash: `sha512_crypto_sig_${ts}`,
    rawPayloadSummary: `Applicant portal payment via ${gateway}`,
  };
}

interface Props {
  initialProgramme?: string;
}

type Step = 'route' | 'profile' | 'programme' | 'documents' | 'referees' | 'review_pay';

export function ApplicationForm({ initialProgramme }: Props) {
  const {
    routes,
    applications,
    mutations,
  } = useAdmissions();

  // Active route
  const activeRoutes = routes.filter((r) => r.active);
  const [selectedRouteCode, setSelectedRouteCode] = useState<string>(activeRoutes[0]?.code ?? 'UTME');
  const activeRoute = routes.find((r) => r.code === selectedRouteCode) ?? activeRoutes[0];

  // Current working application ID
  const [appId] = useState<string>('app-client-draft-001');

  // Navigation steps
  const [currentStep, setCurrentStep] = useState<Step>('route');

  // Applicant Profile Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2007-06-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [nin, setNin] = useState('');
  const [nationality, setNationality] = useState('Nigerian');

  // Contact Verification (OTP Simulation)
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Check duplicates when email/phone changes (ADM-01 derived value)
  const duplicateWarning =
    !isVerified && (email.length > 5 || phone.length > 8)
      ? (() => {
          const match = applications.find(
            (a) =>
              (email && a.applicant.email.toLowerCase() === email.toLowerCase()) ||
              (phone && a.applicant.phone === phone)
          );
          return match
            ? `Notice: An applicant record with email ${match.applicant.email} or phone ${match.applicant.phone} already exists in our system. If this is you, you can resume your draft below or continue.`
            : null;
        })()
      : null;

  // Programme Choice & Academic Info
  const initialProg = publishedPrograms.find((p) => p.id === initialProgramme || p.slug === initialProgramme);
  const [programmeId, setProgrammeId] = useState<string>(initialProg?.id ?? publishedPrograms[0]?.id ?? '');
  const [facultyId, setFacultyId] = useState<string>(faculties[0]?.id ?? '');
  const [jambReg, setJambReg] = useState('');
  const [highestQualification, setHighestQualification] = useState('SSCE / WAEC (5 Credits)');

  // Uploaded Documents
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Referees (if required)
  interface RefereeInput {
    fullName: string;
    email: string;
    relationship: string;
    institution: string;
  }
  const [refereesList, setRefereesList] = useState<RefereeInput[]>([
    { fullName: '', email: '', relationship: 'Academic Advisor', institution: '' },
    { fullName: '', email: '', relationship: 'Department Head', institution: '' },
  ]);

  // Payment & Submission State
  const [paymentGateway, setPaymentGateway] = useState<PaymentGatewayProvider>('Paystack');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    applicationNumber: string;
    applicationId: string;
  } | null>(null);

  // Draft Autosave state
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [savedDraftAppNumber, setSavedDraftAppNumber] = useState<string | null>(null);

  // Resume Draft input
  const [resumeAppNumber, setResumeAppNumber] = useState('');
  const [resumeStatus, setResumeStatus] = useState<string | null>(null);

  // Handle Send OTP
  const handleSendOtp = () => {
    if (!email || !phone) {
      alert('Please provide both email and phone number first.');
      return;
    }
    setOtpSent(true);
    setOtpCode('123456');
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim() === '123456' || otpCode.trim().length >= 4) {
      setIsVerified(true);
    } else {
      alert('Invalid OTP code. Please enter 123456 for the simulation.');
    }
  };

  // Handle Document Upload Simulation (ADM-03)
  const handleFileUpload = (req: DocumentRequirement, file: File) => {
    setUploadError(null);
    const validation = validateUploadedDocument(
      {
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type || 'application/pdf',
      },
      req
    );

    if (!validation.valid) {
      setUploadError(validation.errors.join(' '));
      return;
    }

    const newDoc = createUploadedDocument(req, file);

    setUploadedDocs((prev) => {
      const filtered = prev.filter((d) => d.requirementId !== req.id);
      return [...filtered, newDoc];
    });
  };

  // Draft Save
  const handleSaveDraft = () => {
    try {
      const res = mutations.saveDraftApplication(
        {
          id: appId,
          routeCode: activeRoute?.code ?? 'UTME',
          applicant: {
            id: `usr-${appId}`,
            email: email || 'draft@tau.edu.ng',
            phone: phone || '+2348000000000',
            firstName: firstName || 'Draft',
            middleName,
            lastName: lastName || 'Applicant',
            dateOfBirth,
            gender,
            nationality,
            stateOfOrigin: 'Anambra',
            lga: 'Awka South',
            nationalIdNumber: nin || undefined,
            jambRegistrationNumber: jambReg || undefined,
            verification: {
              emailVerified: isVerified,
              phoneVerified: isVerified,
              verificationMethod: 'OTP_SMS',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          programmeId,
          programmeName: publishedPrograms.find((p) => p.id === programmeId)?.title ?? 'B.Sc. Computer Science',
          facultyId,
          facultyName: faculties.find((f) => f.id === facultyId)?.name ?? 'Faculty of Computing',
          departmentId: 'dept-csc',
          departmentName: 'Department of Computer Science',
          firstChoiceProgramme: publishedPrograms.find((p) => p.id === programmeId)?.title ?? 'B.Sc. Computer Science',
          documents: uploadedDocs,
          qualifications: [createQualification(highestQualification)],
        },
        {
          personId: `usr-${appId}`,
          name: `${firstName || 'Draft'} ${lastName || 'Applicant'}`,
          role: 'Applicant',
        }
      );

      if (res.ok && res.data) {
        setSavedDraftAppNumber(res.data.applicationNumber);
        setDraftSavedAt(new Date().toLocaleTimeString());
      }
    } catch {
      alert('Failed to save draft. Please ensure minimum details are provided.');
    }
  };

  // Resume Draft
  const handleResumeDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeAppNumber.trim()) return;

    const matched = applications.find(
      (a) => a.applicationNumber.toLowerCase() === resumeAppNumber.trim().toLowerCase()
    );

    if (matched) {
      setFirstName(matched.applicant.firstName);
      setLastName(matched.applicant.lastName);
      setMiddleName(matched.applicant.middleName ?? '');
      setEmail(matched.applicant.email);
      setPhone(matched.applicant.phone);
      setDateOfBirth(matched.applicant.dateOfBirth);
      setNin(matched.applicant.nationalIdNumber ?? '');
      if (matched.applicant.jambRegistrationNumber) setJambReg(matched.applicant.jambRegistrationNumber);
      setIsVerified(matched.applicant.verification.emailVerified || matched.applicant.verification.phoneVerified);

      setSelectedRouteCode(matched.routeCode);
      if (matched.programmeId) setProgrammeId(matched.programmeId);
      if (matched.facultyId) setFacultyId(matched.facultyId);
      if (matched.documents) setUploadedDocs(matched.documents);

      setResumeStatus(`Draft ${matched.applicationNumber} restored successfully!`);
      setCurrentStep('profile');
    } else {
      setResumeStatus(`No application found matching application number ${resumeAppNumber}.`);
    }
  };

  // Simulating Payment Webhook Execution and Application Submission (ADM-05)
  const handlePayAndSubmit = async () => {
    setIsSubmitting(true);
    try {
      const actor = {
        personId: `usr-${appId}`,
        name: `${firstName} ${lastName}`,
        role: 'Applicant',
      };

      // 1. Save draft application first
      const draftRes = mutations.saveDraftApplication(
        {
          id: appId,
          routeCode: activeRoute?.code ?? 'UTME',
          applicant: {
            id: `usr-${appId}`,
            email,
            phone,
            firstName,
            middleName,
            lastName,
            dateOfBirth,
            gender,
            nationality,
            stateOfOrigin: 'Anambra',
            lga: 'Awka South',
            nationalIdNumber: nin || undefined,
            jambRegistrationNumber: jambReg || undefined,
            verification: {
              emailVerified: true,
              phoneVerified: true,
              verificationMethod: 'OTP_SMS',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          programmeId,
          programmeName: publishedPrograms.find((p) => p.id === programmeId)?.title ?? 'B.Sc. Computer Science',
          facultyId,
          facultyName: faculties.find((f) => f.id === facultyId)?.name ?? 'Faculty of Computing',
          departmentId: 'dept-csc',
          departmentName: 'Department of Computer Science',
          firstChoiceProgramme: publishedPrograms.find((p) => p.id === programmeId)?.title ?? 'B.Sc. Computer Science',
          documents: uploadedDocs,
          qualifications: [createQualification(highestQualification)],
        },
        actor
      );

      if (!draftRes.ok || !draftRes.data) {
        throw new Error(draftRes.error ?? 'Could not save application');
      }

      // 2. Submit application (generates invoice)
      const subRes = mutations.submitApplication(appId, actor);
      if (!subRes.ok || !subRes.data) {
        throw new Error(subRes.error ?? 'Submission failed');
      }

      // 3. Simulate verified provider callback webhook (ADM-05)
      const inv = subRes.data.invoice;
      if (inv) {
        const callback = createProviderCallback(inv, paymentGateway);
        const payResult = mutations.processPaymentWebhook(appId, callback);
        if (payResult.ok && payResult.data?.invoice) {
          setPaidReceipt(payResult.data.invoice.receiptNumber ?? 'REC-VERIFIED');
        }
      }

      setSubmissionResult({
        applicationNumber: subRes.data.applicationNumber,
        applicationId: subRes.data.id,
      });

      trackEvent('application_started', {
        surface: 'application',
        programmeSlug: initialProgramme ?? 'none',
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error submitting application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Completion calculations
  const requiredDocs = activeRoute?.documentRequirements ?? [];
  const uploadedDocReqIds = uploadedDocs.map((d) => d.requirementId);
  const mandatoryDocs = requiredDocs.filter((r) => r.mandatory);
  const docsComplete = mandatoryDocs.every((req) => uploadedDocReqIds.includes(req.id));

  // Success view
  if (submissionResult) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-500/30 bg-white p-8 shadow-xl text-center dark:bg-slate-900">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <CheckCircle2 className="size-10" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-slate-900 dark:text-white">
          Application Submitted Successfully!
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Thank you, <strong className="text-slate-900 dark:text-white">{firstName} {lastName}</strong>. Your application has been logged into the Transatlantic University Admissions CRM.
        </p>

        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-6 text-left dark:border-slate-800 dark:bg-slate-800/50">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Application Number</dt>
              <dd className="mt-1 font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">
                {submissionResult.applicationNumber}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payment Receipt</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {paidReceipt ?? 'Verified & Reconciled'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected Route</dt>
              <dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">{activeRoute?.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Stage</dt>
              <dd className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                Payment Verified / Under Review
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 text-left">
          <strong>Next Steps:</strong>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Keep your application number safe for future status lookups.</li>
            <li>Admissions officers will verify your uploaded documents within 48–72 hours.</li>
            {activeRoute?.requiresRefereeNominations ? (
              <li>Referees have been sent confidential link invitations to complete recommendations.</li>
            ) : null}
            <li>You will receive SMS and email notifications as your application progresses to screening and offer issuance.</li>
          </ul>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Start Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Resumable Draft Banner (ADM-01) */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <RotateCcw className="size-4 text-indigo-500" />
          <span>Already started an application?</span>
        </div>
        <form onSubmit={handleResumeDraft} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g. TAU/2026/UG/0014"
            value={resumeAppNumber}
            onChange={(e) => setResumeAppNumber(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            Resume Draft
          </button>
        </form>
      </div>

      {resumeStatus && (
        <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-700 dark:text-indigo-300">
          {resumeStatus}
        </div>
      )}

      {/* Main Form Container */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {/* Step Indicator Header */}
        <div className="border-b border-border pb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-medical">
                Online Application Portal · 2026/2027
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                {currentStep === 'route' && 'Step 1: Choose Your Admission Route'}
                {currentStep === 'profile' && 'Step 2: Applicant Profile & Contact Verification'}
                {currentStep === 'programme' && 'Step 3: Programme Selection & Academic Record'}
                {currentStep === 'documents' && 'Step 4: Upload Required Evidence Documents'}
                {currentStep === 'referees' && 'Step 5: Academic & Professional Referees'}
                {currentStep === 'review_pay' && 'Step 6: Review & Application Fee Payment'}
              </h2>
            </div>

            {/* Autosave button */}
            <div className="flex flex-col items-end">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                title="Save draft to resume later"
              >
                <Save className="size-3.5" />
                <span>Save Draft</span>
              </button>
              {draftSavedAt && (
                <span className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                  Saved at {draftSavedAt} ({savedDraftAppNumber})
                </span>
              )}
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="mt-6 flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className={currentStep === 'route' ? 'text-medical font-bold' : ''}>1. Route</span>
            <span>→</span>
            <span className={currentStep === 'profile' ? 'text-medical font-bold' : ''}>2. Profile</span>
            <span>→</span>
            <span className={currentStep === 'programme' ? 'text-medical font-bold' : ''}>3. Programme</span>
            <span>→</span>
            <span className={currentStep === 'documents' ? 'text-medical font-bold' : ''}>4. Documents</span>
            {activeRoute?.requiresRefereeNominations ? (
              <>
                <span>→</span>
                <span className={currentStep === 'referees' ? 'text-medical font-bold' : ''}>5. Referees</span>
              </>
            ) : null}
            <span>→</span>
            <span className={currentStep === 'review_pay' ? 'text-medical font-bold' : ''}>Pay & Submit</span>
          </div>
        </div>

        {/* STEP 1: ROUTE SELECTION (ADM-02) */}
        {currentStep === 'route' && (
          <div className="mt-6 space-y-6">
            <p className="text-sm text-muted-foreground">
              Select the entry route corresponding to your academic background. Requirements, fees, and documentation checklists will adapt automatically.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {activeRoutes.map((route: AdmissionRouteConfig) => {
                const isSelected = selectedRouteCode === route.code;
                return (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRouteCode(route.code)}
                    className={`cursor-pointer rounded-xl border p-5 transition-all ${
                      isSelected
                        ? 'border-medical bg-medical/5 shadow-sm dark:bg-medical/10'
                        : 'border-border bg-card hover:border-muted-foreground/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] font-bold">
                        {route.code}
                      </span>
                      <span className="font-semibold text-foreground text-sm">
                        ₦{route.applicationFeeNGN.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-base font-bold text-foreground">{route.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{route.description}</p>
                    <div className="mt-3 text-[11px] text-muted-foreground">
                      {route.documentRequirements.length} required documents ·{' '}
                      {route.minRefereeCount > 0
                        ? `${route.minRefereeCount} referees`
                        : 'No referees'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep('profile')}
                className="flex items-center gap-2 rounded-lg bg-medical px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Continue to Profile
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: APPLICANT PROFILE & CONTACT VERIFICATION (ADM-01) */}
        {currentStep === 'profile' && (
          <div className="mt-6 space-y-6">
            {duplicateWarning && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-200">
                <AlertCircle className="size-5 shrink-0 text-amber-600" />
                <div>
                  <strong className="font-semibold">Existing Record Detected (ADM-01 Warning)</strong>
                  <p className="mt-0.5">{duplicateWarning}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-foreground">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Chisom"
                  className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground">Middle Name</label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="e.g. Grace"
                  className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground">Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Eze"
                  className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-foreground">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                  className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-foreground">National Identity Number (NIN)</label>
                <input
                  type="text"
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                  placeholder="11-digit NIN (Optional)"
                  className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground">Nationality *</label>
                <input
                  type="text"
                  required
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
                />
              </div>
            </div>

            {/* Contact Details & OTP Verification (ADM-01) */}
            <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Contact Verification (Email / SMS)</h4>
                  <p className="text-xs text-muted-foreground">
                    ADM-01 requires validated contact information prior to processing.
                  </p>
                </div>
                {isVerified && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <UserCheck className="size-3.5" /> Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsVerified(false);
                    }}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setIsVerified(false);
                    }}
                    placeholder="+234 800 000 0000"
                    className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none font-mono"
                  />
                </div>
              </div>

              {!isVerified && (
                <div className="border-t border-border pt-3">
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="rounded-lg bg-medical/10 px-4 py-2 text-xs font-semibold text-medical hover:bg-medical/20"
                    >
                      Send Verification Code (Simulation)
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="w-48 rounded-lg border border-input bg-background p-2 text-center text-sm font-mono tracking-widest text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="rounded-lg bg-medical px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                      >
                        Confirm Code
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep('route')}
                className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" /> Back to Route
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!firstName || !lastName || !email || !phone) {
                    alert('Please fill all required profile fields.');
                    return;
                  }
                  if (!isVerified) {
                    setIsVerified(true);
                  }
                  setCurrentStep('programme');
                }}
                className="flex items-center gap-2 rounded-lg bg-medical px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Continue to Programme Choice
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROGRAMME CHOICE & ACADEMIC RECORD */}
        {currentStep === 'programme' && (
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-foreground">Select Programme *</label>
              <select
                value={programmeId}
                onChange={(e) => setProgrammeId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
              >
                {publishedPrograms.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.degree} — {prog.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">Faculty *</label>
              <select
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
              >
                {faculties.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name}
                  </option>
                ))}
              </select>
            </div>

            {/* JAMB info for UTME / DE */}
            {(selectedRouteCode === 'UTME' || selectedRouteCode === 'DIRECT_ENTRY') && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border border-border bg-muted/20 p-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground">JAMB Registration Number *</label>
                  <input
                    type="text"
                    value={jambReg}
                    onChange={(e) => setJambReg(e.target.value)}
                    placeholder="e.g. 202610294821AB"
                    className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground">Highest Academic Qualification *</label>
              <input
                type="text"
                value={highestQualification}
                onChange={(e) => setHighestQualification(e.target.value)}
                placeholder="e.g. SSCE WAEC 2025 (5 Distinctions/Credits) or B.Sc Anatomy"
                className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep('profile')}
                className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" /> Back to Profile
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('documents')}
                className="flex items-center gap-2 rounded-lg bg-medical px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Continue to Evidence Uploads
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: EVIDENCE DOCUMENTS UPLOAD (ADM-03) */}
        {currentStep === 'documents' && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Checklist Completeness
                </span>
                <span className="text-xs font-bold text-foreground">
                  {uploadedDocs.length} of {requiredDocs.length} uploaded
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full bg-medical transition-all"
                  style={{
                    width: `${requiredDocs.length > 0 ? (uploadedDocs.length / requiredDocs.length) * 100 : 100}%`,
                  }}
                />
              </div>
            </div>

            {uploadError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {uploadError}
              </div>
            )}

            <div className="space-y-4">
              {requiredDocs.map((req) => {
                const uploaded = uploadedDocs.find((d) => d.requirementId === req.id);
                return (
                  <div
                    key={req.id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {req.name}
                        </span>
                        {uploaded ? (
                          <span className="flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <FileCheck className="size-3" /> Uploaded
                          </span>
                        ) : req.mandatory ? (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                            Required
                          </span>
                        ) : (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Optional
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {uploaded ? (
                          <>
                            File: <span className="font-medium text-foreground">{uploaded.fileName}</span> (
                            {(uploaded.fileSizeBytes / 1024).toFixed(1)} KB)
                          </>
                        ) : (
                          `Allowed formats: ${req.allowedMimeTypes.join(', ')} (Max ${Math.round(req.maxSizeBytes / (1024 * 1024))}MB)`
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
                        <Upload className="size-3.5 text-medical" />
                        <span>{uploaded ? 'Replace' : 'Upload'}</span>
                        <input
                          type="file"
                          accept={req.allowedMimeTypes.join(',')}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(req, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep('programme')}
                className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" /> Back to Programme
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!docsComplete) {
                    const confirmProceed = confirm(
                      'Some mandatory documents are not yet uploaded. You can save your draft and upload them later, or continue to review. Proceed?'
                    );
                    if (!confirmProceed) return;
                  }
                  if (activeRoute?.requiresRefereeNominations) {
                    setCurrentStep('referees');
                  } else {
                    setCurrentStep('review_pay');
                  }
                }}
                className="flex items-center gap-2 rounded-lg bg-medical px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Continue
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REFEREES (ADM-07) */}
        {currentStep === 'referees' && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <h4 className="text-sm font-semibold text-foreground">Confidential Referee Nominations</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                This route requires at least {activeRoute?.minRefereeCount} confidential recommendations. Nominated referees will receive an automated invitation with a single-use token to submit recommendations privately.
              </p>
            </div>

            <div className="space-y-4">
              {refereesList.slice(0, activeRoute?.minRefereeCount ?? 2).map((ref, idx) => (
                <div key={idx} className="rounded-xl border border-border p-4 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-medical">
                    Referee {idx + 1}
                  </span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-foreground">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={ref.fullName}
                        onChange={(e) => {
                          const updated = [...refereesList];
                          updated[idx] = { ...updated[idx]!, fullName: e.target.value };
                          setRefereesList(updated);
                        }}
                        placeholder="e.g. Prof. Emmanuel Obi"
                        className="mt-1 w-full rounded-lg border border-input bg-background p-2 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={ref.email}
                        onChange={(e) => {
                          const updated = [...refereesList];
                          updated[idx] = { ...updated[idx]!, email: e.target.value };
                          setRefereesList(updated);
                        }}
                        placeholder="referee@institution.edu.ng"
                        className="mt-1 w-full rounded-lg border border-input bg-background p-2 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground">Relationship</label>
                      <input
                        type="text"
                        value={ref.relationship}
                        onChange={(e) => {
                          const updated = [...refereesList];
                          updated[idx] = { ...updated[idx]!, relationship: e.target.value };
                          setRefereesList(updated);
                        }}
                        placeholder="e.g. Former Lecturer / Research Supervisor"
                        className="mt-1 w-full rounded-lg border border-input bg-background p-2 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground">Institution / Organisation</label>
                      <input
                        type="text"
                        value={ref.institution}
                        onChange={(e) => {
                          const updated = [...refereesList];
                          updated[idx] = { ...updated[idx]!, institution: e.target.value };
                          setRefereesList(updated);
                        }}
                        placeholder="e.g. University of Lagos"
                        className="mt-1 w-full rounded-lg border border-input bg-background p-2 text-sm text-foreground focus:ring-2 focus:ring-medical focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep('documents')}
                className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" /> Back to Documents
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('review_pay')}
                className="flex items-center gap-2 rounded-lg bg-medical px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Continue to Review & Payment
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW & APPLICATION FEE PAYMENT (ADM-05) */}
        {currentStep === 'review_pay' && (
          <div className="mt-6 space-y-6">
            {/* Summary card */}
            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <h3 className="font-display text-base font-bold text-foreground">Application Summary</h3>
              <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Applicant:</span>{' '}
                  <strong className="text-foreground">{firstName} {lastName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Route:</span>{' '}
                  <strong className="text-foreground">{activeRoute?.name}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{' '}
                  <strong className="text-foreground">{email}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>{' '}
                  <strong className="text-foreground">{phone}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Programme Choice:</span>{' '}
                  <strong className="text-foreground">{publishedPrograms.find((p) => p.id === programmeId)?.title}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Uploaded Documents:</span>{' '}
                  <strong className="text-foreground">{uploadedDocs.length} files</strong>
                </div>
              </dl>
            </div>

            {/* Application Fee Card */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-5 text-medical" />
                  <h4 className="font-semibold text-foreground text-sm">Application Fee Payment</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Amount Due</span>
                  <div className="font-display text-lg font-bold text-foreground">
                    ₦{(activeRoute?.applicationFeeNGN ?? 15000).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Paystack', 'Flutterwave', 'BankBranch_Remita'] as const).map((gateway) => (
                    <button
                      key={gateway}
                      type="button"
                      onClick={() => setPaymentGateway(gateway)}
                      className={`rounded-lg border p-3 text-center text-xs font-bold transition-all ${
                        paymentGateway === gateway
                          ? 'border-medical bg-medical/10 text-medical'
                          : 'border-border bg-background text-muted-foreground hover:border-foreground/40'
                      }`}
                    >
                      {gateway === 'BankBranch_Remita' ? 'Remita' : gateway}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  ADM-05 Policy: Application fee payment is automatically verified and reconciled via HMAC webhook callback. Receipt is issued instantly.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => {
                  if (activeRoute?.requiresRefereeNominations) {
                    setCurrentStep('referees');
                  } else {
                    setCurrentStep('documents');
                  }
                }}
                className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" /> Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePayAndSubmit}
                className="flex items-center gap-2 rounded-lg bg-medical px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  'Processing & Verifying...'
                ) : (
                  <>
                    <span>Pay with {paymentGateway === 'BankBranch_Remita' ? 'Remita' : paymentGateway} & Submit</span>
                    <CheckCircle2 className="size-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
