import StudentsManager from "@/components/app/StudentsManager";
import { getStudentsData } from "@/lib/server-data";

export default async function StudentsPage() {
  const { students, grades } = await getStudentsData();
  const normalizedStudents = students.map((student, index) => ({
    ...student,
    id: typeof student.id === "string" && student.id.length > 0 ? student.id : `student-${index + 1}`,
  }));

  return <StudentsManager initialStudents={normalizedStudents} grades={grades} />;
}
