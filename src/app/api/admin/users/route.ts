import { NextResponse } from "next/server";
import { getCurrentUserRole, type AppRole } from "@/lib/roles";
import { normalizePlan, type PlanTier } from "@/lib/plans";
import { getServerAuthContext } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type ProfileUserKey = "id" | "user_id";

type AdminUser = {
  id: string;
  email: string | null;
  username: string | null;
  role: AppRole;
  subscription: {
    plan: PlanTier;
    status: string;
    currentPeriodEnd: string | null;
  };
  createdAt: string | null;
  lastSignInAt: string | null;
};

type UpdateRolePayload = {
  userId?: string;
  role?: AppRole;
};

type CreateUserPayload = {
  username?: string;
  password?: string;
  role?: AppRole;
};

const DEFAULT_USERS_PER_PAGE = 25;
const MAX_USERS_PER_PAGE = 100;

function normalizeRole(value: string | null | undefined): AppRole {
  return value === "admin" ? "admin" : "parent";
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

function usernameFromEmail(email: string | null | undefined): string | null {
  if (!email) {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized.endsWith("@thinksmart.local")) {
    return null;
  }

  const atIndex = normalized.indexOf("@");
  if (atIndex <= 0) {
    return null;
  }

  return normalized.slice(0, atIndex);
}

type AuthAdminUser = {
  id: string;
  email?: string | null;
  created_at?: string | null;
  last_sign_in_at?: string | null;
  user_metadata?: {
    username?: string;
  } | null;
};

function isMissingColumnError(message: string | undefined, column: string): boolean {
  if (!message) {
    return false;
  }

  const text = message.toLowerCase();
  return text.includes("column") && text.includes(column.toLowerCase()) && text.includes("does not exist");
}

function isMissingTableError(message: string | undefined, table: string): boolean {
  if (!message) {
    return false;
  }

  const text = message.toLowerCase();
  if (!text.includes(table.toLowerCase())) {
    return false;
  }

  return text.includes("could not find the table") || text.includes("schema cache") || text.includes("does not exist");
}

async function requireAdmin() {
  const auth = await getServerAuthContext();
  if (!auth?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const role = await getCurrentUserRole(auth);
  if (role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { auth };
}

async function resolveProfilesUserKey(): Promise<ProfileUserKey> {
  const supabase = getSupabaseServiceClient();

  const byIdResult = await supabase.from("profiles").select("id").limit(1);
  if (!byIdResult.error) {
    return "id";
  }

  if (isMissingColumnError(byIdResult.error.message, "id")) {
    return "user_id";
  }

  throw new Error(byIdResult.error.message);
}

async function getRolesByUserId(userIds: string[]): Promise<Map<string, AppRole>> {
  const rolesByUserId = new Map<string, AppRole>();
  if (!userIds.length) {
    return rolesByUserId;
  }

  const key = await resolveProfilesUserKey();
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(`${key}, role`)
    .in(key, userIds);

  if (error) {
    throw new Error(error.message);
  }

  for (const row of (data ?? []) as Array<Record<ProfileUserKey | "role", unknown>>) {
    const value = row[key];
    if (typeof value === "string") {
      rolesByUserId.set(value, normalizeRole(typeof row.role === "string" ? row.role : null));
    }
  }

  return rolesByUserId;
}

async function getSubscriptionsByUserId(userIds: string[]): Promise<Map<string, { plan: PlanTier; status: string; currentPeriodEnd: string | null }>> {
  const subscriptionsByUserId = new Map<string, { plan: PlanTier; status: string; currentPeriodEnd: string | null }>();
  if (!userIds.length) {
    return subscriptionsByUserId;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id, plan, status, current_period_end")
    .in("user_id", userIds);

  if (error) {
    if (isMissingTableError(error.message, "subscriptions")) {
      return subscriptionsByUserId;
    }
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    if (typeof row.user_id === "string") {
      subscriptionsByUserId.set(row.user_id, {
        plan: normalizePlan(row.plan),
        status: typeof row.status === "string" ? row.status : "inactive",
        currentPeriodEnd: typeof row.current_period_end === "string" ? row.current_period_end : null,
      });
    }
  }

  return subscriptionsByUserId;
}

async function upsertProfileRole(userId: string, role: AppRole) {
  const key = await resolveProfilesUserKey();
  const supabase = getSupabaseServiceClient();

  const updateResult = await supabase
    .from("profiles")
    .update({ role })
    .eq(key, userId)
    .select(`${key}, role`)
    .maybeSingle();

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  if (updateResult.data) {
    return normalizeRole(updateResult.data.role);
  }

  const insertPayload = key === "id" ? { id: userId, role } : { user_id: userId, role };
  const insertResult = await supabase.from("profiles").insert(insertPayload).select(`${key}, role`).maybeSingle();

  if (insertResult.error) {
    throw new Error(insertResult.error.message);
  }

  return normalizeRole(insertResult.data?.role);
}

async function listUsersOrThrow(page: number, perPage: number): Promise<AuthAdminUser[]> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as { users?: AuthAdminUser[] } | null)?.users ?? []);
}

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) {
    return guard.error;
  }

  try {
    const requestUrl = new URL(request.url);
    const pageParam = Number.parseInt(requestUrl.searchParams.get("page") ?? "1", 10);
    const perPageParam = Number.parseInt(requestUrl.searchParams.get("perPage") ?? `${DEFAULT_USERS_PER_PAGE}`, 10);
    const search = (requestUrl.searchParams.get("search") ?? "").trim();

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const perPage = Number.isFinite(perPageParam) ? Math.min(Math.max(perPageParam, 1), MAX_USERS_PER_PAGE) : DEFAULT_USERS_PER_PAGE;
    const normalizedSearch = search.toLowerCase();

    let usersPage: AuthAdminUser[] = [];
    let hasNextPage = false;
    let total: number | null = null;

    if (!normalizedSearch) {
      usersPage = await listUsersOrThrow(page, perPage);
      hasNextPage = usersPage.length === perPage;

      if (hasNextPage) {
        const nextPage = await listUsersOrThrow(page + 1, 1);
        hasNextPage = nextPage.length > 0;
      }

      if (!hasNextPage) {
        total = (page - 1) * perPage + usersPage.length;
      }
    } else {
      const startIndex = (page - 1) * perPage;
      const endIndexExclusive = startIndex + perPage;
      const collected: AuthAdminUser[] = [];
      let matchedCount = 0;
      let scanPage = 1;
      const scanPerPage = MAX_USERS_PER_PAGE;
      const maxScanPages = 1000;

      while (scanPage <= maxScanPages) {
        const batch = await listUsersOrThrow(scanPage, scanPerPage);
        if (!batch.length) {
          break;
        }

        for (const user of batch) {
          const email = (user.email ?? "").toLowerCase();
          if (!email.includes(normalizedSearch)) {
            continue;
          }

          if (matchedCount >= startIndex && matchedCount < endIndexExclusive) {
            collected.push(user);
          }

          matchedCount += 1;

          if (matchedCount >= endIndexExclusive + 1) {
            hasNextPage = true;
            break;
          }
        }

        if (hasNextPage || batch.length < scanPerPage) {
          break;
        }

        scanPage += 1;
      }

      usersPage = collected;
      if (!hasNextPage) {
        total = matchedCount;
      }
    }
    const userIds = usersPage.map((user) => user.id);
    const rolesByUserId = await getRolesByUserId(userIds);
    const subscriptionsByUserId = await getSubscriptionsByUserId(userIds);

    const users: AdminUser[] = usersPage.map((user) => ({
      id: user.id,
      email: user.email ?? null,
      username: user.user_metadata?.username ?? usernameFromEmail(user.email) ?? null,
      role: rolesByUserId.get(user.id) ?? "parent",
      subscription: subscriptionsByUserId.get(user.id) ?? {
        plan: "free",
        status: "inactive",
        currentPeriodEnd: null,
      },
      createdAt: user.created_at ?? null,
      lastSignInAt: user.last_sign_in_at ?? null,
    }));

    const totalPages = total === null ? null : Math.max(1, Math.ceil(total / perPage));
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      users,
      pagination: {
        page,
        perPage,
        total,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch admin users.";
    console.error("GET /api/admin/users failed:", error);
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

export async function PATCH(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) {
    return guard.error;
  }

  let payload: UpdateRolePayload;
  try {
    payload = (await request.json()) as UpdateRolePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userId = payload.userId;
  const role = payload.role;

  if (!userId || (role !== "admin" && role !== "parent")) {
    return NextResponse.json({ error: "Missing or invalid userId/role." }, { status: 400 });
  }

  if (guard.auth.user.id === userId && role !== "admin") {
    return NextResponse.json({ error: "You cannot remove your own admin access." }, { status: 400 });
  }

  try {
    const updatedRole = await upsertProfileRole(userId, role);
    return NextResponse.json({ userId, role: updatedRole });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update user role.";
    console.error("PATCH /api/admin/users failed:", error);
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

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) {
    return guard.error;
  }

  let payload: CreateUserPayload;
  try {
    payload = (await request.json()) as CreateUserPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const username = normalizeUsername(payload.username);
  const password = payload.password ?? "";
  const role: AppRole = payload.role === "admin" ? "admin" : "parent";

  if (!username || username.length < 3) {
    return NextResponse.json({ error: "Username is required (minimum 3 characters)." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const email = usernameToInternalEmail(username);

  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
      },
    });

    if (error || !data.user) {
      if (error?.message?.toLowerCase().includes("database error creating new user")) {
        return NextResponse.json(
          {
            error:
              "Database trigger error while creating auth user. Please run the trigger-fix SQL I provide (handle_new_user compatibility), then try again.",
          },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: error?.message ?? "Could not create user." }, { status: 400 });
    }

    try {
      await upsertProfileRole(data.user.id, role);
    } catch {
      // Profile creation may fail in legacy schemas; auth user creation still succeeds.
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email ?? email,
        username,
        role,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create user.";
    console.error("POST /api/admin/users failed:", error);
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
