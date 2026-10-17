import Stripe from "stripe";
// Stripe TEST-mode only build. No real keys are committed. Without TEST keys
// the site runs in MOCK MODE. Live keys are refused on purpose (see guard).
export const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
export const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || "";
export const isLiveStripeKey = stripeSecret.startsWith("sk_live_") || stripePublishableKey.startsWith("pk_live_");
export const isStripeConfigured = Boolean(
  stripeSecret && !stripeSecret.includes("placeholder") && stripeSecret.startsWith("sk_test_"),
);
/** Throws a clear, safe error if a LIVE key is present — this build is test-mode only. */
export function assertTestModeOnly() {
  if (isLiveStripeKey || stripeSecret.startsWith("sk_live_")) {
    throw new Error("Live keys not allowed in this build — use Stripe TEST keys (sk_test_ / pk_test_) only.");
  }
}
export function getStripe(): Stripe | null {
  assertTestModeOnly();
  if (!isStripeConfigured) return null;
  return new Stripe(stripeSecret);
}
export const PREMIUM_PRICE_ID = process.env.STRIPE_PRICE_ID || ""; // price_... (Premium, legacy)
export const STRIPE_PRICE_SINGLE = process.env.STRIPE_PRICE_SINGLE || ""; // $29 one-time, test mode
export const STRIPE_PRICE_BUNDLE = process.env.STRIPE_PRICE_BUNDLE || ""; // $99 one-time, test mode
export function modulePriceId(plan: "single" | "bundle"): string {
  return plan === "bundle" ? STRIPE_PRICE_BUNDLE : STRIPE_PRICE_SINGLE;
}
/** True only when TEST secret + the relevant module price id(s) are present. */
export const isStripeModulesConfigured = Boolean(isStripeConfigured && STRIPE_PRICE_SINGLE && STRIPE_PRICE_BUNDLE);
export const premiumConfig = {
  monthlyLabel: "$9/mo (placeholder)", yearlyLabel: "$79/yr (placeholder)",
};
