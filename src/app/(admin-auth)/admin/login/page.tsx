import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/roles";
import { getServerAuthContext } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const auth = await getServerAuthContext();
  let role: Awaited<ReturnType<typeof getCurrentUserRole>> | null = null;

  if (auth?.user) {
    role = await getCurrentUserRole(auth);
    if (role === "admin") {
      redirect("/admin");
    }
  }

  if (auth?.user && role !== "admin") {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div className="card" style={{ width: "100%", maxWidth: 560 }}>
          <div className="page-header" style={{ marginBottom: 16 }}>
            <h1 style={{ fontSize: "1.5rem" }}>Admin Access Required</h1>
            <p>
              Signed in as <strong>{auth.user.email ?? "user@thinksmart.local"}</strong>, but this account does not
              have <code>profiles.role = admin</code>.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/dashboard" className="btn btn-secondary">
              Back to Dashboard
            </Link>
            <Link href="/login" className="btn btn-primary">
              Use Different Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="card" style={{ width: "100%", maxWidth: 460 }}>
        <div className="page-header" style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: "1.5rem" }}>Admin Login</h1>
          <p>Use your The Logic Branch account credentials, then we will verify admin access.</p>
        </div>

        <Link href="/login?next=/admin" className="btn btn-primary" style={{ width: "100%" }}>
          Continue to Sign In
        </Link>
      </div>
    </main>
  );
}
