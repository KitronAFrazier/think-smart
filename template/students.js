// ===== STUDENTS PAGE =====
function renderStudents(container) {
  const s = HP.students;

  function studentDetail(idx) {
    const st = s[idx];
    const subjectBars = Object.entries(st.progress).map(([sub, pct]) => {
      const colors = { Math: 'blue', 'Language Arts': 'green', Science: 'purple', 'Social Studies': 'gold', Art: 'gold', Reading: 'green', Music: 'purple', Spanish: 'blue' };
      const c = colors[sub] || 'blue';
      return `
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:5px">
            <span style="color:var(--text-2)">${sub}</span>
            <span style="font-weight:600;color:var(--text)">${pct}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill ${c}" style="width:${pct}%"></div></div>
        </div>
      `;
    }).join('');

    const avg = Math.round(Object.values(st.progress).reduce((a,b)=>a+b,0)/Object.keys(st.progress).length);

    return `
      <div class="card" style="margin-top:20px">
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:20px;flex-wrap:wrap">
          <div style="width:72px;height:72px;border-radius:20px;background:var(--surface-2);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:2.2rem">${st.avatar}</div>
          <div>
            <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:700">${st.name}</div>
            <div style="color:var(--text-3)">${st.grade}</div>
            <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
              <span class="badge gold">🔥 ${st.streak}-day streak</span>
              <span class="badge purple">⭐ ${st.xp.toLocaleString()} XP</span>
              <span class="badge green">📊 ${avg}% avg</span>
            </div>
          </div>
          <div style="margin-left:auto;display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" onclick="hp_showToast('Student profile editing coming soon!','✏️')">✏️ Edit</button>
            <button class="btn btn-primary btn-sm" onclick="hp_navigate('planner')">📅 Planner</button>
          </div>
        </div>
        <div class="grid-2">
          <div>
            <div class="section-title" style="margin-bottom:14px">Subject Progress</div>
            ${subjectBars}
          </div>
          <div>
            <div class="section-title" style="margin-bottom:14px">Recent Activity</div>
            ${HP.grades.filter(g => g.student === st.name).slice(0,4).map(g => `
              <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
                <div style="flex:1">
                  <div style="font-size:0.85rem;font-weight:500">${g.lesson}</div>
                  <div style="font-size:0.75rem;color:var(--text-3)">${g.subject} · ${g.date}</div>
                </div>
                <span class="badge ${g.grade >= 90 ? 'green' : g.grade >= 80 ? 'blue' : g.grade >= 70 ? 'gold' : 'red'}">${g.letter}</span>
              </div>
            `).join('')}
            <button class="btn btn-ghost btn-sm" onclick="hp_navigate('progress')" style="margin-top:10px;width:100%">View all grades →</button>
          </div>
        </div>
      </div>
    `;
  }

  // Tab state
  let activeIdx = HP.state.activeStudent || 0;

  function render() {
    container.innerHTML = `
      <div class="page">
        <div class="page-header">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
            <div>
              <h1>My Students</h1>
              <p>${s.length} students enrolled · School Year 2025–2026</p>
            </div>
            <button class="btn btn-gold" onclick="hp_openAddStudent()">+ Add Student</button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:20px">
          ${s.map((st, i) => {
            const avg = Math.round(Object.values(st.progress).reduce((a,b)=>a+b,0)/Object.keys(st.progress).length);
            return `
              <div class="student-card ${i === activeIdx ? 'active' : ''}" onclick="(function(){window._activeStudentIdx=${i};document.querySelectorAll('.student-card').forEach((c,ci)=>c.classList.toggle('active',ci===${i}));document.getElementById('student-detail').innerHTML='';})()"
                style="${i === activeIdx ? 'border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,0.1)' : ''}">
                <div class="student-avatar" style="background:var(--surface-2)">${st.avatar}</div>
                <div class="student-name">${st.name}</div>
                <div class="student-grade">${st.grade}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <span style="font-size:0.75rem;color:var(--text-3)">Avg Grade</span>
                  <span style="font-family:var(--font-display);font-size:1rem;font-weight:700">${avg}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill blue" style="width:${avg}%"></div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:10px;font-size:0.75rem;color:var(--text-3)">
                  <span>🔥 ${st.streak} days</span>
                  <span>⭐ ${st.xp.toLocaleString()} XP</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div id="student-detail">
          ${studentDetail(activeIdx)}
        </div>
      </div>
    `;

    // Wire up student card clicks properly
    container.querySelectorAll('.student-card').forEach((card, i) => {
      card.addEventListener('click', () => {
        HP.state.activeStudent = i;
        container.querySelectorAll('.student-card').forEach((c, ci) => {
          c.style.borderColor = ci === i ? 'var(--blue)' : '';
          c.style.boxShadow = ci === i ? '0 0 0 3px rgba(37,99,235,0.1)' : '';
        });
        document.getElementById('student-detail').innerHTML = studentDetail(i);
      });
    });
  }

  render();
}

function hp_openAddStudent() {
  hp_openModal('Add New Student', `
    <div class="form-group">
      <label class="form-label">Student Name</label>
      <input class="form-input" placeholder="First name" />
    </div>
    <div class="form-group">
      <label class="form-label">Grade Level</label>
      <select class="form-select">
        <option>Kindergarten</option>
        <option>1st Grade</option><option>2nd Grade</option><option>3rd Grade</option>
        <option>4th Grade</option><option>5th Grade</option><option>6th Grade</option>
        <option>7th Grade</option><option>8th Grade</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Date of Birth</label>
      <input type="date" class="form-input" />
    </div>
    <div class="form-group">
      <label class="form-label">Avatar</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${['🦋','🦕','🦄','🐉','🦊','🐨','🐸','🦁'].map(e => `
          <button onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.style.background='');this.style.background='var(--surface-3)'" 
            style="width:40px;height:40px;border-radius:10px;background:var(--surface-2);border:1px solid var(--border);font-size:1.3rem;cursor:pointer">${e}</button>
        `).join('')}
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:8px">
      <button class="btn btn-secondary" onclick="hp_closeModal()" style="flex:1">Cancel</button>
      <button class="btn btn-primary" onclick="hp_closeModal();hp_showToast('Student added!','👧')" style="flex:1">Add Student</button>
    </div>
  `);
}
