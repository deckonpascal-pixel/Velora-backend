import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE = "https://api.paystack.co";

// Starts a Paystack transaction for an existing order and returns the checkout URL.
router.post("/initialize", async (req, res) => {
  const { orderId } = req.body;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  try {
    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: order.email,
        amount: order.total * 100,
        callback_url: `${process.env.FRONTEND_URL}?reference={reference}`,
        metadata: { orderId: order.id },
      }),
    });
    const data = await response.json();
    if (!data.status) return res.status(400).json({ error: data.message || "Could not start payment" });

    await prisma.order.update({ where: { id: order.id }, data: { reference: data.data.reference } });
    res.json({ authorizationUrl: data.data.authorization_url, reference: data.data.reference });
  } catch (e) {
    res.status(500).json({ error: "Payment provider unreachable — check PAYSTACK_SECRET_KEY" });
  }
});

// Called by the frontend after Paystack redirects back, to confirm payment succeeded.
router.get("/verify/:reference", async (req, res) => {
  try {
    const response = await fetch(`${PAYSTACK_BASE}/transaction/verify/${req.params.reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    const data = await response.json();
    if (data.status && data.data.status === "success") {
      const order = await prisma.order.update({
        where: { reference: req.params.reference },
        data: { status: "paid" },
      });
      return res.json({ success: true, order });
    }
    res.json({ success: false });
  } catch (e) {
    res.status(500).json({ success: false, error: "Could not verify payment" });
  }
});

// Paystack webhook — set this URL in your Paystack dashboard under Settings -> API Keys & Webhooks.
router.post("/webhook", async (req, res) => {
  const event = req.body;
  if (event?.event === "charge.success") {
    try {
      await prisma.order.update({ where: { reference: event.data.reference }, data: { status: "paid" } });
    } catch {
      // order may not exist yet or already updated — safe to ignore
    }
  }
  res.sendStatus(200);
});

export default router;
