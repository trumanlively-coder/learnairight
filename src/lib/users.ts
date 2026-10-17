import crypto from "crypto";
import fs from "fs";
import path from "path";
// Local/mock account + subscriber stores. Files contain emails + password
// hashes and are gitignored (see .gitignore). Move to a real DB before launch.
export type User = {
  id: string; email: string; passwordHash: string; // "salt:hash" scrypt, never plaintext
  entitlements: string[]; // paid module slugs
  bundle: boolean; trialEndsAt: string | null; createdAt: string;
};
export type Subscriber = {
  id: string; email: string; plan: string; // trial | single:<slug> | bundle | premium
  amount: number; // USD, mock
  status: string; startsAt: string; expiresAt: string | null; createdAt: string;
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
export const isTrialActive = (u: User | null) => Boolean(u?.trialEndsAt && new Date(u.trialEndsAt).getTime() > Date.now());
