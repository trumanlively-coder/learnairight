import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { verifyAndGrantCheckoutSession } from "@/lib/stripe-grant";
// Stripe webhook: grants module entitlements on checkout.session.completed.
// Signature is verified whenever STRIPE_WEBHOOK_SECRET is set; without a
// secret (local dev without `stripe listen`) events are ignored. The success
// page also verifies the session server-side (idempotent), so test purchases
// still unlock locally even before a webhook endpoint exists.
export async function POST(req: Request) {
  let stripe;
  try { stripe = getStripe(); } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Live keys not allowed in this build." }, { status: 500 }); }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret || secret.includes("placeholder")) {
    return NextResponse.json({ received: true, mock: true, note: "Webhook not configured (no STRIPE_WEBHOOK_SECRET) — event ignored, no entitlement changed." });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });
  let event;
  try { event = stripe.webhooks.constructEvent(await req.text(), sig, secret); }
  catch { return NextResponse.json({ error: "invalid signature" }, { status: 400 }); }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.metadata?.plan === "single" || session.metadata?.plan === "bundle") {
      const r = await verifyAndGrantCheckoutSession(session.id);
      if (!r.ok) return NextResponse.json({ received: true, granted: false, note: r.error });
      return NextResponse.json({ received: true, granted: r.granted, alreadyGranted: r.alreadyGranted });
    }
    // Premium subscription sessions (no module plan metadata) land here —
    // premium-by-subscription records are a pre-launch TODO; bundle grants premium via users.bundle.
    console.log("Stripe webhook (non-module checkout):", session.id);
  }
  return NextResponse.json({ received: true });
}
