import { NextRequest, NextResponse } from "next/server";

const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "gtech";
const COOKIE_NAME = "clawtik-auth";

export function middleware(req: NextRequest) {
  // Skip auth for the login page and login API
  if (
    req.nextUrl.pathname === "/login" ||
    req.nextUrl.pathname === "/api/auth"
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authCookie = req.cookies.get(COOKIE_NAME);
  if (authCookie?.value === AUTH_PASSWORD) {
    return NextResponse.next();
  }

  // Redirect to login
  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
