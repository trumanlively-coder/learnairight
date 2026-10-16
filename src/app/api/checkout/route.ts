import { NextResponse } from "next/server"; import { getStripe, PREMIUM_PRICE_ID } from "@/lib/stripe";
export async function POST(req:Request){
  const origin = req.headers.get("origin") || "http://localhost:3000";
  const stripe = getStripe();
  // MOCK MODE: no Stripe keys -> do not charge, send user to mock success page.
  if(!stripe || !PREMIUM_PRICE_ID){ return NextResponse.json({ mock:true, url:`${origin}/checkout/success?mock=1`, message:"Stripe is not configured (placeholder mode). No payment was taken. Tru: add STRIPE_SECRET_KEY and STRIPE_PRICE_ID — see .env.example / README." }); }
  const session = await stripe.checkout.sessions.create({ mode:"subscription", line_items:[{price:PREMIUM_PRICE_ID,quantity:1}], success_url:`${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url:`${origin}/checkout/cancel`, });
  return NextResponse.json({ url: session.url });
}
