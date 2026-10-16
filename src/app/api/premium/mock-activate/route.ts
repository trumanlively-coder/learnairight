import { NextResponse } from "next/server";
// DEV/MOCK ONLY: sets premium cookie so Tru can preview gated content without Stripe.
// Before public launch, replace with real entitlement checks (Stripe webhook -> DB -> session).
export async function POST(){ const r=NextResponse.json({ok:true,mock:true}); r.cookies.set("learnairight_premium","1",{httpOnly:true,sameSite:"lax",path:"/",maxAge:60*60*24*30}); return r; }
