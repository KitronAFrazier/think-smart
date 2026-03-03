import { CalendarRange, ChevronLeft, ChevronRight, Layers3, ListChecks } from "lucide-react";
import { getPlannerData } from "@/lib/server-data";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const dates = ["Feb 24", "Feb 25", "Feb 26", "Feb 27", "Feb 28"];

export default async function PlannerPage() {
  const { tasks } = await getPlannerData();

  const schedule = days.map((_, index) => tasks.filter((_, taskIndex) => taskIndex % 5 === index));

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1>Lesson Planner</h1>
            <p>Week of February 24 – 28, 2026</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-secondary btn-sm" type="button">
              <ChevronLeft className="icon-svg" /> Prev
            </button>
            <button className="btn btn-primary btn-sm" type="button">
              Today
            </button>
            <button className="btn btn-secondary btn-sm" type="button">
              Next <ChevronRight className="icon-svg" />
            </button>
            <button className="btn btn-gold btn-sm" type="button">
              Add Lesson
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="tabs" style={{ marginBottom: 16 }}>
          <button className="tab active" type="button">
            <CalendarRange className="icon-svg" /> Week View
          </button>
          <button className="tab" type="button">
            <Layers3 className="icon-svg" /> Month View
          </button>
          <button className="tab" type="button">
            <ListChecks className="icon-svg" /> List View
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
          {days.map((day, index) => {
            const isToday = index === 3;
            const lessons = schedule[index] ?? [];

            return (
              <div style={{ flex: 1, minWidth: 0 }} key={day}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "10px 6px",
                    borderRadius: 10,
                    marginBottom: 8,
                    background: isToday ? "var(--blue)" : "var(--surface-2)",
                    border: `1px solid ${isToday ? "var(--blue)" : "var(--border)"}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: isToday ? "#fff" : "var(--text-3)",
                    }}
                  >
                    {day.slice(0, 3)}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: isToday ? "#fff" : "var(--text)",
                    }}
                  >
                    {dates[index].split(" ")[1]}
                  </div>
                </div>

                {lessons.map((lesson) => (
                  <div
                    key={`${day}-${lesson.id}`}
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderLeft: "3px solid var(--blue)",
                      borderRadius: 8,
                      padding: 10,
                      marginBottom: 8,
                      opacity: lesson.done ? "0.55" : "1",
                    }}
                  >
                    <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--blue)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {lesson.subject}
                    </div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text)", marginTop: 2 }}>{lesson.title}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-3)", marginTop: 4 }}>{lesson.student}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="section-title">Upcoming This Week</div>
        </div>
        {tasks.map((task) => (
          <div className="task-item" key={task.id}>
            <div className={`task-check ${task.done ? "done" : ""}`}></div>
            <div style={{ flex: 1 }}>
              <div className={`task-text ${task.done ? "done" : ""}`}>{task.title}</div>
              <div className="task-subject">{task.subject}</div>
            </div>
            <span className={`badge ${task.done ? "green" : "gray"}`}>{task.done ? "Done" : task.due}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
