"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrialButton } from "@/components/ModuleActions";

const LS_KEY = "learnairight-first-win";
const STEP_LABELS = [
  "Watch Lesson 1 above (first video slot + guide)",
  "Copy the starter prompt below",
  "Adapt it to your job/shop in the box",
  "Save it to your account",
];

export default function FirstWinChecklist({ loggedIn, starterPrompt, initialSteps, initialPrompt, initialCompletedAt }: {
  loggedIn: boolean; starterPrompt: string; initialSteps: number[]; initialPrompt: string; initialCompletedAt: string | null;
}) {
  const router = useRouter();
  const [steps, setSteps] = useState<number[]>(initialSteps);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [savedAt, setSavedAt] = useState<string | null>(initialCompletedAt);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // Anonymous progress is in-session/local only; it becomes account-saved on signup + Save.
  useEffect(() => {
    if (loggedIn) return;
    const id = setTimeout(() => {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) { const d = JSON.parse(raw); if (Array.isArray(d.steps)) setSteps(d.steps); if (typeof d.prompt === "string" && d.prompt) setPrompt(d.prompt); }
      } catch { /* ignore */ }
    }, 0);
    return () => clearTimeout(id);
  }, [loggedIn]);

  function persistLocal(nextSteps: number[], nextPrompt: string) {
    if (!loggedIn) { try { localStorage.setItem(LS_KEY, JSON.stringify({ steps: nextSteps, prompt: nextPrompt })); } catch { /* ignore */ } }
  }
  async function persistServer(nextSteps: number[], nextPrompt: string, announce = false) {
    if (!loggedIn) { persistLocal(nextSteps, nextPrompt); return; }
    if (announce) setBusy(true);
    const r = await fetch("/api/modules/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ steps: nextSteps, prompt: nextPrompt }) });
    const d = await r.json().catch(() => ({}));
    if (announce) setBusy(false);
    if (!r.ok) { if (announce) setMsg(d.error || "Could not save."); return; }
    if (d.firstWin) { setSteps(d.firstWin.steps); setSavedAt(d.firstWin.completedAt); }
    if (announce) { setMsg("Saved to your account."); router.refresh(); }
  }
  function toggle(n: number) {
    const next = steps.includes(n) ? steps.filter((x) => x !== n) : [...steps, n].sort((a, b) => a - b);
    setSteps(next); persistLocal(next, prompt); if (loggedIn) void persistServer(next, prompt);
  }
  function copyStarter() {
    setPrompt(starterPrompt);
    if (!steps.includes(2)) { const next = [...steps, 2].sort((a, b) => a - b); setSteps(next); persistLocal(next, starterPrompt); if (loggedIn) void persistServer(next, starterPrompt); }
    setMsg("Starter prompt copied into the box — now make it yours (step 3).");
  }
  const done = Boolean(savedAt && prompt.trim()) || (loggedIn && steps.includes(4) && Boolean(prompt.trim()));

  return (
    <section className="rounded-3xl border border-emerald-400/30 p-6" aria-label="First-win checklist">
      <p className="text-xs font-bold tracking-widest text-emerald-300">YOUR FIRST WIN ✦ ABOUT 10–15 MINUTES</p>
      <h2 className="mt-2 text-2xl font-bold">Leave with a prompt that works for your job</h2>
      <p className="mt-2 text-sm text-zinc-400">Five steps. No account needed to start — you only need a free account to save your prompt and progress (step 4). No credit card, ever, until you choose to buy a module.</p>
      <ol className="mt-5 space-y-3">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1; const checked = steps.includes(n) || (n === 4 && done);
          return (
            <li key={n} className="flex items-start gap-3 rounded-2xl border border-white/10 p-4">
              <input type="checkbox" checked={checked} onChange={() => toggle(n)} disabled={n === 4} className="mt-1 h-5 w-5 accent-amber-400" aria-label={`Step ${n}: ${label}`} />
              <div className="flex-1">
                <p className="font-bold text-sm">Step {n} — {label}{n === 4 && <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-zinc-200">Free with account</span>}</p>
                {n === 2 && <button onClick={copyStarter} className="mt-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-black">Copy the starter prompt</button>}
                {n === 3 && (
                  <textarea value={prompt} onChange={(e) => { setPrompt(e.target.value); persistLocal(steps, e.target.value); }} rows={5}
                    placeholder="Edit the starter prompt here with your real job, shop, task, and tone…"
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-amber-400" />
                )}
                {n === 4 && (loggedIn ? (
                  <button onClick={() => void persistServer(steps, prompt, true)} disabled={busy || !prompt.trim()} className="mt-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-black disabled:opacity-60">{busy ? "Saving…" : "Save it to your account"}</button>
                ) : (
                  <Link href="/signup?next=/modules/ai-for-beginners" className="mt-2 inline-block rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-black">Create a free account to save</Link>
                ))}
              </div>
            </li>
          );
        })}
        <li className="flex items-start gap-3 rounded-2xl border border-amber-400/30 p-4">
          <span className="mt-0.5 text-lg">→</span>
          <div>
            <p className="font-bold text-sm">Step 5 — See what&rsquo;s next</p>
            <p className="mt-1 text-sm text-zinc-400">Unlock Module 2, “Prompting Like a Manager,” free for 7 days and turn this one prompt into a reusable brief.</p>
            <div className="mt-2 flex flex-wrap gap-2 items-start"><TrialButton loggedIn={loggedIn} /><Link href="/modules/prompting-like-a-manager" className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold">Preview Module 2</Link></div>
          </div>
        </li>
      </ol>
      {done && <p className="mt-4 rounded-xl bg-emerald-400/10 border border-emerald-400/30 px-4 py-3 text-sm text-emerald-200">✅ You saved your first working prompt. It stays in your account — find it under “My saved prompts” on the modules page.</p>}
      {msg && !done && <p className="mt-3 text-xs text-emerald-300">{msg}</p>}
      {!loggedIn && <p className="mt-3 text-xs text-zinc-500">Your ticks and draft are kept in this browser until you sign up. Saving to an account is what makes them stick.</p>}
    </section>
  );
}
