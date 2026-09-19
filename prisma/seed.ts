import "dotenv/config";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { writePlaceholderImage } from "./placeholder";

const DEMO_PRODUCTS_DIR = path.join(process.cwd(), "public", "demo-products");

async function productImageUrl(slug: string, title: string) {
  if (fs.existsSync(path.join(DEMO_PRODUCTS_DIR, `${slug}.jpg`))) {
    return `/demo-products/${slug}.jpg`;
  }
  return writePlaceholderImage(title, "products", slug, 800, 800);
}

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  console.log("Seeding database...");

  // --- Admin user -----------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Store Admin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin account ready: ${adminEmail}`);

  // --- Site settings ----------------------------------------------------
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: process.env.NEXT_PUBLIC_STORE_NAME ?? "AutoSpare Parts",
      tagline: "Genuine car & bike spare parts, in stock near you.",
      phone: process.env.NEXT_PUBLIC_STORE_PHONE ?? "+91 90000 00000",
      whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? "+91 90000 00000",
      email: process.env.NEXT_PUBLIC_STORE_EMAIL ?? "contact@example.com",
      address: process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "123 Main Road, Your City, State, 000000",
      shippingFee: 99,
      freeShippingThreshold: 2000,
    },
  });

  // --- Brands -------------------------------------------------------------
  const brandNames = ["TorqueMax", "RoadForce", "DuraParts", "VoltEdge", "IronGrip", "PrimeDrive"];
  const brands: Record<string, string> = {};
  for (const name of brandNames) {
    const logo = await writePlaceholderImage(name, "brands", slugify(name), 300, 300);
    const brand = await prisma.brand.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), logo },
    });
    brands[name] = brand.id;
  }
  console.log(`Created ${brandNames.length} brands`);

  // --- Categories -----------------------------------------------------
  async function upsertCategory(name: string, vehicleType: "CAR" | "BIKE" | "UNIVERSAL", parentId?: string, position = 0) {
    const slug = slugify(name);
    const image = await writePlaceholderImage(name, "categories", slug, 600, 600);
    return prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug, vehicleType, parentId, position, image },
    });
  }

  const carParts = await upsertCategory("Car Parts", "CAR", undefined, 1);
  const bikeParts = await upsertCategory("Bike Parts", "BIKE", undefined, 2);

  const carEngine = await upsertCategory("Engine Components", "CAR", carParts.id, 1);
  const carBrakes = await upsertCategory("Brakes & Suspension", "CAR", carParts.id, 2);
  const carElectrical = await upsertCategory("Electrical & Lighting", "CAR", carParts.id, 3);
  const carBody = await upsertCategory("Body & Exterior", "CAR", carParts.id, 4);

  const bikeEngine = await upsertCategory("Engine & Transmission", "BIKE", bikeParts.id, 1);
  const bikeBrakes = await upsertCategory("Brakes & Wheels", "BIKE", bikeParts.id, 2);
  const bikeElectrical = await upsertCategory("Electrical", "BIKE", bikeParts.id, 3);
  const bikeBody = await upsertCategory("Body & Accessories", "BIKE", bikeParts.id, 4);

  console.log("Created categories");

  // --- Products -----------------------------------------------------------
  type SeedProduct = {
    title: string;
    sku: string;
    categoryId: string;
    brand: string;
    vehicleType: "CAR" | "BIKE" | "UNIVERSAL";
    price: number;
    compareAtPrice?: number;
    stock: number;
    isFeatured?: boolean;
    shortDescription: string;
    description: string;
    compatibility?: string;
  };

  const products: SeedProduct[] = [
    {
      title: "Front Brake Pad Set",
      sku: "CAR-BRK-001",
      categoryId: carBrakes.id,
      brand: "TorqueMax",
      vehicleType: "CAR",
      price: 1499,
      compareAtPrice: 1799,
      stock: 25,
      isFeatured: true,
      shortDescription: "High-friction front brake pads for reliable stopping power.",
      description:
        "Premium ceramic-composite front brake pad set engineered for consistent stopping power and low noise. Designed to fit a wide range of hatchbacks and sedans.",
      compatibility: "Maruti Swift, Baleno, Hyundai i20, Grand i10",
    },
    {
      title: "Rear Shock Absorber",
      sku: "CAR-SUS-002",
      categoryId: carBrakes.id,
      brand: "RoadForce",
      vehicleType: "CAR",
      price: 3499,
      stock: 10,
      shortDescription: "Gas-charged rear shock absorber for a smoother ride.",
      description:
        "Twin-tube gas-charged shock absorber that improves ride comfort and handling stability on rough roads. Direct bolt-on replacement.",
      compatibility: "Maruti Swift, Dzire, Wagon R",
    },
    {
      title: "Engine Oil Filter",
      sku: "CAR-ENG-003",
      categoryId: carEngine.id,
      brand: "DuraParts",
      vehicleType: "CAR",
      price: 299,
      stock: 100,
      isFeatured: true,
      shortDescription: "High-flow oil filter for cleaner engine lubrication.",
      description:
        "Keeps engine oil free of contaminants for longer engine life. Recommended to replace at every oil change interval.",
      compatibility: "Most petrol & diesel hatchbacks and sedans",
    },
    {
      title: "Spark Plug Set (4 pcs)",
      sku: "CAR-ENG-004",
      categoryId: carEngine.id,
      brand: "PrimeDrive",
      vehicleType: "CAR",
      price: 899,
      stock: 60,
      shortDescription: "Iridium-tipped spark plugs for smoother ignition.",
      description:
        "Set of 4 iridium-tipped spark plugs offering improved fuel efficiency and stable idling compared to standard copper plugs.",
    },
    {
      title: "Radiator Cooling Fan",
      sku: "CAR-ENG-005",
      categoryId: carEngine.id,
      brand: "VoltEdge",
      vehicleType: "CAR",
      price: 2799,
      compareAtPrice: 3199,
      stock: 8,
      shortDescription: "OEM-spec radiator fan assembly to prevent overheating.",
      description:
        "Direct-fit radiator cooling fan assembly with motor, designed to match OEM airflow specifications and keep engine temperature in check.",
    },
    {
      title: "Headlight Assembly (Left)",
      sku: "CAR-ELE-006",
      categoryId: carElectrical.id,
      brand: "IronGrip",
      vehicleType: "CAR",
      price: 4499,
      stock: 5,
      isFeatured: true,
      shortDescription: "Clear-lens left headlight assembly, plug-and-play fit.",
      description:
        "Complete left-side headlight assembly with clear lens housing. Direct plug-and-play replacement for damaged or foggy headlights.",
    },
    {
      title: "Car Battery 12V 65Ah",
      sku: "CAR-ELE-007",
      categoryId: carElectrical.id,
      brand: "VoltEdge",
      vehicleType: "CAR",
      price: 6499,
      stock: 15,
      shortDescription: "Maintenance-free 65Ah battery with 3-year warranty.",
      description:
        "Maintenance-free sealed lead-acid battery delivering reliable cold-start performance. Backed by a 3-year replacement warranty.",
    },
    {
      title: "Wiper Blade Pair",
      sku: "CAR-BDY-008",
      categoryId: carBody.id,
      brand: "DuraParts",
      vehicleType: "CAR",
      price: 599,
      stock: 200,
      shortDescription: "Streak-free wiper blades, set of 2.",
      description: "Frameless wiper blade set offering streak-free wiping in all weather conditions. Easy clip-on installation.",
    },
    {
      title: "Side Mirror (Right)",
      sku: "CAR-BDY-009",
      categoryId: carBody.id,
      brand: "IronGrip",
      vehicleType: "CAR",
      price: 1299,
      stock: 0,
      shortDescription: "Manual-adjust right side mirror, primed for painting.",
      description: "Replacement right-side door mirror, primed and ready for painting to match your vehicle's color.",
    },
    {
      title: "Alloy Wheel 15-inch",
      sku: "CAR-BDY-010",
      categoryId: carBody.id,
      brand: "RoadForce",
      vehicleType: "CAR",
      price: 5999,
      compareAtPrice: 6999,
      stock: 12,
      isFeatured: true,
      shortDescription: "Lightweight 15-inch alloy wheel, sold individually.",
      description: "Lightweight cast alloy wheel that improves handling and gives your car a sportier stance. Sold individually.",
    },
    {
      title: "Bike Chain Sprocket Kit",
      sku: "BIKE-ENG-011",
      categoryId: bikeEngine.id,
      brand: "TorqueMax",
      vehicleType: "BIKE",
      price: 1199,
      stock: 30,
      isFeatured: true,
      shortDescription: "Complete chain and sprocket kit for smooth power transfer.",
      description:
        "Heat-treated chain and sprocket kit for smooth, efficient power transfer with extended service life over stock components.",
      compatibility: "Honda Unicorn, CB Shine, Hornet 2.0",
    },
    {
      title: "Bike Clutch Plate Set",
      sku: "BIKE-ENG-012",
      categoryId: bikeEngine.id,
      brand: "PrimeDrive",
      vehicleType: "BIKE",
      price: 799,
      stock: 40,
      shortDescription: "Friction-optimized clutch plates for smooth gear shifts.",
      description: "Complete clutch plate set engineered for consistent friction and smoother gear engagement.",
      compatibility: "Bajaj Pulsar 150/180/220",
    },
    {
      title: "Bike Front Disc Brake Pad",
      sku: "BIKE-BRK-013",
      categoryId: bikeBrakes.id,
      brand: "IronGrip",
      vehicleType: "BIKE",
      price: 349,
      compareAtPrice: 449,
      stock: 75,
      isFeatured: true,
      shortDescription: "High-grip sintered brake pads for confident braking.",
      description: "Sintered metal front disc brake pads that provide strong, consistent bite in wet and dry conditions.",
      compatibility: "Honda Activa 3G/4G/5G, Honda Dio",
    },
    {
      title: "Bike Alloy Wheel Rim",
      sku: "BIKE-BRK-014",
      categoryId: bikeBrakes.id,
      brand: "RoadForce",
      vehicleType: "BIKE",
      price: 2199,
      stock: 3,
      shortDescription: "Lightweight alloy rim for improved handling.",
      description: "Precision-balanced alloy wheel rim that reduces unsprung weight for sharper handling.",
    },
    {
      title: "Bike LED Headlamp",
      sku: "BIKE-ELE-015",
      categoryId: bikeElectrical.id,
      brand: "VoltEdge",
      vehicleType: "BIKE",
      price: 999,
      stock: 50,
      shortDescription: "Bright LED headlamp with wide beam spread.",
      description: "High-output LED headlamp offering superior night visibility with low power draw compared to halogen bulbs.",
    },
    {
      title: "Bike Battery 12V 5Ah",
      sku: "BIKE-ELE-016",
      categoryId: bikeElectrical.id,
      brand: "VoltEdge",
      vehicleType: "BIKE",
      price: 1399,
      stock: 20,
      shortDescription: "Maintenance-free sealed battery for reliable starts.",
      description: "Sealed maintenance-free battery offering reliable cranking power and a long shelf life.",
    },
    {
      title: "Bike Side Mirror Set",
      sku: "BIKE-BDY-017",
      categoryId: bikeBody.id,
      brand: "DuraParts",
      vehicleType: "BIKE",
      price: 399,
      stock: 90,
      shortDescription: "Universal-fit mirror set, left and right.",
      description: "Universal-fit side mirror set with wide-angle glass for better rear visibility.",
    },
    {
      title: "Bike Seat Cover (Universal)",
      sku: "BIKE-BDY-018",
      categoryId: bikeBody.id,
      brand: "IronGrip",
      vehicleType: "UNIVERSAL",
      price: 549,
      stock: 0,
      shortDescription: "Weatherproof, non-slip seat cover.",
      description: "Weatherproof non-slip seat cover that protects the original seat foam from wear and moisture.",
    },
  ];

  for (const p of products) {
    const slug = slugify(p.title);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) continue;

    const created = await prisma.product.create({
      data: {
        title: p.title,
        slug,
        sku: p.sku,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        vehicleType: p.vehicleType,
        compatibility: p.compatibility,
        isFeatured: p.isFeatured ?? false,
        isActive: true,
        categoryId: p.categoryId,
        brandId: brands[p.brand],
      },
    });

    const imageUrl = await productImageUrl(slug, p.title);
    await prisma.productImage.create({
      data: { productId: created.id, url: imageUrl, altText: p.title, position: 0 },
    });
  }
  console.log(`Created ${products.length} products`);

  // --- Banners --------------------------------------------------------
  const bannerData = [
    { title: "Genuine Parts for Every Ride", subtitle: "Shop car & bike spare parts at fair prices", linkUrl: "/products", label: "AutoSpare Promo Banner" },
    { title: "New Stock Just Arrived", subtitle: "Check out the latest additions to our catalog", linkUrl: "/products?sort=newest", label: "New Arrivals Banner" },
  ];
  for (let i = 0; i < bannerData.length; i++) {
    const b = bannerData[i];
    const existingCount = await prisma.banner.count();
    if (existingCount > i) continue;
    const image = await writePlaceholderImage(b.label, "banners", `banner-${i + 1}`, 1600, 600, false);
    await prisma.banner.create({
      data: { title: b.title, subtitle: b.subtitle, linkUrl: b.linkUrl, image, position: i, isActive: true },
    });
  }
  console.log("Created banners");

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
