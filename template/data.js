// ===== HOMEPATH APP DATA =====
const HP = {
  state: {
    currentPage: 'dashboard',
    darkMode: false,
    sidebarOpen: true,
    activeStudent: 0,
    activeZone: null,
    modal: null,
    tasks: [
      { id: 1, title: 'Chapter 4 Reading', subject: 'Language Arts', student: 'Emma', done: false, due: 'Today', color: '#2563EB' },
      { id: 2, title: 'Multiplication Practice', subject: 'Math', student: 'Emma', done: true, due: 'Today', color: '#10B981' },
      { id: 3, title: 'Texas History: Settlement', subject: 'Social Studies', student: 'Emma', done: false, due: 'Today', color: '#F59E0B' },
      { id: 4, title: 'Science: Animal Habitats', subject: 'Science', student: 'Liam', done: false, due: 'Today', color: '#7C3AED' },
      { id: 5, title: 'Spelling Words Practice', subject: 'Language Arts', student: 'Liam', done: true, due: 'Today', color: '#2563EB' },
    ],
    studentTasks: [
      { id: 1, title: 'Read Chapter 4', subject: 'Language Arts', icon: '📖', color: '#EFF6FF', iconBg: '#DBEAFE', done: false, xp: 20 },
      { id: 2, title: 'Times Tables Quiz', subject: 'Math', icon: '🔢', color: '#ECFDF5', iconBg: '#D1FAE5', done: true, xp: 30 },
      { id: 3, title: 'Texas Settlement Video', subject: 'Social Studies', icon: '🤠', color: '#FFFBEB', iconBg: '#FEF3C7', done: false, xp: 25 },
      { id: 4, title: 'Animal Habitats Worksheet', subject: 'Science', icon: '🦁', color: '#F5F3FF', iconBg: '#EDE9FE', done: false, xp: 20 },
    ]
  },
  students: [
    { name: 'Emma', grade: '3rd Grade', avatar: '🦋', color: '#2563EB', xp: 1240, streak: 12, subjects: ['Math', 'Language Arts', 'Science', 'Social Studies', 'Art'], progress: { Math: 78, 'Language Arts': 85, Science: 62, 'Social Studies': 70, Art: 90 } },
    { name: 'Liam', grade: '1st Grade', avatar: '🦕', color: '#10B981', xp: 880, streak: 8, subjects: ['Math', 'Reading', 'Science', 'Art'], progress: { Math: 65, Reading: 80, Science: 55, Art: 88 } },
    { name: 'Sophie', grade: '5th Grade', avatar: '🦄', color: '#7C3AED', xp: 2100, streak: 21, subjects: ['Math', 'Language Arts', 'Science', 'Social Studies', 'Music', 'Spanish'], progress: { Math: 92, 'Language Arts': 88, Science: 75, 'Social Studies': 82, Music: 95, Spanish: 68 } },
  ],
  attendance: {
    March: [
      { day: 3, present: true }, { day: 4, present: true }, { day: 5, present: true },
      { day: 6, present: true }, { day: 7, present: false },
      { day: 10, present: true }, { day: 11, present: true }, { day: 12, present: true },
      { day: 13, present: true }, { day: 14, present: true },
      { day: 17, present: true }, { day: 18, present: false }, { day: 19, present: true },
      { day: 20, present: true }, { day: 21, present: true },
    ]
  },
  zones: [
    { num: 1, name: 'Inner Loop / Central', area: 'Montrose, Heights, Midtown', groups: 14, teachers: 8 },
    { num: 2, name: 'North / The Woodlands', area: 'Spring, Tomball, Conroe', groups: 22, teachers: 12 },
    { num: 3, name: 'Northeast / Kingwood', area: 'Humble, Atascocita, Baytown', groups: 11, teachers: 6 },
    { num: 4, name: 'Southeast / Pearland', area: 'Pearland, League City, Clear Lake', groups: 18, teachers: 9 },
    { num: 5, name: 'Southwest / Sugar Land', area: 'Sugar Land, Missouri City', groups: 16, teachers: 10 },
    { num: 6, name: 'West / Katy', area: 'Katy, Cypress, Cinco Ranch', groups: 25, teachers: 14 },
  ],
  teachers: [
    { name: 'Sarah M.', subjects: ['Piano', 'Music Theory'], zone: 1, rate: '$45/hr', verified: true, avatar: '👩‍🎵', virtual: true },
    { name: 'Coach David', subjects: ['PE', 'Self-Defense', 'Soccer'], zone: 2, rate: '$35/hr', verified: true, avatar: '🏋️', virtual: false },
    { name: 'Mrs. Chen', subjects: ['Mandarin', 'Art', 'Calligraphy'], zone: 5, rate: '$50/hr', verified: true, avatar: '👩‍🎨', virtual: true },
    { name: 'Dr. Patel', subjects: ['Math', 'Science', 'Coding'], zone: 3, rate: '$60/hr', verified: true, avatar: '👨‍🔬', virtual: true },
    { name: 'Miss Rodriguez', subjects: ['Spanish', 'English Writing'], zone: 6, rate: '$40/hr', verified: false, avatar: '👩‍🏫', virtual: true },
    { name: 'Mr. Thompson', subjects: ['History', 'Geography', 'Civics'], zone: 4, rate: '$42/hr', verified: true, avatar: '🧑‍💼', virtual: false },
  ],
  groups: [
    { name: 'Katy Homeschool Co-op', zone: 6, members: 34, meeting: 'Thursdays 9am', type: 'in-person' },
    { name: 'Sugar Land STEM Group', zone: 5, members: 22, meeting: 'Tuesdays 10am', type: 'both' },
    { name: 'Woodlands Classical Academy', zone: 2, members: 58, meeting: 'Mon/Wed 9am', type: 'in-person' },
    { name: 'Houston Online Co-op', zone: 1, members: 91, meeting: 'Fridays 11am', type: 'online' },
    { name: 'Pearland Arts Co-op', zone: 4, members: 28, meeting: 'Wednesdays 2pm', type: 'in-person' },
  ],
  grades: [
    { student: 'Emma', subject: 'Math', lesson: 'Fractions Ch.3', grade: 92, letter: 'A', date: '2/24' },
    { student: 'Emma', subject: 'Language Arts', lesson: 'Poetry Analysis', grade: 88, letter: 'B+', date: '2/22' },
    { student: 'Emma', subject: 'Science', lesson: 'Water Cycle Test', grade: 76, letter: 'C+', date: '2/20' },
    { student: 'Liam', subject: 'Reading', lesson: 'Comprehension Quiz', grade: 95, letter: 'A', date: '2/25' },
    { student: 'Liam', subject: 'Math', lesson: 'Addition to 20', grade: 84, letter: 'B', date: '2/23' },
    { student: 'Sophie', subject: 'Math', lesson: 'Pre-Algebra Ch.5', grade: 98, letter: 'A+', date: '2/26' },
    { student: 'Sophie', subject: 'Science', lesson: 'Ecosystems Lab', grade: 90, letter: 'A-', date: '2/21' },
  ],
  txlaws: [
    {
      q: "Is homeschooling legal in Texas?",
      a: "Yes. Under the landmark Leeper v. Arlington ISD (1994) ruling, Texas homeschools are legally classified as private schools. Parents have broad freedom to educate their children at home without state approval or oversight."
    },
    {
      q: "What subjects are required by Texas law?",
      a: "Texas requires a \"bona fide\" curriculum that includes: Reading, Spelling, Grammar, Mathematics, and Good Citizenship. Beyond these five, parents have complete freedom to choose additional subjects."
    },
    {
      q: "Do I need to register with my school district?",
      a: "No. Texas does not require homeschool families to register, notify, or report to their local school district or the state. Simply withdraw your child from public school in writing if currently enrolled."
    },
    {
      q: "How many hours/days do we need to school?",
      a: "Texas law sets no minimum number of school days or hours per year. Parents determine their own schedule. However, keeping records is strongly recommended in case of any legal questions."
    },
    {
      q: "What is the Texas ESA+ program?",
      a: "The Texas Education Savings Account+ (ESA+) provides eligible families with up to $10,500/year (or $11,500 for special needs) to spend on approved educational expenses including curriculum, tutoring, testing, and more. Check eligibility at tea.texas.gov."
    },
    {
      q: "Can my homeschooled child participate in public school activities?",
      a: "This varies by district. Texas has no statewide 'Tim Tebow law' allowing homeschoolers to participate in public school extracurriculars or sports. Contact your local district directly."
    },
    {
      q: "Do I need to be a certified teacher?",
      a: "No. Texas places no educational or certification requirements on homeschool parents. Any parent or guardian can legally homeschool their child regardless of their own education level."
    },
    {
      q: "Useful resources",
      a: "• THSC (Texas Home School Coalition): thsc.org\n• TEA ESA+ Program: tea.texas.gov\n• HSLDA Texas: hslda.org/legal/texas\n• Texas Private School Accreditation Commission: tepsac.org"
    }
  ]
};

function hp_setState(updates) {
  Object.assign(HP.state, updates);
}

function hp_toggleDark() {
  HP.state.darkMode = !HP.state.darkMode;
  document.getElementById('app-body').className = HP.state.darkMode ? 'dark-mode' : 'light-mode';
  const btn = document.querySelector('.dark-toggle');
  if (btn) btn.textContent = HP.state.darkMode ? '☀️' : '🌙';
}

function hp_toggleSidebar() {
  HP.state.sidebarOpen = !HP.state.sidebarOpen;
  const sb = document.querySelector('.sidebar');
  const mc = document.querySelector('.main-content');
  if (window.innerWidth <= 900) {
    sb.classList.toggle('mobile-open', HP.state.sidebarOpen);
  } else {
    sb.classList.toggle('collapsed', !HP.state.sidebarOpen);
    mc.classList.toggle('sidebar-collapsed', !HP.state.sidebarOpen);
  }
}

function hp_showToast(msg, emoji = '✅') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${emoji}</span><span>${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function hp_toggleTask(id) {
  const task = HP.state.tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    hp_showToast(task.done ? 'Task completed! 🎉' : 'Task unmarked', task.done ? '✅' : '↩️');
    hp_navigate(HP.state.currentPage);
  }
}

function hp_toggleStudentTask(id) {
  const task = HP.state.studentTasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    if (task.done) {
      hp_showToast(`+${task.xp} XP earned! Keep it up!`, '⭐');
    }
    hp_navigate('student-app');
  }
}

function hp_closeModal() {
  HP.state.modal = null;
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) overlay.remove();
}

function hp_openModal(title, content) {
  hp_closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) hp_closeModal(); };
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="modal-close" onclick="hp_closeModal()">✕</button>
      </div>
      ${content}
    </div>
  `;
  document.body.appendChild(overlay);
}
