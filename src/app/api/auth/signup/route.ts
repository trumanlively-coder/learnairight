import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/users";
import { createUserSessionToken, USER_COOKIE, userCookieOptions } from "@/lib/user-auth";
export async function POST(req: Request) {
  const { email = "", password = "" } = await req.json().catch(() => ({}));
  const clean = String(email).toLowerCase().trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  if (String(password).length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  if (findUserByEmail(clean)) return NextResponse.json({ error: "An account with that email already exists — try logging in." }, { status: 409 });
  const user = createUser(clean, String(password));
  const res = NextResponse.json({ ok: true, email: user.email });
  res.cookies.set(USER_COOKIE, createUserSessionToken(user.id), userCookieOptions);
  return res;
}
