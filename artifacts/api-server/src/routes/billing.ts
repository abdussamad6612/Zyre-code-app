import { Router, type Request, type Response } from "express";
import { stripe } from "../lib/stripe";
import { convex } from "../lib/convex";
import { getPlanConfig, getStripePriceId } from "../lib/plans";
import { getSession } from "./auth";

const router = Router();

router.post("/billing/checkout", async (req: Request, res: Response) => {
  try {
    const { planId, successUrl, cancelUrl } = req.body;
    if (!planId) {
      return res.status(400).json({ error: "planId is required" });
    }
    if (!stripe) {
      return res.status(503).json({ error: "Stripe not configured — add STRIPE_SECRET_KEY to enable payments" });
    }
    const plan = getPlanConfig(planId);
    if (!plan || plan.price === 0) {
      return res.status(400).json({ error: "Invalid plan" });
    }
    const priceId = getStripePriceId(planId);
    if (!priceId) {
      return res.status(503).json({ error: `Stripe price ID not configured for plan ${planId}` });
    }
    const token = req.headers.authorization?.replace("Bearer ", "");
    const authSession = token ? await getSession(token) : null;
    if (!authSession) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = authSession.userId;
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl || `${process.env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.APP_URL}/billing/cancel`,
      allow_promotion_codes: true,
      metadata: { userId, planId },
      subscription_data: { metadata: { userId, planId } },
    });
    res.json({ url: stripeSession.url });
  } catch (err) {
    console.error("billing/checkout error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post("/billing/portal", async (req: Request, res: Response) => {
  try {
    const { returnUrl } = req.body;
    if (!stripe) {
      return res.status(503).json({ error: "Stripe not configured" });
    }
    const token = req.headers.authorization?.replace("Bearer ", "");
    const authSession = token ? await getSession(token) : null;
    if (!authSession) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!convex) {
      return res.status(503).json({ error: "Convex not configured" });
    }
    const customer = await (convex as any).query("stripe:getCustomerByClerkId", { clerkId: authSession.userId }).catch(() => null);
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
    const token = req.headers.authorization?.replace("Bearer ", "");
    const authSession = token ? await getSession(token) : null;
    if (!authSession) {
      return res.json({ canSend: false, reason: "Not authenticated", billingMode: "tokens", remaining: 0 });
    }
    const userId = authSession.userId;
    if (!convex) {
      return res.json({ canSend: true, reason: "Convex not configured", billingMode: "tokens", remaining: -1 });
    }
    const result = await (convex as any).query("billingSwitch:canSendMessage", { clerkId: userId }).catch(() => null);
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
