import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { recordPurchase } from "@/lib/users";
import { BUNDLE_PRICE, SINGLE_PRICE, getModule } from "@/data/modules";
import { getStripe, isLiveStripeKey, isStripeConfigured, modulePriceId } from "@/lib/stripe";
// Module checkout: REAL Stripe Checkout when TEST keys + price ids are set;
// otherwise the labelled mock flow. Live keys are refused (test-mode only build).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign up or log in first.", needsAuth: true }, { status: 401 });
  const { plan = "", slug = "" } = await req.json().catch(() => ({}));
  if (plan !== "single" && plan !== "bundle") return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  let modSlug: string | null = null;
  if (plan === "single") {
    const mod = getModule(String(slug));
    if (!mod || !mod.paid) return NextResponse.json({ error: "Pick a paid module for a Single Module Pass." }, { status: 400 });
    modSlug = mod.slug;
  }
  if (isLiveStripeKey) {
    return NextResponse.json({ error: "Live keys not allowed in this build — use Stripe TEST keys (sk_test_) only. No charge made." }, { status: 500 });
  }
  const priceId = modulePriceId(plan);
  if (isStripeConfigured && priceId) {
    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: "Stripe checkout unavailable. No charge made." }, { status: 500 });
    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "http://localhost:3000";
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: user.email,
        metadata: { userId: user.id, userEmail: user.email, plan, moduleSlug: modSlug || "" },
        success_url: `${origin}/modules/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/modules${modSlug ? `/${modSlug}` : ""}?checkout=cancelled`,
      });
      if (!session.url) return NextResponse.json({ error: "Stripe did not return a checkout URL. No charge made." }, { status: 502 });
      return NextResponse.json({ ok: true, stripe: true, testMode: true, url: session.url, plan, slug: modSlug });
    } catch {
      return NextResponse.json({ error: "Could not start Stripe test checkout. No charge made." }, { status: 502 });
    }
  }
  if (isStripeConfigured && !priceId) {
    return NextResponse.json({ error: `Stripe TEST key is set but ${plan === "bundle" ? "STRIPE_PRICE_BUNDLE" : "STRIPE_PRICE_SINGLE"} is missing — create the test price and set it. No charge made.` }, { status: 501 });
  }
  // Mock flow (no Stripe keys): clearly labelled, no card, no charge.
  if (plan === "bundle") {
    const u = recordPurchase(user, "bundle", null, BUNDLE_PRICE);
    return NextResponse.json({ ok: true, mock: true, noCharge: true, plan: "bundle", amount: BUNDLE_PRICE, bundle: u.bundle });
  }
  recordPurchase(user, "single", modSlug, SINGLE_PRICE);
  return NextResponse.json({ ok: true, mock: true, noCharge: true, plan: "single", slug: modSlug, amount: SINGLE_PRICE });
}
