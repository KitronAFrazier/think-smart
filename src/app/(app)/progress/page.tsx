import { Download, Filter, FileText } from "lucide-react";
import { getProgressData } from "@/lib/server-data";

export default async function ProgressPage() {
  const { grades, students } = await getProgressData();

  const letterColor: Record<string, string> = {
    "A+": "green",
    A: "green",
    "A-": "green",
    "B+": "blue",
    B: "blue",
    "B-": "blue",
    "C+": "gold",
    C: "gold",
    "C-": "gold",
    D: "red",
    F: "red",
  };

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1>Progress & Grades</h1>
            <p>2025–2026 School Year · All Students</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" type="button">
              <Filter className="icon-svg" /> Filter
            </button>
            <button className="btn btn-primary btn-sm" type="button">
              <Download className="icon-svg" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {students.map((student) => {
          const rowGrades = grades.filter((grade) => grade.student === student.name);
          const avg = rowGrades.length
            ? Math.round(rowGrades.reduce((sum, row) => sum + row.grade, 0) / rowGrades.length)
            : 0;

          return (
            <div className="stat-card blue" key={student.name}>
              <div className="stat-icon blue" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                {student.avatar}
              </div>
              <div>
                <div className="stat-value">{avg}%</div>
                <div className="stat-label">
                  {student.name} · {student.grade}
                </div>
                <div className="stat-change">Letter Grade: {avg >= 90 ? "A" : avg >= 80 ? "B" : avg >= 70 ? "C" : "D"}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="section-header">
          <div className="section-title">Grade History</div>
          <button className="btn btn-secondary btn-sm" type="button">
            <FileText className="icon-svg" /> Add Grade
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Subject</th>
                <th>Assignment</th>
                <th>Letter</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={`${grade.student}-${grade.lesson}-${grade.date}`}>
                  <td>{grade.student}</td>
                  <td>{grade.subject}</td>
                  <td>{grade.lesson}</td>
                  <td>
                    <span className={`badge ${letterColor[grade.letter] || "gray"}`}>{grade.letter}</span>
                  </td>
                  <td>
                    <strong>{grade.grade}</strong>
                    <span style={{ color: "var(--text-3)" }}>/100</span>
                  </td>
                  <td style={{ color: "var(--text-3)" }}>{grade.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
