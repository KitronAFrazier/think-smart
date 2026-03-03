"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PlanTier } from "@/lib/plans";
import { PLAN_LABELS } from "@/lib/plans";

type SettingsPanelProps = {
  email: string;
  initialDisplayName: string;
  currentPlan: PlanTier;
};

type LocalSettings = {
  displayName: string;
  schoolYearStartDate: string;
  timezone: string;
  weekStartsOn: "sunday" | "monday";
  dateFormat: "us" | "iso";
  notifyEmail: boolean;
  notifyReminders: boolean;
  notifyCommunity: boolean;
  marketingEmails: boolean;
  profileVisibleToCommunity: boolean;
  autoLockMinutes: "15" | "30" | "60" | "never";
};

const STORAGE_KEY = "tlb-settings-v1";
const PREFERENCES_COOKIE_KEY = "tlb-user-preferences";

function getDefaults(displayName: string): LocalSettings {
  const currentYear = new Date().getFullYear();
  return {
    displayName,
    schoolYearStartDate: `${currentYear}-09-01`,
    timezone: "America/Chicago",
    weekStartsOn: "monday",
    dateFormat: "us",
    notifyEmail: true,
    notifyReminders: true,
    notifyCommunity: true,
    marketingEmails: false,
    profileVisibleToCommunity: true,
    autoLockMinutes: "30",
  };
}

export default function SettingsPanel({ email, initialDisplayName, currentPlan }: SettingsPanelProps) {
  const defaults = useMemo(() => getDefaults(initialDisplayName), [initialDisplayName]);
  const [settings, setSettings] = useState<LocalSettings>(defaults);
  const [mounted, setMounted] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LocalSettings>;
        setSettings({ ...defaults, ...parsed });
      } else {
        setSettings(defaults);
      }
    } catch {
      setSettings(defaults);
    } finally {
      setMounted(true);
    }
  }, [defaults]);

  function saveSettings() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      const prefsForServer = {
        displayName: settings.displayName,
        schoolYearStartDate: settings.schoolYearStartDate,
      };
      document.cookie = `${PREFERENCES_COOKIE_KEY}=${encodeURIComponent(JSON.stringify(prefsForServer))}; path=/; max-age=31536000; samesite=lax`;
      const now = new Date().toLocaleString();
      setSavedAt(now);
      setMessage("Settings saved.");
    } catch {
      setMessage("Could not save settings in this browser.");
    }
  }

  function resetSettings() {
    setSettings(defaults);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      const prefsForServer = {
        displayName: defaults.displayName,
        schoolYearStartDate: defaults.schoolYearStartDate,
      };
      document.cookie = `${PREFERENCES_COOKIE_KEY}=${encodeURIComponent(JSON.stringify(prefsForServer))}; path=/; max-age=31536000; samesite=lax`;
      setSavedAt(new Date().toLocaleString());
      setMessage("Settings reset to defaults.");
    } catch {
      setMessage("Settings reset, but could not persist to browser storage.");
    }
  }

  if (!mounted) {
    return (
      <div className="card">
        <p style={{ color: "var(--text-2)" }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <div className="section-header" style={{ marginBottom: 12 }}>
          <div className="section-title">Account</div>
          <span className="badge purple">{PLAN_LABELS[currentPlan]}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Display Name</label>
            <input
              className="form-input"
              value={settings.displayName}
              onChange={(event) => setSettings((previous) => ({ ...previous, displayName: event.target.value }))}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email</label>
            <input className="form-input" value={email} readOnly />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">School Year Start Date</label>
            <input
              type="date"
              className="form-input"
              value={settings.schoolYearStartDate}
              onChange={(event) => setSettings((previous) => ({ ...previous, schoolYearStartDate: event.target.value }))}
            />
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <Link href="/billing" className="btn btn-secondary btn-sm">
            Manage Billing
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>Preferences</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Timezone</label>
            <select
              className="form-select"
              value={settings.timezone}
              onChange={(event) => setSettings((previous) => ({ ...previous, timezone: event.target.value }))}
            >
              <option value="America/Chicago">Central (US)</option>
              <option value="America/New_York">Eastern (US)</option>
              <option value="America/Denver">Mountain (US)</option>
              <option value="America/Los_Angeles">Pacific (US)</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Week Starts On</label>
            <select
              className="form-select"
              value={settings.weekStartsOn}
              onChange={(event) =>
                setSettings((previous) => ({ ...previous, weekStartsOn: event.target.value === "sunday" ? "sunday" : "monday" }))
              }
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date Format</label>
            <select
              className="form-select"
              value={settings.dateFormat}
              onChange={(event) => setSettings((previous) => ({ ...previous, dateFormat: event.target.value === "iso" ? "iso" : "us" }))}
            >
              <option value="us">MM/DD/YYYY</option>
              <option value="iso">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>Notifications</div>
        <div style={{ display: "grid", gap: 8 }}>
          <label className="task-item" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
            <input
              type="checkbox"
              checked={settings.notifyEmail}
              onChange={(event) => setSettings((previous) => ({ ...previous, notifyEmail: event.target.checked }))}
            />
            <span style={{ marginLeft: 10 }}>Email notifications for account and activity</span>
          </label>
          <label className="task-item" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
            <input
              type="checkbox"
              checked={settings.notifyReminders}
              onChange={(event) => setSettings((previous) => ({ ...previous, notifyReminders: event.target.checked }))}
            />
            <span style={{ marginLeft: 10 }}>Daily planner reminders</span>
          </label>
          <label className="task-item" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
            <input
              type="checkbox"
              checked={settings.notifyCommunity}
              onChange={(event) => setSettings((previous) => ({ ...previous, notifyCommunity: event.target.checked }))}
            />
            <span style={{ marginLeft: 10 }}>Community updates and responses</span>
          </label>
          <label className="task-item" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
            <input
              type="checkbox"
              checked={settings.marketingEmails}
              onChange={(event) => setSettings((previous) => ({ ...previous, marketingEmails: event.target.checked }))}
            />
            <span style={{ marginLeft: 10 }}>Product announcements and tips</span>
          </label>
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>Privacy & Security</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label className="task-item" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
            <input
              type="checkbox"
              checked={settings.profileVisibleToCommunity}
              onChange={(event) => setSettings((previous) => ({ ...previous, profileVisibleToCommunity: event.target.checked }))}
            />
            <span style={{ marginLeft: 10 }}>Show profile in community directory</span>
          </label>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Auto-lock Session</label>
            <select
              className="form-select"
              value={settings.autoLockMinutes}
              onChange={(event) =>
                setSettings((previous) => ({
                  ...previous,
                  autoLockMinutes:
                    event.target.value === "15" || event.target.value === "60" || event.target.value === "never" ? event.target.value : "30",
                }))
              }
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-sm" style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>
            {savedAt ? `Last saved: ${savedAt}` : "No saved changes in this browser yet."}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetSettings}>
              Reset
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={saveSettings}>
              Save Changes
            </button>
          </div>
        </div>
        {message ? <div style={{ marginTop: 8 }}><span className="badge green">{message}</span></div> : null}
      </div>
    </div>
  );
}
