import AdminConsole from "@/components/admin/AdminConsole";
import { getServerAuthContext } from "@/lib/supabase/server";

export default async function AdminPage() {
  const auth = await getServerAuthContext();
  const email = auth?.user.email ?? "admin@thinksmart.local";
  const userId = auth?.user.id ?? "";

  return <AdminConsole currentUserId={userId} email={email} />;
}
