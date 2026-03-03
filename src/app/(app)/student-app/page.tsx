import PlanGate from "@/components/app/PlanGate";
import StudentAppView from "@/components/app/StudentAppView";
import { getCurrentPlan } from "@/lib/current-plan";

export default async function StudentAppPage() {
  const currentPlan = await getCurrentPlan();

  return (
    <PlanGate requiredPlan="family_plus" currentPlan={currentPlan}>
      <StudentAppView />
    </PlanGate>
  );
}
