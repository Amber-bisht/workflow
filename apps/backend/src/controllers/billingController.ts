import { Hono } from "hono";
import Razorpay from "razorpay";
import { createHmac } from "crypto";
import { BillingService } from "../services/BillingService";
import { env } from "../config/env";

export const billingRouter = new Hono();

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay credentials not configured in .env");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// GET /api/billing/status
billingRouter.get("/status", async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const credits = await BillingService.getCredits(userId);
  return c.json({ success: true, ...credits });
});

// POST /api/billing/create-order — create ₹99 Razorpay order for Starter Pack
billingRouter.post("/create-order", async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: 9900, // ₹99 in paise
      currency: "INR",
      receipt: `starter_${userId}_${Date.now()}`,
      notes: { userId, plan: "STARTER" },
    });

    return c.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID,
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await c.req.json();
    const keySecret = process.env.RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET;

    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return c.json({ error: "Invalid payment signature" }, 400);
    }

    await BillingService.addStarterCredits(userId, razorpay_order_id);

    const credits = await BillingService.getCredits(userId);
    return c.json({ success: true, message: "1,000 credits added!", ...credits });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
