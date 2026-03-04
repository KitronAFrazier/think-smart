export const gradeLevelOptions = [
  "Kindergarten",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
] as const;

export type GradeLevelOption = (typeof gradeLevelOptions)[number];

export type CurriculumPack = {
  title: string;
  summary: string;
  includedCourses: string[];
  texasAlignment: string[];
  federalAlignment: string[];
  recommendedMaterials: string[];
};

export type GradeCurriculum = {
  label: GradeLevelOption;
  requiredSubjects: string[];
  classes: string[];
  curriculumPacks: CurriculumPack[];
};

export const gradeCurriculum: GradeCurriculum[] = [
  {
    label: "Kindergarten",
    requiredSubjects: ["Reading", "Language Arts", "Mathematics", "Science", "Social Studies"],
    classes: ["Phonological Awareness", "Letter & Sound Mastery", "Counting & Cardinality", "Weather & Nature", "Family and Community"],
    curriculumPacks: [
      {
        title: "K Foundations Pack",
        summary: "Build school readiness, early literacy, and early numeracy through short daily lessons and play-based practice.",
        includedCourses: ["Read-Aloud Lab", "Handwriting Readiness", "Math Centers", "Science Exploration", "Citizenship Circle"],
        texasAlignment: ["TEKS Kindergarten ELAR", "TEKS Kindergarten Mathematics", "TEKS Kindergarten Science", "TEKS Kindergarten Social Studies"],
        federalAlignment: ["ESSA evidence-based literacy support", "Head Start Early Learning Outcomes Framework", "Common Core-aligned K foundational skills"],
        recommendedMaterials: ["Decodable readers (Level A)", "Manipulatives (ten frames, counters)", "Picture vocabulary cards", "Family learning log"],
      },
    ],
  },
  {
    label: "1st Grade",
    requiredSubjects: ["Reading", "Language Arts", "Mathematics", "Science", "Social Studies"],
    classes: ["Reading Fluency", "Sentence Composition", "Addition & Subtraction", "Plants & Animals", "Communities & Rules"],
    curriculumPacks: [
      {
        title: "1st Grade Core Success Pack",
        summary: "Strengthen decoding, writing basics, and number fluency while introducing inquiry-based science and civics.",
        includedCourses: ["Phonics & Fluency", "Grammar Basics", "Math Fact Fluency", "Life Science Lab", "Civics for Kids"],
        texasAlignment: ["TEKS Grade 1 ELAR", "TEKS Grade 1 Mathematics", "TEKS Grade 1 Science", "TEKS Grade 1 Social Studies"],
        federalAlignment: ["ESSA Tiered interventions", "Common Core-aligned Grade 1 ELA and Math progressions", "NCSS C3 civics indicators (elementary)"],
        recommendedMaterials: ["Phonics readers", "Math fluency flashcards", "Simple lab journals", "Primary source picture sets"],
      },
    ],
  },
  {
    label: "2nd Grade",
    requiredSubjects: ["Reading", "Language Arts", "Mathematics", "Science", "Social Studies"],
    classes: ["Reading Comprehension", "Paragraph Writing", "Place Value Strategies", "Matter & Energy", "Texas Communities"],
    curriculumPacks: [
      {
        title: "2nd Grade Skills to Mastery Pack",
        summary: "Develop independent reading, organized writing, and mathematical reasoning with Texas-focused social studies.",
        includedCourses: ["Comprehension Workshop", "Writing Studio", "Math Problem Solving", "STEM Discovery", "Texas Heritage"],
        texasAlignment: ["TEKS Grade 2 ELAR", "TEKS Grade 2 Mathematics", "TEKS Grade 2 Science", "TEKS Grade 2 Social Studies"],
        federalAlignment: ["Common Core-aligned Grade 2 literacy and numeracy benchmarks", "ESSA subgroup progress monitoring", "Next Generation Science Standards practices"],
        recommendedMaterials: ["Leveled readers (Levels J–M)", "Graphic organizers", "Base-ten blocks", "Texas map activities"],
      },
    ],
  },
  {
    label: "3rd Grade",
    requiredSubjects: ["Reading", "Writing", "Mathematics", "Science", "Social Studies"],
    classes: ["Literary Analysis", "Informative Writing", "Multiplication & Division", "Ecosystems", "Texas History"],
    curriculumPacks: [
      {
        title: "3rd Grade STAAR Readiness Pack",
        summary: "Prepare students for intermediate rigor and state assessments with structured reading, math, and writing blocks.",
        includedCourses: ["Reading Deep Dive", "Constructed Response Writing", "Math Fluency & Models", "Science Investigations", "Texas Timeline"],
        texasAlignment: ["TEKS Grade 3 ELAR", "TEKS Grade 3 Mathematics", "TEKS Grade 3 Science", "TEKS Grade 3 Social Studies (Texas history)"],
        federalAlignment: ["ESSA accountability-aligned assessment readiness", "Common Core-aligned Grade 3 priority standards", "National Archives civics literacy resources"],
        recommendedMaterials: ["STAAR-style passages", "Multiplication arrays toolkit", "Science notebooks", "Texas primary source excerpts"],
      },
    ],
  },
  {
    label: "4th Grade",
    requiredSubjects: ["Reading", "Writing", "Mathematics", "Science", "Social Studies"],
    classes: ["Novel Studies", "Expository Essays", "Fractions & Decimals", "Energy & Matter", "Texas Government & Regions"],
    curriculumPacks: [
      {
        title: "4th Grade Academic Growth Pack",
        summary: "Advance critical reading, essay writing, and multi-step math while expanding state history and science depth.",
        includedCourses: ["Literature Circles", "Essay Writing Lab", "Fraction Strategy Sessions", "Lab Science", "Texas Civics & Geography"],
        texasAlignment: ["TEKS Grade 4 ELAR", "TEKS Grade 4 Mathematics", "TEKS Grade 4 Science", "TEKS Grade 4 Social Studies"],
        federalAlignment: ["Common Core-aligned Grade 4 text complexity goals", "ESSA evidence-based writing interventions", "C3 Framework geography and civics indicators"],
        recommendedMaterials: ["Chapter books", "RACE writing templates", "Fraction strips", "Texas constitution mini-reader"],
      },
    ],
  },
  {
    label: "5th Grade",
    requiredSubjects: ["Reading", "Writing", "Mathematics", "Science", "Social Studies"],
    classes: ["Text Evidence Skills", "Research Writing", "Volume & Decimals", "Earth & Space Systems", "US History Foundations"],
    curriculumPacks: [
      {
        title: "5th Grade Bridge to Middle School Pack",
        summary: "Increase independence in research, STEM investigation, and historical thinking to support upper-grade transition.",
        includedCourses: ["Reading Seminar", "Research & Citation Basics", "Applied Math", "STEM Inquiry", "Foundations of US History"],
        texasAlignment: ["TEKS Grade 5 ELAR", "TEKS Grade 5 Mathematics", "TEKS Grade 5 Science", "TEKS Grade 5 Social Studies"],
        federalAlignment: ["Common Core-aligned Grade 5 college-and-career progression", "ESSA science and literacy integration", "Library of Congress primary source analysis routines"],
        recommendedMaterials: ["Informational text sets", "Citation organizers", "STEM engineering kits", "US timeline and source cards"],
      },
    ],
  },
  {
    label: "6th Grade",
    requiredSubjects: ["English Language Arts", "Mathematics", "Science", "Social Studies", "Electives"],
    classes: ["World Literature", "Ratios & Expressions", "Earth & Space Science", "Ancient Civilizations", "Digital Literacy"],
    curriculumPacks: [
      {
        title: "6th Grade Middle School Launch Pack",
        summary: "Package core academics with organization and study habits for a successful transition to middle school pacing.",
        includedCourses: ["ELA Close Reading", "Math Foundations", "Earth Science Lab", "World Cultures", "Study Skills Bootcamp"],
        texasAlignment: ["TEKS Grade 6 ELAR", "TEKS Grade 6 Mathematics", "TEKS Grade 6 Science", "TEKS Grade 6 Social Studies"],
        federalAlignment: ["Common Core-aligned Grade 6 literacy shifts", "ESSA support for college-readiness indicators", "National Geographic geography standards"],
        recommendedMaterials: ["Annotation bookmarks", "Interactive notebooks", "Lab report templates", "Ancient world maps"],
      },
    ],
  },
  {
    label: "7th Grade",
    requiredSubjects: ["English Language Arts", "Mathematics", "Science", "Social Studies", "Electives"],
    classes: ["Argumentative Writing", "Pre-Algebra", "Life Science", "Texas History & Civics", "Career Exploration"],
    curriculumPacks: [
      {
        title: "7th Grade Texas + Federal Standards Pack",
        summary: "Align literacy, pre-algebra, and life science with Texas history while integrating federal college/career readiness goals.",
        includedCourses: ["Writing for Evidence", "Pre-Algebra Strategy Lab", "Life Science Inquiry", "Texas History Seminar", "College & Career Awareness"],
        texasAlignment: ["TEKS Grade 7 ELAR", "TEKS Grade 7 Mathematics", "TEKS Grade 7 Science", "TEKS Grade 7 Texas History"],
        federalAlignment: ["Common Core-aligned mathematical practice standards", "ESSA subgroup and intervention planning", "Perkins V career awareness exposure"],
        recommendedMaterials: ["DBQ writing packets", "Graphing activities", "Microscope labs", "Texas civics primary documents"],
      },
    ],
  },
  {
    label: "8th Grade",
    requiredSubjects: ["English Language Arts", "Mathematics", "Science", "Social Studies", "Electives"],
    classes: ["Literary & Rhetorical Analysis", "Algebra Readiness", "Physical Science", "US History & Government", "High School Readiness"],
    curriculumPacks: [
      {
        title: "8th Grade High School Ready Pack",
        summary: "Capstone middle-school package that targets readiness for Algebra I, advanced ELA, and civic literacy expectations.",
        includedCourses: ["Critical Reading & Writing", "Algebra Foundations", "Physical Science Lab", "US History Since Reconstruction", "Transition Planning"],
        texasAlignment: ["TEKS Grade 8 ELAR", "TEKS Grade 8 Mathematics", "TEKS Grade 8 Science", "TEKS Grade 8 US History"],
        federalAlignment: ["ESSA middle-school to high-school readiness metrics", "Common Core-aligned Grade 8 anchor standards", "iCivics and federal civics competencies"],
        recommendedMaterials: ["Socratic seminar prompts", "Linear equations toolkit", "Lab safety and data sheets", "Constitution and bill of rights excerpts"],
      },
    ],
  },
];

export function isValidGradeLevel(value: string): value is GradeLevelOption {
  return gradeLevelOptions.includes(value as GradeLevelOption);
}

export function getCurriculumForGrade(gradeLevel: string) {
  return gradeCurriculum.find((grade) => grade.label === gradeLevel);
}
