export type PlanTier = "free" | "family" | "family_plus" | "co_op";

export const PLAN_ORDER: Record<PlanTier, number> = {
  free: 0,
  family: 1,
  family_plus: 2,
  co_op: 3,
};

export const PLAN_LABELS: Record<PlanTier, string> = {
  free: "Free",
  family: "Family",
  family_plus: "Family Plus",
  co_op: "Co-Op",
};

export function hasRequiredPlan(current: PlanTier, required: PlanTier): boolean {
  return PLAN_ORDER[current] >= PLAN_ORDER[required];
}

export function normalizePlan(plan: string | null | undefined): PlanTier {
  if (plan === "family" || plan === "family_plus" || plan === "co_op" || plan === "free") {
    return plan;
  }
  return "free";
}
