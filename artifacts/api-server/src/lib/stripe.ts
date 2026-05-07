import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Stripe not configured - payment features disabled");
}

export const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover" as any,
      typescript: true,
    })
  : null;
