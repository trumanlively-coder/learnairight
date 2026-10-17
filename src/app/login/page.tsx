import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
export default function Login() {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <p className="text-amber-400 font-bold tracking-widest text-xs">LEARNAIRIGHT ACCOUNT</p>
      <h1 className="mt-3 text-4xl font-black">Welcome back</h1>
      <p className="mt-3 text-zinc-400 text-sm">Log in to continue your modules, trial, and purchases.</p>
      <Suspense fallback={<p className="mt-8">Loading…</p>}><AuthForm mode="login" /></Suspense>
      <p className="mt-4 text-sm text-zinc-400">New here? <Link className="text-amber-400 underline" href="/signup">Create a free account</Link></p>
    </div>
  );
}
