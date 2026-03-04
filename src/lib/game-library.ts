import type { Mode } from "@/lib/adaptive-engine";

export const MVP_PHASE_1_GAME_IDS = [
  "letter-galaxy",
  "number-hopper",
  "pattern-parade",
  "counting-treasure",
  "multiplication-monsters",
  "math-maze",
  "fraction-pizza-shop",
  "word-detective",
  "decimal-dash",
  "logic-tower",
] as const;

export type MvpGameId = (typeof MVP_PHASE_1_GAME_IDS)[number];

export type StandardsAlignment = {
  teks: string[];
  commonCore: string[];
  ngss?: string[];
  c3?: string[];
  essa: string[];
};

export type MasteryMilestone = {
  label: string;
  targetAccuracy: number;
  maxAvgReactionMs?: number;
  minSessions: number;
};

export type RewardDesign = {
  xpPerCorrect: number;
  streakBonusThresholds: number[];
  dailyChallengeExample: string;
  badgeTiers: string[];
  unlockTrack: string[];
};

export type GameDesignDoc = {
  id: MvpGameId;
  name: string;
  gradeBand: "K-2" | "3-5";
  gradeTargets: string[];
  subject: string;
  mode: Mode;
  gameDescription: string;
  learningObjective: string;
  kidInstructions: string[];
  mechanics: string[];
  controls: string[];
  winCondition: string;
  difficultyProgression: string[];
  educationalOutcomes: string[];
  standards: StandardsAlignment;
  assessmentOutcomes: string[];
  masteryMilestones: MasteryMilestone[];
  rewards: RewardDesign;
  implementationNotes: string[];
};

export const MVP_PHASE_1_GAMES: GameDesignDoc[] = [
  {
    id: "letter-galaxy",
    name: "Letter Galaxy",
    gradeBand: "K-2",
    gradeTargets: ["Kindergarten", "1st Grade"],
    subject: "Reading",
    mode: "primes",
    gameDescription: "Pilot through space and collect target letters while avoiding distractors.",
    learningObjective: "Build letter recognition and phoneme matching speed.",
    kidInstructions: [
      "Listen to the target letter sound.",
      "Move and collect matching letters.",
      "Avoid wrong letters to keep hearts.",
    ],
    mechanics: [
      "30-cell arcade grid loop",
      "Collect correct targets for score",
      "Penalty on incorrect targets",
      "Troggles act as moving hazards",
    ],
    controls: ["Arrow keys or WASD", "Tap destination cells on touch"],
    winCondition: "Reach score target before lives are depleted.",
    difficultyProgression: [
      "More letter distractors",
      "Faster hazard speed",
      "Audio cue delay reduced",
    ],
    educationalOutcomes: ["Letter-sound fluency", "Visual discrimination", "Attention control"],
    standards: {
      teks: ["TEKS K ELAR 2A", "TEKS 1 ELAR 2A"],
      commonCore: ["CCSS.ELA-LITERACY.RF.K.3", "CCSS.ELA-LITERACY.RF.1.3"],
      essa: ["Tier 1 foundational literacy practice", "Frequent progress-monitoring"],
    },
    assessmentOutcomes: ["Correct target rate", "Confusion pairs", "Time-to-correct response"],
    masteryMilestones: [
      { label: "Developing", targetAccuracy: 0.7, minSessions: 3 },
      { label: "Proficient", targetAccuracy: 0.82, maxAvgReactionMs: 2100, minSessions: 5 },
      { label: "Mastery", targetAccuracy: 0.9, maxAvgReactionMs: 1600, minSessions: 8 },
    ],
    rewards: {
      xpPerCorrect: 8,
      streakBonusThresholds: [5, 10, 15],
      dailyChallengeExample: "Get 20 correct letters with 85%+ accuracy.",
      badgeTiers: ["Sound Scout", "Phonics Pilot", "Galaxy Reader"],
      unlockTrack: ["Spaceship Skin", "Comet Trail", "Nebula World"],
    },
    implementationNotes: [
      "Uses shared grid engine with literacy content payload",
      "Audio prompt queue is configurable per level",
      "Supports keyboard and tap input parity",
    ],
  },
  {
    id: "number-hopper",
    name: "Number Hopper",
    gradeBand: "K-2",
    gradeTargets: ["Kindergarten", "1st Grade"],
    subject: "Mathematics",
    mode: "multiples",
    gameDescription: "Hop across pads in the correct number pattern.",
    learningObjective: "Reinforce counting, skip counting, and number order.",
    kidInstructions: [
      "See your target counting rule.",
      "Hop to numbers that fit the rule.",
      "Chain correct hops for streak bonuses.",
    ],
    mechanics: ["Pattern target", "Arcade avoidance", "Short 90-second runs"],
    controls: ["Arrow keys or WASD", "Tap to move"],
    winCondition: "Complete target hop count with positive lives.",
    difficultyProgression: ["Higher number max", "Faster hazards", "Mixed sequencing prompts"],
    educationalOutcomes: ["Counting fluency", "Patterning", "Working memory"],
    standards: {
      teks: ["TEKS K Math 2A", "TEKS 1 Math 2A"],
      commonCore: ["CCSS.MATH.CONTENT.K.CC.A.1", "CCSS.MATH.CONTENT.1.NBT.A.1"],
      essa: ["Frequent formative checks", "Adaptive pacing"],
    },
    assessmentOutcomes: ["Sequence accuracy", "Skip-count response time"],
    masteryMilestones: [
      { label: "Developing", targetAccuracy: 0.72, minSessions: 3 },
      { label: "Proficient", targetAccuracy: 0.85, maxAvgReactionMs: 2200, minSessions: 5 },
      { label: "Mastery", targetAccuracy: 0.92, maxAvgReactionMs: 1700, minSessions: 8 },
    ],
    rewards: {
      xpPerCorrect: 8,
      streakBonusThresholds: [4, 8, 12],
      dailyChallengeExample: "Complete 3 rounds without breaking sequence.",
      badgeTiers: ["Pond Jumper", "Pattern Hopper", "Number Ninja"],
      unlockTrack: ["Frog Hat", "Lily Trail", "Marsh World"],
    },
    implementationNotes: [
      "Mapped to multiples mode for skip-counting logic",
      "Number range controlled by adaptive profile",
    ],
  },
  {
    id: "pattern-parade",
    name: "Pattern Parade",
    gradeBand: "K-2",
    gradeTargets: ["Kindergarten", "1st Grade", "2nd Grade"],
    subject: "Mathematics",
    mode: "factors",
    gameDescription: "Complete repeating visual and numeric patterns in a parade route.",
    learningObjective: "Develop pattern recognition and prediction.",
    kidInstructions: ["Spot the parade rule.", "Collect pieces that continue the pattern.", "Avoid pattern breakers."],
    mechanics: ["Rule-based matching", "Incremental complexity", "Timed rounds"],
    controls: ["Arrow keys or WASD", "Touch grid navigation"],
    winCondition: "Complete three pattern chains in one run.",
    difficultyProgression: ["Longer pattern chains", "Multiple rule options", "Reduced hint frequency"],
    educationalOutcomes: ["Inductive reasoning", "Pattern extension"],
    standards: {
      teks: ["TEKS K Math 2B", "TEKS 1 Math 2C", "TEKS 2 Math 2D"],
      commonCore: ["CCSS.MATH.CONTENT.1.OA.C.5", "CCSS.MATH.CONTENT.2.OA.B.2"],
      essa: ["Evidence-based fluency practice", "Adaptive intervention triggers"],
    },
    assessmentOutcomes: ["Rule detection success", "Error type by pattern family"],
    masteryMilestones: [
      { label: "Developing", targetAccuracy: 0.7, minSessions: 3 },
      { label: "Proficient", targetAccuracy: 0.84, maxAvgReactionMs: 2300, minSessions: 5 },
      { label: "Mastery", targetAccuracy: 0.9, maxAvgReactionMs: 1800, minSessions: 8 },
    ],
    rewards: {
      xpPerCorrect: 9,
      streakBonusThresholds: [5, 10, 14],
      dailyChallengeExample: "Finish a run with at least two perfect chains.",
      badgeTiers: ["Pattern Spotter", "Rule Runner", "Parade Master"],
      unlockTrack: ["Confetti Burst", "Marching Pet", "Festival World"],
    },
    implementationNotes: [
      "Factor-mode target sets can emulate divisor pattern families",
      "Content payload can swap numeric for icon patterns",
    ],
  },
  {
    id: "counting-treasure",
    name: "Counting Treasure",
    gradeBand: "K-2",
    gradeTargets: ["Kindergarten", "1st Grade"],
    subject: "Mathematics",
    mode: "multiples",
    gameDescription: "Collect treasure chests labeled with correct counts and cardinal values.",
    learningObjective: "Strengthen one-to-one correspondence and cardinality.",
    kidInstructions: ["Read the count target.", "Collect matching treasure values.", "Keep streak alive for bonus coins."],
    mechanics: ["Rapid target-matching", "Positive/negative feedback", "Short loop replay"],
    controls: ["Keyboard directional controls", "Tap controls"],
    winCondition: "Reach coin target before timer expires.",
    difficultyProgression: ["Higher target numbers", "Distractor density increase"],
    educationalOutcomes: ["Cardinality", "Number magnitude sense"],
    standards: {
      teks: ["TEKS K Math 2A"],
      commonCore: ["CCSS.MATH.CONTENT.K.CC.B.4"],
      essa: ["Frequent low-stakes progress checks"],
    },
    assessmentOutcomes: ["Correct cardinal picks", "Mistakes on near-neighbor values"],
    masteryMilestones: [
      { label: "Developing", targetAccuracy: 0.75, minSessions: 3 },
      { label: "Proficient", targetAccuracy: 0.86, maxAvgReactionMs: 2200, minSessions: 5 },
      { label: "Mastery", targetAccuracy: 0.93, maxAvgReactionMs: 1700, minSessions: 8 },
    ],
    rewards: {
      xpPerCorrect: 7,
      streakBonusThresholds: [4, 9, 13],
      dailyChallengeExample: "Collect 30 treasures with fewer than 5 misses.",
      badgeTiers: ["Treasure Seeker", "Count Captain", "Cardinality Champ"],
      unlockTrack: ["Gold Chest Skin", "Parrot Pet", "Island World"],
    },
    implementationNotes: [
      "Reuses multiples mode with tuned target ranges for K-1",
      "Coin economy integrated via score-to-xp conversion",
    ],
  },
  {
    id: "multiplication-monsters",
    name: "Multiplication Monsters",
    gradeBand: "3-5",
    gradeTargets: ["3rd Grade", "4th Grade"],
    subject: "Mathematics",
    mode: "multiples",
    gameDescription: "Defeat monsters by collecting values matching multiplication targets.",
    learningObjective: "Automate multiplication fact recall.",
    kidInstructions: ["Watch the target multiple.", "Collect matching answers quickly.", "Avoid wrong numbers and monsters."],
    mechanics: ["Arcade math combat", "Fact fluency timing", "Combo-based scoring"],
    controls: ["Arrow keys/WASD", "Touch navigation"],
    winCondition: "Defeat wave by reaching score threshold.",
    difficultyProgression: ["Larger factor families", "Faster spawn/tick rates", "Higher hazard counts"],
    educationalOutcomes: ["Multiplication automaticity", "Selective attention"],
    standards: {
      teks: ["TEKS 3 Math 4F", "TEKS 4 Math 4D"],
      commonCore: ["CCSS.MATH.CONTENT.3.OA.C.7"],
      essa: ["Explicit fluency intervention", "Progress-monitoring data"],
    },
    assessmentOutcomes: ["Fact-family mastery map", "Speed by factor"],
    masteryMilestones: [
      { label: "Developing", targetAccuracy: 0.72, minSessions: 3 },
      { label: "Proficient", targetAccuracy: 0.85, maxAvgReactionMs: 1800, minSessions: 5 },
      { label: "Mastery", targetAccuracy: 0.93, maxAvgReactionMs: 1300, minSessions: 10 },
    ],
    rewards: {
      xpPerCorrect: 10,
      streakBonusThresholds: [6, 12, 18],
      dailyChallengeExample: "Clear x6, x7, and x8 waves in one session.",
      badgeTiers: ["Monster Bopper", "Fact Fighter", "Multiplication Hero"],
      unlockTrack: ["Battle Armor", "Fire Trail", "Dungeon World"],
    },
    implementationNotes: [
      "Current engine already supports this with multiples mode",
      "Adaptive profile increases number range and enemy speed",
    ],
  },
  {
    id: "math-maze",
    name: "Math Maze",
    gradeBand: "3-5",
    gradeTargets: ["3rd Grade", "4th Grade"],
    subject: "Mathematics",
    mode: "equality",
    gameDescription: "Navigate a maze by selecting expressions equal to the target value.",
    learningObjective: "Practice arithmetic reasoning and expression evaluation.",
    kidInstructions: ["Read target value.", "Choose equal expressions to move forward.", "Avoid non-equal traps."],
    mechanics: ["Expression evaluation", "Pathing pressure", "Adaptive expression complexity"],
    controls: ["Arrow keys/WASD", "Touch movement"],
    winCondition: "Reach maze exits across three short rounds.",
    difficultyProgression: ["Operations introduced gradually", "Multi-term expressions", "Faster hazards"],
    educationalOutcomes: ["Mental math", "Expression equivalence"],
    standards: {
      teks: ["TEKS 3 Math 4A", "TEKS 4 Math 5A"],
      commonCore: ["CCSS.MATH.CONTENT.3.OA.D.8", "CCSS.MATH.CONTENT.4.OA.A.3"],
      essa: ["Evidence-based problem-solving practice"],
    },
    assessmentOutcomes: ["Equation accuracy", "Operation-type error trends"],
    masteryMilestones: [
      { label: "Developing", targetAccuracy: 0.7, minSessions: 3 },
      { label: "Proficient", targetAccuracy: 0.84, maxAvgReactionMs: 1900, minSessions: 6 },
      { label: "Mastery", targetAccuracy: 0.91, maxAvgReactionMs: 1450, minSessions: 10 },
    ],
    rewards: {
      xpPerCorrect: 10,
      streakBonusThresholds: [5, 10, 15],
      dailyChallengeExample: "Complete a level using only 1 mistake.",
      badgeTiers: ["Maze Solver", "Equation Explorer", "Math Navigator"],
      unlockTrack: ["Compass Skin", "Torch Effect", "Labyrinth World"],
    },
    implementationNotes: [
      "Directly maps to equality mode",
      "Expression complexity controlled by eqComplexity in adaptive profile",
    ],
  },
  {
    id: "fraction-pizza-shop",
    name: "Fraction Pizza Shop",
    gradeBand: "3-5",
    gradeTargets: ["3rd Grade", "4th Grade", "5th Grade"],
    subject: "Mathematics",
    mode: "factors",
    gameDescription: "Serve pizza slices matching requested fractions and equivalents.",
    learningObjective: "Understand fractions as equal parts and equivalent forms.",
    kidInstructions: ["Read the pizza order fraction.", "Collect matching equivalent slices.", "Serve quickly for tip bonuses."],
    mechanics: ["Equivalent-value matching", "Timed order queue", "Combo tips"],
    controls: ["Keyboard movement", "Touch movement"],
    winCondition: "Serve required orders with >=80% correctness.",
    difficultyProgression: ["Denominator range grows", "Equivalent fraction distractors", "Faster queue cadence"],
    educationalOutcomes: ["Fraction equivalence", "Part-whole reasoning"],
    standards: {
      teks: ["TEKS 3 Math 3A", "TEKS 4 Math 3D", "TEKS 5 Math 3I"],
      commonCore: ["CCSS.MATH.CONTENT.3.NF.A.1", "CCSS.MATH.CONTENT.4.NF.A.1"],
      essa: ["Explicit conceptual math supports"],
    },
    assessmentOutcomes: ["Equivalent fraction success", "Denominator-specific accuracy"],
    masteryMilestones: [
      { label: "Developing", targetAccuracy: 0.7, minSessions: 3 },
      { label: "Proficient", targetAccuracy: 0.83, maxAvgReactionMs: 2100, minSessions: 6 },
      { label: "Mastery", targetAccuracy: 0.9, maxAvgReactionMs: 1600, minSessions: 10 },
    ],
    rewards: {
      xpPerCorrect: 11,
      streakBonusThresholds: [5, 10, 16],
      dailyChallengeExample: "Serve 8 orders with no equivalent-fraction misses.",
      badgeTiers: ["Slice Server", "Fraction Chef", "Pizza Pro"],
      unlockTrack: ["Chef Apron", "Oven Glow", "City Food World"],
    },
    implementationNotes: [
      "Factor families can represent numerator/denominator relationships",
      "Future content pack can render visual slice cards instead of plain numerals",
    ],
  },
  {
    id: "word-detective",
    name: "Word Detective",
    gradeBand: "3-5",
    gradeTargets: ["3rd Grade", "4th Grade", "5th Grade"],
    subject: "Reading",
    mode: "inequality",
    gameDescription: "Find clue words that do not match distractor meanings in short passages.",
    learningObjective: "Improve reading comprehension and context clue use.",
    kidInstructions: ["Read the clue target.", "Collect words that fit the clue.", "Skip words that do not belong."],
    mechanics: ["Semantic target matching", "Distractor filtering", "Time pressure"],
    controls: ["Keyboard and touch grid movement"],
    winCondition: "Solve clue set before time expires.",
    difficultyProgression: ["Higher vocabulary level", "Closer distractor semantics", "Reduced hinting"],
    educationalOutcomes: ["Context clue reasoning", "Inference"],
    standards: {
      teks: ["TEKS 3 ELAR 6F", "TEKS 4 ELAR 6F", "TEKS 5 ELAR 6F"],
      commonCore: ["CCSS.ELA-LITERACY.RL.3.1", "CCSS.ELA-LITERACY.RI.4.1"],
      essa: ["Tiered literacy supports", "Comprehension progress monitoring"],
    },
    assessmentOutcomes: ["Inference accuracy", "Distractor confusion matrix"],
    masteryMilestones: [
      { label: "Developing", targetAccuracy: 0.68, minSessions: 3 },
      { label: "Proficient", targetAccuracy: 0.82, maxAvgReactionMs: 2400, minSessions: 6 },
      { label: "Mastery", targetAccuracy: 0.9, maxAvgReactionMs: 1900, minSessions: 10 },
    ],
    rewards: {
      xpPerCorrect: 11,
      streakBonusThresholds: [4, 9, 14],
      dailyChallengeExample: "Solve 3 clue rounds with 85%+ accuracy.",
      badgeTiers: ["Clue Finder", "Text Tracker", "Detective Elite"],
      unlockTrack: ["Detective Hat", "Magnifier FX", "Mystery World"],
    },
    implementationNotes: [
      "Inequality mode supports non-target filtering behavior",
      "Lexical content should be supplied from grade-leveled corpus",
    ],
  },
  {
    id: "decimal-dash",
    name: "Decimal Dash",
    gradeBand: "3-5",
    gradeTargets: ["4th Grade", "5th Grade"],
    subject: "Mathematics",
    mode: "equality",
    gameDescription: "Dash through lanes by choosing decimal values equivalent to target quantities.",
    learningObjective: "Strengthen decimal place-value understanding.",
    kidInstructions: ["Read decimal target.", "Collect equivalent decimal expressions.", "Avoid close but incorrect values."],
    mechanics: ["Fast lane switching", "Decimal equivalence picks", "Streak multiplier"],
    controls: ["Keyboard movement", "Touch movement"],
    winCondition: "Maintain combo and finish run with target score.",
    difficultyProgression: ["More decimal places", "Tighter distractor spacing", "Higher pace"],
    educationalOutcomes: ["Place-value precision", "Value comparison"],
    standards: {
      teks: ["TEKS 4 Math 2H", "TEKS 5 Math 2A"],
      commonCore: ["CCSS.MATH.CONTENT.4.NF.C.7", "CCSS.MATH.CONTENT.5.NBT.A.3"],
      essa: ["Data-informed numeric intervention"],
    },
    assessmentOutcomes: ["Decimal-comparison accuracy", "Place-value error rates"],
    masteryMilestones: [
      { label: "Developing", targetAccuracy: 0.7, minSessions: 3 },
      { label: "Proficient", targetAccuracy: 0.84, maxAvgReactionMs: 1900, minSessions: 6 },
      { label: "Mastery", targetAccuracy: 0.91, maxAvgReactionMs: 1500, minSessions: 10 },
    ],
    rewards: {
      xpPerCorrect: 12,
      streakBonusThresholds: [6, 12, 18],
      dailyChallengeExample: "Hit a 15-combo in decimal rounds.",
      badgeTiers: ["Dash Starter", "Decimal Driver", "Precision Racer"],
      unlockTrack: ["Turbo Wheels", "Neon Trail", "Skyway World"],
    },
    implementationNotes: [
      "Uses equality mode; decimal rendering can be toggled by content set",
      "Adaptive system tunes speed and expression complexity",
    ],
  },
  {
    id: "logic-tower",
    name: "Logic Tower",
    gradeBand: "3-5",
    gradeTargets: ["3rd Grade", "4th Grade", "5th Grade"],
    subject: "Logic",
    mode: "factors",
    gameDescription: "Stack tower levels by selecting tiles that satisfy logic constraints.",
    learningObjective: "Develop deductive reasoning and strategic planning.",
    kidInstructions: ["Read the tower rule.", "Collect only tiles that satisfy it.", "Build upward before hazards reach you."],
    mechanics: ["Constraint-based selections", "Tower progression", "Error penalties"],
    controls: ["Keyboard directional input", "Touch movement"],
    winCondition: "Complete tower height objective in one loop.",
    difficultyProgression: ["Multi-step constraints", "Mixed rule sets", "Faster hazard movement"],
    educationalOutcomes: ["Deductive logic", "Planning under pressure"],
    standards: {
      teks: ["TEKS 3 Math process standards", "TEKS 4 Math process standards", "TEKS 5 Math process standards"],
      commonCore: ["CCSS.MATH.PRACTICE.MP1", "CCSS.MATH.PRACTICE.MP7"],
      ngss: ["NGSS SEP: Analyzing and interpreting data"],
      c3: ["D2.Civ.1.3-5 (decision-making rules)"],
      essa: ["Evidence-based critical-thinking routines"],
    },
    assessmentOutcomes: ["Constraint-satisfaction rate", "Planning efficiency"],
    masteryMilestones: [
      { label: "Developing", targetAccuracy: 0.68, minSessions: 3 },
      { label: "Proficient", targetAccuracy: 0.82, maxAvgReactionMs: 2200, minSessions: 6 },
      { label: "Mastery", targetAccuracy: 0.9, maxAvgReactionMs: 1700, minSessions: 10 },
    ],
    rewards: {
      xpPerCorrect: 12,
      streakBonusThresholds: [5, 10, 15],
      dailyChallengeExample: "Complete two towers with 0 lives lost.",
      badgeTiers: ["Tower Trainee", "Logic Builder", "Master Architect"],
      unlockTrack: ["Blueprint Skin", "Cog Companion", "Citadel World"],
    },
    implementationNotes: [
      "Factor mode can represent rule-valid tile sets",
      "Future variant can use matrix/puzzle rendering on top of same session APIs",
    ],
  },
];

export function getMvpGameById(id: string) {
  return MVP_PHASE_1_GAMES.find((game) => game.id === id) ?? MVP_PHASE_1_GAMES[0];
}

export function isMvpGameId(id: string): id is MvpGameId {
  return (MVP_PHASE_1_GAME_IDS as readonly string[]).includes(id);
}
