import { NextResponse } from "next/server";
import { isValidGradeLevel } from "@/lib/grade-curriculum";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { getServerAuthContext } from "@/lib/supabase/server";

export const runtime = "nodejs";

type CreateStudentPayload = {
  firstName?: string;
  gradeLevel?: string;
};

type UpdateStudentPayload = {
  id?: string;
  firstName?: string;
  gradeLevel?: string;
  loginUsername?: string;
  loginPassword?: string;
};

type StudentRow = {
  id: string;
  first_name: string;
  grade_level: string;
  avatar_text?: string | null;
  login_username?: string | null;
  auth_user_id?: string | null;
  xp: number | null;
  streak: number | null;
};

function normalizeAvatarText(firstName: string): string {
  return firstName.trim().slice(0, 2).toUpperCase();
}

function isMissingColumnError(message: string | undefined, column: string): boolean {
  if (!message) {
    return false;
  }

  const text = message.toLowerCase();
  return text.includes("column") && text.includes(column.toLowerCase()) && (text.includes("schema cache") || text.includes("does not exist"));
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeUsername(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}

function usernameToInternalEmail(username: string): string {
  return `${username}@thinksmart.local`;
}

function mapStudentResponse(data: StudentRow) {
  return {
    id: data.id,
    name: data.first_name,
    grade: data.grade_level,
    avatar:
      ("avatar_text" in data && typeof data.avatar_text === "string"
        ? data.avatar_text
        : null) ?? normalizeAvatarText(data.first_name),
    loginUsername: ("login_username" in data && typeof data.login_username === "string" ? data.login_username : null) ?? null,
    xp: data.xp ?? 0,
    streak: data.streak ?? 0,
    progress: {},
  };
}

async function selectStudentAfterWrite(
  auth: NonNullable<Awaited<ReturnType<typeof getServerAuthContext>>>,
  studentId: string,
  ownerUserId?: string,
): Promise<{ data: StudentRow | null; error: { message: string } | null }> {
  let withAllQuery = auth.client
    .from("students")
    .select("id, first_name, grade_level, avatar_text, login_username, auth_user_id, xp, streak")
    .eq("id", studentId);

  if (ownerUserId) {
    withAllQuery = withAllQuery.eq("user_id", ownerUserId);
  }

  const withAll = await withAllQuery.maybeSingle();

  if (!withAll.error) {
    return { data: withAll.data as StudentRow | null, error: null };
  }

  const loginMissing = isMissingColumnError(withAll.error.message, "login_username") || isMissingColumnError(withAll.error.message, "auth_user_id");
  const avatarMissing = isMissingColumnError(withAll.error.message, "avatar_text");

  if (!loginMissing && !avatarMissing) {
    return { data: null, error: { message: withAll.error.message } };
  }

  const fallbackSelect = ["id", "first_name", "grade_level", "xp", "streak"];
  if (!avatarMissing) {
    fallbackSelect.push("avatar_text");
  }
  if (!loginMissing) {
    fallbackSelect.push("login_username", "auth_user_id");
  }

  let fallbackQuery = auth.client
    .from("students")
    .select(fallbackSelect.join(", "))
    .eq("id", studentId);

  if (ownerUserId) {
    fallbackQuery = fallbackQuery.eq("user_id", ownerUserId);
  }

  const fallback = await fallbackQuery.maybeSingle();

  if (fallback.error) {
    return { data: null, error: { message: fallback.error.message } };
  }

  return { data: fallback.data as StudentRow | null, error: null };
}

async function resolveStudentOwnerUserId(
  auth: NonNullable<Awaited<ReturnType<typeof getServerAuthContext>>>,
): Promise<{ ownerUserId: string; error?: string; status?: number }> {
  const requesterEmail = auth.user.email?.trim().toLowerCase();
  if (!requesterEmail) {
    return { ownerUserId: auth.user.id };
  }

  try {
    const service = getSupabaseServiceClient();
    const { data, error } = await service
      .from("profiles")
      .select("id")
      .ilike("secondary_parent_email", requesterEmail)
      .limit(2);

    if (error) {
      return { ownerUserId: auth.user.id };
    }

    if (!data || data.length === 0) {
      return { ownerUserId: auth.user.id };
    }

    if (data.length > 1) {
      return {
        ownerUserId: auth.user.id,
        error: "Secondary parent email is linked to multiple parent accounts. Ask the primary parent to update Settings.",
        status: 409,
      };
    }

    const resolvedOwner = data[0]?.id;
    if (typeof resolvedOwner !== "string" || !resolvedOwner) {
      return { ownerUserId: auth.user.id };
    }

    return { ownerUserId: resolvedOwner };
  } catch {
    return { ownerUserId: auth.user.id };
  }
}

export async function POST(request: Request) {
  const auth = await getServerAuthContext();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerResolution = await resolveStudentOwnerUserId(auth);
  if (ownerResolution.error) {
    return NextResponse.json({ error: ownerResolution.error }, { status: ownerResolution.status ?? 500 });
  }

  const ownerUserId = ownerResolution.ownerUserId;

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
      user_id: ownerUserId,
      first_name: firstName,
      grade_level: gradeLevel,
      avatar_text: normalizeAvatarText(firstName),
    })
    .select("id")
    .single();

  let createdId = withAvatar.data?.id as string | undefined;
  let error = withAvatar.error;

  if (error && isMissingColumnError(error.message, "avatar_text")) {
    const fallback = await auth.client
      .from("students")
      .insert({
        user_id: ownerUserId,
        first_name: firstName,
        grade_level: gradeLevel,
      })
      .select("id")
      .single();

    createdId = fallback.data?.id as string | undefined;
    error = fallback.error;
  }

  if (error || !createdId) {
    return NextResponse.json({ error: error?.message ?? "Could not create student." }, { status: 500 });
  }

  const selected = await selectStudentAfterWrite(auth, createdId, ownerUserId);
  if (selected.error || !selected.data) {
    return NextResponse.json({ error: selected.error?.message ?? "Could not create student." }, { status: 500 });
  }

  return NextResponse.json({ student: mapStudentResponse(selected.data) });
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

export async function PATCH(request: Request) {
  const auth = await getServerAuthContext();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: UpdateStudentPayload;
  try {
    body = (await request.json()) as UpdateStudentPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const studentId = body.id?.trim();
  const firstName = body.firstName?.trim();
  const gradeLevel = body.gradeLevel?.trim();
  const nextLoginUsername = normalizeUsername(body.loginUsername);
  const nextLoginPassword = (body.loginPassword ?? "").trim();
  const hasCredentialInput = body.loginUsername !== undefined || body.loginPassword !== undefined;

  if (!studentId || !firstName || !gradeLevel) {
    return NextResponse.json({ error: "Student id, first name, and grade level are required." }, { status: 400 });
  }

  if (!isUuid(studentId)) {
    return NextResponse.json({ error: "Invalid student id." }, { status: 400 });
  }

  if (!isValidGradeLevel(gradeLevel)) {
    return NextResponse.json({ error: "Grade level must be Kindergarten through 8th Grade." }, { status: 400 });
  }

  if (hasCredentialInput) {
    if (!nextLoginUsername || nextLoginUsername.length < 3) {
      return NextResponse.json({ error: "Student username is required (minimum 3 characters)." }, { status: 400 });
    }

    if (nextLoginPassword && nextLoginPassword.length < 8) {
      return NextResponse.json({ error: "Student password must be at least 8 characters." }, { status: 400 });
    }
  }

  const existingRes = await auth.client
    .from("students")
    .select("id, auth_user_id, login_username")
    .eq("id", studentId)
    .maybeSingle();

  let existingAuthUserId: string | null = null;
  let existingLoginUsername: string | null = null;

  if (existingRes.error) {
    const missingCredentialColumns =
      isMissingColumnError(existingRes.error.message, "auth_user_id") || isMissingColumnError(existingRes.error.message, "login_username");

    if (!missingCredentialColumns) {
      return NextResponse.json({ error: existingRes.error.message }, { status: 500 });
    }

    if (hasCredentialInput) {
      return NextResponse.json(
        { error: "Database missing student credential columns. Apply the latest Supabase migrations and try again." },
        { status: 500 },
      );
    }

    const existsFallback = await auth.client
      .from("students")
      .select("id")
      .eq("id", studentId)
      .maybeSingle();

    if (existsFallback.error) {
      return NextResponse.json({ error: existsFallback.error.message }, { status: 500 });
    }

    if (!existsFallback.data) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }
  } else {
    if (!existingRes.data) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    existingAuthUserId = typeof existingRes.data.auth_user_id === "string" ? existingRes.data.auth_user_id : null;
    existingLoginUsername = typeof existingRes.data.login_username === "string" ? existingRes.data.login_username : null;
  }

  let resolvedAuthUserId = existingAuthUserId;
  let resolvedLoginUsername = existingLoginUsername;

  if (hasCredentialInput) {
    try {
      const service = getSupabaseServiceClient();
      const targetUsername = nextLoginUsername;

      if (!resolvedAuthUserId && !nextLoginPassword) {
        return NextResponse.json(
          { error: "Set a password (minimum 8 characters) when creating student login credentials for the first time." },
          { status: 400 },
        );
      }

      if (!resolvedAuthUserId) {
        const createResult = await service.auth.admin.createUser({
          email: usernameToInternalEmail(targetUsername),
          password: nextLoginPassword,
          email_confirm: true,
          user_metadata: {
            username: targetUsername,
            account_type: "student",
            parent_user_id: auth.user.id,
            student_id: studentId,
          },
        });

        if (createResult.error || !createResult.data.user) {
          return NextResponse.json({ error: createResult.error?.message ?? "Could not create student credentials." }, { status: 400 });
        }

        resolvedAuthUserId = createResult.data.user.id;
        resolvedLoginUsername = targetUsername;
      } else {
        const updates: {
          email?: string;
          password?: string;
          user_metadata?: Record<string, string>;
        } = {};

        if (targetUsername !== (resolvedLoginUsername ?? "")) {
          updates.email = usernameToInternalEmail(targetUsername);
          updates.user_metadata = {
            username: targetUsername,
            account_type: "student",
            parent_user_id: auth.user.id,
            student_id: studentId,
          };
        }

        if (nextLoginPassword) {
          updates.password = nextLoginPassword;
        }

        if (Object.keys(updates).length > 0) {
          const updateResult = await service.auth.admin.updateUserById(resolvedAuthUserId, updates);
          if (updateResult.error) {
            return NextResponse.json({ error: updateResult.error.message }, { status: 400 });
          }
        }

        resolvedLoginUsername = targetUsername;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update student credentials.";
      const isServiceKeyMissing = message.includes("SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json(
        {
          error: isServiceKeyMissing
            ? "Missing SUPABASE_SERVICE_ROLE_KEY in server environment. Add it to .env.local and restart dev server."
            : message,
        },
        { status: isServiceKeyMissing ? 503 : 500 },
      );
    }
  }

  const updatePayload: Record<string, string> = {
    first_name: firstName,
    grade_level: gradeLevel,
    avatar_text: normalizeAvatarText(firstName),
  };

  if (hasCredentialInput && resolvedAuthUserId && resolvedLoginUsername) {
    updatePayload.auth_user_id = resolvedAuthUserId;
    updatePayload.login_username = resolvedLoginUsername;
  }

  const withAvatar = await auth.client
    .from("students")
    .update(updatePayload)
    .eq("id", studentId)
    .select("id")
    .maybeSingle();

  let writeError = withAvatar.error;

  if (writeError && isMissingColumnError(writeError.message, "avatar_text")) {
    delete updatePayload.avatar_text;
    const fallback = await auth.client
      .from("students")
      .update(updatePayload)
      .eq("id", studentId)
      .select("id")
      .maybeSingle();

    writeError = fallback.error;
  }

  if (writeError && (isMissingColumnError(writeError.message, "auth_user_id") || isMissingColumnError(writeError.message, "login_username"))) {
    if (hasCredentialInput) {
      return NextResponse.json(
        { error: "Database missing student credential columns. Apply the latest Supabase migrations and try again." },
        { status: 500 },
      );
    }

    const legacyPayload: Record<string, string> = {
      first_name: firstName,
      grade_level: gradeLevel,
    };

    if ("avatar_text" in updatePayload) {
      legacyPayload.avatar_text = updatePayload.avatar_text;
    }

    const legacy = await auth.client
      .from("students")
      .update(legacyPayload)
      .eq("id", studentId)
      .select("id")
      .maybeSingle();

    writeError = legacy.error;
  }

  if (writeError) {
    return NextResponse.json({ error: writeError.message }, { status: 500 });
  }

  const selected = await selectStudentAfterWrite(auth, studentId);
  if (selected.error) {
    return NextResponse.json({ error: selected.error.message }, { status: 500 });
  }

  if (!selected.data) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  return NextResponse.json({ student: mapStudentResponse(selected.data) });
}
