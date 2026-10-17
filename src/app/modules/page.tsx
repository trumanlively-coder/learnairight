import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { BUNDLE_PRICE, SINGLE_PRICE, modules } from "@/data/modules";
import { accessLabel, getCurrentUser } from "@/lib/user-auth";
import { isTrialActive } from "@/lib/users";
import { BuyButtons, LogoutButton, TrialButton } from "@/components/ModuleActions";
import { isStripeModulesConfigured } from "@/lib/stripe";

async function ModulesInner() {
  await connection();
  const user = await getCurrentUser();
  const trial = isTrialActive(user);
  const badge = (s: string) => {
    const a = accessLabel(user, s);
    if (a === "free") return "FREE — OPEN";
    if (a === "trial") return "TRIAL — UNLOCKED";
    if (a === "unlocked") return "UNLOCKED";
    return "🔒 LOCKED";
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      {isStripeModulesConfigured ? (<p className="text-amber-400 font-bold tracking-widest text-xs">TRAINING MODULES ✦ STRIPE TEST MODE — TEST CARD ONLY, NO REAL CHARGES</p>) : (<p className="text-amber-400 font-bold tracking-widest text-xs">TRAINING MODULES ✦ MOCK CHECKOUT — NO REAL CHARGES</p>)}
      <h1 className="mt-3 text-5xl font-black">Learn AI right, one module at a time.</h1>
      <p className="mt-3 text-zinc-400 max-w-2xl">Module 1 is free for everyone — start Lesson 1 instantly, no account needed. Create a free account only to download its exercise, save your progress, or start the 7-day trial of Module 2. No credit card, ever, until you choose to buy.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
        {user ? (<><span className="rounded-full bg-white/5 border border-white/10 px-4 py-2">Signed in as <b>{user.email}</b>{user.bundle ? " · All-Access" : ""}{trial ? ` · Trial until ${new Date(user.trialEndsAt!).toLocaleDateString()}` : ""}</span><LogoutButton /></>)
        : (<><Link href="/signup" className="rounded-full bg-amber-400 px-5 py-2.5 font-bold text-black">Create free account</Link><Link href="/login" className="rounded-full border border-white/20 px-5 py-2.5 font-bold">Log in</Link></>)}
      </div>

      {user?.firstWin?.prompt && (
        <section className="mt-8 rounded-3xl border border-emerald-400/30 p-6" aria-label="My saved prompts">
          <p className="text-xs font-bold tracking-widest text-emerald-300">MY SAVED PROMPTS</p>
          <h2 className="mt-2 text-xl font-bold">Your first working prompt</h2>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-zinc-200">{user.firstWin.prompt}</pre>
          <Link href="/modules/ai-for-beginners" className="mt-3 inline-block text-sm text-amber-400 underline">Continue Module 1 →</Link>
        </section>
      )}
      <div className="mt-10 grid md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-emerald-400/30 p-6"><p className="text-xs font-bold text-emerald-300">FREE TRIAL</p><h2 className="mt-2 text-2xl font-bold">Module 1 free + Module 2 for 7 days</h2><p className="mt-2 text-sm text-zinc-400">Module 1 (&ldquo;AI for Beginners&rdquo;) is open to everyone — Lesson 1 is instant, no account. Create a free account and start the trial to unlock Module 2 free for seven days.</p><div className="mt-4"><TrialButton loggedIn={Boolean(user)} /></div></div>
        <div className="rounded-3xl border border-white/10 p-6"><p className="text-xs font-bold text-amber-400">SINGLE MODULE PASS</p><h2 className="mt-2 text-2xl font-bold">${SINGLE_PRICE} <span className="text-sm text-zinc-400">/ module (placeholder)</span></h2><p className="mt-2 text-sm text-zinc-400">Unlock one paid module of your choice, forever in this mock store. Buy from any module page below.</p></div>
        <div className="rounded-3xl border border-amber-400/40 p-6"><p className="text-xs font-bold text-amber-400">ALL-ACCESS BUNDLE ✦ BEST VALUE</p><h2 className="mt-2 text-2xl font-bold">${BUNDLE_PRICE} <span className="text-sm text-zinc-400">(placeholder)</span></h2><p className="mt-2 text-sm text-zinc-400">Every module, every future module in this ladder, plus all LearnAIRight Premium guides.</p><div className="mt-4"><BuyButtons slug={modules[1].slug} loggedIn={Boolean(user)} stripeConfigured={isStripeModulesConfigured} /></div></div>
      </div>

      <div className="mt-12 space-y-4">
        {modules.map((m) => (
          <article key={m.slug} className="rounded-3xl border border-white/10 p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div>
              <p className="text-xs font-bold text-amber-400">MODULE {m.order} • {m.difficulty} • {m.duration} <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-zinc-200">{badge(m.slug)}</span></p>
              <h2 className="mt-2 text-2xl font-bold">{m.title}</h2>
              <p className="mt-1 text-sm text-zinc-400 max-w-2xl">{m.summary}</p>
              {!m.paid && <p className="mt-2 text-sm font-bold text-emerald-300">Start Lesson 1 instantly — no account</p>}
              <ul className="mt-3 space-y-1.5 text-sm max-w-2xl">
                {m.sections.map((s, i) => {
                  const lockedLesson = accessLabel(user, m.slug) === "locked";
                  return (<li key={s.heading} className={lockedLesson ? "flex flex-wrap gap-2 items-center text-zinc-500 opacity-60" : "flex flex-wrap gap-2 items-center text-zinc-300"}>
                    <span>{lockedLesson ? "🔒" : "✓"} Lesson {i + 1} — {s.heading}</span>
                    {lockedLesson && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-zinc-300">Included in All-Access · or ${SINGLE_PRICE} Single Pass</span>}
                    {!m.paid && i === 0 && <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">Instant — no account</span>}
                  </li>);
                })}
                {!m.paid && <li className="flex flex-wrap gap-2 items-center text-zinc-300"><span>✓ Exercise download &amp; saved progress</span><span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-zinc-200">Free with account</span></li>}
                {m.paid && accessLabel(user, m.slug) === "locked" && <li className="flex flex-wrap gap-2 items-center text-zinc-500 opacity-60"><span>🔒 {m.exerciseTitle} (download)</span><span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-zinc-300">Included in All-Access · or ${SINGLE_PRICE} Single Pass</span></li>}
              </ul>
            </div>
            <Link href={`/modules/${m.slug}`} className="shrink-0 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-black">{accessLabel(user, m.slug) === "locked" ? "Preview module" : "Open module"}</Link>
          </article>
        ))}
      </div>
      {isStripeModulesConfigured ? (<p className="mt-8 text-xs text-zinc-500">Stripe TEST mode is configured — checkout opens Stripe with test card 4242 4242 4242 4242, no real money moves. Remaining video slots are placeholders until Tru adds real video URLs.</p>) : (<p className="mt-8 text-xs text-zinc-500">Checkout not configured yet — mock unlock, no card, no charge. Remaining video slots are placeholders until Tru adds real video URLs.</p>)}
    </div>
  );
}
export default function Modules() { return (<Suspense fallback={<p className="p-8">Loading modules…</p>}><ModulesInner /></Suspense>); }
