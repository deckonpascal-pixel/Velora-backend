import { Router } from "express";
import { prisma } from "../db.js";
import { requireAdmin, optionalAuth } from "../middleware/auth.js";

const router = Router();

// Create an order — works for guests (email only) or logged-in users (token optional).
router.post("/", optionalAuth, async (req, res) => {
  const { email, items } = req.body; // items: [{ productId, quantity }]
  if (!email || !items || !items.length) {
    return res.status(400).json({ error: "Email and at least one item are required" });
  }

  try {
    const products = await prisma.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } });
    let total = 0;
    const orderItemsData = items.map((i) => {
      const product = products.find((p) => p.id === i.productId);
      if (!product) throw new Error(`Product ${i.productId} not found`);
      total += product.price * i.quantity;
      return { productId: product.id, quantity: i.quantity, price: product.price };
    });

    const order = await prisma.order.create({
      data: {
        email,
        total,
        userId: req.user?.userId ?? null,
        items: { create: orderItemsData },
      },
      include: { items: { include: { product: true } } },
    });

    res.json(order);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/", requireAdmin, async (_req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });
  res.json(orders);
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  const order = await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status: req.body.status } });
  res.json(order);
});

export default router;
