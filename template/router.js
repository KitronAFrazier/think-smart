// ===== ROUTER =====
function hp_navigate(page) {
  HP.state.currentPage = page;
  const content = document.getElementById('page-content');
  if (!content) return;

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // Update topbar title
  const titles = {
    dashboard: '🏠 Dashboard',
    students: '👧 My Students',
    planner: '📅 Lesson Planner',
    progress: '📊 Progress & Grades',
    community: '🗺️ Community Hub',
    resources: '🌟 Resources',
    txlaws: '⚖️ Texas Homeschool Laws',
    'student-app': '🎮 Student View'
  };
  const titleEl = document.querySelector('.topbar-title');
  if (titleEl) titleEl.textContent = titles[page] || page;

  // Render page
  const renderers = {
    dashboard: renderDashboard,
    students: renderStudents,
    planner: renderPlanner,
    progress: renderProgress,
    community: renderCommunity,
    resources: renderResources,
    txlaws: renderTxLaws,
    'student-app': renderStudentApp
  };

  if (renderers[page]) {
    content.innerHTML = '';
    renderers[page](content);
  }

  // Close mobile sidebar after nav
  if (window.innerWidth <= 900) {
    HP.state.sidebarOpen = false;
    document.querySelector('.sidebar')?.classList.remove('mobile-open');
  }
}
