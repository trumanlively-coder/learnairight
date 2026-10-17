import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { recordPurchase } from "@/lib/users";
import { BUNDLE_PRICE, SINGLE_PRICE, getModule } from "@/data/modules";
import { isStripeConfigured } from "@/lib/stripe";
// MOCK CHECKOUT — no real payment is taken. When Tru adds Stripe keys, wire
// this to real Stripe Checkout products (suggested: "LearnAIRight Single
// Module Pass" $29, "LearnAIRight All-Access Bundle" $99) and grant
// entitlements from the webhook instead of here. TODO(stripe-modules).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign up or log in first.", needsAuth: true }, { status: 401 });
  const { plan = "", slug = "" } = await req.json().catch(() => ({}));
  if (isStripeConfigured) {
    // Keys exist but module products are not wired yet — refuse rather than fake a charge.
    return NextResponse.json({ error: "Stripe keys are present but module products are not wired yet (see TODO in this route). No charge made.", stripeTodo: true }, { status: 501 });
  }
  if (plan === "bundle") {
    const u = recordPurchase(user, "bundle", null, BUNDLE_PRICE);
    return NextResponse.json({ ok: true, mock: true, noCharge: true, plan: "bundle", amount: BUNDLE_PRICE, bundle: u.bundle });
  }
  if (plan === "single") {
    const mod = getModule(String(slug));
    if (!mod || !mod.paid) return NextResponse.json({ error: "Pick a paid module for a Single Module Pass." }, { status: 400 });
    recordPurchase(user, "single", mod.slug, SINGLE_PRICE);
    return NextResponse.json({ ok: true, mock: true, noCharge: true, plan: "single", slug: mod.slug, amount: SINGLE_PRICE });
  }
  return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
}
