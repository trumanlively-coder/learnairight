"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
const btn = "rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-300 disabled:opacity-60";
const ghost = "rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold hover:bg-white/10 disabled:opacity-60";

export function TrialButton({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter(); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function start() {
    if (!loggedIn) { router.push("/signup?next=/modules"); return; }
    setBusy(true);
    const r = await fetch("/api/trial/start", { method: "POST" });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg(d.error || "Could not start trial."); return; }
    setMsg(d.alreadyActive ? "Your trial is already active — Module 2 is unlocked below." : "✅ Trial started — Module 2 is unlocked for 7 days.");
    router.refresh();
  }
  return (<span className="inline-flex flex-col gap-1"><button className={btn} disabled={busy} onClick={start}>{busy ? "Starting…" : "Start your free trial"}</button>{msg && <span className="text-xs text-emerald-300">{msg}</span>}</span>);
}

export function BuyButtons({ slug, loggedIn }: { slug: string; loggedIn: boolean }) {
  const router = useRouter(); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState("");
  async function buy(plan: "single" | "bundle") {
    if (!loggedIn) { router.push("/signup?next=/modules"); return; }
    setBusy(plan);
    const r = await fetch("/api/modules/purchase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, slug }) });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) { setMsg(d.error || "Purchase failed."); return; }
    setMsg(`✅ Mock purchase recorded — no charge was made. ${plan === "bundle" ? "All-Access (incl. Premium) is unlocked." : "This module is unlocked."}`);
    router.refresh();
  }
  return (
    <span className="inline-flex flex-col gap-2">
      <span className="flex flex-wrap gap-2">
        <button className={btn} disabled={!!busy} onClick={() => buy("single")}>{busy === "single" ? "…" : "Buy Single Pass — $29"}</button>
        <button className={ghost} disabled={!!busy} onClick={() => buy("bundle")}>{busy === "bundle" ? "…" : "All-Access Bundle — $99"}</button>
      </span>
      <span className="text-xs text-zinc-500">Mock checkout — no card, no charge. Tru connects Stripe before launch.</span>
      {msg && <span className="text-xs text-emerald-300">{msg}</span>}
    </span>
  );
}

export function LogoutButton() {
  const router = useRouter();
  async function out() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/modules"); router.refresh(); }
  return <button className={ghost} onClick={out}>Log out</button>;
}
