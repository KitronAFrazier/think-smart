import { createSupabaseServerClient, getServerAuthContext } from "@/lib/supabase/server";

export type AppRole = "parent" | "admin";

function normalizeRole(value: string | null | undefined): AppRole {
  return value === "admin" ? "admin" : "parent";
}

function isMissingIdColumnError(message: string | undefined): boolean {
  if (!message) {
    return false;
  }

  const text = message.toLowerCase();
  return text.includes("column") && text.includes("id") && text.includes("does not exist");
}

export async function getCurrentUserRole(
  authContext?: Awaited<ReturnType<typeof getServerAuthContext>>,
): Promise<AppRole> {
  const context = authContext ?? (await getServerAuthContext());
  if (!context?.user) {
    return "parent";
  }

  try {
    const supabase = createSupabaseServerClient(context.accessToken);
    const byId = await supabase.from("profiles").select("role").eq("id", context.user.id).maybeSingle();

    if (!byId.error) {
      return normalizeRole(byId.data?.role);
    }

    if (!isMissingIdColumnError(byId.error.message)) {
      return "parent";
    }

    const byUserId = await supabase.from("profiles").select("role").eq("user_id", context.user.id).maybeSingle();
    if (byUserId.error) {
      return "parent";
    }

    return normalizeRole(byUserId.data?.role);
  } catch {
    return "parent";
  }
}
