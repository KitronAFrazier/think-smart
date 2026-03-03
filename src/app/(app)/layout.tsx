import { redirect } from "next/navigation";
import AppShell from "@/components/app/AppShell";
import { getCurrentUserRole } from "@/lib/roles";
import { normalizePlan, type PlanTier } from "@/lib/plans";
import { getUserSubscription } from "@/lib/subscription";
import { getServerAuthContext } from "@/lib/supabase/server";

function resolvePlan(status: string | null, plan: string | null | undefined): PlanTier {
  if (!status) {
    return "free";
  }

  const normalizedStatus = status.toLowerCase();
  const paidStatuses = new Set(["active", "trialing", "past_due"]);

  if (!paidStatuses.has(normalizedStatus)) {
    return "free";
  }

  return normalizePlan(plan);
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const authContext = await getServerAuthContext();

  if (!authContext?.user) {
    redirect("/login");
  }

  let currentPlan: PlanTier = "free";
  const role = await getCurrentUserRole(authContext);
  const isAdmin = role === "admin";

  try {
    const subscription = await getUserSubscription(authContext.user.id);
    if (subscription) {
      currentPlan = resolvePlan(subscription.status, subscription.plan);
    }
  } catch {
    currentPlan = "free";
  }

  return (
    <AppShell userEmail={authContext.user.email ?? "user@thinksmart.local"} currentPlan={currentPlan} isAdmin={isAdmin}>
      {children}
    </AppShell>
  );
}
