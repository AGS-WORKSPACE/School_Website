"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  History,
  Lock,
  Mail,
  Phone,
  Receipt,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useAdmissions } from "@tau/admissions";

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { applications } = useAdmissions();

  const app = applications.find((a) => a.id === id);

  if (!app) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admissions/applications"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary mb-3"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back to all dossiers
        </Link>
        <PageHeader
          eyebrow={`EP-05 · Dossier #${app.applicationNumber}`}
          title={`${app.applicant.firstName} ${app.applicant.lastName}`}
          description={`${app.routeCode} applicant for ${app.programmeName} (${app.academicSession}).`}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                {app.stage.replace(/_/g, " ")}
              </Badge>
              {app.invoice?.status === "Verified" && (
                <Badge variant="default" className="bg-emerald-600 text-xs">
                  <CheckCircle2 className="mr-1 size-3" /> Fee Reconciled
                </Badge>
              )}
            </div>
          }
        />
      </div>

      {/* Assisted Intake Provenance Banner (ADM-04) */}
      {app.assistedIntake && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-xs">
          <div className="flex items-start gap-3">
            <UserPlus className="size-5 shrink-0 text-indigo-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Walk-In Assisted Intake Record (ADM-04)
              </h3>
              <p className="mt-1 text-muted-foreground leading-relaxed">
                Captured by <strong>{app.assistedIntake.assistingOfficerName}</strong> (
                {app.assistedIntake.assistingOfficerEmail}) at {app.assistedIntake.campusLocation} on{" "}
                {new Date(app.assistedIntake.capturedAt).toLocaleString()}.
              </p>
              <div className="mt-2 flex items-center gap-4 text-muted-foreground font-mono text-[0.68rem]">
                <span>Channel: {app.assistedIntake.intakeChannel}</span>
                <span>
                  Consent: {app.assistedIntake.applicantConsent.signatureType} (Acknowledged)
                </span>
                <span>
                  Status: {app.assistedIntake.applicantConfirmationStatus.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Profile & Contact</TabsTrigger>
          <TabsTrigger value="qualifications">Academic Qualifications</TabsTrigger>
          <TabsTrigger value="evidence">
            Evidence & Documents ({app.documents.length})
          </TabsTrigger>
          <TabsTrigger value="payment">Fee & Payment Receipt</TabsTrigger>
          {app.refereeRequests && app.refereeRequests.length > 0 && (
            <TabsTrigger value="referees">
              Referees ({app.refereeRequests.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="timeline">Audit Timeline</TabsTrigger>
        </TabsList>

        {/* Profile & Contact Tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section title="Biographical Information" description="Identity records submitted by candidate.">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Full Legal Name</span>
                  <span className="font-semibold">
                    {app.applicant.firstName} {app.applicant.middleName ?? ""} {app.applicant.lastName}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Date of Birth</span>
                  <span className="font-semibold">{app.applicant.dateOfBirth}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-semibold">{app.applicant.gender}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Nationality</span>
                  <span className="font-semibold">{app.applicant.nationality}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">State / LGA</span>
                  <span className="font-semibold">
                    {app.applicant.stateOfOrigin ?? "N/A"} / {app.applicant.lga ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">National ID Number (NIN)</span>
                  <span className="font-mono font-semibold">
                    {app.applicant.nationalIdNumber ?? "Not Provided"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">JAMB Registration Number</span>
                  <span className="font-mono font-semibold">
                    {app.applicant.jambRegistrationNumber ?? "Not Required"}
                  </span>
                </div>
              </div>
            </Section>

            <Section title="Contact Verification (ADM-01)" description="Multi-channel contact validation.">
              <div className="space-y-3 text-xs">
                <div className="rounded-lg border border-border p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium flex items-center gap-1.5">
                      <Mail className="size-3.5 text-muted-foreground" />
                      {app.applicant.email}
                    </span>
                    {app.applicant.verification.emailVerified ? (
                      <Badge variant="default" className="bg-emerald-600 text-[0.65rem]">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 text-[0.65rem]">
                        Unverified
                      </Badge>
                    )}
                  </div>
                  <div className="text-[0.68rem] text-muted-foreground">
                    Method: {app.applicant.verification.verificationMethod}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium flex items-center gap-1.5">
                      <Phone className="size-3.5 text-muted-foreground" />
                      {app.applicant.phone}
                    </span>
                    {app.applicant.verification.phoneVerified ? (
                      <Badge variant="default" className="bg-emerald-600 text-[0.65rem]">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 text-[0.65rem]">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>

                {app.applicant.nextOfKin && (
                  <div className="pt-2 border-t border-border">
                    <span className="font-bold block mb-1">Next of Kin:</span>
                    <p className="text-muted-foreground">
                      {app.applicant.nextOfKin.name} ({app.applicant.nextOfKin.relationship}) —{" "}
                      {app.applicant.nextOfKin.phone}
                    </p>
                  </div>
                )}
              </div>
            </Section>
          </div>
        </TabsContent>

        {/* Qualifications Tab */}
        <TabsContent value="qualifications" className="mt-4">
          <Section
            title="Prior Academic Qualifications"
            description="Certificates, exam sittings, and degree classifications entered by applicant."
          >
            <div className="space-y-3">
              {app.qualifications.map((q) => (
                <div key={q.id} className="rounded-lg border border-border p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {q.type.replace(/_/g, " ")} ({q.examYear})
                    </span>
                    <Badge variant="outline" className="font-mono text-[0.68rem]">
                      Reg: {q.examRegistrationNumber}
                    </Badge>
                  </div>
                  {q.institutionName && (
                    <div className="text-muted-foreground">Institution: {q.institutionName}</div>
                  )}
                  <div className="rounded bg-muted/40 p-2 font-mono text-[0.72rem] text-foreground">
                    {q.gradeScoreSummary}
                  </div>
                </div>
              ))}
              {app.qualifications.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No academic qualifications entered yet.
                </p>
              )}
            </div>
          </Section>
        </TabsContent>

        {/* Evidence & Documents Tab (ADM-03) */}
        <TabsContent value="evidence" className="mt-4">
          <Section
            title="Evidence & Document Verification (ADM-03)"
            description="Uploaded credentials with virus scan results, cryptographic checksums, and replacement audit."
          >
            <div className="divide-y divide-border">
              {app.documents.map((doc) => (
                <div key={doc.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary shrink-0" />
                      <div>
                        <span className="font-bold text-foreground">{doc.fileName}</span>
                        <span className="text-muted-foreground ml-2">
                          ({(doc.fileSizeBytes / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.securityScan.passed ? (
                        <Badge variant="default" className="bg-emerald-600 text-[0.65rem]">
                          <ShieldCheck className="mr-1 size-3" /> Clean
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[0.65rem]">
                          Flagged
                        </Badge>
                      )}
                      <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-1 size-3" /> View
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="font-mono text-[0.65rem] text-muted-foreground bg-muted/30 p-2 rounded">
                    SHA-256: {doc.checksumSha256}
                  </div>

                  {doc.replacementHistory.length > 0 && (
                    <div className="rounded border border-border/60 bg-muted/20 p-2 text-[0.68rem]">
                      <div className="font-semibold flex items-center gap-1 text-muted-foreground">
                        <History className="size-3" /> Replacement History:
                      </div>
                      {doc.replacementHistory.map((h) => (
                        <div key={h.id} className="mt-1 text-muted-foreground">
                          Replaced {h.previousFileName} on {new Date(h.replacedAt).toLocaleDateString()} by{" "}
                          {h.replacedBy}. Reason: {h.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {app.documents.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No documents uploaded.
                </p>
              )}
            </div>
          </Section>
        </TabsContent>

        {/* Payment Tab (ADM-05) */}
        <TabsContent value="payment" className="mt-4">
          <Section
            title="Application Fee Reconciliation (ADM-05)"
            description="Verified payment gateway transaction and receipt record."
          >
            {app.invoice ? (
              <div className="rounded-xl border border-border p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="text-muted-foreground">Invoice Reference:</span>
                    <span className="font-mono font-bold ml-2 text-foreground">
                      {app.invoice.invoiceReference}
                    </span>
                  </div>
                  <Badge
                    variant={app.invoice.status === "Verified" ? "default" : "outline"}
                    className={app.invoice.status === "Verified" ? "bg-emerald-600" : "text-amber-600"}
                  >
                    {app.invoice.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-muted-foreground block">Amount</span>
                    <span className="font-bold text-sm">
                      ₦{app.invoice.amount.toLocaleString()} {app.invoice.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Receipt Number</span>
                    <span className="font-mono font-semibold">
                      {app.invoice.receiptNumber ?? "Pending"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Payment Method</span>
                    <span className="font-medium">{app.invoice.paymentMethod ?? "Not Paid"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Reconciled At</span>
                    <span className="font-medium">
                      {app.invoice.verifiedAt
                        ? new Date(app.invoice.verifiedAt).toLocaleString()
                        : "Awaiting Callback"}
                    </span>
                  </div>
                </div>

                {app.invoice.verifiedCallback && (
                  <div className="rounded bg-muted/40 p-3 space-y-1 font-mono text-[0.68rem] text-muted-foreground">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <Receipt className="size-3.5" /> Gateway Signature Verification:
                    </div>
                    <div>Gateway Ref: {app.invoice.verifiedCallback.gatewayReference}</div>
                    <div>Provider: {app.invoice.verifiedCallback.provider}</div>
                    <div>Signature Hash: {app.invoice.verifiedCallback.signatureHash}</div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No application fee invoice issued.
              </p>
            )}
          </Section>
        </TabsContent>

        {/* Confidential Referees Tab (ADM-07) */}
        {app.refereeRequests && app.refereeRequests.length > 0 && (
          <TabsContent value="referees" className="mt-4">
            <Section
              title="Confidential Referee Reports (ADM-07)"
              description="Confidential evaluations submitted via single-use token links. Accessible only to authorized admissions officers."
            >
              <div className="space-y-4">
                {app.refereeRequests.map((refReq) => (
                  <div key={refReq.id} className="rounded-xl border border-border p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-border pb-2.5">
                      <div>
                        <span className="font-bold text-sm text-foreground">{refReq.refereeName}</span>
                        <span className="text-muted-foreground ml-2">
                          ({refReq.refereeDesignation}, {refReq.refereeInstitution})
                        </span>
                      </div>
                      <Badge
                        variant={refReq.status === "Submitted" ? "default" : "outline"}
                        className={refReq.status === "Submitted" ? "bg-emerald-600" : "text-amber-600"}
                      >
                        {refReq.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground text-[0.7rem]">
                      <span>Email: {refReq.refereeEmail}</span>
                      <span>Requested: {new Date(refReq.requestedAt).toLocaleDateString()}</span>
                      {refReq.submittedAt && (
                        <span>Submitted: {new Date(refReq.submittedAt).toLocaleDateString()}</span>
                      )}
                    </div>

                    {/* Confidential Submission Details (Visible to Officer) */}
                    {refReq.submission ? (
                      <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3.5 space-y-2">
                        <div className="flex items-center justify-between font-semibold text-purple-950 dark:text-purple-300">
                          <span className="flex items-center gap-1.5">
                            <Lock className="size-3.5" /> Confidential Recommendation
                          </span>
                          <Badge variant="outline" className="bg-background text-purple-700 dark:text-purple-300">
                            {refReq.submission.recommendationDecision}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[0.68rem] text-muted-foreground">
                          <div>Ability: {refReq.submission.academicAbilityRating}</div>
                          <div>Character: {refReq.submission.moralCharacterRating}</div>
                          <div>Known: {refReq.submission.knownDurationYears} years</div>
                        </div>
                        <p className="italic text-foreground bg-background/60 p-2 rounded text-xs">
                          &ldquo;{refReq.submission.confidentialNarrative}&rdquo;
                        </p>
                      </div>
                    ) : (
                      <div className="rounded bg-muted/40 p-3 text-xs text-muted-foreground">
                        Single-use link sent to referee. Awaiting confidential submission.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>
        )}

        {/* Audit Timeline Tab */}
        <TabsContent value="timeline" className="mt-4">
          <Section title="Application Lifecycle History" description="Chronological audit log.">
            <div className="space-y-3">
              {app.stageHistory.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs border-l-2 border-primary/30 pl-3 py-1">
                  <Clock className="size-3.5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-semibold text-foreground">
                      Stage changed to <span className="text-primary">{log.newStage.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">{log.remarks}</p>
                    <div className="text-[0.68rem] text-muted-foreground font-mono mt-1">
                      {new Date(log.timestamp).toLocaleString()} by {log.actorName} ({log.actorRole})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
