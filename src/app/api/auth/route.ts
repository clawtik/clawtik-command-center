import { NextResponse } from "next/server";

const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "gtech";
const COOKIE_NAME = "clawtik-auth";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password === AUTH_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, AUTH_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ error: "Wrong password" }, { status: 401 });
}
