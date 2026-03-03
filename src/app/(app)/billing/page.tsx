import BillingPanel from "@/components/app/BillingPanel";
import { getCurrentPlan } from "@/lib/current-plan";
import { getServerAuthContext } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";

export default async function BillingPage() {
  const currentPlan = await getCurrentPlan();
  const auth = await getServerAuthContext();

  let status = "inactive";
  let renewsAt: string | null = null;

  if (auth?.user) {
    try {
      const subscription = await getUserSubscription(auth.user.id);
      status = subscription?.status ?? "inactive";
      renewsAt = subscription?.current_period_end
        ? new Date(subscription.current_period_end).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null;
    } catch {
      status = "inactive";
    }
  }

  return <BillingPanel currentPlan={currentPlan} status={status} renewsAt={renewsAt} />;
}
