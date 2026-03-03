import UpgradePlans from "@/components/app/UpgradePlans";
import { getCurrentPlan } from "@/lib/current-plan";

export default async function UpgradePage() {
  const currentPlan = await getCurrentPlan();
  return <UpgradePlans currentPlan={currentPlan} />;
}
