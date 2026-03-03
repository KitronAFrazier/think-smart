import PlanGate from "@/components/app/PlanGate";
import { getCurrentPlan } from "@/lib/current-plan";
import { getTxLawsData } from "@/lib/server-data";

export default async function TxLawsPage() {
  const currentPlan = await getCurrentPlan();
  const { laws } = await getTxLawsData();

  return (
    <PlanGate requiredPlan="family_plus" currentPlan={currentPlan}>
      <div className="page">
        <div className="page-header">
          <h1>Texas Homeschool Laws & Options</h1>
          <p>Know your rights · Updated February 2026 · Source: THSC.org</p>
        </div>

        <div style={{ background: "linear-gradient(135deg,#0F2240,#1A3560)", borderRadius: "var(--radius)", padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: 8 }}>
            Texas is a Homeschool-Friendly State
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: 600 }}>
            Under Leeper v. Arlington ISD (1994), Texas homeschools are legally classified as private schools. Parents have broad
            freedom to educate their children without state oversight, registration, or testing requirements.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16, marginBottom: 28 }}>
          {laws.map((item, index) => (
            <div className="card" key={item.q}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "var(--blue)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.4, marginBottom: 6 }}>{item.q}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-2)", lineHeight: 1.6 }}>{item.a}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>
            Your Texas Homeschool Checklist
          </div>
          {[
            "Withdraw your child from public school in writing (if applicable)",
            "Choose a bona fide curriculum covering required subjects",
            "Keep attendance records",
            "Keep grade and progress records",
            "Check ESA+ eligibility at tea.texas.gov",
          ].map((text) => (
            <div className="task-item" key={text}>
              <div className="task-check"></div>
              <div className="task-text">{text}</div>
            </div>
          ))}
        </div>
      </div>
    </PlanGate>
  );
}
