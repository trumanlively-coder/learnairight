import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";

async function LoginInner({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await connection();
  const { error } = await searchParams;
  const configured = isAdminConfigured();
  if (configured && (await isAdminAuthenticated())) redirect("/admin/sponsors");
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-3xl font-black">Admin login</h1>
      <p className="mt-2 text-sm text-zinc-400">Sponsor requests contain contact emails, so this area is password-protected.</p>
      {!configured ? (
        <p className="mt-6 rounded-xl bg-red-400/10 border border-red-400/30 px-4 py-3 text-sm text-red-200">
          Admin not configured: set the <code>ADMIN_PASSWORD</code> environment variable (in <code>.env.local</code> locally, or in Vercel Project Settings in production) and restart/redeploy. No sponsor data is shown until then.
        </p>
      ) : (
        <form method="post" action="/api/admin/login" className="mt-6 space-y-3">
          {error ? <p className="rounded-xl bg-red-400/10 border border-red-400/30 px-4 py-3 text-sm text-red-200">Incorrect password — try again.</p> : null}
          <label className="block text-sm">Admin password
            <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-xl bg-black/50 border border-white/15 px-3 py-2" />
          </label>
          <button className="rounded-full bg-amber-400 text-black px-6 py-3 font-bold">Sign in</button>
        </form>
      )}
    </div>
  );
}

export default function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (<Suspense fallback={<p className="p-8">Loading…</p>}><LoginInner searchParams={searchParams} /></Suspense>);
}
