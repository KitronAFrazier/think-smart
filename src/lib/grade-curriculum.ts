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

export type GradeCurriculum = {
  label: GradeLevelOption;
  requiredSubjects: string[];
  classes: string[];
};

export const gradeCurriculum: GradeCurriculum[] = [
  {
    label: "Kindergarten",
    requiredSubjects: ["Reading", "Spelling", "Grammar", "Mathematics", "Good Citizenship"],
    classes: ["Phonics & Early Reading", "Handwriting", "Number Sense", "Nature Science", "Community Helpers"],
  },
  {
    label: "1st Grade",
    requiredSubjects: ["Reading", "Spelling", "Grammar", "Mathematics", "Good Citizenship"],
    classes: ["Reading Foundations", "Spelling Patterns", "Math Fluency", "Life Science", "History Stories"],
  },
  {
    label: "2nd Grade",
    requiredSubjects: ["Reading", "Spelling", "Grammar", "Mathematics", "Good Citizenship"],
    classes: ["Reading Comprehension", "Sentence Writing", "Addition & Subtraction", "Earth Science", "Texas Communities"],
  },
  {
    label: "3rd Grade",
    requiredSubjects: ["Reading", "Spelling", "Grammar", "Mathematics", "Good Citizenship"],
    classes: ["Literature Study", "Paragraph Writing", "Multiplication & Division", "Ecosystems", "Texas History"],
  },
  {
    label: "4th Grade",
    requiredSubjects: ["Reading", "Spelling", "Grammar", "Mathematics", "Good Citizenship"],
    classes: ["Novel Studies", "Essay Writing", "Fractions", "Energy & Matter", "US Regions"],
  },
  {
    label: "5th Grade",
    requiredSubjects: ["Reading", "Spelling", "Grammar", "Mathematics", "Good Citizenship"],
    classes: ["Advanced Literature", "Research Writing", "Decimals", "Human Body Systems", "US History Foundations"],
  },
  {
    label: "6th Grade",
    requiredSubjects: ["Reading", "Spelling", "Grammar", "Mathematics", "Good Citizenship"],
    classes: ["World Literature", "Grammar & Composition", "Ratios & Expressions", "Earth & Space Science", "Ancient Civilizations"],
  },
  {
    label: "7th Grade",
    requiredSubjects: ["Reading", "Spelling", "Grammar", "Mathematics", "Good Citizenship"],
    classes: ["Informational Text", "Analytical Writing", "Pre-Algebra", "Life Science", "Texas & US Civics"],
  },
  {
    label: "8th Grade",
    requiredSubjects: ["Reading", "Spelling", "Grammar", "Mathematics", "Good Citizenship"],
    classes: ["Literary Analysis", "Argument Writing", "Algebra Readiness", "Physical Science", "US History & Government"],
  },
];

export function isValidGradeLevel(value: string): value is GradeLevelOption {
  return gradeLevelOptions.includes(value as GradeLevelOption);
}

export function getCurriculumForGrade(gradeLevel: string) {
  return gradeCurriculum.find((grade) => grade.label === gradeLevel);
}
