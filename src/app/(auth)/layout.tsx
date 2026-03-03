"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "thinksmart-theme";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("light-mode", !darkMode);
    window.localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, position: "relative" }}>
      <button
        className="dark-toggle"
        type="button"
        onClick={() => setDarkMode((prev) => !prev)}
        style={{ position: "absolute", top: 20, right: 20 }}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="icon-svg" /> : <Moon className="icon-svg" />}
      </button>

      <div className="card" style={{ width: "100%", maxWidth: 420 }}>
        {children}
      </div>
    </main>
  );
}
