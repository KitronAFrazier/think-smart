"use client";

import { useState } from "react";
import { PLAN_LABELS, type PlanTier } from "@/lib/plans";
import { safeJsonParse } from "@/lib/http";

type BillingPanelProps = {
  currentPlan: PlanTier;
  status: string;
  renewsAt: string | null;
};

export default function BillingPanel({ currentPlan, status, renewsAt }: BillingPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openBillingPortal() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await safeJsonParse<{ url?: string; error?: string }>(response);

      if (!response.ok || !json.url) {
        throw new Error(json.error ?? "Could not open billing portal.");
      }

      window.location.href = json.url;
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : "Could not open billing portal.");
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Billing</h1>
        <p>Manage subscription details and invoices.</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div className="section-title">Current Subscription</div>
          <span className="badge blue">{PLAN_LABELS[currentPlan]}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
          <div className="card-sm" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>Status</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>{status}</div>
          </div>
          <div className="card-sm" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>Renews</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>{renewsAt ?? "N/A"}</div>
          </div>
        </div>

        {error ? (
          <div className="badge red" style={{ marginBottom: 10 }}>
            {error}
          </div>
        ) : null}

        <button className="btn btn-primary" type="button" onClick={openBillingPortal} disabled={loading}>
          {loading ? "Opening billing portal..." : "Open Stripe Billing Portal"}
        </button>
      </div>

      <div className="card empty-state">
        <p>
          Need to change plans? Go to <a href="/upgrade">Upgrade</a>.
        </p>
      </div>
    </div>
  );
}
