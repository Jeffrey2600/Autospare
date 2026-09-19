// One-off maintenance script: points existing seeded products at the real
// demo photos in public/demo-products/ instead of the generated placeholder
// graphics, without touching orders, customers, or settings.
//
// Run with: npx tsx prisma/update-product-images.ts
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEMO_PRODUCTS_DIR = path.join(process.cwd(), "public", "demo-products");

async function main() {
  const files = fs
    .readdirSync(DEMO_PRODUCTS_DIR)
    .filter((f) => f.endsWith(".jpg"))
    .map((f) => f.replace(/\.jpg$/, ""));

  let updated = 0;
  let skipped = 0;

  for (const slug of files) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      console.log(`skip: no product with slug "${slug}"`);
      skipped++;
      continue;
    }

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: `/demo-products/${slug}.jpg`,
        altText: product.title,
        position: 0,
      },
    });
    console.log(`updated: ${product.title}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated} product(s), skipped ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
