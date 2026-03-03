"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { resolveRedirectPath } from "@/lib/redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const code = useMemo(() => searchParams.get("code"), [searchParams]);
  const nextPath = useMemo(() => resolveRedirectPath(searchParams.get("next")), [searchParams]);
  const oauthError = useMemo(
    () => searchParams.get("error_description") ?? searchParams.get("error"),
    [searchParams],
  );

  useEffect(() => {
    let cancelled = false;

    async function finalizeAuth() {
      if (oauthError) {
        setError(oauthError);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();

        if (code) {
          const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
          if (codeError) {
            throw codeError;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error(sessionError?.message ?? "No session returned from Google sign in.");
        }

        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to persist login session.");
        }

        if (!cancelled) {
          router.replace(nextPath);
          router.refresh();
        }
      } catch (oauthCallbackError) {
        if (!cancelled) {
          setError(oauthCallbackError instanceof Error ? oauthCallbackError.message : "Google login failed.");
        }
      }
    }

    void finalizeAuth();

    return () => {
      cancelled = true;
    };
  }, [code, nextPath, oauthError, router]);

  if (error) {
    return (
      <div>
        <div className="page-header" style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: "1.45rem" }}>Google sign in failed</h1>
          <p>{error}</p>
        </div>
        <Link href="/login" className="btn btn-primary" style={{ width: "100%" }}>
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 10 }}>
        <h1 style={{ fontSize: "1.45rem" }}>Signing you in...</h1>
        <p>Please wait while we finish your Google login.</p>
      </div>
      <div className="progress-bar" aria-hidden>
        <div className="progress-fill blue" style={{ width: "70%" }}></div>
      </div>
    </div>
  );
}
