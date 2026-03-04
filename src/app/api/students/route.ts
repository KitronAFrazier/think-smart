import { NextResponse } from "next/server";
import { getServerAuthContext } from "@/lib/supabase/server";

export const runtime = "nodejs";

type CreateStudentPayload = {
  firstName?: string;
  gradeLevel?: string;
};

const VALID_GRADE_LEVELS = new Set([
  "Kindergarten",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
]);

function normalizeAvatarText(firstName: string): string {
  return firstName.trim().slice(0, 2).toUpperCase();
}

function isValidGradeLevel(gradeLevel: string): boolean {
  return VALID_GRADE_LEVELS.has(gradeLevel);
}

function isMissingColumnError(message: string | undefined, column: string): boolean {
  if (!message) {
    return false;
  }

  const text = message.toLowerCase();
  return text.includes("column") && text.includes(column.toLowerCase()) && text.includes("schema cache");
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request) {
  const auth = await getServerAuthContext();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateStudentPayload;
  try {
    body = (await request.json()) as CreateStudentPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const firstName = body.firstName?.trim();
  const gradeLevel = body.gradeLevel?.trim();

  if (!firstName || !gradeLevel) {
    return NextResponse.json({ error: "First name and grade level are required." }, { status: 400 });
  }

  if (!isValidGradeLevel(gradeLevel)) {
    return NextResponse.json({ error: "Grade level must be Kindergarten through 8th Grade." }, { status: 400 });
  }

  const withAvatar = await auth.client
    .from("students")
    .insert({
      user_id: auth.user.id,
      first_name: firstName,
      grade_level: gradeLevel,
      avatar_text: normalizeAvatarText(firstName),
    })
    .select("id, first_name, grade_level, avatar_text, xp, streak")
    .single();

  let data: {
    id: string;
    first_name: string;
    grade_level: string;
    avatar_text?: string | null;
    xp: number | null;
    streak: number | null;
  } | null = withAvatar.data;
  let error = withAvatar.error;

  if (error && isMissingColumnError(error.message, "avatar_text")) {
    const fallback = await auth.client
      .from("students")
      .insert({
        user_id: auth.user.id,
        first_name: firstName,
        grade_level: gradeLevel,
      })
      .select("id, first_name, grade_level, xp, streak")
      .single();

    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not create student." }, { status: 500 });
  }

  return NextResponse.json({
    student: {
      id: data.id,
      name: data.first_name,
      grade: data.grade_level,
      avatar:
        ("avatar_text" in data && typeof data.avatar_text === "string"
          ? data.avatar_text
          : null) ?? normalizeAvatarText(data.first_name),
      xp: data.xp ?? 0,
      streak: data.streak ?? 0,
      progress: {},
    },
  });
}

export async function DELETE(request: Request) {
  const auth = await getServerAuthContext();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const studentId = url.searchParams.get("id")?.trim();

  if (!studentId) {
    return NextResponse.json({ error: "Student id is required." }, { status: 400 });
  }

  if (!isUuid(studentId)) {
    return NextResponse.json({ error: "Invalid student id." }, { status: 400 });
  }

  const { data, error } = await auth.client
    .from("students")
    .delete()
    .eq("id", studentId)
    .eq("user_id", auth.user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
