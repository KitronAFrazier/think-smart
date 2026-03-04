import StudentsManager from "@/components/app/StudentsManager";
import { getStudentsData } from "@/lib/server-data";

export default async function StudentsPage() {
  const { students, grades } = await getStudentsData();
  const normalizedStudents = students.filter(
    (student): student is typeof student & { id: string } => typeof student.id === "string" && student.id.length > 0,
  );

  return <StudentsManager initialStudents={normalizedStudents} grades={grades} />;
}
