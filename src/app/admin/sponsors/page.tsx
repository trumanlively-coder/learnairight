import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { readSponsors } from "@/lib/sponsors";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";

// Protected: src/proxy.ts redirects unauthenticated /admin/* requests to
// /admin/login, and this server component re-verifies the session before
// any sponsor data (incl. emails) is read or rendered (defense in depth).
async function AdminInner() {
  await connection();
  if (!isAdminConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-4xl font-black">Admin — Sponsor Requests</h1>
        <p className="mt-4 rounded-xl bg-red-400/10 border border-red-400/30 px-4 py-3 text-sm text-red-200">
          Admin not configured: set the <code>ADMIN_PASSWORD</code> environment variable (in <code>.env.local</code> locally, or in Vercel Project Settings in production) and restart/redeploy. No sponsor data is shown until then.
        </p>
      </div>
    );
  }
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const list = readSponsors();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <h1 className="text-4xl font-black">Admin — Sponsor Requests</h1>
        <form method="post" action="/api/admin/logout"><button className="rounded-full border border-white/20 px-5 py-2 text-sm font-bold">Log out</button></form>
      </div>
      <p className="mt-3 text-sm text-zinc-400"><b className="text-white">Sponsor requests</b> · <a className="text-amber-400 underline" href="/admin/subscribers">Subscribers</a></p><p className="mt-2 text-emerald-200 text-sm rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-4 py-3">🔒 You are signed in. Every request below is <b>pending_approval</b> by default; approving/publishing a sponsor is a manual decision for Tru (no code here auto-publishes).</p>
      {list.length === 0 ? (
        <p className="mt-8 text-zinc-400">No sponsor requests yet. Submit one via <a className="underline" href="/pricing">/pricing</a> to test. Stored in <code>data/sponsors.json</code>.</p>
      ) : (
        <div className="mt-8 space-y-4">{list.map((s) => (
          <article key={s.id} className="rounded-3xl border border-white/10 p-5">
            <div className="flex justify-between flex-wrap gap-2"><h2 className="font-bold">{s.business}</h2><span className="rounded-full bg-amber-400 text-black text-xs font-bold px-3 py-1">{s.status}</span></div>
            <p className="mt-1 text-sm text-zinc-400">{s.contact} • {s.email} {s.website ? `• ${s.website}` : ""} • {s.tier} • {new Date(s.createdAt).toLocaleString()}</p>
            {s.message && <p className="mt-2 text-sm text-zinc-300">{s.message}</p>}
          </article>))}
        </div>
      )}
    </div>
  );
}
export default function Admin() { return (<Suspense fallback={<p className="p-8">Loading…</p>}><AdminInner /></Suspense>); }
