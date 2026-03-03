import { normalizePlan, type PlanTier } from "@/lib/plans";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export type SubscriptionRecord = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanTier;
  status: string;
  current_period_end: string | null;
};

export async function getUserSubscription(userId: string): Promise<SubscriptionRecord | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    user_id: data.user_id,
    stripe_customer_id: data.stripe_customer_id,
    stripe_subscription_id: data.stripe_subscription_id,
    plan: normalizePlan(data.plan),
    status: data.status,
    current_period_end: data.current_period_end,
  };
}

export async function upsertUserSubscription(input: {
  userId: string;
  plan?: string | null;
  status?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  currentPeriodEnd?: string | null;
}) {
  const supabase = getSupabaseServiceClient();

  const payload = {
    user_id: input.userId,
    plan: normalizePlan(input.plan),
    status: input.status ?? "inactive",
    stripe_customer_id: input.stripeCustomerId ?? null,
    stripe_subscription_id: input.stripeSubscriptionId ?? null,
    current_period_end: input.currentPeriodEnd ?? null,
  };

  const { error } = await supabase.from("subscriptions").upsert(payload, {
    onConflict: "user_id",
  });

  if (error) {
    throw error;
  }
}

export function stripePriceIdToPlan(priceId?: string | null, productId?: string | null): PlanTier {
  if (!priceId && !productId) {
    return "free";
  }

  if (
    (process.env.STRIPE_PRICE_FAMILY && priceId === process.env.STRIPE_PRICE_FAMILY) ||
    (process.env.STRIPE_PRICE_FAMILY_MONTHLY && priceId === process.env.STRIPE_PRICE_FAMILY_MONTHLY) ||
    (process.env.STRIPE_PRICE_FAMILY_YEARLY && priceId === process.env.STRIPE_PRICE_FAMILY_YEARLY) ||
    (process.env.STRIPE_PRODUCT_FAMILY && productId === process.env.STRIPE_PRODUCT_FAMILY)
  ) {
    return "family";
  }

  if (
    (process.env.STRIPE_PRICE_FAMILY_PLUS && priceId === process.env.STRIPE_PRICE_FAMILY_PLUS) ||
    (process.env.STRIPE_PRICE_FAMILY_PLUS_MONTHLY && priceId === process.env.STRIPE_PRICE_FAMILY_PLUS_MONTHLY) ||
    (process.env.STRIPE_PRICE_FAMILY_PLUS_YEARLY && priceId === process.env.STRIPE_PRICE_FAMILY_PLUS_YEARLY) ||
    (process.env.STRIPE_PRODUCT_FAMILY_PLUS && productId === process.env.STRIPE_PRODUCT_FAMILY_PLUS)
  ) {
    return "family_plus";
  }

  if (
    (process.env.STRIPE_PRICE_CO_OP && priceId === process.env.STRIPE_PRICE_CO_OP) ||
    (process.env.STRIPE_PRICE_COOP && priceId === process.env.STRIPE_PRICE_COOP) ||
    (process.env.STRIPE_PRICE_CO_OP_YEARLY && priceId === process.env.STRIPE_PRICE_CO_OP_YEARLY) ||
    (process.env.STRIPE_PRICE_COOP_YEARLY && priceId === process.env.STRIPE_PRICE_COOP_YEARLY) ||
    (process.env.STRIPE_PRODUCT_CO_OP && productId === process.env.STRIPE_PRODUCT_CO_OP) ||
    (process.env.STRIPE_PRODUCT_COOP && productId === process.env.STRIPE_PRODUCT_COOP)
  ) {
    return "co_op";
  }

  return "free";
}
