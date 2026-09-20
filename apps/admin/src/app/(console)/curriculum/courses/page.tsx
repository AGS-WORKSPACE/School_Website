"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Search } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@tau/ui/dialog";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Textarea } from "@tau/ui/textarea";
import { PageHeader } from "@/components/console/page-header";
import {
  useCurriculum,
  CourseLevel,
  Semester,
  CourseClassification,
} from "@tau/curriculum";
import { useSession } from "@/providers/session-provider";

export default function CoursesPage() {
  const { courses, mutations } = useCurriculum();
  const { session } = useSession();

  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  // Create course dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newLevel, setNewLevel] = useState<CourseLevel>(100);
  const [newSemester, setNewSemester] = useState<Semester>(1);
  const [newDepartment, setNewDepartment] = useState("Computer Science");
  const [newClassification, setNewClassification] = useState<CourseClassification>("Core");
  const [newLH, setNewLH] = useState(2);
  const [newTH, setNewTH] = useState(0);
  const [newPH, setNewPH] = useState(3);
  const [newCU, setNewCU] = useState(3);
  const [newSynopsis, setNewSynopsis] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = courses.filter((c) => {
    const matchesQuery =
      c.code.toLowerCase().includes(query.toLowerCase()) ||
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.departmentName.toLowerCase().includes(query.toLowerCase());

    const matchesLevel = levelFilter === "all" || String(c.level) === levelFilter;
    const matchesClass = classFilter === "all" || c.classification === classFilter;

    return matchesQuery && matchesLevel && matchesClass;
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = mutations.createCourse(
      {
        code: newCode,
        title: newTitle,
        level: newLevel,
        semester: newSemester,
        departmentId: "dept-computer",
        departmentName: newDepartment,
        facultyId: "fac-sci",
        classification: newClassification,
        credits: {
          lectureHours: newLH,
          tutorialHours: newTH,
          practicalHours: newPH,
          creditUnits: newCU,
        },
        synopsis: newSynopsis,
        prerequisites: [],
      },
      {
        personId: session?.personId ?? "per-guest",
        name: session?.displayName ?? "Academic Officer",
      }
    );

    if (!res.ok) {
      setError(res.error ?? "Failed to create course");
    } else {
      setIsOpen(false);
      setNewCode("");
      setNewTitle("");
      setNewSynopsis("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CUR-02 · Course Catalogue & Syllabi"
        title="Course registry & learning outcomes"
        description="Manage courses, credits, and prerequisites."
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 size-3.5" />
                Register new course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <form onSubmit={handleCreateCourse}>
                <DialogHeader>
                  <DialogTitle>Register New Academic Course</DialogTitle>
                  <DialogDescription>
                    Course codes are checked for institutional uniqueness before allocation.
                  </DialogDescription>
                </DialogHeader>

                {error && (
                  <div className="mt-3 p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg font-medium">
                    {error}
                  </div>
                )}

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="code" className="text-xs">Course Code (e.g. CSC 204)</Label>
                      <Input
                        id="code"
                        placeholder="CSC 204"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="dept" className="text-xs">Department</Label>
                      <Input
                        id="dept"
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-xs">Course Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Object-Oriented Software Design"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="level" className="text-xs">Level</Label>
                      <NativeSelect
                        id="level"
                        value={newLevel}
                        onChange={(e) => setNewLevel(Number(e.target.value) as CourseLevel)}
                        className="text-xs"
                      >
                        <option value={100}>100 Level</option>
                        <option value={200}>200 Level</option>
                        <option value={300}>300 Level</option>
                        <option value={400}>400 Level</option>
                        <option value={500}>500 Level</option>
                      </NativeSelect>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="semester" className="text-xs">Semester</Label>
                      <NativeSelect
                        id="semester"
                        value={newSemester}
                        onChange={(e) => setNewSemester(Number(e.target.value) as Semester)}
                        className="text-xs"
                      >
                        <option value={1}>Semester I</option>
                        <option value={2}>Semester II</option>
                      </NativeSelect>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="classification" className="text-xs">Classification</Label>
                      <NativeSelect
                        id="classification"
                        value={newClassification}
                        onChange={(e) => setNewClassification(e.target.value as CourseClassification)}
                        className="text-xs"
                      >
                        <option value="Core">Core</option>
                        <option value="Elective">Elective</option>
                        <option value="General Studies">General Studies</option>
                      </NativeSelect>
                    </div>
                  </div>

                  {/* Credit Breakdown */}
                  <div className="grid grid-cols-4 gap-2 p-3 bg-muted/40 rounded-lg border border-border">
                    <div className="space-y-1">
                      <Label className="text-[0.68rem]">Lecture (LH)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={6}
                        value={newLH}
                        onChange={(e) => setNewLH(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[0.68rem]">Tutorial (TH)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={4}
                        value={newTH}
                        onChange={(e) => setNewTH(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[0.68rem]">Practical (PH)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={12}
                        value={newPH}
                        onChange={(e) => setNewPH(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[0.68rem] font-bold text-primary">Credit Units</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={newCU}
                        onChange={(e) => setNewCU(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="synopsis" className="text-xs">Course Synopsis</Label>
                    <Textarea
                      id="synopsis"
                      rows={3}
                      placeholder="Concise overview of curriculum content..."
                      value={newSynopsis}
                      onChange={(e) => setNewSynopsis(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Allocate Course Code</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by course code, title, or department..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <NativeSelect
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="text-xs w-36"
          >
            <option value="all">All Levels</option>
            <option value="100">100 Level</option>
            <option value="200">200 Level</option>
            <option value="300">300 Level</option>
            <option value="400">400 Level</option>
          </NativeSelect>

          <NativeSelect
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs w-36"
          >
            <option value="all">All Types</option>
            <option value="Core">Core</option>
            <option value="Elective">Elective</option>
            <option value="General Studies">GST</option>
          </NativeSelect>
        </div>
      </div>

      {/* Course Table */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Course Title</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Level / Sem</th>
              <th className="px-4 py-3">Credits (CU)</th>
              <th className="px-4 py-3">Classification</th>
              <th className="px-4 py-3">Prerequisites</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((course) => {
              const activeVersion =
                course.versions.find((v) => v.id === course.activeVersionId) ??
                course.versions[0];

              return (
                <tr key={course.id} className="hover:bg-muted/25 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-primary text-sm">
                    {course.code}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-foreground">
                    {course.title}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {course.departmentName}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {course.level}L · Sem {course.semester}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-foreground">
                    {activeVersion?.credits.creditUnits} CU
                    <span className="text-[0.68rem] text-muted-foreground font-normal ml-1">
                      ({activeVersion?.credits.lectureHours} LH / {activeVersion?.credits.practicalHours} PH)
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="outline" className="text-[0.68rem]">
                      {course.classification}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {activeVersion?.prerequisites.length > 0 ? (
                      <span className="font-mono text-[0.7rem] bg-muted/60 px-1.5 py-0.5 rounded">
                        {activeVersion.prerequisites.map((p) => p.courseCode).join(", ")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/curriculum/courses/${course.id}`}>
                        Syllabus & CLOs <ArrowRight className="ml-1 size-3" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
