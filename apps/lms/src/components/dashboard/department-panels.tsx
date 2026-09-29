"use client";

import * as React from "react";
import {
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import type { StudentContext } from "@tau/student-dashboard";
import { useStudents } from "@tau/students";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";

type Level = 100 | 200 | 300 | 400;
type CoursePlanItem = {
  code: string;
  title: string;
  credits: number;
  level: Level;
  semester: 1 | 2;
  type: "Core" | "General studies" | "Elective";
};

const physicsCourses: CoursePlanItem[] = [
  { code: "MTH 101", title: "Elementary Mathematics I", credits: 3, level: 100, semester: 1, type: "Core" },
  { code: "PHY 101", title: "General Physics I", credits: 3, level: 100, semester: 1, type: "Core" },
  { code: "PHY 107", title: "Experimental Physics I", credits: 1, level: 100, semester: 1, type: "Core" },
  { code: "CHM 101", title: "General Chemistry I", credits: 3, level: 100, semester: 1, type: "Core" },
  { code: "GST 111", title: "Communication in English", credits: 2, level: 100, semester: 1, type: "General studies" },
  { code: "COS 101", title: "Introduction to Computing Sciences", credits: 3, level: 100, semester: 1, type: "Core" },
  { code: "STA 111", title: "Descriptive Statistics", credits: 3, level: 100, semester: 1, type: "Core" },
  { code: "MTH 102", title: "Elementary Mathematics II", credits: 3, level: 100, semester: 2, type: "Core" },
  { code: "PHY 102", title: "General Physics II", credits: 3, level: 100, semester: 2, type: "Core" },
  { code: "PHY 108", title: "Experimental Physics II", credits: 1, level: 100, semester: 2, type: "Core" },
  { code: "CHM 102", title: "General Chemistry II", credits: 3, level: 100, semester: 2, type: "Core" },
  { code: "GST 112", title: "Nigerian Peoples and Culture", credits: 2, level: 100, semester: 2, type: "General studies" },
  { code: "COS 102", title: "Introduction to Problem Solving", credits: 3, level: 100, semester: 2, type: "Core" },
  { code: "STA 112", title: "Probability and Statistical Inference", credits: 3, level: 100, semester: 2, type: "Core" },
  { code: "PHY 201", title: "Classical Mechanics I", credits: 3, level: 200, semester: 1, type: "Core" },
  { code: "PHY 203", title: "Electricity and Magnetism I", credits: 3, level: 200, semester: 1, type: "Core" },
  { code: "PHY 205", title: "Thermal Physics", credits: 3, level: 200, semester: 1, type: "Core" },
  { code: "PHY 207", title: "Practical Physics III", credits: 2, level: 200, semester: 1, type: "Core" },
  { code: "MTH 201", title: "Mathematical Methods I", credits: 3, level: 200, semester: 1, type: "Core" },
  { code: "MTH 203", title: "Differential Equations", credits: 3, level: 200, semester: 1, type: "Core" },
  { code: "GST 211", title: "Entrepreneurship and Innovation", credits: 2, level: 200, semester: 1, type: "General studies" },
  { code: "PHY 202", title: "Classical Mechanics II", credits: 3, level: 200, semester: 2, type: "Core" },
  { code: "PHY 204", title: "Electricity and Magnetism II", credits: 3, level: 200, semester: 2, type: "Core" },
  { code: "PHY 206", title: "Waves and Optics", credits: 3, level: 200, semester: 2, type: "Core" },
  { code: "PHY 208", title: "Practical Physics IV", credits: 2, level: 200, semester: 2, type: "Core" },
  { code: "MTH 202", title: "Linear Algebra", credits: 3, level: 200, semester: 2, type: "Core" },
  { code: "MTH 204", title: "Mathematical Methods II", credits: 3, level: 200, semester: 2, type: "Core" },
  { code: "PHY 301", title: "Quantum Mechanics I", credits: 3, level: 300, semester: 1, type: "Core" },
  { code: "PHY 303", title: "Electromagnetic Theory I", credits: 3, level: 300, semester: 1, type: "Core" },
  { code: "PHY 305", title: "Solid State Physics I", credits: 3, level: 300, semester: 1, type: "Core" },
  { code: "PHY 307", title: "Electronics I", credits: 3, level: 300, semester: 1, type: "Core" },
  { code: "PHY 309", title: "Advanced Practical Physics I", credits: 2, level: 300, semester: 1, type: "Core" },
  { code: "PHY 311", title: "Computational Physics", credits: 2, level: 300, semester: 1, type: "Elective" },
  { code: "PHY 302", title: "Quantum Mechanics II", credits: 3, level: 300, semester: 2, type: "Core" },
  { code: "PHY 304", title: "Electromagnetic Theory II", credits: 3, level: 300, semester: 2, type: "Core" },
  { code: "PHY 306", title: "Statistical Physics", credits: 3, level: 300, semester: 2, type: "Core" },
  { code: "PHY 308", title: "Electronics II", credits: 3, level: 300, semester: 2, type: "Core" },
  { code: "PHY 310", title: "Advanced Practical Physics II", credits: 3, level: 300, semester: 2, type: "Core" },
  { code: "PHY 312", title: "Geophysics", credits: 2, level: 300, semester: 2, type: "Elective" },
  { code: "PHY 401", title: "Nuclear Physics", credits: 3, level: 400, semester: 1, type: "Core" },
  { code: "PHY 403", title: "Atomic and Molecular Physics", credits: 3, level: 400, semester: 1, type: "Core" },
  { code: "PHY 405", title: "Solid State Physics II", credits: 3, level: 400, semester: 1, type: "Core" },
  { code: "PHY 407", title: "Energy and Environmental Physics", credits: 3, level: 400, semester: 1, type: "Elective" },
  { code: "PHY 409", title: "Research Project I", credits: 3, level: 400, semester: 1, type: "Core" },
  { code: "PHY 411", title: "Advanced Quantum Mechanics", credits: 3, level: 400, semester: 1, type: "Elective" },
  { code: "PHY 402", title: "Particle Physics", credits: 3, level: 400, semester: 2, type: "Core" },
  { code: "PHY 404", title: "Materials Science", credits: 3, level: 400, semester: 2, type: "Core" },
  { code: "PHY 406", title: "Medical and Radiation Physics", credits: 3, level: 400, semester: 2, type: "Elective" },
  { code: "PHY 408", title: "Atmospheric Physics", credits: 3, level: 400, semester: 2, type: "Elective" },
  { code: "PHY 410", title: "Research Project II", credits: 6, level: 400, semester: 2, type: "Core" },
  { code: "PHY 412", title: "Physics Seminar", credits: 3, level: 400, semester: 2, type: "Core" },
];

const departmentStaff = [
  { name: "Prof. Grace Udoh", role: "Head of Department", courses: ["PHY 401 Nuclear Physics", "PHY 410 Research Project II"], email: "grace.udoh@nau.edu.ng", office: "Science Block B, Room 214" },
  { name: "Dr. Chika Nwankwo", role: "Departmental Examination Officer", courses: ["PHY 201 Classical Mechanics I", "PHY 202 Classical Mechanics II"], email: "chika.nwankwo@nau.edu.ng", office: "Science Block B, Room 207" },
  { name: "Dr. Emeka Okafor", role: "Senior Lecturer", courses: ["PHY 101 General Physics I", "PHY 307 Electronics I", "PHY 308 Electronics II"], email: "emeka.okafor@nau.edu.ng", office: "Physics Laboratory Wing, Room 12" },
  { name: "Dr. Adaeze Obi", role: "Senior Lecturer", courses: ["PHY 205 Thermal Physics", "PHY 306 Statistical Physics"], email: "adaeze.obi@nau.edu.ng", office: "Science Block B, Room 203" },
  { name: "Dr. Yusuf Bello", role: "Lecturer I", courses: ["PHY 206 Waves and Optics", "PHY 403 Atomic and Molecular Physics"], email: "yusuf.bello@nau.edu.ng", office: "Optics Laboratory, Room 4" },
  { name: "Dr. Nneka Ibe", role: "Lecturer I", courses: ["PHY 305 Solid State Physics I", "PHY 404 Materials Science"], email: "nneka.ibe@nau.edu.ng", office: "Materials Laboratory, Room 6" },
];

function typeVariant(type: CoursePlanItem["type"]) {
  if (type === "Core") return "success" as const;
  if (type === "General studies") return "secondary" as const;
  return "outline" as const;
}

export function DepartmentPanels({ context }: { context: StudentContext }) {
  const { transfers } = useStudents();
  const [level, setLevel] = React.useState<"all" | Level>("all");
  const transfer = transfers.find(
    (item) => item.studentId === context.sisStudentId && item.status === "In_Review",
  );
  const isPhysics = context.programmeName.toLowerCase().includes("physics");

  if (!isPhysics) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6" role="status">
        <ShieldAlert className="size-6 text-amber-800" aria-hidden />
        <h2 className="mt-3 font-display text-xl font-bold text-amber-950">Department information is not connected</h2>
        <p className="mt-2 text-sm text-amber-900">No authorised frontend department record is available for {context.programmeName}. Contact your faculty office for the current course handbook and staff list.</p>
      </section>
    );
  }

  const visibleCourses = physicsCourses.filter(
    (course) => level === "all" || course.level === level,
  );
  const totalCredits = physicsCourses.reduce((sum, course) => sum + course.credits, 0);
  const completedCodes = new Set(
    transfer?.creditDecisions.map((decision) => decision.courseCode) ?? [],
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">My department</p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Department of Physics</h2>
        <p className="mt-2 max-w-3xl text-sm text-lms-muted">Department contacts, academic leadership and the published course plan for your current B.Sc. Physics curriculum.</p>
      </header>

      {transfer ? (
        <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950" role="status">
          Your change to {transfer.toProgrammeName} is still in review. This page continues to show your current Department of Physics information until the transfer is fully approved and effective.
        </p>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card" aria-labelledby="department-overview-title">
        <div className="bg-gradient-to-r from-[#10102d] to-[#29296f] p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <Badge className="border-white/15 bg-white/10 text-white">Faculty of Physical Sciences</Badge>
              <h3 id="department-overview-title" className="mt-3 font-display text-2xl font-bold">Physics at NAU</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">The department develops strong foundations in experimental, theoretical and computational physics, with advanced study in energy, materials, electronics and applied research.</p>
            </div>
            <Building2 className="size-10 text-[#e1bd55]" aria-hidden />
          </div>
        </div>
        <dl className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
          <DepartmentFact icon={MapPin} label="Department office" value="Science Block B, Main Campus" />
          <DepartmentFact icon={Phone} label="Office line" value="+234 803 555 0142" />
          <DepartmentFact icon={Mail} label="Department email" value="physics@nau.edu.ng" />
          <DepartmentFact icon={CalendarDays} label="Student enquiries" value="Mon–Fri, 9:00–16:00" />
        </dl>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <LeadershipCard
          icon={UserRoundCheck}
          label="Head of Department"
          name="Prof. Grace Udoh"
          detail="Academic leadership, programme oversight and departmental approvals"
          email="grace.udoh@nau.edu.ng"
        />
        <LeadershipCard
          icon={ClipboardCheck}
          label="Departmental Examination Officer"
          name="Dr. Chika Nwankwo"
          detail="Examination timetables, result queries and departmental assessment records"
          email="chika.nwankwo@nau.edu.ng"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card" aria-labelledby="programme-plan-title">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Curriculum ver-phy-2023</p>
            <h3 id="programme-plan-title" className="mt-1 font-display text-xl font-bold">Full programme course plan</h3>
            <p className="mt-1 text-sm text-lms-muted">{physicsCourses.length} published course entries · {totalCredits} credit units across 100–400 level.</p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Filter programme courses by level">
            {(["all", 100, 200, 300, 400] as const).map((value) => (
              <Button key={value} size="sm" variant={level === value ? "default" : "outline"} onClick={() => setLevel(value)} aria-pressed={level === value}>
                {value === "all" ? "All levels" : `${value} level`}
              </Button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {([100, 200, 300, 400] as Level[])
            .filter((courseLevel) => level === "all" || level === courseLevel)
            .map((courseLevel) => {
              const levelCourses = visibleCourses.filter((course) => course.level === courseLevel);
              const levelCredits = levelCourses.reduce((sum, course) => sum + course.credits, 0);
              return (
                <details key={courseLevel} open={courseLevel === context.level || level !== "all"} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                    <div>
                      <h4 className="font-display text-lg font-bold">{courseLevel} level</h4>
                      <p className="mt-1 text-xs text-lms-muted">{levelCourses.length} courses · {levelCredits} credit units</p>
                    </div>
                    <ChevronDown className="size-5 text-primary transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="border-t border-border">
                    {[1, 2].map((semester) => (
                      <div key={semester} className="border-b border-border last:border-b-0">
                        <div className="bg-muted/30 px-5 py-3 text-sm font-bold">Semester {semester}</div>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[720px] text-left text-sm">
                            <thead className="sr-only"><tr><th>Course</th><th>Type</th><th>Credits</th><th>Your state</th></tr></thead>
                            <tbody className="divide-y divide-border">
                              {levelCourses.filter((course) => course.semester === semester).map((course) => {
                                const completed = completedCodes.has(course.code);
                                const inProgress = course.code === "COS 101" && context.level === 100;
                                return (
                                  <tr key={course.code}>
                                    <td className="px-5 py-3"><strong>{course.code}</strong><span className="ml-2 text-lms-muted">{course.title}</span></td>
                                    <td className="px-4 py-3"><Badge variant={typeVariant(course.type)}>{course.type}</Badge></td>
                                    <td className="px-4 py-3">{course.credits} CU</td>
                                    <td className="px-5 py-3"><Badge variant={completed ? "success" : inProgress ? "outline" : "muted"}>{completed ? "Completed" : inProgress ? "In progress" : course.level > context.level ? "Future level" : "Planned"}</Badge></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
        </div>
        <p className="border-t border-border bg-muted/20 px-5 py-3 text-xs text-lms-muted">Elective availability and semester placement may change through approved curriculum decisions. Registration remains the source for what you may take in a specific semester.</p>
      </section>

      <section aria-labelledby="department-lecturers-title">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/8 text-primary"><UsersRound className="size-5" aria-hidden /></span>
          <div><h3 id="department-lecturers-title" className="font-display text-xl font-bold">Department lecturers</h3><p className="text-sm text-lms-muted">Teaching staff and their published course responsibilities.</p></div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departmentStaff.map((staff) => (
            <article key={staff.email} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-full bg-[#10102d] font-bold text-white">{staff.name.split(" ").slice(-1)[0][0]}</span><Badge variant={staff.role.includes("Head") || staff.role.includes("Examination") ? "secondary" : "outline"}>{staff.role}</Badge></div>
              <h4 className="mt-4 font-display text-lg font-bold">{staff.name}</h4>
              <p className="mt-1 text-xs text-lms-muted">{staff.email}</p>
              <p className="mt-1 text-xs text-lms-muted">{staff.office}</p>
              <div className="mt-4 border-t border-border pt-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary"><BookOpenCheck className="size-4" aria-hidden /> Courses taught</p><ul className="mt-2 space-y-1.5 text-sm text-lms-muted">{staff.courses.map((course) => <li key={course}>{course}</li>)}</ul></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function DepartmentFact({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return <div className="bg-card p-5"><dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lms-muted"><Icon className="size-4 text-primary" aria-hidden />{label}</dt><dd className="mt-2 text-sm font-bold">{value}</dd></div>;
}

function LeadershipCard({ icon: Icon, label, name, detail, email }: { icon: typeof UserRoundCheck; label: string; name: string; detail: string; email: string }) {
  return <article className="rounded-2xl border border-border bg-card p-5 shadow-card"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="size-5" aria-hidden /></span><div><p className="text-xs font-bold uppercase tracking-wide text-primary">{label}</p><h3 className="mt-1 font-display text-lg font-bold">{name}</h3><p className="mt-2 text-sm leading-relaxed text-lms-muted">{detail}</p><a href={`mailto:${email}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"><Mail className="size-4" aria-hidden />{email}</a></div></div></article>;
}
