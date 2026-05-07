import { Router, type Request, type Response } from "express";
import { stripe } from "../lib/stripe";
import { convex } from "../lib/convex";
import { getPlanConfig, getStripePriceId } from "../lib/plans";

const router = Router();

router.post("/billing/checkout", async (req: Request, res: Response) => {
  try {
    const { clerkId, planId, successUrl, cancelUrl } = req.body;
    if (!clerkId || !planId) {
      return res.status(400).json({ error: "clerkId and planId are required" });
    }
    if (!stripe) {
      return res.status(503).json({ error: "Stripe not configured" });
    }
    const plan = getPlanConfig(planId);
    if (!plan || plan.price === 0) {
      return res.status(400).json({ error: "Invalid plan" });
    }
    const priceId = getStripePriceId(planId);
    if (!priceId) {
      return res.status(503).json({ error: `Stripe price ID not configured for plan ${planId}` });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl || `${process.env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.APP_URL}/billing/cancel`,
      allow_promotion_codes: true,
      metadata: { clerkId, planId },
      subscription_data: { metadata: { clerkId, planId } },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("billing/checkout error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post("/billing/portal", async (req: Request, res: Response) => {
  try {
    const { clerkId, returnUrl } = req.body;
    if (!clerkId) {
      return res.status(400).json({ error: "clerkId is required" });
    }
    if (!stripe) {
      return res.status(503).json({ error: "Stripe not configured" });
    }
    if (!convex) {
      return res.status(503).json({ error: "Convex not configured" });
    }
    const customer = await (convex as any).query("stripe:getCustomerByClerkId", { clerkId }).catch(() => null);
    if (!customer?.stripeCustomerId) {
      return res.status(404).json({ error: "No Stripe customer found for this user" });
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: returnUrl || `${process.env.APP_URL}/billing`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("billing/portal error:", err);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

router.post("/billing/check-limit", async (req: Request, res: Response) => {
  try {
    const { clerkId } = req.body;
    if (!clerkId) {
      return res.status(400).json({ canSend: false, reason: "Missing clerkId", billingMode: "tokens", remaining: 0 });
    }
    if (!convex) {
      return res.json({ canSend: true, reason: "Convex not configured", billingMode: "tokens", remaining: -1 });
    }
    const result = await (convex as any).query("billingSwitch:canSendMessage", { clerkId }).catch(() => null);
    if (!result) {
      return res.json({ canSend: true, reason: "Unable to check limit", billingMode: "tokens", remaining: -1 });
    }
    res.json(result);
  } catch (err) {
    console.error("billing/check-limit error:", err);
    res.json({ canSend: true, reason: "Error checking limit", billingMode: "tokens", remaining: -1, error: true });
  }
});

export default router;
