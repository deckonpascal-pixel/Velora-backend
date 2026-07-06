import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const PRODUCTS = [
  { slug: "p1", name: "Velora Signature Hoodie", category: "Hoodies", price: 24000, kind: "hoodie", wash: "#EDE7D8", badge: "New" },
  { slug: "p2", name: "Velora Oversized Tee", category: "T-Shirts", price: 13500, was: 15000, kind: "top", wash: "#F1ECE0", badge: "Sale" },
  { slug: "p3", name: "Velora Premium Joggers", category: "Pants", price: 18500, kind: "pants", wash: "#EAE3D2" },
  { slug: "p4", name: "Velora Varsity Jacket", category: "Jackets", price: 32000, kind: "jacket", wash: "#EDE4D0", badge: "New" },
  { slug: "p5", name: "Velora Court Tee", category: "T-Shirts", price: 12000, kind: "top", wash: "#F1ECE0" },
  { slug: "p6", name: "Velora Bomber Jacket", category: "Jackets", price: 38500, kind: "jacket", wash: "#EAE3D2" },
  { slug: "p7", name: "Velora Cargo Pants", category: "Pants", price: 21500, kind: "pants", wash: "#EDE7D8" },
  { slug: "p8", name: "Velora Weekend Tote", category: "Accessories", price: 15500, kind: "bag", wash: "#F1ECE0" },
  { slug: "p9", name: "Velora Court Sneaker", category: "Accessories", price: 29500, kind: "shoe", wash: "#EAE3D2" },
];

async function main() {
  for (const p of PRODUCTS) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }
  console.log(`Seeded ${PRODUCTS.length} products`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
