"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Flame, Trophy } from "lucide-react";
import { mockStudentTasks, mockStudents } from "@/lib/mock-data";

const panelLabels: Record<string, string> = {
  curriculum: "Grade Curriculum",
  "practice-quizzes": "Practice Quizzes",
  "final-test": "Final Test",
  "game-numbers": "Numbers Game",
  "game-spelling-typing": "Spelling & Typing Games",
  "game-coding": "Coding Games",
  "game-history": "History Games",
  points: "Points & Rewards",
};

export default function StudentAppView() {
  const searchParams = useSearchParams();
  const activePanel = searchParams.get("panel") ?? "curriculum";
  const student = mockStudents[0];
  const [tasks, setTasks] = useState(mockStudentTasks);

  const doneCount = tasks.filter((task) => task.done).length;
  const assignmentXP = tasks.filter((task) => task.done).reduce((sum, task) => sum + task.xp, 0);
  const gameXP = 120;
  const quizXP = 90;
  const testXP = 140;
  const totalXP = student.xp + assignmentXP + gameXP + quizXP + testXP;
  const totalPossible = tasks.reduce((sum, task) => sum + task.xp, 0);
  const subjectProgs = useMemo(() => Object.entries(student.progress).slice(0, 4), [student.progress]);

  function toggleTask(id: number) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }

  return (
    <div className="page">
      <div className="student-app">
        <div className="student-topbar">
          <Link className="student-back" href="/dashboard">
            Parent View
          </Link>
          <div className="student-avatar-big">{student.avatar}</div>
          <div className="student-xp">{totalXP.toLocaleString()} XP</div>
        </div>

        <div className="student-body">
          <div className="student-greeting">
            <h2>Hey {student.name}!</h2>
            <p>{student.grade} learner · {panelLabels[activePanel] ?? "Student Dashboard"} · {doneCount}/{tasks.length} tasks done</p>
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
              <div style={{ color: "#FCD34D", fontWeight: 700, fontSize: "1.1rem" }}>{assignmentXP}/{totalPossible} Assignment XP</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>+{gameXP + quizXP + testXP} from games, quizzes, and tests</div>
            </div>
          </div>

          <div className="student-panel-card">
            <h3>{panelLabels[activePanel] ?? "Student Dashboard"}</h3>
            {activePanel === "curriculum" ? (
              <p>
                Curriculum for {student.grade}: Mathematics, Language Arts, Science, Social Studies, Spelling, Grammar, and Good Citizenship.
              </p>
            ) : null}
            {activePanel === "practice-quizzes" ? <p>Practice quizzes are available for Math facts, Reading comprehension, and Science review.</p> : null}
            {activePanel === "final-test" ? <p>Final tests are unlocked after completing all weekly practice quizzes.</p> : null}
            {activePanel === "game-numbers" ? (
              <>
                <p>Number games: multiplication sprint, fractions challenge, and mental math race.</p>
                <Link className="btn btn-primary btn-sm" href="/game">
                  Play Numbers Game
                </Link>
              </>
            ) : null}
            {activePanel === "game-spelling-typing" ? <p>Spelling & typing games: word builder, sentence scramble, and typing speed drills.</p> : null}
            {activePanel === "game-coding" ? <p>Coding games: logic puzzles, block coding quests, and debugging mini-missions.</p> : null}
            {activePanel === "game-history" ? <p>History games: timeline quest, state facts challenge, and civics trivia rounds.</p> : null}
            {activePanel === "points" ? (
              <ul>
                <li>Assignments completed: +{assignmentXP} XP</li>
                <li>Game scores: +{gameXP} XP</li>
                <li>Practice quizzes: +{quizXP} XP</li>
                <li>Final tests: +{testXP} XP</li>
              </ul>
            ) : null}
          </div>

          <div style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: "0.85rem", marginBottom: 10 }}>Today&apos;s Assignments</div>
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

          <div className="student-awards-card">
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>
              <Trophy className="icon-svg" />
            </div>
            <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>My Badges</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              {["Bookworm", "Math Whiz", "Scientist", "10-Day Streak", "1000 XP"].map((badge) => (
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
