import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/roles";
import { getServerAuthContext } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getServerAuthContext();
  if (!auth?.user) {
    redirect("/admin/login");
  }

  const role = await getCurrentUserRole(auth);
  if (role !== "admin") {
    redirect("/dashboard");
  }

  return children;
}
