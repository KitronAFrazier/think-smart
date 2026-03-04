import { NextResponse } from "next/server";
import { z } from "zod";
import { computeNextProfile, defaultProfile, type Mode } from "@/lib/adaptive-engine";
import { getAuthedStudent } from "@/lib/auth/get-student";
import { awardGameRewards } from "@/lib/game-progression";
import { isMvpGameId } from "@/lib/game-library";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  sessionId: z.string().uuid(),
  score: z.number().int().min(0).max(1_000_000),
  levelReached: z.number().int().min(1).max(999),
  gameId: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json();
  const { sessionId, score, levelReached, gameId } = Body.parse(json);

  if (gameId && !isMvpGameId(gameId)) {
    return NextResponse.json({ error: "Invalid gameId" }, { status: 400 });
  }

  const { student } = await getAuthedStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: { events: true },
  });

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.studentId !== student.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const correctEats = session.events.filter((event: { type: string; isCorrect: boolean }) => event.type === "eat" && event.isCorrect).length;
  const wrongEats = session.events.filter((event: { type: string; isCorrect: boolean }) => event.type === "eat" && !event.isCorrect).length;
  const eatEvents = session.events.filter((event: { type: string }) => event.type === "eat");

  const avgReactionMs = eatEvents.length
    ? Math.round(eatEvents.reduce((sum: number, event: { reactionMs: number }) => sum + event.reactionMs, 0) / eatEvents.length)
    : 0;

  let bestStreak = 0;
  let streak = 0;

  for (const event of eatEvents) {
    if (event.isCorrect) {
      streak += 1;
    } else {
      streak = 0;
    }
    bestStreak = Math.max(bestStreak, streak);
  }

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      score,
      levelReached,
      correctEats,
      wrongEats,
      avgReactionMs,
      bestStreak,
    },
  });

  const prevProfile =
    (await prisma.studentModeProfile.findUnique({
      where: { studentId_mode: { studentId: student.id, mode: session.mode } },
    })) ??
    (await prisma.studentModeProfile.create({
      data: { studentId: student.id, mode: session.mode, ...defaultProfile() },
    }));

  const next = computeNextProfile(
    session.mode as Mode,
    {
      skillRating: prevProfile.skillRating,
      level: prevProfile.level,
      emaAccuracy: prevProfile.emaAccuracy,
      emaReactionMs: prevProfile.emaReactionMs,
      streakBest: prevProfile.streakBest,
      numberMax: prevProfile.numberMax,
      eqComplexity: prevProfile.eqComplexity as 1 | 2 | 3,
      troggleCount: prevProfile.troggleCount,
      tickMs: prevProfile.tickMs,
    },
    { correctEats, wrongEats, avgReactionMs, bestStreak, score, levelReached },
  );

  await prisma.studentModeProfile.update({
    where: { studentId_mode: { studentId: student.id, mode: session.mode } },
    data: {
      skillRating: next.skillRating,
      level: next.level,
      emaAccuracy: next.emaAccuracy,
      emaReactionMs: next.emaReactionMs,
      streakBest: next.streakBest,
      numberMax: next.numberMax,
      eqComplexity: next.eqComplexity,
      troggleCount: next.troggleCount,
      tickMs: next.tickMs,
    },
  });

  const existing = await prisma.studentBestScore.findUnique({
    where: { studentId_mode: { studentId: student.id, mode: session.mode } },
    select: { bestScore: true },
  });

  await prisma.studentBestScore.upsert({
    where: { studentId_mode: { studentId: student.id, mode: session.mode } },
    update: { bestScore: Math.max(score, existing?.bestScore ?? 0) },
    create: { studentId: student.id, mode: session.mode, bestScore: score },
  });

  const rewardGameId = gameId && isMvpGameId(gameId) ? gameId : null;

  const rewardProgress = rewardGameId
    ? await awardGameRewards({
        studentId: student.id,
        gameId: rewardGameId,
        correctEats,
        bestStreak,
        levelReached,
      })
    : null;

  return NextResponse.json({
    ok: true,
    summary: { correctEats, wrongEats, avgReactionMs, bestStreak },
    rewardProgress,
    nextProfile: {
      level: next.level,
      numberMax: next.numberMax,
      eqComplexity: next.eqComplexity,
      troggleCount: next.troggleCount,
      tickMs: next.tickMs,
    },
  });
}
