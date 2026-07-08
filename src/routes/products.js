import { Router } from "express";
import { prisma } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

function slugify(name) {
  const base = String(name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${base}-${Date.now().toString(36)}`;
}

function cleanData(body) {
  const data = { ...body };
  if (!data.slug) data.slug = slugify(data.name);
  if (data.price !== undefined) data.price = Number(data.price);
  if (data.was !== undefined && data.was !== null && data.was !== "") data.was = Number(data.was);
  else delete data.was;
  if (data.stock !== undefined) data.stock = Number(data.stock);
  if (!data.badge) delete data.badge;
  if (!data.wash) data.wash = "#EDE7D8";
  return data;
}

router.get("/", async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  res.json(products);
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const product = await prisma.product.create({ data: cleanData(req.body) });
    res.json(product);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const data = cleanData(req.body);
    delete data.slug;
    const product = await prisma.product.update({ where: { id: Number(req.params.id) }, data });
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
