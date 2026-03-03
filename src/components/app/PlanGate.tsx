import Link from "next/link";
import { Lock } from "lucide-react";
import { PLAN_LABELS, type PlanTier } from "@/lib/plans";

type PlanGateProps = {
  requiredPlan: PlanTier;
  currentPlan: PlanTier;
  children: React.ReactNode;
};

const ORDER: Record<PlanTier, number> = {
  free: 0,
  family: 1,
  family_plus: 2,
  co_op: 3,
};

export default function PlanGate({ requiredPlan, currentPlan, children }: PlanGateProps) {
  if (ORDER[currentPlan] >= ORDER[requiredPlan]) {
    return <>{children}</>;
  }

  return (
    <div className="page">
      <div className="card empty-state">
        <div className="icon">
          <Lock className="icon-svg" />
        </div>
        <p>
          This section requires the {PLAN_LABELS[requiredPlan]} plan. Your current plan is {PLAN_LABELS[currentPlan]}.
        </p>
        <div style={{ marginTop: 16 }}>
          <Link href="/upgrade" className="btn btn-primary">
            Upgrade Plan
          </Link>
        </div>
      </div>
    </div>
  );
}
