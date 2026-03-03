// ===== PLANNER PAGE =====
function renderPlanner(container) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dates = ['Feb 24', 'Feb 25', 'Feb 26', 'Feb 27', 'Feb 28'];
  const subjects = ['Math', 'Language Arts', 'Science', 'Social Studies', 'Art', 'Music'];
  const colors = { Math: '#2563EB', 'Language Arts': '#10B981', Science: '#7C3AED', 'Social Studies': '#F59E0B', Art: '#EF4444', Music: '#EC4899' };
  const bgColors = { Math: '#EFF6FF', 'Language Arts': '#ECFDF5', Science: '#F5F3FF', 'Social Studies': '#FFFBEB', Art: '#FEF2F2', Music: '#FDF2F8' };

  const schedule = {
    0: [
      { sub: 'Math', title: 'Fractions Review', student: 'Emma', done: true },
      { sub: 'Language Arts', title: 'Grammar Worksheet', student: 'Sophie', done: true },
    ],
    1: [
      { sub: 'Science', title: 'Ecosystems Lab', student: 'Sophie', done: true },
      { sub: 'Math', title: 'Addition to 20', student: 'Liam', done: true },
    ],
    2: [
      { sub: 'Social Studies', title: 'Texas History', student: 'Emma', done: true },
      { sub: 'Language Arts', title: 'Reading Ch.4', student: 'Liam', done: false },
    ],
    3: [
      { sub: 'Math', title: 'Multiplication Practice', student: 'Emma', done: false },
      { sub: 'Science', title: 'Animal Habitats', student: 'Liam', done: false },
      { sub: 'Language Arts', title: 'Essay Draft', student: 'Sophie', done: false },
    ],
    4: [
      { sub: 'Art', title: 'Watercolor Project', student: 'Emma', done: false },
      { sub: 'Music', title: 'Piano Practice', student: 'Sophie', done: false },
    ]
  };

  const weekCols = days.map((day, i) => {
    const lessons = schedule[i] || [];
    const isToday = i === 3;
    return `
      <div style="flex:1;min-width:0">
        <div style="text-align:center;padding:10px 6px;border-radius:10px;margin-bottom:8px;background:${isToday ? 'var(--blue)' : 'var(--surface-2)'};border:1px solid ${isToday ? 'var(--blue)' : 'var(--border)'}">
          <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${isToday ? '#fff' : 'var(--text-3)'}">
            ${day.slice(0,3)}
          </div>
          <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:${isToday ? '#fff' : 'var(--text)'}">
            ${dates[i].split(' ')[1]}
          </div>
          <div style="font-size:0.68rem;color:${isToday ? 'rgba(255,255,255,0.7)' : 'var(--text-3)'}">
            ${dates[i].split(' ')[0]}
          </div>
        </div>
        ${lessons.map(l => `
          <div style="background:${bgColors[l.sub] || 'var(--surface-2)'};border:1px solid ${colors[l.sub]}33;border-left:3px solid ${colors[l.sub]};border-radius:8px;padding:10px;margin-bottom:8px;cursor:pointer;opacity:${l.done ? '0.55' : '1'};transition:all 0.2s" onclick="hp_showToast('${l.title} details','📖')">
            <div style="font-size:0.72rem;font-weight:600;color:${colors[l.sub]};text-transform:uppercase;letter-spacing:0.04em">${l.sub}</div>
            <div style="font-size:0.82rem;font-weight:500;color:#1a1a2e;margin-top:2px;${l.done ? 'text-decoration:line-through;' : ''}">${l.title}</div>
            <div style="font-size:0.7rem;color:#6b7280;margin-top:4px">${l.student} ${l.done ? '· ✓ Done' : ''}</div>
          </div>
        `).join('')}
        <button onclick="hp_openAddLesson()" style="width:100%;padding:8px;background:transparent;border:1px dashed var(--border);border-radius:8px;color:var(--text-3);font-size:0.78rem;cursor:pointer;transition:all 0.2s" 
          onmouseover="this.style.background='var(--surface-2)'" 
          onmouseout="this.style.background='transparent'">
          + Add
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div>
            <h1>Lesson Planner</h1>
            <p>Week of February 24 – 28, 2026</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-secondary btn-sm" onclick="hp_showToast('Previous week','◀')">◀ Prev</button>
            <button class="btn btn-primary btn-sm">Today</button>
            <button class="btn btn-secondary btn-sm" onclick="hp_showToast('Next week','▶')">Next ▶</button>
            <button class="btn btn-gold btn-sm" onclick="hp_openAddLesson()">+ Add Lesson</button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="tabs" style="margin-bottom:16px">
          <button class="tab active" onclick="this.parentElement.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));this.classList.add('active')">Week View</button>
          <button class="tab" onclick="hp_showToast('Month view coming soon!','📅')">Month View</button>
          <button class="tab" onclick="hp_showToast('List view coming soon!','📋')">List View</button>
        </div>
        <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:4px">
          ${weekCols}
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="section-header">
            <div class="section-title">Subjects Overview</div>
          </div>
          ${subjects.map(s => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
              <div style="width:10px;height:10px;border-radius:50%;background:${colors[s]};flex-shrink:0"></div>
              <span style="flex:1;font-size:0.88rem">${s}</span>
              <span class="badge blue" style="background:${bgColors[s]};color:${colors[s]}">
                ${Math.floor(Math.random()*3)+2} lessons/wk
              </span>
            </div>
          `).join('')}
        </div>
        <div class="card">
          <div class="section-header">
            <div class="section-title">Upcoming This Week</div>
          </div>
          ${HP.state.tasks.map(t => `
            <div class="task-item">
              <div class="task-check ${t.done ? 'done' : ''}" onclick="hp_toggleTask(${t.id})"></div>
              <div style="flex:1">
                <div class="task-text ${t.done ? 'done' : ''}">${t.title}</div>
                <div class="task-subject" style="color:${colors[t.subject] || 'var(--text-3)'}">${t.subject}</div>
              </div>
              <span class="badge ${t.done ? 'green' : 'gray'}">${t.done ? 'Done' : t.due}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
