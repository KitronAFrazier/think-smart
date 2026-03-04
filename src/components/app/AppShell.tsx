"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CheckCircle2, FileText, PlusCircle, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { PLAN_LABELS, type PlanTier } from "@/lib/plans";
import Sidebar from "@/components/app/Sidebar";
import Topbar from "@/components/app/Topbar";

type AppShellProps = {
  children: React.ReactNode;
  userEmail: string;
  currentPlan: PlanTier;
  isAdmin: boolean;
};

type ModalState =
  | { kind: "addLesson" }
  | { kind: "exportReport" }
  | null;

type ToastState =
  | {
      message: string;
      icon?: React.ReactNode;
    }
  | null;

const TITLE_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  students: "My Students",
  planner: "Lesson Planner",
  progress: "Progress & Grades",
  community: "Community Hub",
  resources: "Resources",
  txlaws: "Texas Homeschool Laws",
  "student-app": "Student View",
  upgrade: "Upgrade",
  billing: "Billing",
  settings: "Settings",
};

const THEME_KEY = "thinksmart-theme";

export default function AppShell({ children, userEmail, currentPlan, isAdmin }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === null) {
      return true;
    }

    return saved === "dark";
  });
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("light-mode", !darkMode);
    window.localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const topbarTitle = useMemo(() => {
    const segment = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
    return TITLE_MAP[segment] ?? "The Logic Branch";
  }, [pathname]);

  const userInitials = useMemo(() => {
    const local = userEmail.split("@")[0] ?? "TS";
    const tokens = local.split(/[._-]/).filter(Boolean);
    if (tokens.length >= 2) {
      return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
    }
    return local.slice(0, 2).toUpperCase();
  }, [userEmail]);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
  }

  function showSavedToast(message: string) {
    setToast({ message, icon: <CheckCircle2 className="icon-svg" /> });
  }

  return (
    <div id="app">
      <Sidebar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => {
          setSidebarOpen((prev) => !prev);
        }}
      />
      <div className={`main-content ${sidebarOpen ? "" : "sidebar-collapsed"}`} id="main-content">
        <Topbar
          title={topbarTitle}
          darkMode={darkMode}
          userInitials={userInitials}
          isAdmin={isAdmin}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => {
            setSidebarOpen((prev) => !prev);
          }}
          onOpenAddLesson={() => setModal({ kind: "addLesson" })}
          onOpenReport={() => setModal({ kind: "exportReport" })}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          onSignOut={handleSignOut}
        />

        <div style={{ padding: "0 28px" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 12 }}>
            <span className="badge purple">Current Plan: {PLAN_LABELS[currentPlan]}</span>
          </div>
        </div>

        {children}
      </div>

      {modal ? (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{modal.kind === "addLesson" ? "Add New Lesson" : "Export Report"}</div>
              <button className="modal-close" onClick={() => setModal(null)} type="button" aria-label="Close modal">
                <X className="icon-svg" />
              </button>
            </div>

            {modal.kind === "addLesson" ? (
              <>
                <div className="form-group">
                  <label className="form-label">Lesson Title</label>
                  <input className="form-input" placeholder="e.g., Chapter 5 Reading" />
                </div>
                <div className="form-group">
                  <label className="form-label">Student</label>
                  <select className="form-select">
                    <option>Emma - 3rd Grade</option>
                    <option>Liam - 1st Grade</option>
                    <option>Sophie - 5th Grade</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-select">
                    <option>Math</option>
                    <option>Language Arts</option>
                    <option>Science</option>
                    <option>Social Studies</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button className="btn btn-secondary" type="button" style={{ flex: 1 }} onClick={() => setModal(null)}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    type="button"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setModal(null);
                      showSavedToast("Lesson added.");
                    }}
                  >
                    <PlusCircle className="icon-svg" /> Add Lesson
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ color: "var(--text-2)", fontSize: "0.9rem", marginBottom: 20 }}>
                  Generate a PDF report for Texas homeschool records.
                </p>
                <div className="form-group">
                  <label className="form-label">Student</label>
                  <select className="form-select">
                    <option>All Students</option>
                    <option>Emma - 3rd Grade</option>
                    <option>Liam - 1st Grade</option>
                    <option>Sophie - 5th Grade</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Report Type</label>
                  <select className="form-select">
                    <option>Attendance Log</option>
                    <option>Grade Report</option>
                    <option>Progress Summary</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button className="btn btn-secondary" type="button" style={{ flex: 1 }} onClick={() => setModal(null)}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    type="button"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setModal(null);
                      showSavedToast("Report generated.");
                    }}
                  >
                    <FileText className="icon-svg" /> Download
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="toast">
          <span>{toast.icon ?? <CheckCircle2 className="icon-svg" />}</span>
          <span>{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}
