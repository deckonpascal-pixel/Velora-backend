import { Router } from "express";
import { prisma } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  res.json(products);
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.json(product);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const product = await prisma.product.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(product);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
