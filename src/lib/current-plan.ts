import { normalizePlan, type PlanTier } from "@/lib/plans";
import { getUserSubscription } from "@/lib/subscription";
import { getServerAuthContext } from "@/lib/supabase/server";

export async function getCurrentPlan(): Promise<PlanTier> {
  const auth = await getServerAuthContext();
  if (!auth?.user) {
    return "free";
  }

  try {
    const subscription = await getUserSubscription(auth.user.id);
    if (!subscription) {
      return "free";
    }

    const status = subscription.status?.toLowerCase();
    if (status === "active" || status === "trialing" || status === "past_due") {
      return normalizePlan(subscription.plan);
    }

    return "free";
  } catch {
    return "free";
  }
}
