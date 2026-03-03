"use client";

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PLAN_LABELS, type PlanTier } from "@/lib/plans";
import { safeJsonParse } from "@/lib/http";

type UpgradePlansProps = {
  currentPlan: PlanTier;
};

const plans: Array<{
  id: PlanTier;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyOnly?: boolean;
  minimumStudents?: number;
  description: string;
  features: string[];
}> = [
  {
    id: "free",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    description: "Core planning and tracking",
    features: ["Dashboard", "Students", "Planner", "Progress"],
  },
  {
    id: "family",
    monthlyPrice: "$19/mo",
    yearlyPrice: "$190/yr",
    description: "Community tools and saved resources",
    features: ["Everything in Free", "Community Hub", "Resources", "Priority support"],
  },
  {
    id: "family_plus",
    monthlyPrice: "$39/mo",
    yearlyPrice: "$390/yr",
    description: "Full platform with premium guidance",
    features: ["Everything in Family", "TX Laws deep dive", "Student App", "Early access"],
  },
  {
    id: "co_op",
    monthlyPrice: "Yearly only",
    yearlyPrice: "Co-Op yearly pricing",
    yearlyOnly: true,
    minimumStudents: 10,
    description: "For co-ops with 10+ students",
    features: ["Everything in Family Plus", "Co-Op management", "10+ student pricing"],
  },
];

type BillingInterval = "month" | "year";

export default function UpgradePlans({ currentPlan }: UpgradePlansProps) {
  const [pendingPlan, setPendingPlan] = useState<PlanTier | null>(null);
  const [billingIntervals, setBillingIntervals] = useState<Record<PlanTier, BillingInterval>>({
    free: "month",
    family: "month",
    family_plus: "month",
    co_op: "year",
  });
  const [activeCheckout, setActiveCheckout] = useState<{ plan: PlanTier; billingInterval: BillingInterval; studentCount?: number } | null>(null);
  const [coOpStudentCount, setCoOpStudentCount] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const stripePromise = useMemo(() => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      return null;
    }
    return loadStripe(publishableKey);
  }, []);

  async function handleCheckout(plan: PlanTier) {
    if (plan === "free") {
      return;
    }

    setPendingPlan(plan);
    setError(null);

    try {
      if (!stripePromise) {
        throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in environment.");
      }

      const billingInterval = plan === "co_op" ? "year" : billingIntervals[plan] ?? "month";
      const studentCount = Number(coOpStudentCount);

      if (plan === "co_op" && (!Number.isFinite(studentCount) || studentCount < 10)) {
        throw new Error("Co-Op pricing requires 10 or more students.");
      }

      setActiveCheckout({
        plan,
        billingInterval,
        studentCount: plan === "co_op" ? Math.floor(studentCount) : undefined,
      });
      setPendingPlan(null);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Could not start checkout.");
      setPendingPlan(null);
    }
  }

  async function fetchClientSecret() {
    if (!activeCheckout) {
      throw new Error("Checkout selection is missing.");
    }

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: activeCheckout.plan,
        billingInterval: activeCheckout.billingInterval,
        studentCount: activeCheckout.studentCount,
      }),
    });

    const json = await safeJsonParse<{ clientSecret?: string; error?: string }>(response);

    if (!response.ok || !json.clientSecret) {
      throw new Error(json.error ?? "Could not start checkout.");
    }

    return json.clientSecret;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Upgrade</h1>
        <p>Choose the right plan for your homeschool workflow.</p>
      </div>

      {error ? (
        <div className="badge red" style={{ marginBottom: 16 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;

          return (
            <div className="card" key={plan.id} style={isCurrent ? { borderColor: "var(--blue)", boxShadow: "0 0 0 3px rgba(37,99,235,0.1)" } : undefined}>
              <div className="section-header">
                <div className="section-title">{PLAN_LABELS[plan.id]}</div>
                {isCurrent ? <span className="badge blue">Current</span> : null}
              </div>
              {plan.id !== "free"
                ? plan.yearlyOnly
                  ? (
                    <div style={{ marginBottom: 8 }}>
                      <span className="badge blue">Yearly only</span>
                    </div>
                    )
                  : (
                    <div style={{ display: "inline-flex", gap: 6, marginBottom: 8 }}>
                      <button
                        className={`btn btn-sm ${billingIntervals[plan.id] === "month" ? "btn-primary" : "btn-secondary"}`}
                        type="button"
                        onClick={() => setBillingIntervals((previous) => ({ ...previous, [plan.id]: "month" }))}
                        disabled={pendingPlan !== null}
                      >
                        Monthly
                      </button>
                      <button
                        className={`btn btn-sm ${billingIntervals[plan.id] === "year" ? "btn-primary" : "btn-secondary"}`}
                        type="button"
                        onClick={() => setBillingIntervals((previous) => ({ ...previous, [plan.id]: "year" }))}
                        disabled={pendingPlan !== null}
                      >
                        Yearly
                      </button>
                    </div>
                    )
                : null}
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>
                {plan.yearlyOnly || billingIntervals[plan.id] === "year" ? plan.yearlyPrice : plan.monthlyPrice}
              </div>
              <div style={{ color: "var(--text-3)", fontSize: "0.85rem", marginBottom: 14 }}>{plan.description}</div>

              {plan.id === "co_op" ? (
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label" htmlFor="co-op-student-count">
                    Student count ({plan.minimumStudents}+)
                  </label>
                  <input
                    id="co-op-student-count"
                    className="form-input"
                    type="number"
                    min={plan.minimumStudents}
                    step={1}
                    value={coOpStudentCount}
                    onChange={(event) => setCoOpStudentCount(event.target.value)}
                    disabled={pendingPlan !== null}
                  />
                </div>
              ) : null}

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                {plan.features.map((feature) => (
                  <div key={feature} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem" }}>
                    <CheckCircle2 className="icon-svg" />
                    {feature}
                  </div>
                ))}
              </div>

              {plan.id === "free" ? (
                <button className="btn btn-secondary" style={{ width: "100%" }} type="button" disabled>
                  Free Plan
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  type="button"
                  disabled={isCurrent || pendingPlan !== null || (plan.id === "co_op" && Number(coOpStudentCount) < 10)}
                  onClick={() => handleCheckout(plan.id)}
                >
                  {pendingPlan === plan.id
                    ? "Preparing checkout..."
                    : isCurrent
                      ? "Current Plan"
                      : `Upgrade (${plan.yearlyOnly || billingIntervals[plan.id] === "year" ? "Yearly" : "Monthly"})`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {activeCheckout && stripePromise ? (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="section-header" style={{ marginBottom: 12 }}>
            <div className="section-title">
              Checkout: {PLAN_LABELS[activeCheckout.plan]} ({activeCheckout.billingInterval === "year" ? "Yearly" : "Monthly"})
            </div>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => setActiveCheckout(null)}>
              Close
            </button>
          </div>
          <EmbeddedCheckoutProvider
            key={`${activeCheckout.plan}-${activeCheckout.billingInterval}`}
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      ) : null}
    </div>
  );
}
