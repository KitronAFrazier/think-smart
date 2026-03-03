import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/supabase/server";

export default async function HomePage() {
  const authContext = await getServerAuthContext();

  if (authContext?.user) {
    redirect("/dashboard");
  }

  redirect("/login");
}
