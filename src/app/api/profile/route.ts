import { NextResponse } from "next/server";
import { getServerAuthContext } from "@/lib/supabase/server";

export const runtime = "nodejs";

type UpdateProfilePayload = {
  fullName?: string;
  secondaryParentEmail?: string;
};

function isMissingColumnError(message: string | undefined, column: string): boolean {
  if (!message) {
    return false;
  }

  const text = message.toLowerCase();
  return text.includes("column") && text.includes(column.toLowerCase()) && (text.includes("schema cache") || text.includes("does not exist"));
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function PATCH(request: Request) {
  const auth = await getServerAuthContext();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: UpdateProfilePayload;
  try {
    body = (await request.json()) as UpdateProfilePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const fullName = body.fullName?.trim();
  const secondaryParentEmailRaw = body.secondaryParentEmail?.trim() ?? "";
  const secondaryParentEmail = secondaryParentEmailRaw ? secondaryParentEmailRaw.toLowerCase() : null;
  if (!fullName) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }

  if (secondaryParentEmail && !isValidEmail(secondaryParentEmail)) {
    return NextResponse.json({ error: "Secondary parent email is not valid." }, { status: 400 });
  }

  const withSecondaryEmail = await auth.client
    .from("profiles")
    .upsert({ id: auth.user.id, full_name: fullName, secondary_parent_email: secondaryParentEmail }, { onConflict: "id" })
    .select("full_name, secondary_parent_email")
    .single();

  let data = withSecondaryEmail.data;
  let error = withSecondaryEmail.error;

  if (error && isMissingColumnError(error.message, "secondary_parent_email")) {
    const fallback = await auth.client
      .from("profiles")
      .upsert({ id: auth.user.id, full_name: fullName }, { onConflict: "id" })
      .select("full_name")
      .single();

    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not update profile." }, { status: 500 });
  }

  return NextResponse.json({
    profile: {
      fullName: data.full_name,
      secondaryParentEmail:
        "secondary_parent_email" in data && typeof data.secondary_parent_email === "string"
          ? data.secondary_parent_email
          : null,
    },
  });
}
