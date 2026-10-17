import crypto from "crypto";
import { cookies } from "next/headers";
import { findUserById, type User } from "./users";
import { TRIAL_MODULE_SLUG, getModule } from "@/data/modules";
import { isTrialActive } from "./users";

export const USER_COOKIE = "learnairight_user";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
// Optional USER_SESSION_SECRET; falls back to ADMIN_PASSWORD, then a clearly
// local-dev-only constant. Set USER_SESSION_SECRET before any public launch.
function secret() { return process.env.USER_SESSION_SECRET || process.env.ADMIN_PASSWORD || "learnairight-local-dev-only-secret-change-me"; }
function sign(payload: string) { return crypto.createHmac("sha256", secret()).update(`learnairight-user:${payload}`).digest("base64url"); }
export function createUserSessionToken(userId: string, now = Date.now()): string {
  const payload = `${userId}.${now + TTL_MS}`; return `${payload}.${sign(payload)}`;
}
export function verifyUserSessionToken(token: string | undefined | null, now = Date.now()): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf("."); if (dot <= 0) return null;
  const payload = token.slice(0, dot); const sig = token.slice(dot + 1);
  const exp = Number(payload.split(".").pop()); if (!Number.isFinite(exp) || exp < now) return null;
  const a = Buffer.from(sig); const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return payload.slice(0, payload.lastIndexOf("."));
}
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const id = verifyUserSessionToken(store.get(USER_COOKIE)?.value);
  return id ? findUserById(id) ?? null : null;
}
export const userCookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: Math.floor(TTL_MS / 1000) };

/** Server-side module gate — used by the module page AND the download route. */
export function canAccessModule(user: User | null, slug: string): boolean {
  const mod = getModule(slug); if (!mod) return false;
  if (!mod.paid) return true; // Module 1 is free for everyone, signed in or not
  if (!user) return false;
  if (user.bundle || user.entitlements.includes(slug)) return true;
  if (slug === TRIAL_MODULE_SLUG && isTrialActive(user)) return true;
  return false;
}
export function hasBundleAccess(user: User | null): boolean { return Boolean(user?.bundle); }
export function accessLabel(user: User | null, slug: string): "free" | "unlocked" | "trial" | "locked" {
  const mod = getModule(slug); if (!mod) return "locked";
  if (!mod.paid) return "free";
  if (!user) return "locked";
  if (user.bundle || user.entitlements.includes(slug)) return "unlocked";
  if (slug === TRIAL_MODULE_SLUG && isTrialActive(user)) return "trial";
  return "locked";
}
