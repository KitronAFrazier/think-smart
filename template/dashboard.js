// ===== DASHBOARD PAGE =====
function renderDashboard(container) {
  const doneCount = HP.state.tasks.filter(t => t.done).length;
  const totalCount = HP.state.tasks.length;

  // Build calendar
  const daysInMonth = 31;
  const startDay = 0; // March 2025 starts Sunday
  const attendedDays = HP.attendance.March.filter(d => d.present).map(d => d.day);
  let calCells = '';
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
    calCells += `<div class="cal-day-name">${d}</div>`;
  });
  for (let i = 0; i < startDay; i++) calCells += `<div class="cal-day other-month"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === 27;
    const attended = attendedDays.includes(d);
    const hasEvent = [5, 12, 19, 26].includes(d);
    const cls = [
      'cal-day',
      isToday ? 'today' : '',
      !isToday && attended ? 'attended' : '',
      hasEvent && !isToday ? 'has-event' : ''
    ].filter(Boolean).join(' ');
    calCells += `<div class="${cls}">${d}</div>`;
  }

  const taskItems = HP.state.tasks.map(t => `
    <div class="task-item">
      <div class="task-check ${t.done ? 'done' : ''}" onclick="hp_toggleTask(${t.id})"></div>
      <div style="flex:1">
        <div class="task-text ${t.done ? 'done' : ''}">${t.title}</div>
        <div class="task-subject">${t.subject} · ${t.student}</div>
      </div>
      <div class="task-meta">${t.due}</div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>Good morning, Sarah ☀️</h1>
        <p>Friday, February 27, 2026 · Week 22 of School Year</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-icon blue">👧</div>
          <div>
            <div class="stat-value">3</div>
            <div class="stat-label">Students Enrolled</div>
            <div class="stat-change">↑ 3 active today</div>
          </div>
        </div>
        <div class="stat-card gold">
          <div class="stat-icon gold">📚</div>
          <div>
            <div class="stat-value">${doneCount}/${totalCount}</div>
            <div class="stat-label">Tasks Today</div>
            <div class="stat-change">${Math.round(doneCount/totalCount*100)}% complete</div>
          </div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon green">📆</div>
          <div>
            <div class="stat-value">18</div>
            <div class="stat-label">School Days (March)</div>
            <div class="stat-change">↑ 2 days excused</div>
          </div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon purple">🏆</div>
          <div>
            <div class="stat-value">87%</div>
            <div class="stat-label">Avg Grade This Month</div>
            <div class="stat-change">↑ +4% from last month</div>
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:20px">
        <div class="card">
          <div class="section-header">
            <div class="section-title">Today's Tasks</div>
            <div class="section-link" onclick="hp_navigate('planner')">View all →</div>
          </div>
          ${taskItems}
          <div style="margin-top:16px">
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-3);margin-bottom:6px">
              <span>Daily progress</span><span>${doneCount}/${totalCount} complete</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill blue" style="width:${Math.round(doneCount/totalCount*100)}%"></div>
            </div>
          </div>
        </div>

        <div>
          <div class="card" style="margin-bottom:16px">
            <div class="section-header">
              <div class="section-title">March Attendance</div>
              <div class="section-link" onclick="hp_navigate('progress')">View report →</div>
            </div>
            <div style="margin-bottom:10px;display:flex;gap:8px;flex-wrap:wrap">
              <span class="badge green">● 18 Days Present</span>
              <span class="badge red">● 2 Absent</span>
              <span class="badge gray">● 11 Remaining</span>
            </div>
            <div class="cal-grid">${calCells}</div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="section-header">
            <div class="section-title">Student Progress</div>
            <div class="section-link" onclick="hp_navigate('students')">Manage →</div>
          </div>
          ${HP.students.map(s => {
            const subjects = Object.keys(s.progress);
            const avg = Math.round(subjects.reduce((a, k) => a + s.progress[k], 0) / subjects.length);
            return `
              <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
                <div style="width:40px;height:40px;border-radius:12px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">${s.avatar}</div>
                <div style="flex:1">
                  <div style="font-weight:600;font-size:0.9rem">${s.name} <span style="font-weight:400;color:var(--text-3)">· ${s.grade}</span></div>
                  <div class="progress-bar" style="margin-top:6px">
                    <div class="progress-fill blue" style="width:${avg}%"></div>
                  </div>
                </div>
                <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--text)">${avg}%</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="card">
          <div class="section-header">
            <div class="section-title">Quick Actions</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            ${[
              ['📚', 'Add Lesson', 'hp_openAddLesson()'],
              ['📆', 'Log Attendance', "hp_showToast('Attendance logged!','📆')"],
              ['📊', 'Export Report', 'hp_openReport()'],
              ['👩‍🏫', 'Find Teacher', "hp_navigate('community')"],
              ['🏆', 'View Grades', "hp_navigate('progress')"],
              ['🌟', 'Scholarships', "hp_navigate('resources')"],
            ].map(([icon, label, action]) => `
              <button class="btn btn-secondary" onclick="${action}" style="justify-content:flex-start;width:100%">
                <span>${icon}</span> <span style="font-size:0.82rem">${label}</span>
              </button>
            `).join('')}
          </div>

          <div class="divider"></div>
          <div class="section-title" style="margin-bottom:12px">Community Activity</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${[
              ['🗺️', 'New co-op in Katy Zone: "West Houston STEM"', '2h ago'],
              ['👩‍🏫', 'Dr. Patel (Math/Science) joined — Zone 3', '5h ago'],
              ['📋', 'Field trip posted: Houston Museum of Natural Science', '1d ago'],
            ].map(([icon, text, time]) => `
              <div style="display:flex;align-items:flex-start;gap:10px;font-size:0.82rem">
                <span style="font-size:1rem;margin-top:1px">${icon}</span>
                <div style="flex:1;color:var(--text-2)">${text}</div>
                <div style="color:var(--text-3);white-space:nowrap">${time}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
