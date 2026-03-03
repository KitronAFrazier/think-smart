import { NextResponse } from "next/server";
import { getServerAuthContext } from "@/lib/supabase/server";

export const runtime = "nodejs";

type CreateStudentPayload = {
  firstName?: string;
  gradeLevel?: string;
};

function normalizeAvatarText(firstName: string): string {
  return firstName.trim().slice(0, 2).toUpperCase();
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

  const { data, error } = await auth.client
    .from("students")
    .insert({
      user_id: auth.user.id,
      first_name: firstName,
      grade_level: gradeLevel,
      avatar_text: normalizeAvatarText(firstName),
    })
    .select("id, first_name, grade_level, avatar_text, xp, streak")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not create student." }, { status: 500 });
  }

  return NextResponse.json({
    student: {
      id: data.id,
      name: data.first_name,
      grade: data.grade_level,
      avatar: data.avatar_text ?? normalizeAvatarText(data.first_name),
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

  const { error } = await auth.client
    .from("students")
    .delete()
    .eq("id", studentId)
    .eq("user_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
