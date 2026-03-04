import { NextResponse } from "next/server";
import { getServerAuthContext } from "@/lib/supabase/server";

export const runtime = "nodejs";

type UpdateProfilePayload = {
  fullName?: string;
};

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
  if (!fullName) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }

  const { data, error } = await auth.client
    .from("profiles")
    .upsert({ id: auth.user.id, full_name: fullName }, { onConflict: "id" })
    .select("full_name")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not update profile." }, { status: 500 });
  }

  return NextResponse.json({ profile: { fullName: data.full_name } });
}
