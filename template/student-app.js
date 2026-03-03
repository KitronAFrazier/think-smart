// ===== STUDENT APP PAGE =====
function renderStudentApp(container) {
  const student = HP.students[0]; // Emma
  const tasks = HP.state.studentTasks;
  const doneCount = tasks.filter(t => t.done).length;
  const totalXP = tasks.filter(t => t.done).reduce((a, t) => a + t.xp, 0);
  const totalPossible = tasks.reduce((a, t) => a + t.xp, 0);

  const iconBgs = ['#DBEAFE','#D1FAE5','#FEF3C7','#EDE9FE','#FCE7F3','#E0F2FE'];
  const fillColors = ['#3B82F6','#10B981','#F59E0B','#7C3AED','#EC4899','#0EA5E9'];

  const taskCards = tasks.map((t, i) => `
    <div class="task-card ${t.done ? 'done-card' : ''}" onclick="hp_toggleStudentTask(${t.id})">
      <div class="task-card-icon" style="background:${t.iconBg}">${t.icon}</div>
      <div style="flex:1;min-width:0">
        <div class="task-card-title">${t.title}</div>
        <div class="task-card-sub">${t.subject} · +${t.xp} XP</div>
      </div>
      <div class="task-card-check ${t.done ? 'checked' : ''}">
        ${t.done ? '✓' : ''}
      </div>
    </div>
  `).join('');

  const subjectProgs = Object.entries(student.progress).slice(0, 4).map(([sub, pct], i) => `
    <div class="subject-prog">
      <div class="subject-prog-header">
        <span>${sub}</span>
        <span>${pct}%</span>
      </div>
      <div class="subject-prog-bar">
        <div class="subject-prog-fill" style="width:${pct}%;background:${fillColors[i % fillColors.length]}"></div>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="student-app" id="student-app-root">
      <div class="student-topbar">
        <button class="student-back" onclick="hp_navigate('dashboard')">
          ← Parent View
        </button>
        <div class="student-avatar-big">${student.avatar}</div>
        <div class="student-xp">⭐ ${(student.xp + totalXP).toLocaleString()} XP</div>
      </div>

      <div class="student-body">
        <div class="student-greeting">
          <h2>Hey Emma! 👋</h2>
          <p>${doneCount === totalCount ? "All done! Amazing work today! 🎉" : `${doneCount} of ${tasks.length} tasks done today`}</p>
        </div>

        <div class="streak-bar">
          <div class="streak-fire">🔥</div>
          <div>
            <div class="streak-num">${student.streak}</div>
            <div class="streak-label">Day Streak!</div>
          </div>
          <div style="margin-left:auto;text-align:right">
            <div style="color:#FCD34D;font-weight:700;font-size:1.1rem">${totalXP}/${totalPossible} XP</div>
            <div style="color:rgba(255,255,255,0.6);font-size:0.75rem">earned today</div>
          </div>
        </div>

        <div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);border-radius:var(--radius);padding:8px;margin-bottom:16px">
          <div style="background:rgba(255,255,255,0.25);border-radius:10px;height:10px;overflow:hidden">
            <div style="height:100%;background:linear-gradient(90deg,#FCD34D,#F97316);border-radius:10px;transition:width 0.6s ease;width:${Math.round(doneCount/tasks.length*100)}%"></div>
          </div>
          <div style="display:flex;justify-content:space-between;color:rgba(255,255,255,0.7);font-size:0.75rem;margin-top:6px;padding:0 4px">
            <span>${doneCount} complete</span>
            <span>${tasks.length - doneCount} remaining</span>
          </div>
        </div>

        <div style="color:rgba(255,255,255,0.8);font-weight:600;font-size:0.85rem;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.06em">📋 Today's Tasks</div>
        <div class="task-cards">
          ${taskCards}
        </div>

        <div class="progress-section">
          <h3>📊 My Progress</h3>
          ${subjectProgs}
        </div>

        <div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);border-radius:var(--radius);padding:20px;margin-top:16px;text-align:center">
          <div style="font-size:2rem;margin-bottom:8px">🏆</div>
          <div style="color:#fff;font-weight:700;margin-bottom:4px">My Badges</div>
          <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:10px">
            ${[
              {e:'📚',n:'Bookworm'},{e:'🔢',n:'Math Whiz'},{e:'🔬',n:'Scientist'},
              {e:'🔥',n:'10-Day Streak'},{e:'⭐',n:'1000 XP'},
            ].map(b => `
              <div style="text-align:center;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 12px">
                <div style="font-size:1.5rem">${b.e}</div>
                <div style="font-size:0.68rem;color:rgba(255,255,255,0.8);margin-top:3px">${b.n}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="height:32px"></div>
      </div>
    </div>
  `;
}
