import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type SessionPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SessionPayload;

  if (!body.access_token || !body.refresh_token) {
    return NextResponse.json({ error: "Missing access token or refresh token." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const accessTokenExpiresAt = body.expires_at ? new Date(body.expires_at * 1000) : undefined;
  const refreshTokenMaxAgeSeconds = 60 * 60 * 24 * 30;

  cookieStore.set("sb-access-token", body.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: accessTokenExpiresAt,
  });

  cookieStore.set("sb-refresh-token", body.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: refreshTokenMaxAgeSeconds,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("sb-access-token");
  cookieStore.delete("sb-refresh-token");

  return NextResponse.json({ ok: true });
}
