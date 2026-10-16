import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "learnairight_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length > 0);
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(`learnairight-admin:${payload}`).digest("base64url");
}

/** Token is `<expMs>.<hmac>` — never contains the password itself. */
export function createAdminSessionToken(now = Date.now()): string | null {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  const payload = String(now + SESSION_TTL_MS);
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null, now = Date.now()): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp < now) return false;
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function checkAdminPassword(input: string): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !input) return false;
  // Hash both sides first so timingSafeEqual always compares equal lengths.
  const a = crypto.createHash("sha256").update(input).digest();
  const b = crypto.createHash("sha256").update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const store = await cookies();
  return verifyAdminSessionToken(store.get(ADMIN_COOKIE)?.value);
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: Math.floor(SESSION_TTL_MS / 1000),
};
