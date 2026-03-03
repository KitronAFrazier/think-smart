// ===== HOMEPATH APP BOOTSTRAP =====
(function() {
  function init() {
    const app = document.getElementById('app');
    app.innerHTML = `
      ${hp_buildSidebar()}
      <div class="main-content" id="main-content">
        ${hp_buildTopbar()}
        <div id="page-content"></div>
      </div>
    `;

    // Initial page render
    hp_navigate('dashboard');

    // Handle mobile sidebar overlay click
    document.addEventListener('click', function(e) {
      const sidebar = document.querySelector('.sidebar');
      const toggle = document.querySelector('.topbar-toggle');
      if (window.innerWidth <= 900 && HP.state.sidebarOpen) {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
          HP.state.sidebarOpen = false;
          sidebar.classList.remove('mobile-open');
        }
      }
    });

    // Keyboard shortcut: D = dashboard, P = planner, S = students
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === '1') hp_navigate('dashboard');
      if (e.key === '2') hp_navigate('students');
      if (e.key === '3') hp_navigate('planner');
      if (e.key === '4') hp_navigate('progress');
      if (e.key === '5') hp_navigate('community');
      if (e.key === '6') hp_navigate('resources');
      if (e.key === '7') hp_navigate('txlaws');
      if (e.key === '0') hp_navigate('student-app');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
