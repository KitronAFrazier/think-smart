import { NextResponse } from "next/server";
import { normalizePlan, type PlanTier } from "@/lib/plans";
import { getCurrentUserRole } from "@/lib/roles";
import { getServerAuthContext } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const ALLOWED_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
  "inactive",
]);

type UpdateSubscriptionPayload = {
  userId?: string;
  plan?: PlanTier;
  status?: string;
  currentPeriodEnd?: string | null;
};

type GrantMonthPayload = {
  userId?: string;
  plan?: PlanTier;
};

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

function normalizeStatus(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!ALLOWED_STATUSES.has(normalized)) {
    return null;
  }

  return normalized;
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

async function verifyUserExists(userId: string) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error) {
    if (isMissingTableError(error.message, "subscriptions")) {
      throw new Error("Missing table: public.subscriptions. Apply supabase/master.sql to enable subscription management.");
    }
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("User not found.");
  }
}

type ExistingSubscription = {
  user_id: string;
  plan: string | null;
  status: string | null;
  current_period_end: string | null;
};

async function upsertManualSubscription(input: {
  userId: string;
  plan?: PlanTier;
  status?: string;
  currentPeriodEnd?: string | null;
}) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id, plan, status, current_period_end")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message, "subscriptions")) {
      throw new Error("Missing table: public.subscriptions. Apply supabase/master.sql to enable subscription management.");
    }
    throw new Error(error.message);
  }

  const existingData = (data as ExistingSubscription | null) ?? null;
  const nextPlan = normalizePlan(input.plan ?? existingData?.plan ?? "free");
  const nextStatus = input.status ?? existingData?.status ?? "inactive";
  const nextCurrentPeriodEnd =
    input.currentPeriodEnd !== undefined ? input.currentPeriodEnd : existingData?.current_period_end ?? null;

  if (existingData) {
    const updateResult = await supabase
      .from("subscriptions")
      .update({
        plan: nextPlan,
        status: nextStatus,
        current_period_end: nextCurrentPeriodEnd,
      })
      .eq("user_id", input.userId);

    if (updateResult.error) {
      if (isMissingTableError(updateResult.error.message, "subscriptions")) {
        throw new Error("Missing table: public.subscriptions. Apply supabase/master.sql to enable subscription management.");
      }
      throw new Error(updateResult.error.message);
    }
  } else {
    const insertResult = await supabase.from("subscriptions").insert({
      user_id: input.userId,
      plan: nextPlan,
      status: nextStatus,
      current_period_end: nextCurrentPeriodEnd,
      stripe_customer_id: null,
      stripe_subscription_id: null,
    });

    if (insertResult.error) {
      if (isMissingTableError(insertResult.error.message, "subscriptions")) {
        throw new Error("Missing table: public.subscriptions. Apply supabase/master.sql to enable subscription management.");
      }
      throw new Error(insertResult.error.message);
    }
  }

  return {
    userId: input.userId,
    plan: nextPlan,
    status: nextStatus,
    currentPeriodEnd: nextCurrentPeriodEnd,
  };
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) {
    return guard.error;
  }

  let payload: UpdateSubscriptionPayload;
  try {
    payload = (await request.json()) as UpdateSubscriptionPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userId = payload.userId;
  const status = normalizeStatus(payload.status);
  const providedPeriodEnd = payload.currentPeriodEnd;
  const plan = payload.plan === undefined ? undefined : normalizePlan(payload.plan);

  if (!userId) {
    return NextResponse.json({ error: "Missing userId." }, { status: 400 });
  }

  if (payload.status !== undefined && !status) {
    return NextResponse.json({ error: "Invalid subscription status." }, { status: 400 });
  }

  if (providedPeriodEnd !== undefined && providedPeriodEnd !== null) {
    const parsedDate = new Date(providedPeriodEnd);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid currentPeriodEnd date." }, { status: 400 });
    }
  }

  if (payload.plan === undefined && payload.status === undefined && payload.currentPeriodEnd === undefined) {
    return NextResponse.json({ error: "No subscription changes provided." }, { status: 400 });
  }

  try {
    await verifyUserExists(userId);
    const result = await upsertManualSubscription({
      userId,
      plan,
      status: status ?? undefined,
      currentPeriodEnd: providedPeriodEnd,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update subscription.";
    console.error("PATCH /api/admin/subscriptions failed:", error);
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

  let payload: GrantMonthPayload;
  try {
    payload = (await request.json()) as GrantMonthPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userId = payload.userId;
  if (!userId) {
    return NextResponse.json({ error: "Missing userId." }, { status: 400 });
  }

  const plan = normalizePlan(payload.plan ?? "family");
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    await verifyUserExists(userId);
    const result = await upsertManualSubscription({
      userId,
      plan,
      status: "active",
      currentPeriodEnd: periodEnd,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not grant free month.";
    console.error("POST /api/admin/subscriptions failed:", error);
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
