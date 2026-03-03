// ===== PROGRESS & GRADES PAGE =====
function renderProgress(container) {
  const letterColor = { 'A+': 'green', 'A': 'green', 'A-': 'green', 'B+': 'blue', 'B': 'blue', 'B-': 'blue', 'C+': 'gold', 'C': 'gold', 'C-': 'gold', 'D': 'red', 'F': 'red' };

  const gradeRows = HP.grades.map(g => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:1rem">${HP.students.find(s=>s.name===g.student)?.avatar||'👤'}</span>
        <span>${g.student}</span>
      </div></td>
      <td>${g.subject}</td>
      <td>${g.lesson}</td>
      <td><span class="badge ${letterColor[g.letter] || 'gray'}">${g.letter}</span></td>
      <td><strong>${g.grade}</strong><span style="color:var(--text-3)">/100</span></td>
      <td style="color:var(--text-3)">${g.date}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div>
            <h1>Progress & Grades</h1>
            <p>2025–2026 School Year · All Students</p>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" onclick="hp_showToast('Filter applied','🔍')">Filter</button>
            <button class="btn btn-primary btn-sm" onclick="hp_openReport()">📥 Export PDF</button>
          </div>
        </div>
      </div>

      <div class="stats-grid" style="margin-bottom:24px">
        ${HP.students.map(s => {
          const avg = Math.round(Object.values(s.progress).reduce((a,b)=>a+b,0)/Object.keys(s.progress).length);
          const letter = avg >= 90 ? 'A' : avg >= 80 ? 'B' : avg >= 70 ? 'C' : 'D';
          return `
            <div class="stat-card ${avg >= 90 ? 'green' : avg >= 80 ? 'blue' : 'gold'}">
              <div style="font-size:2rem">${s.avatar}</div>
              <div>
                <div class="stat-value">${avg}%</div>
                <div class="stat-label">${s.name} · ${s.grade}</div>
                <div class="stat-change">Letter Grade: ${letter}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="grid-2" style="margin-bottom:24px">
        ${HP.students.map(s => {
          const subjectColors = { Math: 'blue', 'Language Arts': 'green', Science: 'purple', 'Social Studies': 'gold', Art: 'gold', Reading: 'green', Music: 'purple', Spanish: 'blue' };
          return `
            <div class="card">
              <div class="section-header">
                <div class="section-title">${s.avatar} ${s.name}'s Subjects</div>
                <span class="badge gray">${s.grade}</span>
              </div>
              ${Object.entries(s.progress).map(([sub, pct]) => `
                <div style="margin-bottom:10px">
                  <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px">
                    <span style="color:var(--text-2)">${sub}</span>
                    <span style="font-weight:600">${pct}% <span style="color:var(--text-3);font-weight:400">(${pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : 'D'})</span></span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill ${subjectColors[sub]||'blue'}" style="width:${pct}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
      </div>

      <div class="card">
        <div class="section-header">
          <div class="section-title">Grade History</div>
          <button class="btn btn-secondary btn-sm" onclick="hp_showToast('Add grade recorded!','✏️')">+ Add Grade</button>
        </div>
        <div class="table-wrap">
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
            <tbody>${gradeRows}</tbody>
          </table>
        </div>
      </div>

      <div class="card" style="margin-top:20px">
        <div class="section-header">
          <div class="section-title">Attendance Summary</div>
          <button class="btn btn-primary btn-sm" onclick="hp_openReport()">📄 Full Report</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">
          ${HP.students.map(s => `
            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:1.5rem;margin-bottom:6px">${s.avatar}</div>
              <div style="font-weight:600;margin-bottom:4px">${s.name}</div>
              <div style="font-size:0.8rem;color:var(--text-3)">Days Present</div>
              <div style="font-family:var(--font-display);font-size:1.6rem;font-weight:800;color:var(--green)">18</div>
              <div style="font-size:0.75rem;color:var(--text-3)">2 absent · 90% rate</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
