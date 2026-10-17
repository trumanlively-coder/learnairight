import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { getCurrentUser } from "@/lib/user-auth";
import { verifyAndGrantCheckoutSession } from "@/lib/stripe-grant";

async function Inner({ searchParams }: { searchParams: Promise<{ session_id?: string; mock?: string }> }) {
  await connection();
  const sp = await searchParams;
  if (sp.mock === "1" || !sp.session_id) {
    return (<div className="mx-auto max-w-3xl px-4 py-20 text-center"><h1 className="text-4xl font-black">Mock checkout complete</h1><p className="mt-3 text-zinc-400">No payment was taken — Stripe test mode is not configured here, so the module was unlocked by the mock flow.</p><Link href="/modules" className="mt-6 inline-block rounded-full bg-amber-400 text-black px-6 py-3 font-bold">Back to modules →</Link></div>);
  }
  const user = await getCurrentUser();
  if (!user) {
    return (<div className="mx-auto max-w-3xl px-4 py-20 text-center"><h1 className="text-4xl font-black">Payment received in test mode — log in to see your module</h1><p className="mt-3 text-zinc-400">Log in with the same email you used at Stripe checkout, then reopen this page.</p><Link href="/login?next=/modules" className="mt-6 inline-block rounded-full bg-amber-400 text-black px-6 py-3 font-bold">Log in →</Link></div>);
  }
  const r = await verifyAndGrantCheckoutSession(sp.session_id, user.id);
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-4xl font-black">{r.ok ? "✅ Test purchase confirmed" : "We could not confirm that test payment yet"}</h1>
      {r.ok ? (
        <p className="mt-3 text-zinc-400">{r.plan === "bundle" ? "All-Access Bundle (incl. Premium)" : "Your Single Module Pass"} is unlocked for <b className="text-white">{user.email}</b> — Stripe TEST mode, no real charge (test card 4242…).</p>
      ) : (
        <p className="mt-3 text-zinc-400">{r.error} If you completed Stripe test checkout and access does not appear, the webhook may not be configured for this environment — the grant also runs from the <code>checkout.session.completed</code> webhook when <code>STRIPE_WEBHOOK_SECRET</code> is set. Dev note: verify the session id, price ids, and that you are logged in as the purchasing account.</p>
      )}
      <Link href={r.ok && r.slug ? `/modules/${r.slug}` : "/modules"} className="mt-6 inline-block rounded-full bg-amber-400 text-black px-6 py-3 font-bold">Go to your modules →</Link>
    </div>
  );
}
export default function ModuleSuccess({ searchParams }: { searchParams: Promise<{ session_id?: string; mock?: string }> }) {
  return (<Suspense fallback={<p className="p-8">Confirming test payment…</p>}><Inner searchParams={searchParams} /></Suspense>);
}
