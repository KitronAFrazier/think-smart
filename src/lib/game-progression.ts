import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getMvpGameById, type MvpGameId } from "@/lib/game-library";

type StoredProgress = {
  student_id: string;
  game_id: string;
  xp_total: number;
  level: number;
  daily_streak: number;
  last_played_on: Date | null;
  created_at: Date;
  updated_at: Date;
};

type StoredBadge = {
  badge_key: string;
  unlocked_at: Date;
};

export type RewardGrantInput = {
  studentId: string;
  gameId: MvpGameId;
  correctEats: number;
  bestStreak: number;
  levelReached: number;
};

export type RewardGrantResult = {
  gameId: MvpGameId;
  xpEarned: number;
  xpTotal: number;
  level: number;
  dailyStreak: number;
  unlockedBadges: string[];
};

export type StudentGameProgress = {
  gameId: string;
  xpTotal: number;
  level: number;
  dailyStreak: number;
  lastPlayedOn: string | null;
  badges: string[];
};

const XP_PER_LEVEL = 250;

function badgeThresholds(badgeCount: number) {
  if (badgeCount <= 1) return [250];
  if (badgeCount === 2) return [250, 900];
  return [300, 1000, 2200].slice(0, badgeCount);
}

function sameUtcDay(a: Date, b: Date) {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

function isYesterdayUtc(last: Date, today: Date) {
  const lastUtc = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return todayUtc - lastUtc === 24 * 60 * 60 * 1000;
}

function computeXpEarned(gameId: MvpGameId, correctEats: number, bestStreak: number, levelReached: number) {
  const game = getMvpGameById(gameId);
  const baseXp = Math.max(0, correctEats) * game.rewards.xpPerCorrect;
  const streakBonus = game.rewards.streakBonusThresholds.reduce((sum, threshold) => {
    if (bestStreak < threshold) return sum;
    return sum + Math.round(game.rewards.xpPerCorrect * (threshold / 2));
  }, 0);
  const levelBonus = Math.max(0, levelReached - 1) * 5;
  return baseXp + streakBonus + levelBonus;
}

export async function awardGameRewards(input: RewardGrantInput): Promise<RewardGrantResult> {
  const { studentId, gameId, correctEats, bestStreak, levelReached } = input;
  const game = getMvpGameById(gameId);
  const xpEarned = computeXpEarned(gameId, correctEats, bestStreak, levelReached);

  const txResult = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<StoredProgress[]>(Prisma.sql`
      SELECT student_id, game_id, xp_total, level, daily_streak, last_played_on, created_at, updated_at
      FROM game_progress
      WHERE student_id = ${studentId} AND game_id = ${gameId}
      FOR UPDATE
    `);

    const current = rows[0] ?? null;
    const now = new Date();

    let nextStreak = 1;
    if (current?.last_played_on) {
      if (sameUtcDay(current.last_played_on, now)) {
        nextStreak = current.daily_streak;
      } else if (isYesterdayUtc(current.last_played_on, now)) {
        nextStreak = current.daily_streak + 1;
      }
    }

    const nextXpTotal = (current?.xp_total ?? 0) + xpEarned;
    const nextLevel = Math.max(1, Math.floor(nextXpTotal / XP_PER_LEVEL) + 1);

    const updatedRows = await tx.$queryRaw<StoredProgress[]>(Prisma.sql`
      INSERT INTO game_progress (student_id, game_id, xp_total, level, daily_streak, last_played_on, created_at, updated_at)
      VALUES (${studentId}, ${gameId}, ${nextXpTotal}, ${nextLevel}, ${nextStreak}, ${now}, ${now}, ${now})
      ON CONFLICT (student_id, game_id)
      DO UPDATE SET
        xp_total = EXCLUDED.xp_total,
        level = EXCLUDED.level,
        daily_streak = EXCLUDED.daily_streak,
        last_played_on = EXCLUDED.last_played_on,
        updated_at = EXCLUDED.updated_at
      RETURNING student_id, game_id, xp_total, level, daily_streak, last_played_on, created_at, updated_at
    `);

    const thresholds = badgeThresholds(game.rewards.badgeTiers.length);
    for (let i = 0; i < thresholds.length; i += 1) {
      if (nextXpTotal < thresholds[i]) continue;
      const badgeName = game.rewards.badgeTiers[i];
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO game_badges (student_id, game_id, badge_key, unlocked_at)
        VALUES (${studentId}, ${gameId}, ${badgeName}, ${now})
        ON CONFLICT (student_id, game_id, badge_key) DO NOTHING
      `);
    }

    const badgeRows = await tx.$queryRaw<StoredBadge[]>(Prisma.sql`
      SELECT badge_key, unlocked_at
      FROM game_badges
      WHERE student_id = ${studentId} AND game_id = ${gameId}
      ORDER BY unlocked_at ASC
    `);

    const saved = updatedRows[0];
    return {
      xpTotal: saved?.xp_total ?? nextXpTotal,
      level: saved?.level ?? nextLevel,
      dailyStreak: saved?.daily_streak ?? nextStreak,
      unlockedBadges: badgeRows.map((row) => row.badge_key),
    };
  });

  return {
    gameId,
    xpEarned,
    xpTotal: txResult.xpTotal,
    level: txResult.level,
    dailyStreak: txResult.dailyStreak,
    unlockedBadges: txResult.unlockedBadges,
  };
}

export async function getStudentProgress(studentId: string, gameId?: MvpGameId): Promise<StudentGameProgress[]> {
  const progressRows = await prisma.$queryRaw<StoredProgress[]>(Prisma.sql`
    SELECT student_id, game_id, xp_total, level, daily_streak, last_played_on, created_at, updated_at
    FROM game_progress
    WHERE student_id = ${studentId}
    ${gameId ? Prisma.sql`AND game_id = ${gameId}` : Prisma.empty}
    ORDER BY updated_at DESC
  `);

  if (!progressRows.length) return [];

  const gameIds = progressRows.map((row) => row.game_id);
  const badgeRows = await prisma.$queryRaw<Array<{ game_id: string; badge_key: string }>>(Prisma.sql`
    SELECT game_id, badge_key
    FROM game_badges
    WHERE student_id = ${studentId} AND game_id IN (${Prisma.join(gameIds)})
    ORDER BY unlocked_at ASC
  `);

  const badgeMap = new Map<string, string[]>();
  for (const row of badgeRows) {
    const existing = badgeMap.get(row.game_id) ?? [];
    existing.push(row.badge_key);
    badgeMap.set(row.game_id, existing);
  }

  return progressRows.map((row) => ({
    gameId: row.game_id,
    xpTotal: row.xp_total,
    level: row.level,
    dailyStreak: row.daily_streak,
    lastPlayedOn: row.last_played_on ? row.last_played_on.toISOString().slice(0, 10) : null,
    badges: badgeMap.get(row.game_id) ?? [],
  }));
}
