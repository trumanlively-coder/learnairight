import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
export default function Signup() {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <p className="text-amber-400 font-bold tracking-widest text-xs">LEARNAIRIGHT ACCOUNT</p>
      <h1 className="mt-3 text-4xl font-black">Create your account</h1>
      <p className="mt-3 text-zinc-400 text-sm">Free forever for Module 1. Your account unlocks the 7-day trial of Module 2 and any modules you buy (mock checkout — no charge while Stripe is unconnected).</p>
      <Suspense fallback={<p className="mt-8">Loading…</p>}><AuthForm mode="signup" /></Suspense>
      <p className="mt-4 text-sm text-zinc-400">Already have an account? <Link className="text-amber-400 underline" href="/login">Log in</Link></p>
    </div>
  );
}
