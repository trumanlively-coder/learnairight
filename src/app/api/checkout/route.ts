import { NextResponse } from "next/server"; import { getStripe, PREMIUM_PRICE_ID } from "@/lib/stripe";
export async function POST(req:Request){
  const origin = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "http://localhost:3000";
  let stripe;
  try { stripe = getStripe(); } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Live keys not allowed in this build.", message: "Live keys not allowed in this build — use Stripe TEST keys only. No charge made." }, { status: 500 }); }
  // MOCK MODE: no Stripe TEST keys -> do not charge, send user to mock success page.
  if(!stripe || !PREMIUM_PRICE_ID){ return NextResponse.json({ mock:true, url:`${origin}/checkout/success?mock=1`, message:"Stripe test mode is not configured (mock mode). No payment was taken. Add STRIPE_SECRET_KEY (sk_test_) and STRIPE_PRICE_ID — see .env.example." }); }
  try {
    const session = await stripe.checkout.sessions.create({ mode:"subscription", line_items:[{price:PREMIUM_PRICE_ID,quantity:1}], success_url:`${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url:`${origin}/checkout/cancel`, });
    return NextResponse.json({ url: session.url, testMode: true });
  } catch { return NextResponse.json({ error:"Could not start Stripe test checkout. No charge made." }, { status: 502 }); }
}
