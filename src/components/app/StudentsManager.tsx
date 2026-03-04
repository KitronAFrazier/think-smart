"use client";

import { useMemo, useState } from "react";
import { BookOpen, Flame, Sparkles, Trash2, UserPlus, X } from "lucide-react";
import { safeJsonParse } from "@/lib/http";
import { getCurriculumForGrade, gradeCurriculum, gradeLevelOptions } from "@/lib/grade-curriculum";

type Student = {
  id: string;
  name: string;
  grade: string;
  avatar: string;
  xp: number;
  streak: number;
  progress: Record<string, number>;
};

type GradeRow = {
  student: string;
  subject: string;
  lesson: string;
  grade: number;
  letter: string;
  date: string;
};

type StudentsManagerProps = {
  initialStudents: Student[];
  grades: GradeRow[];
};

type CreateStudentResponse = {
  student?: Student;
  error?: string;
};

type UpdateStudentResponse = {
  student?: Student;
  error?: string;
};

type DeleteStudentResponse = {
  success?: boolean;
  error?: string;
};

export default function StudentsManager({ initialStudents, grades }: StudentsManagerProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialStudents[0]?.id ?? null);
  const [firstName, setFirstName] = useState("");
  const [gradeLevel, setGradeLevel] = useState<string>(gradeLevelOptions[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editGradeLevel, setEditGradeLevel] = useState<string>(gradeLevelOptions[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? students[0] ?? null,
    [selectedStudentId, students],
  );
  const activeCurriculum = activeStudent ? getCurriculumForGrade(activeStudent.grade) : undefined;

  function openAddStudentModal() {
    setFirstName("");
    setGradeLevel(gradeLevelOptions[0]);
    setError(null);
    setIsAddModalOpen(true);
  }

  function closeAddStudentModal() {
    if (saving) {
      return;
    }

    setIsAddModalOpen(false);
  }

  function startProfileEdit() {
    if (!activeStudent) {
      return;
    }

    setEditFirstName(activeStudent.name);
    setEditGradeLevel(activeStudent.grade);
    setError(null);
    setIsEditingProfile(true);
  }

  function cancelProfileEdit() {
    setIsEditingProfile(false);
    setError(null);
  }

  async function handleAddStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = firstName.trim();
    const trimmedGrade = gradeLevel.trim();

    if (!trimmedName || !trimmedGrade) {
      setError("First name and grade level are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: trimmedName, gradeLevel: trimmedGrade }),
      });

      const json = await safeJsonParse<CreateStudentResponse>(response);
      if (!response.ok || !json.student) {
        throw new Error(json.error ?? "Could not add student.");
      }

      setStudents((previous) => [...previous, json.student as Student]);
      setSelectedStudentId(json.student.id);
      setFirstName("");
      setGradeLevel(gradeLevelOptions[0]);
      setIsAddModalOpen(false);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not add student.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStudent() {
    if (!activeStudent) {
      return;
    }

    const trimmedName = editFirstName.trim();
    const trimmedGrade = editGradeLevel.trim();

    if (!trimmedName || !trimmedGrade) {
      setError("First name and grade level are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeStudent.id, firstName: trimmedName, gradeLevel: trimmedGrade }),
      });

      const json = await safeJsonParse<UpdateStudentResponse>(response);
      if (!response.ok || !json.student) {
        throw new Error(json.error ?? "Could not update student.");
      }

      setStudents((previous) =>
        previous.map((student) =>
          student.id === activeStudent.id ? { ...student, ...json.student, progress: student.progress } : student,
        ),
      );
      setIsEditingProfile(false);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update student.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveStudent(studentId: string) {
    const target = students.find((student) => student.id === studentId);
    const label = target?.name ?? "this student";

    if (!window.confirm(`Remove ${label}? This cannot be undone.`)) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/students?id=${encodeURIComponent(studentId)}`, {
        method: "DELETE",
      });

      const json = await safeJsonParse<DeleteStudentResponse>(response);
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Could not remove student.");
      }

      setStudents((previous) => {
        const remaining = previous.filter((student) => student.id !== studentId);
        setSelectedStudentId(remaining[0]?.id ?? null);
        return remaining;
      });
      setIsEditingProfile(false);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not remove student.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1>My Students</h1>
            <p>{students.length} students enrolled · Click a student card to view progress</p>
          </div>
          <button className="btn btn-gold" type="button" onClick={openAddStudentModal} disabled={saving}>
            <UserPlus className="icon-svg" /> Add Student
          </button>
        </div>
      </div>

      {error ? (
        <div className="badge red" style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      {isAddModalOpen ? (
        <div className="modal-overlay" onClick={closeAddStudentModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Student</div>
              <button className="modal-close" type="button" onClick={closeAddStudentModal} aria-label="Close add student modal" disabled={saving}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddStudent}>
              <div className="form-group">
                <label className="form-label" htmlFor="student-first-name">
                  First Name
                </label>
                <input
                  className="form-input"
                  id="student-first-name"
                  placeholder="First name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  disabled={saving}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="student-grade-level">
                  Grade Level
                </label>
                <select
                  className="form-select"
                  id="student-grade-level"
                  value={gradeLevel}
                  onChange={(event) => setGradeLevel(event.target.value)}
                  disabled={saving}
                  required
                >
                  {gradeLevelOptions.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary" type="button" onClick={closeAddStudentModal} style={{ flex: 1 }} disabled={saving}>
                  Cancel
                </button>
                <button className="btn btn-gold" type="submit" style={{ flex: 1 }} disabled={saving}>
                  {saving ? "Saving..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 20 }}>
        {students.map((student) => {
          const values = Object.values(student.progress);
          const avg = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
          const isActive = activeStudent?.id === student.id;

          return (
            <button
              className={`student-card ${isActive ? "active" : ""}`}
              key={student.id}
              type="button"
              onClick={() => {
                setSelectedStudentId(student.id);
                setIsEditingProfile(false);
                setError(null);
              }}
              style={
                isActive
                  ? {
                      borderColor: "var(--blue)",
                      boxShadow: "0 0 0 3px rgba(37,99,235,0.1)",
                      textAlign: "left",
                    }
                  : { textAlign: "left" }
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
            </button>
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
            <div style={{ minWidth: 240, flex: 1 }}>
              {isEditingProfile ? (
                <div style={{ display: "grid", gap: 8, maxWidth: 280 }}>
                  <input
                    className="form-input"
                    value={editFirstName}
                    onChange={(event) => setEditFirstName(event.target.value)}
                    disabled={saving}
                    aria-label="Edit student first name"
                  />
                  <select
                    className="form-select"
                    value={editGradeLevel}
                    onChange={(event) => setEditGradeLevel(event.target.value)}
                    disabled={saving}
                    aria-label="Edit student grade level"
                  >
                    {gradeLevelOptions.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700 }}>{activeStudent.name}</div>
                  <div style={{ color: "var(--text-3)" }}>{activeStudent.grade}</div>
                </>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span className="badge gold">
                  <Flame className="icon-svg" /> {activeStudent.streak}-day streak
                </span>
                <span className="badge purple">
                  <Sparkles className="icon-svg" /> {activeStudent.xp.toLocaleString()} XP
                </span>
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {isEditingProfile ? (
                <>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={cancelProfileEdit} disabled={saving}>
                    Cancel
                  </button>
                  <button className="btn btn-gold btn-sm" type="button" onClick={() => void handleUpdateStudent()} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <button className="btn btn-secondary btn-sm" type="button" onClick={startProfileEdit} disabled={saving}>
                  Edit
                </button>
              )}
              <a className="btn btn-primary btn-sm" href="/planner">
                <BookOpen className="icon-svg" /> Planner
              </a>
              <a className="btn btn-primary btn-sm" href={`/progress?student=${encodeURIComponent(activeStudent.name)}`}>
                View Progress
              </a>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => void handleRemoveStudent(activeStudent.id)} disabled={saving}>
                <Trash2 className="icon-svg" /> Remove
              </button>
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

          <div style={{ marginTop: 24 }}>
            <div className="section-title" style={{ marginBottom: 14 }}>
              {activeStudent.grade} Required Subjects & Classes
            </div>
            {activeCurriculum ? (
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="card" style={{ padding: 14 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: 10, color: "var(--text-2)" }}>Required Subjects</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-2)", display: "grid", gap: 6 }}>
                    {activeCurriculum.requiredSubjects.map((subject) => (
                      <li key={subject}>{subject}</li>
                    ))}
                  </ul>
                </div>
                <div className="card" style={{ padding: 14 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: 10, color: "var(--text-2)" }}>Suggested Classes</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-2)", display: "grid", gap: 6 }}>
                    {activeCurriculum.classes.map((className) => (
                      <li key={className}>{className}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="badge red">No curriculum template configured for this grade level.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="card empty-state">
          <p>No students yet. Add your first student to get started.</p>
        </div>
      )}

      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>
          K–8 Curriculum Breakdown
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {gradeCurriculum.map((grade) => (
            <div key={grade.label} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{grade.label}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-3)", marginBottom: 8 }}>
                Required: {grade.requiredSubjects.join(" · ")}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>Classes: {grade.classes.join(" · ")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
