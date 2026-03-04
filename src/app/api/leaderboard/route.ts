import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  const Mode = z.enum(["multiples", "factors", "primes", "equality", "inequality"]);
  const parsed = Mode.safeParse(mode);

  const rows = await prisma.studentBestScore.findMany({
    where: parsed.success ? { mode: parsed.data } : undefined,
    orderBy: { bestScore: "desc" },
    take: 25,
    include: { student: { select: { name: true, email: true } } },
  });

  return NextResponse.json({
    mode: parsed.success ? parsed.data : "all",
    leaderboard: rows.map((row: { student: { name: string | null; email: string }; bestScore: number; mode: string }) => ({
      studentName: row.student.name ?? row.student.email,
      bestScore: row.bestScore,
      mode: row.mode,
    })),
  });
}
