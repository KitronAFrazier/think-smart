export type Mode = "multiples" | "factors" | "primes" | "equality" | "inequality";

export type Profile = {
  skillRating: number;
  level: number;
  emaAccuracy: number;
  emaReactionMs: number;
  streakBest: number;
  numberMax: number;
  eqComplexity: 1 | 2 | 3;
  troggleCount: number;
  tickMs: number;
};

export type SessionSummary = {
  correctEats: number;
  wrongEats: number;
  avgReactionMs: number;
  bestStreak: number;
  score: number;
  levelReached: number;
};

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

function ema(prev: number, next: number, alpha: number) {
  return prev === 0 ? next : prev * (1 - alpha) + next * alpha;
}

function performanceDelta(accuracy: number, reactionMs: number) {
  const speedScore = clamp((1600 - reactionMs) / 1600, -1, 1);
  const accScore = clamp((accuracy - 0.7) / 0.3, -1.5, 1);
  return 0.65 * accScore + 0.35 * speedScore;
}

function levelFromSkill(skill: number) {
  return clamp(Math.round(1 + skill * 1.2), 1, 20);
}

export function computeNextProfile(mode: Mode, prev: Profile, summary: SessionSummary): Profile {
  const total = summary.correctEats + summary.wrongEats;
  const accuracy = total === 0 ? 0 : summary.correctEats / total;
  const reaction = summary.avgReactionMs || prev.emaReactionMs || 2000;

  const nextEmaAcc = clamp(ema(prev.emaAccuracy, accuracy, 0.25), 0, 1);
  const nextEmaRx = clamp(ema(prev.emaReactionMs, reaction, 0.25), 250, 6000);

  const delta = performanceDelta(accuracy, reaction);
  const nextSkill = clamp(prev.skillRating + delta * 0.35, -3, 10);
  const nextLevel = levelFromSkill(nextSkill);

  let numberMax = clamp(20 + nextLevel * 6, 20, 200);
  let tickMs = clamp(750 - nextLevel * 20, 280, 750);
  let troggleCount = clamp(1 + Math.floor(nextLevel / 4), 1, 5);

  let eqComplexity: 1 | 2 | 3 = 1;

  if (mode === "equality" || mode === "inequality") {
    if (nextLevel >= 6) eqComplexity = 2;
    if (nextLevel >= 12) eqComplexity = 3;
    numberMax = clamp(18 + nextLevel * 5, 18, 160);
  } else if (mode === "primes") {
    numberMax = clamp(30 + nextLevel * 8, 30, 250);
  } else if (mode === "factors") {
    numberMax = clamp(24 + nextLevel * 6, 24, 200);
  }

  const struggling =
    accuracy < 0.55 || reaction > 3200 || summary.wrongEats > summary.correctEats * 1.3;

  if (struggling) {
    numberMax = Math.max(20, Math.floor(numberMax * 0.85));
    tickMs = Math.min(750, Math.floor(tickMs * 1.15));
    troggleCount = Math.max(1, troggleCount - 1);
    if (mode === "equality" || mode === "inequality") eqComplexity = 1;
  }

  return {
    ...prev,
    skillRating: nextSkill,
    level: nextLevel,
    emaAccuracy: nextEmaAcc,
    emaReactionMs: nextEmaRx,
    streakBest: Math.max(prev.streakBest, summary.bestStreak),
    numberMax,
    eqComplexity,
    troggleCount,
    tickMs,
  };
}

export function defaultProfile(): Profile {
  return {
    skillRating: 0,
    level: 1,
    emaAccuracy: 0,
    emaReactionMs: 0,
    streakBest: 0,
    numberMax: 30,
    eqComplexity: 1,
    troggleCount: 1,
    tickMs: 650,
  };
}
