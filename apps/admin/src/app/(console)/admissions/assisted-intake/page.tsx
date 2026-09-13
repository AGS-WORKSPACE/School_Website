"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Textarea } from "@tau/ui/textarea";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useAdmissions, AdmissionRouteCode, ApplicationCase } from "@tau/admissions";
import { useSession } from "@/providers/session-provider";

export default function AssistedIntakePage() {
  const { routes, mutations } = useAdmissions();
  const { session } = useSession();

  // Form State
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("2006-01-01");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [nationality, setNationality] = useState("Nigerian");
  const [stateOfOrigin, setStateOfOrigin] = useState("Anambra");
  const [lga, setLga] = useState("Awka South");
  const [nin, setNin] = useState("");
  const [jambReg, setJambReg] = useState("");
  const [routeCode, setRouteCode] = useState<AdmissionRouteCode>("UTME");
  const [programmeName, setProgrammeName] = useState("B.Sc. Computer Science");
  const [deskLocation, setDeskLocation] = useState("Main Campus Admissions Pavilion (Desk 2)");
  const [qualSummary, setQualSummary] = useState("WAEC 2025: 7 Credits including English and Mathematics");
  const [officerNotes, setOfficerNotes] = useState("Candidate presented original WAEC statement and JAMB slip in person.");
  const [consentAcknowledged, setConsentAcknowledged] = useState(true);

  const [submittedApp, setSubmittedApp] = useState<ApplicationCase | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consentAcknowledged) {
      setError("Applicant consent acknowledgement is mandatory for assisted walk-in intake.");
      return;
    }

    const officer = {
      personId: session?.personId ?? "usr-admissions-desk-01",
      name: session?.displayName ?? "Admissions Desk Officer",
      role: "Admissions Officer",
    };

    const newAppId = `app-walkin-${Date.now()}`;
    const newAppNumber = `TAU/${new Date().getFullYear()}/${routeCode}/${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const application: ApplicationCase = {
      id: newAppId,
      applicationNumber: newAppNumber,
      applicant: {
        id: `usr-walkin-${Date.now()}`,
        email,
        phone,
        firstName,
        middleName: middleName || undefined,
        lastName,
        dateOfBirth,
        gender,
        nationality,
        stateOfOrigin,
        lga,
        nationalIdNumber: nin || undefined,
        jambRegistrationNumber: jambReg || undefined,
        verification: {
          emailVerified: true,
          emailVerifiedAt: now,
          phoneVerified: true,
          phoneVerifiedAt: now,
          verificationMethod: "OFFICER_CONFIRMED",
        },
        createdAt: now,
        updatedAt: now,
      },
      admissionCycleId: "cycle-2026-2027",
      academicSession: "2026/2027",
      routeCode,
      programmeId: "prog-csc",
      programmeName,
      facultyId: "fac-sci",
      facultyName: "Faculty of Computing and Applied Sciences",
      departmentId: "dept-csc",
      departmentName: "Department of Computer Science",
      firstChoiceProgramme: programmeName,
      stage: "Payment_Verified",
      stageHistory: [],
      qualifications: [
        {
          id: `qual-${Date.now()}`,
          type: "O_LEVEL_WAEC",
          examYear: 2025,
          examRegistrationNumber: `WALKIN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          gradeScoreSummary: qualSummary,
          verifiedOnline: true,
        },
      ],
      documents: [],
      assistedIntake: {
        id: `asst-${Date.now()}`,
        applicationId: newAppId,
        assistingOfficerId: officer.personId,
        assistingOfficerName: officer.name,
        assistingOfficerEmail: session ? `${session.personId}@tau.edu.ng` : "admissions@tau.edu.ng",
        campusLocation: deskLocation,
        intakeChannel: "Walk-In Desk",
        capturedAt: now,
        notes: officerNotes,
        applicantConsent: {
          acknowledgedByApplicant: true,
          consentTimestamp: now,
          signatureType: "DIGITAL_ACK",
          consentStatement: `I, ${firstName} ${lastName}, hereby consent to having my admission application captured assisted by university admissions personnel.`,
        },
        applicantConfirmationStatus: "Confirmed_By_Applicant",
        confirmedAt: now,
      },
      invoice: {
        id: `inv-${Date.now()}`,
        applicationId: newAppId,
        applicantId: `usr-walkin-${Date.now()}`,
        routeCode,
        amount: 15000,
        currency: "NGN",
        invoiceReference: `TAU-APP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        issuedAt: now,
        status: "Verified",
        paymentMethod: "Bank Draft / Physical POS (Desk Receipt)",
        verifiedAt: now,
        receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      },
      deadlineTimestamp: "2026-10-31T23:59:59Z",
      lastActiveAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const res = mutations.captureAssistedIntake(application, officer);
    if (!res.ok) {
      setError(res.error ?? "Failed to capture assisted intake.");
      return;
    }

    setSubmittedApp(application);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ADM-04 · Admissions Operations"
        title="Capture assisted walk-in intake"
        description="Capture offline or in-person walk-in applications at designated campus admissions pavilions."
      />

      {submittedApp && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-xs text-emerald-950 dark:text-emerald-200 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">
                Walk-In Application Captured Successfully
              </h3>
              <p className="mt-1 leading-relaxed">
                Candidate <strong>{submittedApp.applicant.firstName} {submittedApp.applicant.lastName}</strong> has been enrolled with Application Number <strong>{submittedApp.applicationNumber}</strong>.
              </p>
              <div className="mt-2 text-muted-foreground font-mono text-[0.68rem]">
                Officer Provenance: {submittedApp.assistedIntake?.assistingOfficerName} ({submittedApp.assistedIntake?.campusLocation})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button asChild size="sm" variant="default" className="text-xs">
              <Link href={`/admissions/applications/${submittedApp.id}`}>
                View Applicant Dossier <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSubmittedApp(null);
                setFirstName("");
                setLastName("");
                setEmail("");
                setPhone("");
                setNin("");
                setJambReg("");
              }}
              className="text-xs"
            >
              Capture Another Walk-In
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleCapture} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Candidate Biodata */}
          <Section
            title="1. Candidate Biodata"
            description="Personal details verified from physical ID documents."
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="first-name" className="text-xs">First Name *</Label>
                  <Input
                    id="first-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Obinna"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="last-name" className="text-xs">Last Name *</Label>
                  <Input
                    id="last-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Nwosu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="middle-name" className="text-xs">Middle Name</Label>
                  <Input
                    id="middle-name"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dob" className="text-xs">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="gender" className="text-xs">Gender</Label>
                  <NativeSelect
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "Male" | "Female" | "Other")}
                    className="text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </NativeSelect>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="nationality" className="text-xs">Nationality</Label>
                  <Input
                    id="nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="state" className="text-xs">State of Origin</Label>
                  <Input
                    id="state"
                    value={stateOfOrigin}
                    onChange={(e) => setStateOfOrigin(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lga" className="text-xs">LGA</Label>
                  <Input
                    id="lga"
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Contact Details & National IDs */}
          <Section
            title="2. Contact & National Identifiers"
            description="Contact details for applicant notification and dispatching login credentials."
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Candidate Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="applicant@example.com"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs">Mobile Phone Number *</Label>
                <Input
                  id="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+2348012345678"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="nin" className="text-xs">NIN (11 Digits)</Label>
                  <Input
                    id="nin"
                    maxLength={11}
                    value={nin}
                    onChange={(e) => setNin(e.target.value)}
                    placeholder="99887766554"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jamb" className="text-xs">JAMB Reg Number</Label>
                  <Input
                    id="jamb"
                    value={jambReg}
                    onChange={(e) => setJambReg(e.target.value)}
                    placeholder="202610293847AB"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="route" className="text-xs">Admission Route</Label>
                  <NativeSelect
                    id="route"
                    value={routeCode}
                    onChange={(e) => setRouteCode(e.target.value as AdmissionRouteCode)}
                    className="text-xs"
                  >
                    {routes.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="programme" className="text-xs">Programme Choice</Label>
                  <NativeSelect
                    id="programme"
                    value={programmeName}
                    onChange={(e) => setProgrammeName(e.target.value)}
                    className="text-xs"
                  >
                    <option value="B.Sc. Computer Science">B.Sc. Computer Science</option>
                    <option value="B.Eng. Software Engineering">B.Eng. Software Engineering</option>
                    <option value="MBBS Medicine & Surgery">MBBS Medicine & Surgery</option>
                    <option value="B.N.Sc. Nursing Science">B.N.Sc. Nursing Science</option>
                    <option value="B.Eng. Electrical & Electronic Engineering">B.Eng. Electrical & Electronic Engineering</option>
                  </NativeSelect>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Officer Provenance & Applicant Consent */}
        <Section
          title="3. Assisting Officer Provenance & Mandatory Consent (ADM-04)"
          description="In compliance with audit standards, walk-in applications require affirmative applicant acknowledgement."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="desk-loc" className="text-xs">Intake Desk Location</Label>
                <Input
                  id="desk-loc"
                  value={deskLocation}
                  onChange={(e) => setDeskLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="qual-notes" className="text-xs">Verified Qualification Summary</Label>
                <Input
                  id="qual-notes"
                  value={qualSummary}
                  onChange={(e) => setQualSummary(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes" className="text-xs">Officer Verification Notes</Label>
              <Textarea
                id="notes"
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAcknowledged}
                  onChange={(e) => setConsentAcknowledged(e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                />
                <div className="text-xs">
                  <span className="font-bold text-foreground">
                    Affirmative Applicant Consent Acknowledged
                  </span>
                  <p className="text-muted-foreground mt-0.5">
                    The applicant was informed that their data is being captured electronically by{" "}
                    <strong>{session?.displayName ?? "Admissions Desk"}</strong>. Login credentials will be dispatched to the candidate email ({email || "candidate email"}) to review and confirm submitted records.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" size="sm" className="text-xs">
                <ShieldCheck className="mr-1.5 size-3.5" /> Complete Assisted Walk-In Capture
              </Button>
            </div>
          </div>
        </Section>
      </form>
    </div>
  );
}
