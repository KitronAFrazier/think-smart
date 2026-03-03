export type Task = {
  id: number;
  title: string;
  subject: string;
  student: string;
  done: boolean;
  due: string;
};

export type Student = {
  id?: string;
  name: string;
  grade: string;
  avatar: string;
  xp: number;
  streak: number;
  progress: Record<string, number>;
};

export type GradeRow = {
  student: string;
  subject: string;
  lesson: string;
  grade: number;
  letter: string;
  date: string;
};

export const mockTasks: Task[] = [
  { id: 1, title: "Chapter 4 Reading", subject: "Language Arts", student: "Emma", done: false, due: "Today" },
  { id: 2, title: "Multiplication Practice", subject: "Math", student: "Emma", done: true, due: "Today" },
  { id: 3, title: "Texas History: Settlement", subject: "Social Studies", student: "Emma", done: false, due: "Today" },
  { id: 4, title: "Science: Animal Habitats", subject: "Science", student: "Liam", done: false, due: "Today" },
  { id: 5, title: "Spelling Words Practice", subject: "Language Arts", student: "Liam", done: true, due: "Today" },
];

export const mockStudents: Student[] = [
  {
    name: "Emma",
    grade: "3rd Grade",
    avatar: "EJ",
    xp: 1240,
    streak: 12,
    progress: {
      Math: 78,
      "Language Arts": 85,
      Science: 62,
      "Social Studies": 70,
      Art: 90,
    },
  },
  {
    name: "Liam",
    grade: "1st Grade",
    avatar: "LB",
    xp: 880,
    streak: 8,
    progress: {
      Math: 65,
      Reading: 80,
      Science: 55,
      Art: 88,
    },
  },
  {
    name: "Sophie",
    grade: "5th Grade",
    avatar: "SR",
    xp: 2100,
    streak: 21,
    progress: {
      Math: 92,
      "Language Arts": 88,
      Science: 75,
      "Social Studies": 82,
      Music: 95,
      Spanish: 68,
    },
  },
];

export const mockGrades: GradeRow[] = [
  { student: "Emma", subject: "Math", lesson: "Fractions Ch.3", grade: 92, letter: "A", date: "2/24" },
  { student: "Emma", subject: "Language Arts", lesson: "Poetry Analysis", grade: 88, letter: "B+", date: "2/22" },
  { student: "Emma", subject: "Science", lesson: "Water Cycle Test", grade: 76, letter: "C+", date: "2/20" },
  { student: "Liam", subject: "Reading", lesson: "Comprehension Quiz", grade: 95, letter: "A", date: "2/25" },
  { student: "Liam", subject: "Math", lesson: "Addition to 20", grade: 84, letter: "B", date: "2/23" },
  { student: "Sophie", subject: "Math", lesson: "Pre-Algebra Ch.5", grade: 98, letter: "A+", date: "2/26" },
  { student: "Sophie", subject: "Science", lesson: "Ecosystems Lab", grade: 90, letter: "A-", date: "2/21" },
];

export const mockAttendance = {
  present: 18,
  absent: 2,
  remaining: 11,
};

export const mockZones = [
  { num: 1, name: "Inner Loop / Central", area: "Montrose, Heights, Midtown", groups: 14, teachers: 8 },
  { num: 2, name: "North / The Woodlands", area: "Spring, Tomball, Conroe", groups: 22, teachers: 12 },
  { num: 3, name: "Northeast / Kingwood", area: "Humble, Atascocita, Baytown", groups: 11, teachers: 6 },
  { num: 4, name: "Southeast / Pearland", area: "Pearland, League City, Clear Lake", groups: 18, teachers: 9 },
  { num: 5, name: "Southwest / Sugar Land", area: "Sugar Land, Missouri City", groups: 16, teachers: 10 },
  { num: 6, name: "West / Katy", area: "Katy, Cypress, Cinco Ranch", groups: 25, teachers: 14 },
];

export const mockTeachers = [
  {
    name: "Sarah M.",
    subjects: ["Piano", "Music Theory"],
    zone: 1,
    rate: "$45/hr",
    verified: true,
    virtual: true,
  },
  {
    name: "Coach David",
    subjects: ["PE", "Self-Defense", "Soccer"],
    zone: 2,
    rate: "$35/hr",
    verified: true,
    virtual: false,
  },
  {
    name: "Mrs. Chen",
    subjects: ["Mandarin", "Art", "Calligraphy"],
    zone: 5,
    rate: "$50/hr",
    verified: true,
    virtual: true,
  },
];

export const mockGroups = [
  { name: "Katy Homeschool Co-op", zone: 6, members: 34, meeting: "Thursdays 9am", type: "in-person" },
  { name: "Sugar Land STEM Group", zone: 5, members: 22, meeting: "Tuesdays 10am", type: "both" },
  { name: "Woodlands Classical Academy", zone: 2, members: 58, meeting: "Mon/Wed 9am", type: "in-person" },
  { name: "Houston Online Co-op", zone: 1, members: 91, meeting: "Fridays 11am", type: "online" },
];

export const mockStudentTasks = [
  { id: 1, title: "Read Chapter 4", subject: "Language Arts", done: false, xp: 20 },
  { id: 2, title: "Times Tables Quiz", subject: "Math", done: true, xp: 30 },
  { id: 3, title: "Texas Settlement Video", subject: "Social Studies", done: false, xp: 25 },
  { id: 4, title: "Animal Habitats Worksheet", subject: "Science", done: false, xp: 20 },
];

export const mockTxLaws = [
  {
    q: "Is homeschooling legal in Texas?",
    a: "Yes. Under Leeper v. Arlington ISD (1994), Texas homeschools are legally classified as private schools.",
  },
  {
    q: "What subjects are required by Texas law?",
    a: "Texas requires a bona fide curriculum with Reading, Spelling, Grammar, Mathematics, and Good Citizenship.",
  },
  {
    q: "Do I need to register with my school district?",
    a: "No. Texas does not require homeschool families to register, notify, or report to district/state agencies.",
  },
  {
    q: "Do I need to be a certified teacher?",
    a: "No. Texas places no certification requirement on homeschool parents.",
  },
];

export const mockResourceCategories = [
  {
    title: "Scholarships & Funding",
    items: [
      { name: "Texas ESA+ Program", desc: "Up to $10,500/year for homeschool expenses.", tag: "State Program", link: "tea.texas.gov" },
      { name: "THSC Scholarship Fund", desc: "Local grants for Houston-area homeschool families.", tag: "Local Grant", link: "thsc.org" },
      { name: "Khan Academy", desc: "Complete free curriculum for K-12.", tag: "Free Resource", link: "khanacademy.org" },
    ],
  },
  {
    title: "Curriculum & Learning",
    items: [
      { name: "Sonlight Curriculum", desc: "Literature-based curriculum highly rated by TX homeschoolers.", tag: "Curriculum" },
      { name: "Singapore Math", desc: "A strong K-12 math curriculum option.", tag: "Curriculum" },
      { name: "Texas Virtual School Network", desc: "Online courses approved by TEA.", tag: "Online", link: "txvsn.org" },
    ],
  },
];

export const mockEvents = [
  { name: "Houston Museum of Natural Science", type: "Field Trip", date: "Mar 15", zone: 1, spots: 12, cost: "$5/student" },
  { name: "Co-op Science Fair", type: "Event", date: "Mar 29", zone: 6, spots: 50, cost: "Free" },
];
