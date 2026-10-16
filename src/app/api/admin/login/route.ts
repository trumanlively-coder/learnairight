import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, checkAdminPassword, createAdminSessionToken, isAdminConfigured } from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin not configured: ADMIN_PASSWORD is not set." }, { status: 503 });
  }
  let password = "";
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    password = String((await req.json().catch(() => ({})))?.password || "");
  } else {
    password = String((await req.formData()).get("password") || "");
  }
  const isJson = contentType.includes("application/json");
  if (!checkAdminPassword(password)) {
    if (isJson) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url), 303);
  }
  const token = createAdminSessionToken();
  if (!token) return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  const res = isJson
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/admin/sponsors", req.url), 303);
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
  return res;
}
