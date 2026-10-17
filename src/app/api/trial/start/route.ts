import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { isTrialActive, startTrial } from "@/lib/users";
import { TRIAL_MODULE_SLUG } from "@/data/modules";
// Start the 7-day free trial: unlocks the SECOND module (TRIAL_MODULE_SLUG).
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign up or log in first to start your free trial.", needsAuth: true }, { status: 401 });
  if (isTrialActive(user)) return NextResponse.json({ ok: true, alreadyActive: true, trialEndsAt: user.trialEndsAt, unlocks: TRIAL_MODULE_SLUG });
  const updated = startTrial(user);
  return NextResponse.json({ ok: true, trialEndsAt: updated.trialEndsAt, unlocks: TRIAL_MODULE_SLUG });
}
