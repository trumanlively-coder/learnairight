import { getStripe } from "./stripe";
import { grantStripePurchaseByEmail } from "./users";
import { BUNDLE_PRICE, SINGLE_PRICE, getModule } from "@/data/modules";

export type GrantResult = { ok: boolean; granted?: boolean; alreadyGranted?: boolean; plan?: string; slug?: string | null; error?: string };

/**
 * Verify a Checkout Session server-side with the Stripe TEST secret and grant
 * the entitlement idempotently. Used by the success page AND the webhook.
 * Never grants on the success URL alone — Stripe must confirm payment_status=paid.
 */
export async function verifyAndGrantCheckoutSession(sessionId: string, expectedUserId?: string | null): Promise<GrantResult> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "Stripe test mode is not configured on the server." };
  if (!sessionId) return { ok: false, error: "Missing session_id." };
  let session;
  try { session = await stripe.checkout.sessions.retrieve(sessionId); } catch { return { ok: false, error: "Could not verify that checkout session with Stripe." }; }
  if (session.payment_status !== "paid") return { ok: false, error: `Payment not completed (status: ${session.payment_status}).` };
  if (session.livemode) return { ok: false, error: "Live-mode session refused — this build is test-mode only." };
  const plan = String(session.metadata?.plan || "");
  const slug = session.metadata?.moduleSlug ? String(session.metadata.moduleSlug) : null;
  const email = String(session.metadata?.userEmail || session.customer_email || "");
  const userId = String(session.metadata?.userId || "");
  if (expectedUserId && userId && userId !== expectedUserId) return { ok: false, error: "That checkout belongs to a different account. Log in with the purchasing account." };
  if (plan !== "single" && plan !== "bundle") return { ok: false, error: "Session is not a module purchase." };
  if (plan === "single" && (!slug || !getModule(slug)?.paid)) return { ok: false, error: "Session has no valid module." };
  const amountCents = session.amount_total ?? (plan === "bundle" ? BUNDLE_PRICE * 100 : SINGLE_PRICE * 100);
  const r = grantStripePurchaseByEmail(email, plan, slug, amountCents, session.id);
  if (!r.user) return { ok: false, error: "No local account matches the purchasing email — sign up with that email, then contact Tru." };
  return { ok: true, granted: !r.alreadyGranted, alreadyGranted: r.alreadyGranted, plan, slug };
}
