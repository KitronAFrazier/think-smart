"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminContentPanel from "@/components/admin/AdminContentPanel";
import AdminUsersPanel from "@/components/admin/AdminUsersPanel";

type AdminConsoleProps = {
  currentUserId: string;
  email: string;
};

const STORAGE_KEY = "think-smart-admin-dark-mode";

export default function AdminConsole({ currentUserId, email }: AdminConsoleProps) {
  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === null) {
        setDarkMode(true);
      } else {
        setDarkMode(saved === "1");
      }
    } catch {
      setDarkMode(true);
    } finally {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("light-mode", !darkMode);

    try {
      window.localStorage.setItem(STORAGE_KEY, darkMode ? "1" : "0");
    } catch {
      // no-op if storage is blocked
    }
  }, [darkMode, mounted]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="page">
        <div className="page-header" style={{ marginBottom: 18 }}>
          <div className="section-header" style={{ marginBottom: 8 }}>
            <h1>Admin Console</h1>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              aria-pressed={darkMode}
              onClick={() => setDarkMode((previous) => !previous)}
            >
              {darkMode ? "Light mode" : "Dark mode"}
            </button>
          </div>
          <p>Signed in as {email}</p>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Homeschool Membership Operations</h3>
          <p style={{ color: "var(--text-2)", marginBottom: 14 }}>
            Manage parent/admin access, monitor subscription state, and apply manual membership updates in one place.
          </p>
          <p style={{ color: "var(--text-2)" }}>
            Manual subscription actions are handled with admin-only API checks and do not expose service credentials.
          </p>
        </div>

        <AdminUsersPanel currentUserId={currentUserId} />
        <AdminContentPanel />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/dashboard" className="btn btn-secondary">
            Back to App
          </Link>
        </div>
      </div>
    </div>
  );
}
