import { Router, type Request, type Response } from "express";
import { stripe } from "../lib/stripe";
import { convex } from "../lib/convex";

const router = Router();

const processedEvents = new Set<string>();

router.post("/webhooks/stripe", async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(503).json({ error: "Stripe not configured" });
  }
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return res.status(400).json({ error: "Missing signature or webhook secret" });
  }
  let event: any;
  try {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return res.status(400).json({ error: "Invalid signature" });
  }
  if (processedEvents.has(event.id)) {
    return res.json({ received: true });
  }
  try {
    console.log(`Received Stripe webhook: ${event.type} (${event.id})`);
    processedEvents.add(event.id);
    if (processedEvents.size > 1000) {
      const [first] = processedEvents;
      processedEvents.delete(first);
    }
    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        if (convex) {
          try {
            await (convex as any).mutation("stripe:processWebhookEvent", {
              type: event.type,
              id: event.id,
              data: event.data.object,
            });
          } catch (e) {
            console.error("Failed to process Stripe event in Convex:", e);
          }
        }
        break;
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

router.post("/webhooks/revenuecat", async (req: Request, res: Response) => {
  if (!process.env.REVENUECAT_API_KEY) {
    return res.status(503).json({ error: "RevenueCat not configured" });
  }
  try {
    const event = req.body;
    const appUserId = event?.event?.app_user_id || event?.event?.original_app_user_id;
    if (!appUserId) {
      return res.status(400).json({ error: "Missing app_user_id" });
    }
    if (convex) {
      try {
        await (convex as any).mutation("revenuecat:syncSubscriber", { appUserId });
      } catch (e) {
        console.error("Failed to sync RevenueCat subscriber:", e);
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error("RevenueCat webhook error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

router.get("/webhooks/clerk-billing", (_req: Request, res: Response) => {
  res.send("Clerk billing webhook endpoint is active");
});

router.post("/webhooks/clerk-billing", async (req: Request, res: Response) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(503).json({ error: "Clerk webhook not configured" });
  }
  try {
    const { Webhook } = await import("svix");
    const svixId = req.headers["svix-id"] as string;
    const svixTimestamp = req.headers["svix-timestamp"] as string;
    const svixSignature = req.headers["svix-signature"] as string;
    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({ error: "Missing svix headers" });
    }
    const wh = new Webhook(webhookSecret);
    const payload = JSON.stringify(req.body);
    const evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as any;
    console.log(`Received Clerk webhook: ${evt.type}`);
    if (convex) {
      try {
        await (convex as any).mutation("clerk:processWebhookEvent", { type: evt.type, data: evt.data });
      } catch (e) {
        console.error("Failed to process Clerk event in Convex:", e);
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Clerk billing webhook error:", err);
    res.status(400).json({ error: "Webhook verification failed" });
  }
});

router.post("/webhooks/inngest", async (req: Request, res: Response) => {
  res.json({ received: true });
});

export default router;
