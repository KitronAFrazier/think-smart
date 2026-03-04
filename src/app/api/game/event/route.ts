import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedStudent } from "@/lib/auth/get-student";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  sessionId: z.string().uuid(),
  type: z.literal("eat"),
  isCorrect: z.boolean(),
  reactionMs: z.number().int().min(0).max(60000),
  value: z.string().min(1).max(20),
});

export async function POST(req: Request) {
  const json = await req.json();
  const body = Body.parse(json);

  const { student } = await getAuthedStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await prisma.gameSession.findUnique({
    where: { id: body.sessionId },
    select: { studentId: true },
  });

  if (!session || session.studentId !== student.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.gameEvent.create({
    data: {
      sessionId: body.sessionId,
      type: body.type,
      isCorrect: body.isCorrect,
      reactionMs: body.reactionMs,
      value: body.value,
    },
  });

  return NextResponse.json({ ok: true });
}
