// ===== SHARED COMPONENTS =====

function hp_buildSidebar() {
  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <div class="brand-icon">🏠</div>
          <div>
            <div class="brand-name">HomePath</div>
            <div class="brand-tagline">Texas Homeschool</div>
          </div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Home</div>
        <div class="nav-item active" data-page="dashboard" onclick="hp_navigate('dashboard')">
          <span class="nav-icon">📊</span> Dashboard
        </div>
        <div class="nav-section-label">Academics</div>
        <div class="nav-item" data-page="students" onclick="hp_navigate('students')">
          <span class="nav-icon">👧</span> My Students
        </div>
        <div class="nav-item" data-page="planner" onclick="hp_navigate('planner')">
          <span class="nav-icon">📅</span> Lesson Planner
        </div>
        <div class="nav-item" data-page="progress" onclick="hp_navigate('progress')">
          <span class="nav-icon">📈</span> Progress & Grades
        </div>
        <div class="nav-section-label">Community</div>
        <div class="nav-item" data-page="community" onclick="hp_navigate('community')">
          <span class="nav-icon">🗺️</span> Community Hub
          <span class="nav-badge">NEW</span>
        </div>
        <div class="nav-item" data-page="resources" onclick="hp_navigate('resources')">
          <span class="nav-icon">🌟</span> Resources
        </div>
        <div class="nav-item" data-page="txlaws" onclick="hp_navigate('txlaws')">
          <span class="nav-icon">⚖️</span> TX Laws & Info
        </div>
      </nav>
      <div class="sidebar-footer">
        <button class="student-mode-btn" onclick="hp_navigate('student-app')">
          <span>🎮</span> <span>Switch to Student View</span>
        </button>
      </div>
    </aside>
  `;
}

function hp_buildTopbar() {
  return `
    <header class="topbar">
      <button class="topbar-toggle" onclick="hp_toggleSidebar()">☰</button>
      <div class="topbar-title">🏠 Dashboard</div>
      <div class="topbar-actions">
        <button class="topbar-btn" onclick="hp_openAddLesson()">+ Add Lesson</button>
        <button class="topbar-btn primary" onclick="hp_openReport()">📄 Export Report</button>
        <button class="dark-toggle" onclick="hp_toggleDark()" title="Toggle dark mode">🌙</button>
        <div class="avatar-btn" title="Sarah Johnson">SJ</div>
      </div>
    </header>
  `;
}

function hp_openAddLesson() {
  hp_openModal('Add New Lesson', `
    <div class="form-group">
      <label class="form-label">Lesson Title</label>
      <input class="form-input" placeholder="e.g., Chapter 5 Reading" />
    </div>
    <div class="form-group">
      <label class="form-label">Student</label>
      <select class="form-select">
        <option>Emma — 3rd Grade</option>
        <option>Liam — 1st Grade</option>
        <option>Sophie — 5th Grade</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Subject</label>
      <select class="form-select">
        <option>Math</option>
        <option>Language Arts</option>
        <option>Science</option>
        <option>Social Studies</option>
        <option>Art</option>
        <option>Music</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Due Date</label>
      <input type="date" class="form-input" />
    </div>
    <div style="display:flex;gap:10px;margin-top:8px">
      <button class="btn btn-secondary" onclick="hp_closeModal()" style="flex:1">Cancel</button>
      <button class="btn btn-primary" onclick="hp_closeModal();hp_showToast('Lesson added!','📚')" style="flex:1">Add Lesson</button>
    </div>
  `);
}

function hp_openReport() {
  hp_openModal('Export Report', `
    <p style="color:var(--text-2);font-size:0.9rem;margin-bottom:20px">Generate a PDF report for Texas homeschool records or umbrella school submission.</p>
    <div class="form-group">
      <label class="form-label">Student</label>
      <select class="form-select">
        <option>All Students</option>
        <option>Emma — 3rd Grade</option>
        <option>Liam — 1st Grade</option>
        <option>Sophie — 5th Grade</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Report Type</label>
      <select class="form-select">
        <option>Attendance Log</option>
        <option>Grade Report</option>
        <option>Progress Summary</option>
        <option>Full Year Report</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Date Range</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <input type="date" class="form-input" />
        <input type="date" class="form-input" />
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:8px">
      <button class="btn btn-secondary" onclick="hp_closeModal()" style="flex:1">Cancel</button>
      <button class="btn btn-primary" onclick="hp_closeModal();hp_showToast('Report generated!','📄')" style="flex:1">📥 Download PDF</button>
    </div>
  `);
}
