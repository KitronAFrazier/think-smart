import { NextResponse } from "next/server";
import { z } from "zod";
import { defaultProfile } from "@/lib/adaptive-engine";
import { getAuthedStudent } from "@/lib/auth/get-student";
import { isMvpGameId } from "@/lib/game-library";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  mode: z.enum(["multiples", "factors", "primes", "equality", "inequality"]),
  gameId: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json();
  const { mode, gameId } = Body.parse(json);

  if (gameId && !isMvpGameId(gameId)) {
    return NextResponse.json({ error: "Invalid gameId" }, { status: 400 });
  }

  const { student } = await getAuthedStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile =
    (await prisma.studentModeProfile.findUnique({
      where: { studentId_mode: { studentId: student.id, mode } },
    })) ??
    (await prisma.studentModeProfile.create({
      data: { studentId: student.id, mode, ...defaultProfile() },
    }));

  const session = await prisma.gameSession.create({
    data: { studentId: student.id, mode },
  });

  return NextResponse.json({
    sessionId: session.id,
    gameId: gameId ?? null,
    profile: {
      level: profile.level,
      numberMax: profile.numberMax,
      eqComplexity: profile.eqComplexity,
      troggleCount: profile.troggleCount,
      tickMs: profile.tickMs,
    },
  });
}
