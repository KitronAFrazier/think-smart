"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CircleDollarSign, FileDown, Menu, Moon, Plus, Sun } from "lucide-react";

type TopbarProps = {
  title: string;
  darkMode: boolean;
  userInitials: string;
  isAdmin: boolean;
  onToggleSidebar: () => void;
  onOpenAddLesson: () => void;
  onOpenReport: () => void;
  onToggleDarkMode: () => void;
  onSignOut: () => void;
};

export default function Topbar({
  title,
  darkMode,
  userInitials,
  isAdmin,
  onToggleSidebar,
  onOpenAddLesson,
  onOpenReport,
  onToggleDarkMode,
  onSignOut,
}: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleWindowClick(event: MouseEvent) {
      if (!menuRef.current) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handleWindowClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleWindowClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="topbar">
      <button className="topbar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar" type="button">
        <Menu className="icon-svg" />
      </button>
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <button className="topbar-btn" onClick={onOpenAddLesson} type="button">
          <Plus className="icon-svg" /> Add Lesson
        </button>
        <button className="topbar-btn primary" onClick={onOpenReport} type="button">
          <FileDown className="icon-svg" /> Export Report
        </button>
        <Link className="topbar-btn" href="/upgrade">
          <CircleDollarSign className="icon-svg" /> Upgrade
        </Link>
        <button className="dark-toggle" onClick={onToggleDarkMode} title="Toggle dark mode" type="button">
          {darkMode ? <Sun className="icon-svg" /> : <Moon className="icon-svg" />}
        </button>
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            className="avatar-btn"
            title="Account"
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((previous) => !previous)}
          >
            {userInitials}
          </button>

          {menuOpen ? (
            <div
              role="menu"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: 168,
                border: "1px solid var(--border)",
                borderRadius: 10,
                background: "var(--surface)",
                boxShadow: "var(--shadow)",
                padding: 6,
                zIndex: 80,
              }}
            >
              <Link
                href="/settings"
                role="menuitem"
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", justifyContent: "flex-start", marginBottom: 6 }}
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin"
                  role="menuitem"
                  className="btn btn-secondary btn-sm"
                  style={{ width: "100%", justifyContent: "flex-start", marginBottom: 6 }}
                  onClick={() => setMenuOpen(false)}
                >
                  Admin
                </Link>
              ) : null}
              <button
                type="button"
                role="menuitem"
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", justifyContent: "flex-start" }}
                onClick={() => {
                  setMenuOpen(false);
                  onSignOut();
                }}
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
