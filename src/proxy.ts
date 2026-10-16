import crypto from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16: middleware is now `proxy` (src/proxy.ts, Node.js runtime).
// This is an optimistic first gate for /admin/*; the admin page and
// GET /api/sponsors ALSO verify the session server-side (defense in depth).
const COOKIE = "learnairight_admin";

function isValidToken(token: string | undefined): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  if (!Number.isFinite(Number(payload)) || Number(payload) < Date.now()) return false;
  const expected = crypto.createHmac("sha256", secret).update(`learnairight-admin:${payload}`).digest("base64url");
  const a = Buffer.from(token.slice(dot + 1));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // The login page itself must stay reachable; it fails closed with a
  // clear "admin not configured" message when ADMIN_PASSWORD is unset.
  if (pathname === "/admin/login") return NextResponse.next();
  if (isValidToken(request.cookies.get(COOKIE)?.value)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
