import { Hono } from "hono";
import Razorpay from "razorpay";
import { createHmac } from "crypto";
import { BillingService } from "../services/BillingService";
import { env } from "../config/env";

export const billingRouter = new Hono();

function getRazorpay() {
  const keyId = (process.env.RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID || "")
    .replace(/^["']|["']$/g, "")
    .replace(/%22$/gi, "")
    .trim();

  const keySecret = (process.env.RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET || "")
    .replace(/^["']|["']$/g, "")
    .replace(/%22$/gi, "")
    .trim();

  if (!keyId || !keySecret) {
    const missing: string[] = [];
    if (!keyId) missing.push("RAZORPAY_KEY_ID");
    if (!keySecret) missing.push("RAZORPAY_KEY_SECRET");
    console.error(`[Billing API] Razorpay Error: Missing required key(s): ${missing.join(", ")}`);
    throw new Error(`Razorpay credentials missing: ${missing.join(", ")}. Please set them in your .env or server environment.`);
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// GET /api/billing/status
billingRouter.get("/status", async (c) => {
  const userId = c.req.header("x-user-id") || "default_user";

  const credits = await BillingService.getCredits(userId);
  return c.json({ success: true, ...credits });
});

// GET /api/billing/plans — return SSG pricing plans
billingRouter.get("/plans", (c) => {
  return c.json({
    success: true,
    plans: [
      {
        id: "free",
        name: "Free",
        price: "₹0",
        period: "forever",
        credits: "100 credits / mo",
        description: "Ideal for exploring visual workflow graphs",
        features: [
          "100 free monthly credits",
          "Unlimited visual workflows",
          "All 8+ node types included",
          "Community support",
        ],
        cta: "Current Plan",
        highlight: false,
      },
      {
        id: "starter",
        name: "Starter Top-up",
        price: "₹99",
        period: "one-time",
        credits: "1,000 paid credits",
        description: "Instant credit boost for active automation tasks",
        features: [
          "1,000 paid credits (never expire)",
          "Unlimited visual workflows",
          "All 8+ node types included",
          "Priority email support",
        ],
        cta: "Buy Starter Pack (₹99)",
        highlight: true,
      },
      {
        id: "pro",
        name: "Pro Plan",
        price: "₹499",
        period: "/ month",
        credits: "5,000 credits / mo",
        description: "For power users building production automation",
        features: [
          "5,000 monthly credits",
          "Unlimited visual workflows",
          "All 8+ node types included",
          "24/7 Dedicated 1-on-1 support & Priority queue",
        ],
        cta: "Upgrade to Pro (₹499)",
        highlight: false,
      },
    ],
  });
});

// POST /api/billing/create-order — create Razorpay order for Starter (₹99) or Pro (₹499)
billingRouter.post("/create-order", async (c) => {
  const userId = c.req.header("x-user-id") || "default_user";

  try {
    const body = await c.req.json().catch(() => ({}));
    const planId = body.planId || "starter";

    let amount = 9900; // ₹99 default for Starter
    let credits = 1000;
    let planName = "STARTER";

    if (planId === "pro") {
      amount = 49900; // ₹499 in paise
      credits = 5000;
      planName = "PRO";
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `${planName.toLowerCase()}_${userId}_${Date.now()}`,
      notes: { userId, plan: planName, credits },
    });

    return c.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID,
      credits,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /api/billing/verify-payment — verify Razorpay signature and credit user
billingRouter.post("/verify-payment", async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await c.req.json();
    const keySecret = process.env.RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET;

    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return c.json({ error: "Invalid payment signature" }, 400);
    }

    const creditsToAdd = planId === "pro" ? 5000 : 1000;
    const planName = planId === "pro" ? "PRO" : "STARTER";

    await BillingService.addPaidCredits(userId, creditsToAdd, razorpay_order_id, planName);

    const credits = await BillingService.getCredits(userId);
    return c.json({ success: true, message: `${creditsToAdd.toLocaleString()} credits added!`, ...credits });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
