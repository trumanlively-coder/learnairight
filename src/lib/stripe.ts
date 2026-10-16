import Stripe from "stripe";
// PLACEHOLDER CONFIG — LearnAIRight Premium (Stripe product name suggestion). Tru: fill in real keys in .env.local (see .env.example).
// No real keys are committed. Without keys the site runs in MOCK MODE.
export const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
export const isStripeConfigured = Boolean(stripeSecret && !stripeSecret.includes("placeholder") && stripeSecret.startsWith("sk_"));
export function getStripe(): Stripe | null {
  if (!isStripeConfigured) return null;
  return new Stripe(stripeSecret);
}
export const PREMIUM_PRICE_ID = process.env.STRIPE_PRICE_ID || ""; // price_... from Stripe Dashboard
export const premiumConfig = {
  // PLACEHOLDER PRICING — Tru to decide final numbers. Display-only until Stripe price is wired.
  monthlyLabel: "$9/mo (placeholder)", yearlyLabel: "$79/yr (placeholder)",
};
