import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BUNDLE_PRICE, SINGLE_PRICE, getModule, modules } from "@/data/modules";
import { accessLabel, canAccessModule, getCurrentUser } from "@/lib/user-auth";
import { BuyButtons, TrialButton } from "@/components/ModuleActions";
import FirstWinChecklist from "@/components/FirstWinChecklist";

function VideoPlaceholder({ n, lessonLabel }: { n: number; lessonLabel?: string }) {
  return (
    <div className="flex aspect-video items-center justify-center rounded-3xl border border-dashed border-amber-400/40 bg-white/5 text-center px-6">
      <div><p className="text-3xl">▶</p>{lessonLabel && <p className="mt-2 text-xs font-bold tracking-widest text-amber-400">{lessonLabel}</p>}<p className="mt-2 font-bold">Video {n} coming soon — Tru to add URL</p><p className="text-sm text-zinc-400">Placeholder embed slot. No video is loaded here yet.</p></div>
    </div>
  );
}
const ALL_ACCESS_LABEL = "Included in All-Access";

async function ModuleInner({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const mod = getModule(slug); if (!mod) notFound();
  const user = await getCurrentUser();
  const unlocked = canAccessModule(user, slug);
  const label = accessLabel(user, slug);
  const isFree = !mod.paid;
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <Link href="/modules" className="text-sm text-amber-400 underline">← All modules</Link>
      <p className="mt-6 text-amber-400 font-bold tracking-widest text-xs">MODULE {mod.order} • {mod.difficulty} • {mod.duration} • {label.toUpperCase()}</p>
      <h1 className="mt-3 text-5xl font-black">{mod.title}</h1>
      <p className="mt-3 text-zinc-400">{mod.summary}</p>
      {isFree && <p className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-200">Start Lesson 1 instantly — no account needed. Only the exercise download and saved progress need a free account. No credit card, ever, until you choose to buy.</p>}
      <div className="mt-6 rounded-3xl border border-white/10 p-6">
        <h2 className="font-bold">What you&rsquo;ll be able to do</h2>
        <ul className="mt-2 list-disc pl-5 space-y-1 text-zinc-300">{mod.outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
      </div>

      {unlocked ? (
        <div className="mt-8 space-y-8">
          {Array.from({ length: mod.videoSlots }, (_, i) => <VideoPlaceholder key={i} n={i + 1} lessonLabel={isFree && i === 0 ? "LESSON 1 — INSTANT ACCESS · NO ACCOUNT NEEDED" : isFree ? `LESSON ${i + 1} — FREE` : undefined} />)}
          {mod.sections.map((s, idx) => (
            <div key={s.heading} className="space-y-8">
              <section className="rounded-3xl border border-white/10 p-6">
                <p className="text-xs font-bold tracking-widest text-amber-400">{isFree && idx === 0 ? "LESSON 1 — INSTANT ACCESS · NO ACCOUNT NEEDED" : isFree ? `LESSON ${idx + 1} — FREE` : `LESSON ${idx + 1} — UNLOCKED`}</p>
                <h2 className="mt-2 text-2xl font-bold">{s.heading}</h2>
                <p className="mt-2 text-zinc-300">{s.body}</p>
                <ol className="mt-3 list-decimal pl-5 space-y-1 text-zinc-300">{s.steps.map((x) => <li key={x}>{x}</li>)}</ol>
              </section>
              {isFree && idx === 0 && (
                <FirstWinChecklist loggedIn={Boolean(user)} starterPrompt={mod.starterPrompt || ""} initialSteps={user?.firstWin?.steps || []} initialPrompt={user?.firstWin?.prompt || ""} initialCompletedAt={user?.firstWin?.completedAt || null} />
              )}
            </div>
          ))}
          <section className="rounded-3xl border border-amber-400/30 p-6">
            <h2 className="text-2xl font-bold">{mod.exerciseTitle}</h2>
            <p className="mt-2 text-zinc-300">Do this one for real — it is where the learning sticks.{isFree ? " You can start the exercise from the guide above with no account; the downloadable worksheet is free with an account." : " Download the worksheet, work through it, and keep it with your notes."}</p>
            {isFree && !user ? (
              <>
                <Link href={`/signup?next=/modules/${mod.slug}`} className="mt-4 inline-block rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-black">Download exercise (.md) — Free with account</Link>
                <p className="mt-2 text-xs text-zinc-500">Create a free account (email only, no card) to download and to save your checklist progress.</p>
              </>
            ) : (
              <a href={`/api/modules/${mod.slug}/download`} className="mt-4 inline-block rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-black">Download exercise (.md)</a>
            )}
          </section>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="rounded-3xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold">Lessons in this module</h2>
            <p className="mt-2 text-sm text-zinc-400">Locked lessons are greyed out so you can see exactly what you get. Titles only — no guide content until you unlock.</p>
            <ul className="mt-4 space-y-3">
              {Array.from({ length: mod.videoSlots }, (_, i) => (
                <li key={`v${i}`} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 opacity-60">
                  <span className="text-sm font-bold text-zinc-400">🔒 Video lesson {i + 1}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-zinc-300">{ALL_ACCESS_LABEL} · or ${SINGLE_PRICE} Single Pass</span>
                </li>
              ))}
              {mod.sections.map((s, idx) => (
                <li key={s.heading} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 opacity-60">
                  <span className="text-sm font-bold text-zinc-400">🔒 Lesson {idx + 1} — {s.heading}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-zinc-300">{ALL_ACCESS_LABEL} · or ${SINGLE_PRICE} Single Pass</span>
                </li>
              ))}
              <li className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 opacity-60">
                <span className="text-sm font-bold text-zinc-400">🔒 {mod.exerciseTitle} (download)</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-zinc-300">{ALL_ACCESS_LABEL} · or ${SINGLE_PRICE} Single Pass</span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-amber-400/30 p-6">
            <h2 className="text-2xl font-bold">🔒 Unlock this module</h2>
            <p className="mt-2 text-zinc-300">The full written guide, video lessons, and the downloadable exercise unlock with a free trial (Module 2 only), a Single Module Pass (${SINGLE_PRICE}), or the All-Access Bundle (${BUNDLE_PRICE}, includes Premium). Prices are placeholders; checkout is mocked — no card asked, no charge.</p>
            <div className="mt-5 flex flex-wrap gap-3 items-start">
              {slug === "prompting-like-a-manager" && <TrialButton loggedIn={Boolean(user)} />}
              <BuyButtons slug={mod.slug} loggedIn={Boolean(user)} />
              {!user && <Link href={`/signup?next=/modules/${mod.slug}`} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold">Create free account first</Link>}
            </div>
          </div>
        </div>
      )}
      <div className="mt-10 flex justify-between text-sm">
        {mod.order > 1 ? <Link className="text-amber-400 underline" href={`/modules/${modules[mod.order - 2].slug}`}>← Previous module</Link> : <span />}
        {mod.order < modules.length ? <Link className="text-amber-400 underline" href={`/modules/${modules[mod.order].slug}`}>Next module →</Link> : <span />}
      </div>
    </div>
  );
}
export default function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  return (<Suspense fallback={<p className="p-8">Loading module…</p>}><ModuleInner params={params} /></Suspense>);
}
