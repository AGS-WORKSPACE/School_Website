/**
 * Demonstration student records. Fatima Aliyu continues the EP-07 onboarding
 * seed (student-2026-004); the others cover each lifecycle scenario in EP-08.
 */

import type { CorrectionRequest } from "../domain/correction";
import type { StudentHold } from "../domain/hold";
import type { LifecycleEvent } from "../domain/lifecycle";
import type { FieldHistoryEntry, Provenance, RecordedField, Student, StudentAuditEntry, StudentFieldKey } from "../domain/record";
import type { TransferCase } from "../domain/transfer";

export interface StudentsActor {
  personId: string;
  name: string;
  role: string;
  unit: string;
}

/** Staff personas used by the console's "acting as" switcher to exercise maker-checker rules. */
export const studentsActors: StudentsActor[] = [
  { personId: "usr-registry-01", name: "Mrs. Ada Nwosu", role: "Registry Officer", unit: "Registry" },
  { personId: "usr-registry-02", name: "Mr. Bayo Adekunle", role: "Deputy Registrar (Records)", unit: "Registry" },
  { personId: "usr-bursary-01", name: "Mrs. Kemi Lawal", role: "Bursary Officer", unit: "Bursary" },
  { personId: "usr-library-01", name: "Mr. Sani Garba", role: "Circulation Librarian", unit: "Library" },
  { personId: "usr-affairs-01", name: "Dr. Joy Etim", role: "Dean of Student Affairs", unit: "Student Affairs" },
  { personId: "usr-hod-phy", name: "Prof. Grace Udoh", role: "Head, Physics", unit: "Department" },
  { personId: "usr-hod-csc", name: "Dr. Musa Ibrahim", role: "Head, Computer Science", unit: "Department" },
  { personId: "usr-dean-sci", name: "Prof. Halima Yusuf", role: "Dean, Faculty of Science", unit: "Faculty" },
];

function provenance(source: Provenance["source"], sourceReference: string, effectiveFrom: string, extra: Partial<Provenance> = {}): Provenance {
  return { source, sourceReference, verification: "Verified", verifiedBy: "usr-registry-02", verifiedAt: effectiveFrom, effectiveFrom, recordedBy: "usr-registry-01", recordedAt: effectiveFrom, ...extra };
}

function recordFields(values: Record<StudentFieldKey, string>, base: Provenance, overrides: Partial<Record<StudentFieldKey, Partial<Provenance>>> = {}): Record<StudentFieldKey, RecordedField> {
  return Object.fromEntries(
    (Object.keys(values) as StudentFieldKey[]).map((key) => [key, { value: values[key], provenance: { ...base, ...overrides[key] } }]),
  ) as Record<StudentFieldKey, RecordedField>;
}

const contactUnverified: Partial<Provenance> = { verification: "Unverified", verifiedBy: undefined, verifiedAt: undefined };

export const initialStudents: Student[] = [
  {
    id: "student-2026-004",
    personId: "usr-app-004",
    matriculationNumber: "TAU/26/SCI/0042",
    sourceApplicationId: "app-2026-004",
    sourceOfferId: "offer-2026-004",
    createdAt: "2026-09-04T09:02:00Z",
    fields: recordFields(
      { surname: "Aliyu", firstName: "Fatima", middleName: "", dateOfBirth: "1999-12-04", sex: "Female", nationality: "Nigerian", stateOfOrigin: "Kaduna", lga: "Zaria", nin: "40512837461", email: "fatima.aliyu.pg@gmail.com", phone: "+2348076543210", address: "14 Samaru Road, Zaria, Kaduna", nextOfKin: "Aliyu Bello (father) · +2348031112233", sponsorType: "Self", sponsorName: "Self-funded", sponsorContact: "fatima.aliyu.pg@gmail.com" },
      provenance("Admission_Application", "TAU/2026/PG/0002", "2026-09-04T09:02:00Z"),
      { email: contactUnverified, phone: contactUnverified, address: contactUnverified, nextOfKin: contactUnverified, nin: { source: "External_Verification", sourceReference: "NIMC match NVS-2026-88213" } },
    ),
    priorEducation: [
      { id: "pq-004-bsc", qualificationType: "Bachelors", institution: "Ahmadu Bello University, Zaria", year: 2021, summary: "B.Sc. Computer Science, Second Class Upper", provenance: provenance("Admission_Application", "TAU/2026/PG/0002", "2026-09-04T09:02:00Z", { verifiedBy: "usr-registry-02", sourceReference: "Transcript verified with ABU Registry, ref ABU/TR/2026/1182" }) },
      { id: "pq-004-waec", qualificationType: "WASSCE", institution: "Federal Government Girls' College, Zaria", examNumber: "4250113042", year: 2016, summary: "7 credits including English and Mathematics", provenance: provenance("Admission_Application", "TAU/2026/PG/0002", "2026-09-04T09:02:00Z") },
    ],
  },
  {
    id: "student-2023-117",
    personId: "per-chinedu-okonkwo",
    matriculationNumber: "TAU/23/ENG/0117",
    sourceApplicationId: "app-2023-2211",
    createdAt: "2023-10-02T10:00:00Z",
    fields: recordFields(
      { surname: "Okonkwo", firstName: "Chinedu", middleName: "Emmanuel", dateOfBirth: "2005-06-18", sex: "Male", nationality: "Nigerian", stateOfOrigin: "Anambra", lga: "Onitsha North", nin: "31648205579", email: "chinedu.okonkwo05@gmail.com", phone: "+2349012345678", address: "Block C, Room 214, Tech Hostel, TAU", nextOfKin: "Ngozi Okonkwo (mother) · +2348033334444", sponsorType: "Parent_Guardian", sponsorName: "Mr. Emmanuel Okonkwo", sponsorContact: "+2348055556666" },
      provenance("Admission_Application", "TAU/2023/UG/2211", "2023-10-02T10:00:00Z"),
      { phone: { source: "Student_Request", sourceReference: "Self-service update", recordedBy: "per-chinedu-okonkwo", recordedAt: "2026-01-12T08:30:00Z", effectiveFrom: "2026-01-12T08:30:00Z", ...contactUnverified }, address: contactUnverified },
    ),
    priorEducation: [
      { id: "pq-117-waec", qualificationType: "WASSCE", institution: "Christ the King College, Onitsha", examNumber: "4190221087", year: 2022, summary: "8 credits including Physics, Chemistry, Further Mathematics", provenance: provenance("External_Verification", "WAEC e-verification WV-2023-551902", "2023-10-02T10:00:00Z") },
      { id: "pq-117-utme", qualificationType: "UTME", institution: "JAMB", examNumber: "20231048271GF", year: 2023, summary: "UTME score 268", provenance: provenance("External_Verification", "CAPS import 2023/2024 batch 4", "2023-10-02T10:00:00Z") },
    ],
  },
  {
    id: "student-2022-088",
    personId: "per-aisha-bello",
    matriculationNumber: "TAU/22/SCI/0088",
    sourceApplicationId: "app-2022-1740",
    createdAt: "2022-10-03T10:00:00Z",
    fields: recordFields(
      { surname: "Bello", firstName: "Aisha", middleName: "Oyiza", dateOfBirth: "2004-03-21", sex: "Female", nationality: "Nigerian", stateOfOrigin: "Kogi", lga: "Okene", nin: "22907461153", email: "aisha.bello.oyiza@gmail.com", phone: "+2348123456789", address: "12 Lokoja Crescent, Lokoja, Kogi", nextOfKin: "Hauwa Bello (sister) · +2348067778888", sponsorType: "Scholarship", sponsorName: "Kogi State Scholarship Board", sponsorContact: "scholarships@kogistate.gov.ng" },
      provenance("Admission_Application", "TAU/2022/UG/1740", "2022-10-03T10:00:00Z"),
      {
        dateOfBirth: { source: "Student_Request", sourceReference: "corr-2024-006", effectiveFrom: "2024-02-10T11:00:00Z", recordedAt: "2024-02-10T11:00:00Z", verifiedAt: "2024-02-10T11:00:00Z", approvedBy: "usr-registry-02", approvedAt: "2024-02-10T11:00:00Z" },
        sponsorType: { source: "Registry_Entry", sourceReference: "Award letter KSSB/2024/117", effectiveFrom: "2024-01-15T09:00:00Z", recordedAt: "2024-01-15T09:00:00Z" },
        sponsorName: { source: "Registry_Entry", sourceReference: "Award letter KSSB/2024/117", effectiveFrom: "2024-01-15T09:00:00Z", recordedAt: "2024-01-15T09:00:00Z" },
      },
    ),
    priorEducation: [
      { id: "pq-088-neco", qualificationType: "NECO_SSCE", institution: "Government Secondary School, Okene", examNumber: "10284719GF", year: 2021, summary: "7 credits including Mathematics, Physics and English", provenance: provenance("External_Verification", "NECO result checker NRC-2022-99812", "2022-10-03T10:00:00Z") },
      { id: "pq-088-utme", qualificationType: "UTME", institution: "JAMB", examNumber: "20221187340JC", year: 2022, summary: "UTME score 241", provenance: provenance("External_Verification", "CAPS import 2022/2023 batch 2", "2022-10-03T10:00:00Z") },
    ],
  },
  {
    id: "student-2024-203",
    personId: "per-tunde-adeyemi",
    matriculationNumber: "TAU/24/SCI/0203",
    sourceApplicationId: "app-2024-3025",
    createdAt: "2024-10-07T10:00:00Z",
    fields: recordFields(
      { surname: "Adeyemi", firstName: "Babatunde", middleName: "Oluwaseun", dateOfBirth: "2006-01-09", sex: "Male", nationality: "Nigerian", stateOfOrigin: "Oyo", lga: "Ibadan North", nin: "", email: "tunde.adeyemi06@gmail.com", phone: "+2348091239876", address: "5 Bodija Estate, Ibadan, Oyo", nextOfKin: "Folake Adeyemi (mother) · +2348022223333", sponsorType: "Parent_Guardian", sponsorName: "Mrs. Folake Adeyemi", sponsorContact: "+2348022223333" },
      provenance("Admission_Application", "TAU/2024/UG/3025", "2024-10-07T10:00:00Z"),
      { nin: { source: "Admission_Application", verification: "Unverified", verifiedBy: undefined, verifiedAt: undefined }, email: contactUnverified, phone: contactUnverified },
    ),
    priorEducation: [
      { id: "pq-203-waec", qualificationType: "WASSCE", institution: "International School, University of Ibadan", examNumber: "4110907733", year: 2023, summary: "9 credits", provenance: provenance("External_Verification", "WAEC e-verification WV-2024-118273", "2024-10-07T10:00:00Z") },
    ],
  },
  {
    id: "student-2025-150",
    personId: "per-ngozi-eze",
    matriculationNumber: "TAU/25/SCI/0150",
    sourceApplicationId: "app-2025-0981",
    createdAt: "2025-10-06T10:00:00Z",
    fields: recordFields(
      { surname: "Eze", firstName: "Ngozi", middleName: "Chiamaka", dateOfBirth: "2007-08-30", sex: "Female", nationality: "Nigerian", stateOfOrigin: "Enugu", lga: "Nsukka", nin: "50011836294", email: "ngozi.eze07@gmail.com", phone: "+2347034567812", address: "Queen Amina Hall, Room 31, TAU", nextOfKin: "Chika Eze (father) · +2348039990000", sponsorType: "Parent_Guardian", sponsorName: "Mr. Chika Eze", sponsorContact: "+2348039990000" },
      provenance("Admission_Application", "TAU/2025/UG/0981", "2025-10-06T10:00:00Z"),
      { address: contactUnverified },
    ),
    priorEducation: [
      { id: "pq-150-waec", qualificationType: "WASSCE", institution: "Queen's School, Enugu", examNumber: "4170033218", year: 2024, summary: "8 credits including Mathematics and Physics", provenance: provenance("External_Verification", "WAEC e-verification WV-2025-201775", "2025-10-06T10:00:00Z") },
      { id: "pq-150-utme", qualificationType: "UTME", institution: "JAMB", examNumber: "20251302194HB", year: 2025, summary: "UTME score 279", provenance: provenance("External_Verification", "CAPS import 2025/2026 batch 1", "2025-10-06T10:00:00Z") },
    ],
  },
  {
    id: "student-2024-061",
    personId: "per-ibrahim-musa",
    matriculationNumber: "TAU/24/ENG/0061",
    sourceApplicationId: "app-2024-1502",
    createdAt: "2024-10-07T10:00:00Z",
    fields: recordFields(
      { surname: "Musa", firstName: "Ibrahim", middleName: "Danjuma", dateOfBirth: "2005-11-02", sex: "Male", nationality: "Nigerian", stateOfOrigin: "Niger", lga: "Bida", nin: "38820415506", email: "ibrahim.musa.dj@gmail.com", phone: "+2348145556677", address: "22 Bida Road, Minna, Niger", nextOfKin: "Musa Danjuma (father) · +2348030001122", sponsorType: "Government", sponsorName: "Niger State Bursary Board", sponsorContact: "bursary@nigerstate.gov.ng" },
      provenance("Admission_Application", "TAU/2024/UG/1502", "2024-10-07T10:00:00Z"),
    ),
    priorEducation: [
      { id: "pq-061-nabteb", qualificationType: "NABTEB", institution: "Government Technical College, Minna", examNumber: "NB2023-55127", year: 2023, summary: "Electrical Installation; credits in Mathematics, Physics and English", provenance: provenance("External_Verification", "NABTEB verification NBV-2024-7781", "2024-10-07T10:00:00Z") },
    ],
  },
];

function event(e: Omit<LifecycleEvent, "status" | "proposedBy" | "proposedByName" | "decidedBy" | "decidedByName"> & Partial<LifecycleEvent>): LifecycleEvent {
  return { status: "Approved", proposedBy: "usr-registry-01", proposedByName: "Mrs. Ada Nwosu", decidedBy: "usr-registry-02", decidedByName: "Mr. Bayo Adekunle", decidedAt: e.proposedAt, ...e };
}

const firstSemesterProgression = "Senate approval of sessional results";

export const initialLifecycleEvents: LifecycleEvent[] = [
  // Fatima Aliyu — continues EP-07 onboarding.
  event({ id: "lce-004-mat", studentId: "student-2026-004", type: "Matriculation", effectiveFrom: "2026-09-04", proposedAt: "2026-09-04T09:02:00Z", changes: { programmeId: "prog-msc-csc", programmeName: "M.Sc. Computer Science", curriculumVersion: "ver-msc-csc-2024", level: 700, mode: "Full_Time", cohort: "2026/2027 PG", adviserId: "stf-supervisor-12", adviserName: "Dr. Amaka Obi", standing: "Good_Standing" }, reason: "Created from accepted offer offer-2026-004 (EP-07).", releasableReason: "You were matriculated into M.Sc. Computer Science for the 2026/2027 session." }),

  // Chinedu Okonkwo — progressing normally; adviser changed.
  event({ id: "lce-117-mat", studentId: "student-2023-117", type: "Matriculation", effectiveFrom: "2023-10-02", proposedAt: "2023-10-02T10:00:00Z", changes: { programmeId: "prog-swe", programmeName: "B.Eng. Software Engineering", curriculumVersion: "ver-swe-2023", level: 100, mode: "Full_Time", cohort: "2023/2024", adviserId: "stf-uche-obi", adviserName: "Dr. Uche Obi", standing: "Good_Standing" }, reason: "UTME admission, CAPS batch 4.", releasableReason: "You were matriculated into B.Eng. Software Engineering." }),
  event({ id: "lce-117-200", studentId: "student-2023-117", type: "Level_Progression", effectiveFrom: "2024-10-07", proposedAt: "2024-09-20T10:00:00Z", changes: { level: 200 }, reason: "Met 2023/2024 progression requirements.", releasableReason: "You met the requirements to move to 200 level.", authorityReference: `${firstSemesterProgression} SEN/2024/09/044` }),
  event({ id: "lce-117-300", studentId: "student-2023-117", type: "Level_Progression", effectiveFrom: "2025-10-06", proposedAt: "2025-09-19T10:00:00Z", changes: { level: 300 }, reason: "Met 2024/2025 progression requirements.", releasableReason: "You met the requirements to move to 300 level.", authorityReference: `${firstSemesterProgression} SEN/2025/09/051` }),
  event({ id: "lce-117-adv", studentId: "student-2023-117", type: "Adviser_Assignment", effectiveFrom: "2025-11-03", proposedAt: "2025-10-28T10:00:00Z", changes: { adviserId: "stf-tolu-bamidele", adviserName: "Dr. Tolu Bamidele" }, reason: "Dr. Uche Obi proceeded on sabbatical leave (HR ref SAB/2025/007).", releasableReason: "Dr. Tolu Bamidele is now your academic adviser." }),

  // Aisha Bello — transferred from Physics to Computer Science; old history remains.
  event({ id: "lce-088-mat", studentId: "student-2022-088", type: "Matriculation", effectiveFrom: "2022-10-03", proposedAt: "2022-10-03T10:00:00Z", changes: { programmeId: "prog-phy", programmeName: "B.Sc. Physics", curriculumVersion: "ver-phy-2019", level: 100, mode: "Full_Time", cohort: "2022/2023", adviserId: "stf-grace-udoh", adviserName: "Prof. Grace Udoh", standing: "Good_Standing" }, reason: "UTME admission, CAPS batch 2.", releasableReason: "You were matriculated into B.Sc. Physics." }),
  event({ id: "lce-088-trf", studentId: "student-2022-088", type: "Programme_Transfer", effectiveFrom: "2023-10-09", proposedAt: "2023-08-21T10:00:00Z", decidedAt: "2023-09-25T10:00:00Z", changes: { programmeId: "prog-csc", programmeName: "B.Sc. Computer Science", curriculumVersion: "ver-csc-2019", level: 200 }, reason: "Inter-department transfer on academic merit.", releasableReason: "Your change of programme to B.Sc. Computer Science was approved, starting at 200 level.", authorityReference: "Transfer case trf-2023-014", sourceCaseId: "trf-2023-014" }),
  event({ id: "lce-088-adv", studentId: "student-2022-088", type: "Adviser_Assignment", effectiveFrom: "2023-10-09", proposedAt: "2023-10-02T10:00:00Z", changes: { adviserId: "stf-musa-ibrahim", adviserName: "Dr. Musa Ibrahim" }, reason: "Adviser reassigned on transfer to Computer Science.", releasableReason: "Dr. Musa Ibrahim is now your academic adviser." }),
  event({ id: "lce-088-300", studentId: "student-2022-088", type: "Level_Progression", effectiveFrom: "2024-10-07", proposedAt: "2024-09-20T10:00:00Z", changes: { level: 300 }, reason: "Met 2023/2024 progression requirements.", releasableReason: "You met the requirements to move to 300 level.", authorityReference: `${firstSemesterProgression} SEN/2024/09/044` }),
  event({ id: "lce-088-400", studentId: "student-2022-088", type: "Level_Progression", effectiveFrom: "2025-10-06", proposedAt: "2025-09-19T10:00:00Z", changes: { level: 400 }, reason: "Met 2024/2025 progression requirements.", releasableReason: "You met the requirements to move to 400 level.", authorityReference: `${firstSemesterProgression} SEN/2025/09/051` }),

  // Babatunde Adeyemi — deferred; reinstatement awaiting a decision.
  event({ id: "lce-203-mat", studentId: "student-2024-203", type: "Matriculation", effectiveFrom: "2024-10-07", proposedAt: "2024-10-07T10:00:00Z", changes: { programmeId: "prog-csc", programmeName: "B.Sc. Computer Science", curriculumVersion: "ver-csc-2023", level: 100, mode: "Full_Time", cohort: "2024/2025", adviserId: "stf-musa-ibrahim", adviserName: "Dr. Musa Ibrahim", standing: "Good_Standing" }, reason: "UTME admission, CAPS batch 3.", releasableReason: "You were matriculated into B.Sc. Computer Science." }),
  event({ id: "lce-203-200", studentId: "student-2024-203", type: "Level_Progression", effectiveFrom: "2025-10-06", proposedAt: "2025-09-19T10:00:00Z", changes: { level: 200 }, reason: "Met 2024/2025 progression requirements.", releasableReason: "You met the requirements to move to 200 level.", authorityReference: `${firstSemesterProgression} SEN/2025/09/051` }),
  event({ id: "lce-203-def", studentId: "student-2024-203", type: "Deferral", effectiveFrom: "2026-02-02", proposedAt: "2026-01-26T10:00:00Z", changes: {}, reason: "Medical grounds. Supporting evidence held by University Health Services, ref UHS/2026/044.", releasableReason: "Your request to defer your studies for the rest of the 2025/2026 session was approved.", authorityReference: "Registrar's approval REG/DEF/2026/011" }),
  { id: "lce-203-rei", studentId: "student-2024-203", type: "Reinstatement", effectiveFrom: "2026-10-05", changes: {}, reason: "Fitness-to-resume letter received from University Health Services (UHS/2026/044-R).", releasableReason: "You are cleared to resume your studies from the 2026/2027 session.", authorityReference: "Registrar's approval REG/DEF/2026/011-R", status: "Proposed", proposedBy: "usr-registry-01", proposedByName: "Mrs. Ada Nwosu", proposedAt: "2026-09-08T11:20:00Z" },

  // Ngozi Eze — first-year Physics student with a transfer case in review.
  event({ id: "lce-150-mat", studentId: "student-2025-150", type: "Matriculation", effectiveFrom: "2025-10-06", proposedAt: "2025-10-06T10:00:00Z", changes: { programmeId: "prog-phy", programmeName: "B.Sc. Physics", curriculumVersion: "ver-phy-2023", level: 100, mode: "Full_Time", cohort: "2025/2026", adviserId: "stf-grace-udoh", adviserName: "Prof. Grace Udoh", standing: "Good_Standing" }, reason: "UTME admission, CAPS batch 1.", releasableReason: "You were matriculated into B.Sc. Physics." }),

  // Ibrahim Musa — probation, then suspension; holds are recorded separately.
  event({ id: "lce-061-mat", studentId: "student-2024-061", type: "Matriculation", effectiveFrom: "2024-10-07", proposedAt: "2024-10-07T10:00:00Z", changes: { programmeId: "prog-eee", programmeName: "B.Eng. Electrical & Electronic Engineering", curriculumVersion: "ver-eee-2023", level: 100, mode: "Full_Time", cohort: "2024/2025", adviserId: "stf-kola-ade", adviserName: "Engr. Dr. Kola Ade", standing: "Good_Standing" }, reason: "Direct UTME admission, CAPS batch 3.", releasableReason: "You were matriculated into B.Eng. Electrical & Electronic Engineering." }),
  event({ id: "lce-061-200", studentId: "student-2024-061", type: "Level_Progression", effectiveFrom: "2025-10-06", proposedAt: "2025-09-19T10:00:00Z", changes: { level: 200 }, reason: "Met 2024/2025 progression requirements.", releasableReason: "You met the requirements to move to 200 level.", authorityReference: `${firstSemesterProgression} SEN/2025/09/051` }),
  event({ id: "lce-061-prb", studentId: "student-2024-061", type: "Standing_Change", effectiveFrom: "2026-03-16", proposedAt: "2026-03-10T10:00:00Z", changes: { standing: "Probation" }, reason: "First-semester GPA 1.38 below the 1.50 threshold.", releasableReason: "Your academic standing is Probation after your 2025/2026 first-semester results. Meet your adviser to agree a support plan.", authorityReference: "Faculty of Engineering Board FEB/2026/03/019" }),
  event({ id: "lce-061-sus", studentId: "student-2024-061", type: "Suspension", effectiveFrom: "2026-07-20", proposedAt: "2026-07-15T10:00:00Z", changes: {}, reason: "Student Disciplinary Committee case SDC/2026/019 found examination impersonation proven.", releasableReason: "Your studentship is suspended for one semester following a disciplinary decision. Your decision letter explains the next steps.", authorityReference: "SDC/2026/019; Senate minute SEN/2026/07/112" }),
];

export const initialCorrections: CorrectionRequest[] = [
  { id: "corr-2026-031", studentId: "student-2026-004", field: "middleName", currentValue: "", requestedValue: "Zainab", justification: "My middle name was left out of my application. It appears on my NIN slip and first-degree certificate.", evidence: [{ id: "ev-031-1", documentType: "NIMC record", fileName: "nin-slip-fatima-aliyu.pdf", checksum: "sha256:9f2c…41ab", uploadedAt: "2026-09-10T14:05:00Z" }], origin: "Student", status: "Submitted", submittedAt: "2026-09-10T14:05:00Z", submittedBy: "usr-app-004", submittedByName: "Fatima Aliyu" },
  { id: "corr-2026-029", studentId: "student-2024-203", field: "firstName", currentValue: "Babatunde", requestedValue: "Tunde", justification: "Everyone knows me as Tunde and I want my certificate to say Tunde.", evidence: [{ id: "ev-029-1", documentType: "Sworn affidavit", fileName: "affidavit-name.pdf", checksum: "sha256:77e1…0c9d", uploadedAt: "2026-08-19T09:12:00Z" }], origin: "Student", status: "Rejected", submittedAt: "2026-08-19T09:12:00Z", submittedBy: "per-tunde-adeyemi", submittedByName: "Babatunde Adeyemi", decidedAt: "2026-08-26T15:40:00Z", decidedBy: "usr-registry-02", decidedByName: "Mr. Bayo Adekunle", decisionReason: "Affidavit asserts a preferred name, not an error. Birth certificate and WAEC record both show Babatunde.", releasableReason: "Your record matches your birth certificate and WAEC result. A preferred name is not a correction. You can set a preferred name in your profile." },
  { id: "corr-2024-006", studentId: "student-2022-088", field: "dateOfBirth", currentValue: "2004-03-12", requestedValue: "2004-03-21", justification: "Digits of my date of birth were swapped during application.", evidence: [{ id: "ev-006-1", documentType: "Birth certificate", fileName: "birth-certificate.pdf", checksum: "sha256:1ab3…ee02", uploadedAt: "2024-02-01T10:00:00Z" }], origin: "Student", status: "Approved", submittedAt: "2024-02-01T10:00:00Z", submittedBy: "per-aisha-bello", submittedByName: "Aisha Bello", decidedAt: "2024-02-10T11:00:00Z", decidedBy: "usr-registry-02", decidedByName: "Mr. Bayo Adekunle", decisionReason: "Birth certificate and NIMC record agree on 21 March 2004.", releasableReason: "Your date of birth now matches your birth certificate." },
];

export const initialFieldHistory: FieldHistoryEntry[] = [
  { id: "fh-088-dob", studentId: "student-2022-088", field: "dateOfBirth", previousValue: "2004-03-12", previousProvenance: provenance("Admission_Application", "TAU/2022/UG/1740", "2022-10-03T10:00:00Z", { verification: "Disputed" }), replacedAt: "2024-02-10T11:00:00Z", replacedBy: "usr-registry-02", changeReference: "corr-2024-006", restricted: true },
  { id: "fh-117-phone", studentId: "student-2023-117", field: "phone", previousValue: "+2348061234567", previousProvenance: provenance("Admission_Application", "TAU/2023/UG/2211", "2023-10-02T10:00:00Z"), replacedAt: "2026-01-12T08:30:00Z", replacedBy: "per-chinedu-okonkwo", changeReference: "Self-service update", restricted: false },
];

export const initialTransfers: TransferCase[] = [
  {
    id: "trf-2026-031", studentId: "student-2025-150",
    fromProgrammeId: "prog-phy", fromProgrammeName: "B.Sc. Physics", fromCurriculumVersion: "ver-phy-2023",
    toProgrammeId: "prog-csc", toProgrammeName: "B.Sc. Computer Science", toCurriculumVersion: "ver-csc-2023",
    entryLevel: 200, effectiveFrom: "2026-10-05",
    reason: "Strong first-year results in Mathematics; student's stated interest in computing. Receiving department has vacancies from 2025/2026 withdrawals.",
    cgpa: 4.21, minimumCgpa: 3.5, receivingCapacityRemaining: 6,
    creditDecisions: [
      { id: "cd-031-1", courseCode: "MTH 101", courseTitle: "Elementary Mathematics I", credits: 3, grade: "A", decision: "Transfer_Credit", targetCourseCode: "MTH 101", creditsAwarded: 3, rationale: "Same course in both curricula." },
      { id: "cd-031-2", courseCode: "MTH 102", courseTitle: "Elementary Mathematics II", credits: 3, grade: "A", decision: "Transfer_Credit", targetCourseCode: "MTH 102", creditsAwarded: 3, rationale: "Same course in both curricula." },
      { id: "cd-031-3", courseCode: "PHY 101", courseTitle: "General Physics I", credits: 3, grade: "B", decision: "Transfer_Credit", targetCourseCode: "PHY 101", creditsAwarded: 3, rationale: "Required science course in B.Sc. Computer Science." },
      { id: "cd-031-4", courseCode: "GST 111", courseTitle: "Communication in English", credits: 2, grade: "B", decision: "Transfer_Credit", targetCourseCode: "GST 111", creditsAwarded: 2, rationale: "University-wide general studies course." },
      { id: "cd-031-5", courseCode: "PHY 107", courseTitle: "Experimental Physics I", credits: 1, grade: "A", decision: "Map_To_Course", targetCourseCode: "COS 199", creditsAwarded: 1, rationale: "Mapped to the elective laboratory credit (Senate equivalence list EQ/2025/04)." },
      { id: "cd-031-6", courseCode: "CHM 101", courseTitle: "General Chemistry I", credits: 3, grade: "B", decision: "No_Credit", creditsAwarded: 0, rationale: "Not part of the B.Sc. Computer Science curriculum; stays on the transcript as a completed Physics course." },
    ],
    approvals: [
      { stage: "Releasing_Department", decision: "Approved", decidedBy: "usr-hod-phy", decidedByName: "Prof. Grace Udoh", decidedAt: "2026-09-05T13:00:00Z", note: "Release supported; the student is in good standing." },
    ],
    status: "In_Review", preparedBy: "usr-registry-01", preparedByName: "Mrs. Ada Nwosu", createdAt: "2026-09-01T10:00:00Z",
  },
  {
    id: "trf-2023-014", studentId: "student-2022-088",
    fromProgrammeId: "prog-phy", fromProgrammeName: "B.Sc. Physics", fromCurriculumVersion: "ver-phy-2019",
    toProgrammeId: "prog-csc", toProgrammeName: "B.Sc. Computer Science", toCurriculumVersion: "ver-csc-2019",
    entryLevel: 200, effectiveFrom: "2023-10-09",
    reason: "Inter-department transfer on academic merit.",
    cgpa: 4.02, minimumCgpa: 3.5, receivingCapacityRemaining: 4,
    creditDecisions: [
      { id: "cd-014-1", courseCode: "MTH 101", courseTitle: "Elementary Mathematics I", credits: 3, grade: "A", decision: "Transfer_Credit", targetCourseCode: "MTH 101", creditsAwarded: 3, rationale: "Same course in both curricula." },
      { id: "cd-014-2", courseCode: "CHM 101", courseTitle: "General Chemistry I", credits: 3, grade: "C", decision: "No_Credit", creditsAwarded: 0, rationale: "Not in the receiving curriculum." },
    ],
    approvals: [
      { stage: "Releasing_Department", decision: "Approved", decidedBy: "usr-hod-phy", decidedByName: "Prof. Grace Udoh", decidedAt: "2023-08-28T10:00:00Z", note: "Release supported." },
      { stage: "Receiving_Department", decision: "Approved", decidedBy: "usr-hod-csc", decidedByName: "Dr. Musa Ibrahim", decidedAt: "2023-09-04T10:00:00Z", note: "Accepted at 200 level." },
      { stage: "Faculty", decision: "Approved", decidedBy: "usr-dean-sci", decidedByName: "Prof. Halima Yusuf", decidedAt: "2023-09-14T10:00:00Z", note: "Faculty of Science Board FSB/2023/09/14." },
      { stage: "Registry", decision: "Approved", decidedBy: "usr-registry-02", decidedByName: "Mr. Bayo Adekunle", decidedAt: "2023-09-25T10:00:00Z", note: "Record updated effective 2023/2024 session." },
    ],
    status: "Approved", preparedBy: "usr-registry-01", preparedByName: "Mrs. Ada Nwosu", createdAt: "2023-08-21T10:00:00Z", lifecycleEventId: "lce-088-trf",
  },
];

export const initialHolds: StudentHold[] = [
  { id: "hold-117-fin", studentId: "student-2023-117", type: "Financial", ownerUnit: "Bursary", reason: "Outstanding 2025/2026 second-semester tuition balance of ₦185,000 (invoice INV-2026-11873).", releasableReason: "You have an outstanding fee balance. Pay it or agree an instalment plan with the Bursary before you can register or request a transcript.", effects: ["Registration", "Transcript"], appealRoute: "Raise a payment or charge dispute with the Bursary; enforcement pauses while it is reviewed.", startsAt: "2026-09-01T08:00:00Z", placedBy: "usr-bursary-01", placedByName: "Mrs. Kemi Lawal" },
  { id: "hold-117-lib", studentId: "student-2023-117", type: "Library", ownerUnit: "Library", reason: "Two overdue loans (acc. 004812, 007733).", releasableReason: "You have overdue library books.", effects: ["Transcript", "Graduation"], appealRoute: "Contact the Circulation Desk to dispute a loan or fine.", startsAt: "2026-06-02T08:00:00Z", placedBy: "usr-library-01", placedByName: "Mr. Sani Garba", releasedAt: "2026-06-20T12:00:00Z", releasedBy: "usr-library-01", releasedByName: "Mr. Sani Garba", releaseNote: "Both items returned; no fine outstanding." },
  { id: "hold-061-dis", studentId: "student-2024-061", type: "Disciplinary", ownerUnit: "Student Affairs", reason: "Sanction under SDC/2026/019: no registration or hostel allocation during suspension.", releasableReason: "A disciplinary decision restricts registration and hostel allocation until your suspension ends.", effects: ["Registration", "Accommodation"], appealRoute: "Appeal in writing to the Senate Student Appeals Committee within 21 days.", startsAt: "2026-07-20T08:00:00Z", placedBy: "usr-affairs-01", placedByName: "Dr. Joy Etim" },
  { id: "hold-088-lib", studentId: "student-2022-088", type: "Library", ownerUnit: "Library", reason: "Two books overdue since 3 August 2026 (acc. 011204, 011877); ₦4,500 fine.", releasableReason: "Return two overdue library books and pay the ₦4,500 fine to complete graduation clearance.", effects: ["Transcript", "Graduation"], appealRoute: "Contact the Circulation Desk to dispute a loan or fine.", startsAt: "2026-09-01T08:00:00Z", placedBy: "usr-library-01", placedByName: "Mr. Sani Garba" },
  { id: "hold-203-doc", studentId: "student-2024-203", type: "Documentation", ownerUnit: "Registry", reason: "NIN not yet supplied or verified against NIMC.", releasableReason: "Your National Identification Number is missing from your record. Submit it before your results can be released.", effects: ["Results_Release"], appealRoute: "Submit the outstanding document or ask the Registry for an extension.", startsAt: "2026-05-04T08:00:00Z", placedBy: "usr-registry-01", placedByName: "Mrs. Ada Nwosu" },
];

export const initialStudentAudit: StudentAuditEntry[] = [
  { id: "sa-001", studentId: "student-2026-004", entity: "Record", entityId: "student-2026-004", action: "RECORD_CREATED", actorId: "usr-registry-01", actorName: "Mrs. Ada Nwosu", timestamp: "2026-09-04T09:02:00Z", detail: "SIS record created from Student_Created event student-created:student-2026-004." },
  { id: "sa-002", studentId: "student-2026-004", entity: "Correction", entityId: "corr-2026-031", action: "CORRECTION_SUBMITTED", actorId: "usr-app-004", actorName: "Fatima Aliyu", timestamp: "2026-09-10T14:05:00Z", detail: "Middle name correction submitted with NIMC record." },
  { id: "sa-003", studentId: "student-2024-203", entity: "Lifecycle", entityId: "lce-203-rei", action: "LIFECYCLE_PROPOSED", actorId: "usr-registry-01", actorName: "Mrs. Ada Nwosu", timestamp: "2026-09-08T11:20:00Z", detail: "Reinstatement proposed, effective 2026-10-05." },
  { id: "sa-004", studentId: "student-2025-150", entity: "Transfer", entityId: "trf-2026-031", action: "TRANSFER_STAGE_APPROVED", actorId: "usr-hod-phy", actorName: "Prof. Grace Udoh", timestamp: "2026-09-05T13:00:00Z", detail: "Releasing department approved transfer to B.Sc. Computer Science." },
  { id: "sa-005", studentId: "student-2023-117", entity: "Hold", entityId: "hold-117-fin", action: "HOLD_PLACED", actorId: "usr-bursary-01", actorName: "Mrs. Kemi Lawal", timestamp: "2026-09-01T08:00:00Z", detail: "Financial hold on registration and transcripts." },
];
