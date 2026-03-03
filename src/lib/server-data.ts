import { getServerAuthContext } from "@/lib/supabase/server";
import {
  mockAttendance,
  mockEvents,
  mockGrades,
  mockGroups,
  mockResourceCategories,
  mockStudents,
  mockTasks,
  mockTeachers,
  mockTxLaws,
  mockZones,
} from "@/lib/mock-data";

function relatedStudentFirstName(input: unknown): string | undefined {
  if (Array.isArray(input)) {
    const first = input[0] as { first_name?: unknown } | undefined;
    return typeof first?.first_name === "string" ? first.first_name : undefined;
  }

  if (input && typeof input === "object") {
    const row = input as { first_name?: unknown };
    return typeof row.first_name === "string" ? row.first_name : undefined;
  }

  return undefined;
}

export async function getDashboardData() {
  const auth = await getServerAuthContext();

  if (!auth) {
    return {
      username: "Guest",
      students: mockStudents,
      tasks: mockTasks,
      attendance: mockAttendance,
    };
  }

  const [studentsRes, assignmentsRes, attendanceRes] = await Promise.all([
    auth.client
      .from("students")
      .select("id, first_name, grade_level, avatar_text, xp, streak")
      .order("created_at", { ascending: true }),
    auth.client
      .from("assignments")
      .select("id, title, subject, due_date, status, students(first_name)")
      .order("due_date", { ascending: true })
      .limit(6),
    auth.client.from("attendance").select("status"),
  ]);

  const students =
    studentsRes.data?.map((student) => ({
      id: student.id,
      name: student.first_name,
      grade: student.grade_level,
      avatar: student.avatar_text ?? student.first_name.slice(0, 2).toUpperCase(),
      xp: student.xp ?? 0,
      streak: student.streak ?? 0,
      progress: {},
    })) ?? mockStudents;

  const tasks =
    assignmentsRes.data?.map((assignment, index) => {
      const studentName = relatedStudentFirstName(assignment.students);

      return {
        id: index + 1,
        title: assignment.title,
        subject: assignment.subject,
        student: studentName ?? "Student",
        done: assignment.status === "completed",
        due: assignment.due_date ? "Due" : "Today",
      };
    }) ?? mockTasks;

  const attendanceSummary = attendanceRes.data
    ? {
        present: attendanceRes.data.filter((row) => row.status === "present").length,
        absent: attendanceRes.data.filter((row) => row.status === "absent").length,
        remaining: Math.max(0, 31 - attendanceRes.data.length),
      }
    : mockAttendance;

  const userMeta = auth.user.user_metadata as { full_name?: string; name?: string; username?: string } | null;
  const emailLocalPart = auth.user.email?.split("@")[0] ?? "Parent";
  const username =
    userMeta?.full_name?.trim() ||
    userMeta?.name?.trim() ||
    userMeta?.username?.trim() ||
    emailLocalPart;

  return {
    username,
    students,
    tasks,
    attendance: attendanceSummary,
  };
}

export async function getStudentsData() {
  const auth = await getServerAuthContext();

  if (!auth) {
    return { students: mockStudents, grades: mockGrades };
  }

  const [studentsRes, progressRes] = await Promise.all([
    auth.client
      .from("students")
      .select("id, first_name, grade_level, avatar_text, xp, streak")
      .order("created_at", { ascending: true }),
    auth.client.from("progress").select("student_id, subject, score_percent"),
  ]);

  if (!studentsRes.data || studentsRes.data.length === 0) {
    return { students: mockStudents, grades: mockGrades };
  }

  const progressByStudent = new Map<string, Record<string, number>>();

  for (const row of progressRes.data ?? []) {
    const existing = progressByStudent.get(row.student_id) ?? {};
    existing[row.subject] = row.score_percent;
    progressByStudent.set(row.student_id, existing);
  }

  const students = studentsRes.data.map((student) => ({
    id: student.id,
    name: student.first_name,
    grade: student.grade_level,
    avatar: student.avatar_text ?? student.first_name.slice(0, 2).toUpperCase(),
    xp: student.xp ?? 0,
    streak: student.streak ?? 0,
    progress: progressByStudent.get(student.id) ?? { Math: 0 },
  }));

  return { students, grades: mockGrades };
}

export async function getPlannerData() {
  const auth = await getServerAuthContext();

  if (!auth) {
    return { tasks: mockTasks };
  }

  const { data } = await auth.client
    .from("lesson_plans")
    .select("id, title, subject, start_date, students(first_name)")
    .order("start_date", { ascending: true })
    .limit(8);

  if (!data?.length) {
    return { tasks: mockTasks };
  }

  const tasks = data.map((lesson, index) => ({
    id: index + 1,
    title: lesson.title,
    subject: lesson.subject,
    student: relatedStudentFirstName(lesson.students) ?? "Student",
    done: false,
    due: lesson.start_date ?? "Today",
  }));

  return { tasks };
}

export async function getProgressData() {
  const auth = await getServerAuthContext();

  if (!auth) {
    return { grades: mockGrades, students: mockStudents };
  }

  const [progressRes, studentsRes] = await Promise.all([
    auth.client.from("progress").select("student_id, subject, assignment_title, letter_grade, score_percent, recorded_at"),
    auth.client.from("students").select("id, first_name, grade_level, avatar_text"),
  ]);

  if (!progressRes.data?.length || !studentsRes.data?.length) {
    return { grades: mockGrades, students: mockStudents };
  }

  const studentById = new Map(studentsRes.data.map((row) => [row.id, row]));
  const grades = progressRes.data.map((row) => {
    const student = studentById.get(row.student_id);
    return {
      student: student?.first_name ?? "Student",
      subject: row.subject,
      lesson: row.assignment_title,
      grade: row.score_percent,
      letter: row.letter_grade,
      date: new Date(row.recorded_at).toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
    };
  });

  const students = studentsRes.data.map((row) => ({
    name: row.first_name,
    grade: row.grade_level,
    avatar: row.avatar_text ?? row.first_name.slice(0, 2).toUpperCase(),
    xp: 0,
    streak: 0,
    progress: {},
  }));

  return { grades, students };
}

export async function getCommunityData() {
  const auth = await getServerAuthContext();

  if (!auth) {
    return {
      zones: mockZones,
      teachers: mockTeachers,
      groups: mockGroups,
      events: mockEvents,
      posts: [],
    };
  }

  const [eventsRes, postsRes] = await Promise.all([
    auth.client.from("events").select("title, event_date, location, seats, event_type").order("event_date", { ascending: true }).limit(6),
    auth.client.from("community_posts").select("title, body, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const events =
    eventsRes.data?.map((event) => ({
      name: event.title,
      type: event.event_type,
      date: new Date(event.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      zone: 1,
      spots: event.seats ?? 0,
      cost: "Community",
    })) ?? mockEvents;

  return {
    zones: mockZones,
    teachers: mockTeachers,
    groups: mockGroups,
    events,
    posts: postsRes.data ?? [],
  };
}

export async function getResourcesData() {
  const auth = await getServerAuthContext();

  if (!auth) {
    return {
      categories: mockResourceCategories,
      savedResources: [],
    };
  }

  const { data } = await auth.client
    .from("saved_resources")
    .select("title, description, url, category")
    .order("created_at", { ascending: false })
    .limit(12);

  if (!data?.length) {
    return {
      categories: mockResourceCategories,
      savedResources: [],
    };
  }

  return {
    categories: mockResourceCategories,
    savedResources: data,
  };
}

export async function getTxLawsData() {
  return { laws: mockTxLaws };
}
