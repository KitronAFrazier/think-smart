"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { resolveRedirectPath } from "@/lib/redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9a6 6 0 0 1 0-12c2.2 0 3.6.9 4.4 1.6l3-2.9C17.8 3.2 15.2 2 12 2a10 10 0 1 0 0 20c5.8 0 9.7-4.1 9.7-9.8 0-.7-.1-1.2-.2-1.8z"
      />
      <path fill="#34A853" d="M3.5 7.8 6.7 10A6 6 0 0 1 12 6a6 6 0 0 1 4.4 1.6l3-2.9A10 10 0 0 0 3.5 7.8z" />
      <path fill="#4A90E2" d="M12 22a10 10 0 0 0 6.8-2.5l-3.1-2.6c-.9.6-2.1 1.1-3.7 1.1A6 6 0 0 1 6.7 14l-3.2 2.4A10 10 0 0 0 12 22z" />
      <path fill="#FBBC05" d="M3.5 7.8A10 10 0 0 0 2 12c0 1.5.3 2.9.9 4.2L6.7 14A6 6 0 0 1 6 12c0-.7.1-1.4.4-2z" />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const redirectPath = useMemo(() => resolveRedirectPath(searchParams.get("next")), [searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const normalizedInput = emailOrUsername.trim().toLowerCase();
      if (!normalizedInput) {
        throw new Error("Email or username is required.");
      }
      const signInEmail = normalizedInput.includes("@") ? normalizedInput : `${normalizedInput}@thinksmart.local`;

      const supabase = getSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password,
      });

      if (signInError || !data.session) {
        throw new Error(signInError?.message ?? "Could not sign in.");
      }

      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error("Unable to persist login session.");
      }

      router.push(redirectPath);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setOauthLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (oauthSubmitError) {
      setError(oauthSubmitError instanceof Error ? oauthSubmitError.message : "Unable to start Google sign in.");
      setOauthLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: "1.6rem" }}>Sign in</h1>
        <p>Welcome back to The Logic Branch.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email or Username
          </label>
          <input
            id="email"
            className="form-input"
            value={emailOrUsername}
            onChange={(event) => setEmailOrUsername(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="form-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? (
          <div className="badge red" style={{ marginBottom: 12 }}>
            {error}
          </div>
        ) : null}

        <button className="btn btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="divider"></div>

      <button className="btn btn-secondary" type="button" style={{ width: "100%" }} onClick={handleGoogleSignIn} disabled={oauthLoading}>
        <GoogleIcon /> {oauthLoading ? "Redirecting..." : "Continue with Google"}
      </button>

      <p style={{ marginTop: 14, fontSize: "0.82rem", color: "var(--text-3)" }}>
        New here? <Link href="/signup">Create an account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="page">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
