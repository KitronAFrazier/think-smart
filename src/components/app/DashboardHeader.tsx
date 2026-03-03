"use client";

import { useMemo, useState } from "react";

type DashboardHeaderProps = {
  displayName: string;
  schoolYearStartDate: string | null;
};

function formatToday(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not set";
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return "Not set";
  }

  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function greetingForHour(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

export default function DashboardHeader({ displayName, schoolYearStartDate }: DashboardHeaderProps) {
  const today = useMemo(() => new Date(), []);
  const [currentTime] = useState(() => today);
  const [resolvedDisplayName] = useState(() => {
    if (typeof window === "undefined") {
      return displayName;
    }

    try {
      const raw = window.localStorage.getItem("tlb-settings-v1");
      if (!raw) {
        return displayName;
      }
      const parsed = JSON.parse(raw) as { displayName?: string };
      return parsed.displayName?.trim() || displayName;
    } catch {
      return displayName;
    }
  });
  const greeting = useMemo(() => greetingForHour(currentTime), [currentTime]);

  return (
    <div className="page-header">
      <h1>{`${greeting}, ${resolvedDisplayName}`}</h1>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <span className="badge gray">{formatToday(currentTime)}</span>
        <span className="badge blue">{`School Year Start: ${formatDate(schoolYearStartDate)}`}</span>
      </div>
    </div>
  );
}
