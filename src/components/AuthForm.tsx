"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
export default function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const router = useRouter(); const params = useSearchParams();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const d = await r.json().catch(() => ({})); setBusy(false);
    if (!r.ok) { setError(d.error || "Something went wrong."); return; }
    router.push(params.get("next") || "/modules"); router.refresh();
  }
  const input = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-amber-400";
  return (
    <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-white/10 p-6">
      <label className="block text-sm">Email<input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
      <label className="block text-sm">Password<input className={input} type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>
      {mode === "signup" && <p className="text-xs text-zinc-500">At least 8 characters. Stored only as a salted hash (scrypt) — never in plain text. Local/mock accounts for now; no email is sent.</p>}
      {error && <p className="rounded-xl bg-red-400/10 border border-red-400/30 px-4 py-3 text-sm text-red-200">{error}</p>}
      <button disabled={busy} className="w-full rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-black hover:bg-amber-300 disabled:opacity-60">{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}</button>
    </form>
  );
}
