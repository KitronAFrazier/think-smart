import SettingsPanel from "@/components/app/SettingsPanel";
import { getCurrentPlan } from "@/lib/current-plan";
import { getServerAuthContext } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const [auth, currentPlan] = await Promise.all([getServerAuthContext(), getCurrentPlan()]);
  const user = auth?.user;
  const userMeta = user?.user_metadata as { full_name?: string; name?: string; username?: string } | null;
  const email = user?.email ?? "user@thinksmart.local";
  const initialDisplayName =
    userMeta?.full_name?.trim() || userMeta?.name?.trim() || userMeta?.username?.trim() || email.split("@")[0] || "Parent";

  return (
    <div className="page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage account profile, app preferences, notifications, and security.</p>
      </div>

      <SettingsPanel email={email} initialDisplayName={initialDisplayName} currentPlan={currentPlan} />
    </div>
  );
}
