import "server-only";
import prisma from "@/lib/prisma";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (settings) return settings;

  return {
    id: 1,
    storeName: process.env.NEXT_PUBLIC_STORE_NAME ?? "AutoSpare Parts",
    tagline: "Genuine car & bike spare parts, in stock near you.",
    logoUrl: null as string | null,
    phone: process.env.NEXT_PUBLIC_STORE_PHONE ?? "",
    whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? null,
    email: process.env.NEXT_PUBLIC_STORE_EMAIL ?? "",
    address: process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "",
    facebookUrl: null as string | null,
    instagramUrl: null as string | null,
    shippingFee: 0,
    freeShippingThreshold: null as number | null,
    updatedAt: new Date(),
  };
}

export async function getActiveBanners() {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
  });
}

export async function getNavCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { position: "asc" },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { position: "asc" },
      },
    },
  });
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
}

export async function getNewArrivals(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
}

export type ProductFilters = {
  category?: string;
  vehicleType?: "CAR" | "BIKE" | "UNIVERSAL";
  brand?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc";
  page?: number;
};

const PAGE_SIZE = 12;

export async function getProducts(filters: ProductFilters) {
  const where = {
    isActive: true,
    ...(filters.category ? { category: { slug: filters.category } } : {}),
    ...(filters.vehicleType ? { vehicleType: filters.vehicleType } : {}),
    ...(filters.brand ? { brand: { slug: filters.brand } } : {}),
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q } },
            { description: { contains: filters.q } },
            { sku: { contains: filters.q } },
          ],
        }
      : {}),
    ...(filters.minPrice || filters.maxPrice
      ? {
          price: {
            ...(filters.minPrice ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy =
    filters.sort === "price-asc"
      ? ({ price: "asc" } as const)
      : filters.sort === "price-desc"
        ? ({ price: "desc" } as const)
        : ({ createdAt: "desc" } as const);

  const page = filters.page && filters.page > 0 ? filters.page : 1;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { images: { orderBy: { position: "asc" }, take: 1 }, brand: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
      brand: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  return prisma.product.findMany({
    where: { categoryId, isActive: true, id: { not: excludeId } },
    take: limit,
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
}

export async function getAllBrands() {
  return prisma.brand.findMany({ orderBy: { name: "asc" } });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}
