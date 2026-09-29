/** Frontend demonstration data representing attendance already released to the student. */
export interface StudentAttendanceRecord {
  courseCode: string;
  courseTitle: string;
  sessionsHeld: number;
  attended: number;
  excused: number;
  missed: number;
  releasedRate: number;
  lastUpdated: string;
  source: string;
}

export const studentAttendanceRecords: StudentAttendanceRecord[] = [
  { courseCode: "COS 101", courseTitle: "Introduction to Computing Sciences", sessionsHeld: 6, attended: 5, excused: 1, missed: 0, releasedRate: 83, lastUpdated: "26 September 2026", source: "COS 101 course attendance register" },
  { courseCode: "MTH 101", courseTitle: "Elementary Mathematics I", sessionsHeld: 5, attended: 4, excused: 0, missed: 1, releasedRate: 80, lastUpdated: "25 September 2026", source: "MTH 101 course attendance register" },
  { courseCode: "GST 111", courseTitle: "Communication in English", sessionsHeld: 4, attended: 4, excused: 0, missed: 0, releasedRate: 100, lastUpdated: "24 September 2026", source: "GST 111 course attendance register" },
];

export function attendanceForCourse(courseCode?: string): StudentAttendanceRecord | undefined {
  return courseCode ? studentAttendanceRecords.find((record) => record.courseCode === courseCode) : undefined;
}
