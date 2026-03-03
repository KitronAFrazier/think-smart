import StudentsManager from "@/components/app/StudentsManager";
import { getStudentsData } from "@/lib/server-data";

export default async function StudentsPage() {
  const { students, grades } = await getStudentsData();
  const normalizedStudents = students.map((student, index) => ({
    ...student,
    id: student.id ?? `student-${index}-${student.name.toLowerCase().replace(/\s+/g, "-")}`,
  }));

  return <StudentsManager initialStudents={normalizedStudents} grades={grades} />;
}
