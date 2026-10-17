import crypto from "crypto";
import fs from "fs";
import path from "path";
// Local/mock account + subscriber stores. Files contain emails + password
// hashes and are gitignored (see .gitignore). Move to a real DB before launch.
export type FirstWinProgress = { steps: number[]; prompt: string; completedAt: string | null; updatedAt: string };
export type User = {
  id: string; email: string; passwordHash: string; // "salt:hash" scrypt, never plaintext
  entitlements: string[]; // paid module slugs
  bundle: boolean; trialEndsAt: string | null; createdAt: string;
  firstWin?: FirstWinProgress; // Module 1 first-win checklist + saved prompt (the lock-in library seed)
};
export type Subscriber = {
  id: string; email: string; plan: string; // trial | single:<slug> | bundle | premium
  amount: number; // USD
  status: string; // active_mock | paid_test | trial_active | ...
  startsAt: string; expiresAt: string | null; createdAt: string;
  stripeSessionId?: string; // for idempotent Stripe grants (webhook + success-page verify)
};
const usersFile = path.join(process.cwd(), "data", "users.json");
const subsFile = path.join(process.cwd(), "data", "subscribers.json");
function read<T>(file: string): T[] { try { const v = JSON.parse(fs.readFileSync(file, "utf8")); return Array.isArray(v) ? v : []; } catch { return []; } }
function write(file: string, data: unknown) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(data, null, 2)); }
export const readUsers = () => read<User>(usersFile);
export const readSubscribers = () => read<Subscriber>(subsFile);
function saveUser(u: User) { const all = readUsers(); const i = all.findIndex((x) => x.id === u.id); if (i >= 0) all[i] = u; else all.push(u); write(usersFile, all); }
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":"); if (!salt || !hash) return false;
  const a = crypto.scryptSync(password, salt, 64); const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export const findUserByEmail = (email: string) => readUsers().find((u) => u.email === email.toLowerCase().trim());
export const findUserById = (id: string) => readUsers().find((u) => u.id === id);
export function createUser(email: string, password: string): User {
  const u: User = { id: crypto.randomUUID(), email: email.toLowerCase().trim(), passwordHash: hashPassword(password), entitlements: [], bundle: false, trialEndsAt: null, createdAt: new Date().toISOString() };
  saveUser(u); return u;
}
export function addSubscriber(s: Omit<Subscriber, "id" | "createdAt">): Subscriber {
  const item: Subscriber = { ...s, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), createdAt: new Date().toISOString() };
  write(subsFile, [...readSubscribers(), item]); return item;
}
export function startTrial(user: User): User {
  const ends = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const updated = { ...user, trialEndsAt: ends.toISOString() }; saveUser(updated);
  addSubscriber({ email: user.email, plan: "trial", amount: 0, status: "trial_active", startsAt: new Date().toISOString(), expiresAt: ends.toISOString() });
  return updated;
}
export function recordPurchase(user: User, plan: "single" | "bundle", slug: string | null, amount: number): User {
  const updated = plan === "bundle"
    ? { ...user, bundle: true }
    : { ...user, entitlements: [...new Set([...user.entitlements, ...(slug ? [slug] : [])])] };
  saveUser(updated);
  addSubscriber({ email: user.email, plan: plan === "bundle" ? "bundle" : `single:${slug}`, amount, status: "active_mock", startsAt: new Date().toISOString(), expiresAt: null });
  return updated;
}
/**
 * Idempotent Stripe TEST grant: safe to call from BOTH the webhook and the
 * success-page session verification — the stripeSessionId dedupes.
 * amountCents: 2900 (single) / 9900 (bundle), recorded as USD in subscribers.
 */
export function grantStripePurchaseByEmail(email: string, plan: "single" | "bundle", slug: string | null, amountCents: number, sessionId: string): { user: User | null; alreadyGranted: boolean } {
  const user = findUserByEmail(String(email || ""));
  if (!user) return { user: null, alreadyGranted: false };
  if (sessionId && readSubscribers().some((s) => s.stripeSessionId === sessionId)) return { user, alreadyGranted: true };
  const updated = plan === "bundle"
    ? { ...user, bundle: true }
    : { ...user, entitlements: [...new Set([...user.entitlements, ...(slug ? [slug] : [])])] };
  saveUser(updated);
  addSubscriber({ email: updated.email, plan: plan === "bundle" ? "bundle" : `single:${slug}`, amount: amountCents / 100, status: "paid_test", startsAt: new Date().toISOString(), expiresAt: null, stripeSessionId: sessionId || undefined });
  return { user: updated, alreadyGranted: false };
}
export function saveFirstWinProgress(user: User, steps: number[], prompt: string): User {
  const cleanPrompt = String(prompt || "").slice(0, 2000);
  const cleanSteps = [...new Set((Array.isArray(steps) ? steps : []).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 5))].sort((a, b) => a - b);
  if (cleanPrompt.trim() && !cleanSteps.includes(4)) cleanSteps.push(4);
  const completedAt = cleanPrompt.trim() ? (user.firstWin?.completedAt || new Date().toISOString()) : (user.firstWin?.completedAt || null);
  const updated = { ...user, firstWin: { steps: cleanSteps.sort((a, b) => a - b), prompt: cleanPrompt, completedAt, updatedAt: new Date().toISOString() } };
  saveUser(updated); return updated;
}
export const isTrialActive = (u: User | null) => Boolean(u?.trialEndsAt && new Date(u.trialEndsAt).getTime() > Date.now());
