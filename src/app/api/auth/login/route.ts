import { NextResponse } from "next/server";
import { findUserByEmail, verifyPassword } from "@/lib/users";
import { createUserSessionToken, USER_COOKIE, userCookieOptions } from "@/lib/user-auth";
export async function POST(req: Request) {
  const { email = "", password = "" } = await req.json().catch(() => ({}));
  const user = findUserByEmail(String(email));
  if (!user || !verifyPassword(String(password), user.passwordHash)) return NextResponse.json({ error: "Email or password not recognised." }, { status: 401 });
  const res = NextResponse.json({ ok: true, email: user.email });
  res.cookies.set(USER_COOKIE, createUserSessionToken(user.id), userCookieOptions);
  return res;
}
