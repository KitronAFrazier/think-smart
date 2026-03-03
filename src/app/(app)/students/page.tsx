import { BookOpen, Flame, Pencil, Sparkles } from "lucide-react";
import { getStudentsData } from "@/lib/server-data";

export default async function StudentsPage() {
  const { students, grades } = await getStudentsData();
  const activeStudent = students[0];

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1>My Students</h1>
            <p>{students.length} students enrolled · School Year 2025–2026</p>
          </div>
          <button className="btn btn-gold" type="button">
            Add Student
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 20 }}>
        {students.map((student, index) => {
          const values = Object.values(student.progress);
          const avg = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

          return (
            <div
              className={`student-card ${index === 0 ? "active" : ""}`}
              key={student.name}
              style={
                index === 0
                  ? {
                      borderColor: "var(--blue)",
                      boxShadow: "0 0 0 3px rgba(37,99,235,0.1)",
                    }
                  : undefined
              }
            >
              <div className="student-avatar" style={{ background: "var(--surface-2)", fontSize: "0.88rem", fontWeight: 700 }}>
                {student.avatar}
              </div>
              <div className="student-name">{student.name}</div>
              <div className="student-grade">{student.grade}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>Avg Grade</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700 }}>{avg}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill blue" style={{ width: `${avg}%` }}></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: "0.75rem", color: "var(--text-3)" }}>
                <span>{student.streak} day streak</span>
                <span>{student.xp.toLocaleString()} XP</span>
              </div>
            </div>
          );
        })}
      </div>

      {activeStudent ? (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: "var(--surface-2)",
                border: "2px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              {activeStudent.avatar}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700 }}>{activeStudent.name}</div>
              <div style={{ color: "var(--text-3)" }}>{activeStudent.grade}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span className="badge gold">
                  <Flame className="icon-svg" /> {activeStudent.streak}-day streak
                </span>
                <span className="badge purple">
                  <Sparkles className="icon-svg" /> {activeStudent.xp.toLocaleString()} XP
                </span>
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="btn btn-secondary btn-sm" type="button">
                <Pencil className="icon-svg" /> Edit
              </button>
              <a className="btn btn-primary btn-sm" href="/planner">
                <BookOpen className="icon-svg" /> Planner
              </a>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <div className="section-title" style={{ marginBottom: 14 }}>
                Subject Progress
              </div>
              {Object.entries(activeStudent.progress).map(([subject, percent]) => (
                <div style={{ marginBottom: 12 }} key={subject}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 5 }}>
                    <span style={{ color: "var(--text-2)" }}>{subject}</span>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{percent}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill blue" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="section-title" style={{ marginBottom: 14 }}>
                Recent Activity
              </div>
              {grades
                .filter((grade) => grade.student === activeStudent.name)
                .slice(0, 4)
                .map((grade) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--border)" }} key={`${grade.lesson}-${grade.date}`}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{grade.lesson}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
                        {grade.subject} · {grade.date}
                      </div>
                    </div>
                    <span className="badge blue">{grade.letter}</span>
                  </div>
                ))}
              <a className="btn btn-ghost btn-sm" href="/progress" style={{ marginTop: 10, width: "100%" }}>
                View all grades →
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="card empty-state">
          <p>No students yet. Add your first student to get started.</p>
        </div>
      )}
    </div>
  );
}
