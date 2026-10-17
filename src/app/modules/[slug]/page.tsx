import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, modules } from "@/data/modules";
import { accessLabel, canAccessModule, getCurrentUser } from "@/lib/user-auth";
import { BuyButtons, TrialButton } from "@/components/ModuleActions";

function VideoPlaceholder({ n }: { n: number }) {
  return (
    <div className="flex aspect-video items-center justify-center rounded-3xl border border-dashed border-amber-400/40 bg-white/5 text-center px-6">
      <div><p className="text-3xl">▶</p><p className="mt-2 font-bold">Video {n} coming soon — Tru to add URL</p><p className="text-sm text-zinc-400">Placeholder embed slot. No video is loaded here yet.</p></div>
    </div>
  );
}

async function ModuleInner({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const mod = getModule(slug); if (!mod) notFound();
  const user = await getCurrentUser();
  const unlocked = canAccessModule(user, slug);
  const label = accessLabel(user, slug);
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <Link href="/modules" className="text-sm text-amber-400 underline">← All modules</Link>
      <p className="mt-6 text-amber-400 font-bold tracking-widest text-xs">MODULE {mod.order} • {mod.difficulty} • {mod.duration} • {label.toUpperCase()}</p>
      <h1 className="mt-3 text-5xl font-black">{mod.title}</h1>
      <p className="mt-3 text-zinc-400">{mod.summary}</p>
      <div className="mt-6 rounded-3xl border border-white/10 p-6">
        <h2 className="font-bold">What you&rsquo;ll be able to do</h2>
        <ul className="mt-2 list-disc pl-5 space-y-1 text-zinc-300">{mod.outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
      </div>

      {unlocked ? (
        <div className="mt-8 space-y-8">
          {Array.from({ length: mod.videoSlots }, (_, i) => <VideoPlaceholder key={i} n={i + 1} />)}
          {mod.sections.map((s) => (
            <section key={s.heading} className="rounded-3xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold">{s.heading}</h2>
              <p className="mt-2 text-zinc-300">{s.body}</p>
              <ol className="mt-3 list-decimal pl-5 space-y-1 text-zinc-300">{s.steps.map((x) => <li key={x}>{x}</li>)}</ol>
            </section>
          ))}
          <section className="rounded-3xl border border-amber-400/30 p-6">
            <h2 className="text-2xl font-bold">{mod.exerciseTitle}</h2>
            <p className="mt-2 text-zinc-300">Do this one for real — it is where the learning sticks. Download the worksheet, work through it, and keep it with your notes.</p>
            <a href={`/api/modules/${mod.slug}/download`} className="mt-4 inline-block rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-black">Download exercise (.md)</a>
          </section>
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-amber-400/30 p-6">
          <h2 className="text-2xl font-bold">🔒 This module is locked</h2>
          <p className="mt-2 text-zinc-300">You can see what it covers above. The full written guide, video lessons, and the downloadable exercise unlock with a free trial (Module 2 only), a Single Module Pass ($29), or the All-Access Bundle ($99, includes Premium). Prices are placeholders; checkout is mocked — no charge.</p>
          <div className="mt-3 text-sm text-zinc-400">Inside: {mod.sections.map((s) => s.heading).join(" · ")}</div>
          <div className="mt-5 flex flex-wrap gap-3 items-start">
            {slug === "prompting-like-a-manager" && <TrialButton loggedIn={Boolean(user)} />}
            <BuyButtons slug={mod.slug} loggedIn={Boolean(user)} />
            {!user && <Link href={`/signup?next=/modules/${mod.slug}`} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold">Create free account first</Link>}
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
