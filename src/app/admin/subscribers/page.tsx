import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { readSubscribers } from "@/lib/users";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";

async function Inner() {
  await connection();
  if (!isAdminConfigured()) return (<div className="mx-auto max-w-3xl px-4 py-14"><h1 className="text-4xl font-black">Admin — Subscribers</h1><p className="mt-4 rounded-xl bg-red-400/10 border border-red-400/30 px-4 py-3 text-sm text-red-200">Admin not configured: set <code>ADMIN_PASSWORD</code> and restart/redeploy. No subscriber data is shown until then.</p></div>);
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const list = [...readSubscribers()].reverse();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex items-start justify-between flex-wrap gap-4"><h1 className="text-4xl font-black">Admin — Subscribers</h1><form method="post" action="/api/admin/logout"><button className="rounded-full border border-white/20 px-5 py-2 text-sm font-bold">Log out</button></form></div>
      <p className="mt-3 text-sm text-zinc-400"><Link className="text-amber-400 underline" href="/admin/sponsors">Sponsor requests</Link> · <b className="text-white">Subscribers</b> — mock/local records from <code>data/subscribers.json</code>. Move to a real DB before launch.</p>
      {list.length === 0 ? (
        <p className="mt-8 text-zinc-400">No subscribers yet. Test the flow: <Link className="underline" href="/signup">sign up</Link>, start the trial or mock-buy from <Link className="underline" href="/modules">/modules</Link>, then come back here.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-300"><tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Amount (mock)</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Starts</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3">Recorded</th></tr></thead>
            <tbody>{list.map((s) => (<tr key={s.id} className="border-t border-white/10"><td className="px-4 py-3">{s.email}</td><td className="px-4 py-3">{s.plan}</td><td className="px-4 py-3">${s.amount}</td><td className="px-4 py-3">{s.status}</td><td className="px-4 py-3">{new Date(s.startsAt).toLocaleString()}</td><td className="px-4 py-3">{s.expiresAt ? new Date(s.expiresAt).toLocaleString() : "—"}</td><td className="px-4 py-3">{new Date(s.createdAt).toLocaleString()}</td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export default function AdminSubscribers() { return (<Suspense fallback={<p className="p-8">Loading…</p>}><Inner /></Suspense>); }
