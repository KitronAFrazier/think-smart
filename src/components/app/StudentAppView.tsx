"use client";

import { useMemo, useState } from "react";
import { Check, Flame, Trophy } from "lucide-react";
import { mockStudentTasks, mockStudents } from "@/lib/mock-data";

export default function StudentAppView() {
  const student = mockStudents[0];
  const [tasks, setTasks] = useState(mockStudentTasks);

  const doneCount = tasks.filter((task) => task.done).length;
  const totalXP = tasks.filter((task) => task.done).reduce((sum, task) => sum + task.xp, 0);
  const totalPossible = tasks.reduce((sum, task) => sum + task.xp, 0);

  const subjectProgs = useMemo(() => Object.entries(student.progress).slice(0, 4), [student.progress]);

  function toggleTask(id: number) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }

  return (
    <div className="page">
      <div className="student-app">
        <div className="student-topbar">
          <a className="student-back" href="/dashboard">
            Parent View
          </a>
          <div className="student-avatar-big">{student.avatar}</div>
          <div className="student-xp">{(student.xp + totalXP).toLocaleString()} XP</div>
        </div>

        <div className="student-body">
          <div className="student-greeting">
            <h2>Hey {student.name}!</h2>
            <p>
              {doneCount} of {tasks.length} tasks done today
            </p>
          </div>

          <div className="streak-bar">
            <div className="streak-fire">
              <Flame className="icon-svg" />
            </div>
            <div>
              <div className="streak-num">{student.streak}</div>
              <div className="streak-label">Day Streak</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ color: "#FCD34D", fontWeight: 700, fontSize: "1.1rem" }}>
                {totalXP}/{totalPossible} XP
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>earned today</div>
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "var(--radius)",
              padding: 8,
              marginBottom: 16,
            }}
          >
            <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 10, height: 10, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg,#FCD34D,#F97316)",
                  borderRadius: 10,
                  width: `${Math.round((doneCount / tasks.length) * 100)}%`,
                }}
              ></div>
            </div>
          </div>

          <div style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: "0.85rem", marginBottom: 10 }}>Today&apos;s Tasks</div>
          <div className="task-cards">
            {tasks.map((task) => (
              <button className={`task-card ${task.done ? "done-card" : ""}`} key={task.id} type="button" onClick={() => toggleTask(task.id)}>
                <div className="task-card-icon" style={{ background: "#DBEAFE" }}>
                  {task.subject.slice(0, 1)}
                </div>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div className="task-card-title">{task.title}</div>
                  <div className="task-card-sub">
                    {task.subject} · +{task.xp} XP
                  </div>
                </div>
                <div className={`task-card-check ${task.done ? "checked" : ""}`}>{task.done ? <Check className="icon-svg" /> : null}</div>
              </button>
            ))}
          </div>

          <div className="progress-section">
            <h3>My Progress</h3>
            {subjectProgs.map(([subject, percent]) => (
              <div className="subject-prog" key={subject}>
                <div className="subject-prog-header">
                  <span>{subject}</span>
                  <span>{percent}%</span>
                </div>
                <div className="subject-prog-bar">
                  <div className="subject-prog-fill" style={{ width: `${percent}%`, background: "#3B82F6" }}></div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "var(--radius)",
              padding: 20,
              marginTop: 16,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>
              <Trophy className="icon-svg" />
            </div>
            <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>My Badges</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              {[
                "Bookworm",
                "Math Whiz",
                "Scientist",
                "10-Day Streak",
                "1000 XP",
              ].map((badge) => (
                <div key={badge} style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 12px" }}>
                  <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.8)", marginTop: 3 }}>{badge}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
