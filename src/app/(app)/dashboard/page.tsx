import { CalendarDays, ChartColumn, FileText, GraduationCap, School, Trophy } from "lucide-react";
import DashboardHeader from "@/components/app/DashboardHeader";
import { getDashboardData } from "@/lib/server-data";
import { getServerUserPreferences } from "@/lib/user-preferences";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default async function DashboardPage() {
  const [{ username, students, tasks, attendance }, preferences] = await Promise.all([
    getDashboardData(),
    getServerUserPreferences(),
  ]);
  const doneCount = tasks.filter((task) => task.done).length;
  const totalCount = tasks.length || 1;
  const displayName = preferences.displayName?.trim() || username;
  const schoolYearStartDate = preferences.schoolYearStartDate ?? null;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  return (
    <div className="page">
      <DashboardHeader displayName={displayName} schoolYearStartDate={schoolYearStartDate} />

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue">
            <GraduationCap className="icon-svg" />
          </div>
          <div>
            <div className="stat-value">{students.length}</div>
            <div className="stat-label">Students Enrolled</div>
            <div className="stat-change">{students.length} active this week</div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon gold">
            <School className="icon-svg" />
          </div>
          <div>
            <div className="stat-value">
              {doneCount}/{totalCount}
            </div>
            <div className="stat-label">Tasks Today</div>
            <div className="stat-change">{Math.round((doneCount / totalCount) * 100)}% complete</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon green">
            <CalendarDays className="icon-svg" />
          </div>
          <div>
            <div className="stat-value">{attendance.present}</div>
            <div className="stat-label">School Days (This Month)</div>
            <div className="stat-change">{attendance.absent} days absent</div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon purple">
            <Trophy className="icon-svg" />
          </div>
          <div>
            <div className="stat-value">87%</div>
            <div className="stat-label">Avg Grade This Month</div>
            <div className="stat-change">+4% from last month</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-header">
            <div className="section-title">Today&apos;s Tasks</div>
            <a className="section-link" href="/planner">
              View all →
            </a>
          </div>

          {tasks.map((task) => (
            <div className="task-item" key={task.id}>
              <div className={`task-check ${task.done ? "done" : ""}`}></div>
              <div style={{ flex: 1 }}>
                <div className={`task-text ${task.done ? "done" : ""}`}>{task.title}</div>
                <div className="task-subject">
                  {task.subject} · {task.student}
                </div>
              </div>
              <div className="task-meta">{task.due}</div>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8rem",
                color: "var(--text-3)",
                marginBottom: 6,
              }}
            >
              <span>Daily progress</span>
              <span>
                {doneCount}/{totalCount} complete
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill blue" style={{ width: `${Math.round((doneCount / totalCount) * 100)}%` }}></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <div className="section-title">Monthly Attendance</div>
            <a className="section-link" href="/progress">
              View report →
            </a>
          </div>

          <div style={{ marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge green">{attendance.present} Days Present</span>
            <span className="badge red">{attendance.absent} Absent</span>
            <span className="badge gray">{attendance.remaining} Remaining</span>
          </div>

          <div className="cal-grid">
            {WEEK_DAYS.map((day) => (
              <div className="cal-day-name" key={day}>
                {day}
              </div>
            ))}
            {Array.from({ length: startDay }).map((_, index) => (
              <div className="cal-day other-month" key={`pad-${index}`}></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isToday = day === today.getDate();
              return (
                <div className={`cal-day ${isToday ? "today" : ""}`} key={day}>
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <div className="section-title">Student Progress</div>
            <a className="section-link" href="/students">
              Manage →
            </a>
          </div>

          {students.map((student) => {
            const values = Object.values(student.progress);
            const avg = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

            return (
              <div key={student.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "var(--surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {student.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {student.name} <span style={{ fontWeight: 400, color: "var(--text-3)" }}>· {student.grade}</span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: 6 }}>
                    <div className="progress-fill blue" style={{ width: `${avg}%` }}></div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>{avg}%</div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="section-header">
            <div className="section-title">Quick Actions</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <a href="/planner" className="btn btn-secondary" style={{ justifyContent: "flex-start", width: "100%" }}>
              <CalendarDays className="icon-svg" /> Planner
            </a>
            <a href="/progress" className="btn btn-secondary" style={{ justifyContent: "flex-start", width: "100%" }}>
              <ChartColumn className="icon-svg" /> Grades
            </a>
            <a href="/community" className="btn btn-secondary" style={{ justifyContent: "flex-start", width: "100%" }}>
              <GraduationCap className="icon-svg" /> Find Teacher
            </a>
            <a href="/resources" className="btn btn-secondary" style={{ justifyContent: "flex-start", width: "100%" }}>
              <FileText className="icon-svg" /> Resources
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
