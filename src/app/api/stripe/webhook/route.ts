import { NextResponse } from "next/server"; import { getStripe } from "@/lib/stripe";
// STUB webhook. Tru: set STRIPE_WEBHOOK_SECRET, then on checkout.session.completed /
// customer.subscription.* grant premium by user record (DB) instead of the mock cookie.
export async function POST(req:Request){
  const stripe=getStripe(); const secret=process.env.STRIPE_WEBHOOK_SECRET;
  if(!stripe || !secret){ return NextResponse.json({received:true, mock:true, note:"Webhook stub — no secret configured, event ignored (no charge/entitlement changed)."}); }
  const sig=req.headers.get("stripe-signature"); if(!sig) return NextResponse.json({error:"missing signature"},{status:400});
  try{ const event=stripe.webhooks.constructEvent(await req.text(), sig, secret);
    // TODO (Tru, pre-launch): handle checkout.session.completed -> mark user premium in DB; customer.subscription.deleted -> revoke.
    console.log("Stripe webhook:", event.type);
    return NextResponse.json({received:true});
  }catch{ return NextResponse.json({error:"invalid signature"},{status:400}); }
}
