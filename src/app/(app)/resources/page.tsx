import { Bookmark } from "lucide-react";
import PlanGate from "@/components/app/PlanGate";
import { getCurrentPlan } from "@/lib/current-plan";
import { getResourcesData } from "@/lib/server-data";

export default async function ResourcesPage() {
  const currentPlan = await getCurrentPlan();
  const { categories, savedResources } = await getResourcesData();

  return (
    <PlanGate requiredPlan="family" currentPlan={currentPlan}>
      <div className="page">
        <div className="page-header">
          <h1>Resources</h1>
          <p>Scholarships, local activities, curriculum, and field trips for Texas homeschoolers.</p>
        </div>

        {savedResources.length ? (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-header">
              <div className="section-title">Saved Resources (Supabase)</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
              {savedResources.map((resource) => (
                <div className="resource-card" key={`${resource.title}-${resource.url}`}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>{resource.title}</div>
                    <span className="badge blue">{resource.category}</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-3)", marginBottom: 10 }}>{resource.description}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--blue)" }}>{resource.url}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card empty-state" style={{ marginBottom: 24 }}>
            <div className="icon">
              <Bookmark className="icon-svg" />
            </div>
            <p>No saved resources yet. Save useful links from this page and they will show up here.</p>
          </div>
        )}

        {categories.map((category) => (
          <div style={{ marginBottom: 28 }} key={category.title}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 600, marginBottom: 14 }}>{category.title}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 12 }}>
              {category.items.map((item) => (
                <div className="resource-card" key={item.name}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.3 }}>{item.name}</div>
                    <span className="badge blue" style={{ flexShrink: 0, fontSize: "0.65rem" }}>
                      {item.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.5, marginBottom: 10 }}>{item.desc}</div>
                  {item.link ? <div style={{ fontSize: "0.75rem", color: "var(--blue)" }}>{item.link}</div> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PlanGate>
  );
}
