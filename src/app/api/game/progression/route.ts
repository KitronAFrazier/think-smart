import { NextResponse } from "next/server";
import { getAuthedStudent } from "@/lib/auth/get-student";
import { getStudentProgress } from "@/lib/game-progression";
import { isMvpGameId } from "@/lib/game-library";

export async function GET(req: Request) {
  const { student } = await getAuthedStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const requestedGameId = url.searchParams.get("gameId");

  if (requestedGameId && !isMvpGameId(requestedGameId)) {
    return NextResponse.json({ error: "Invalid gameId" }, { status: 400 });
  }

  const gameId = requestedGameId && isMvpGameId(requestedGameId) ? requestedGameId : undefined;
  const progress = await getStudentProgress(student.id, gameId);

  return NextResponse.json({
    progress,
  });
}
