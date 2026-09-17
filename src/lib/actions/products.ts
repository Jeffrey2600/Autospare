"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { saveUploadedImage, deleteUploadedImage } from "@/lib/upload";

export type ProductFormState = {
  error: string | null;
};

const productSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  sku: z.string().trim().min(1, "SKU is required"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().trim().optional().or(z.literal("")),
  price: z.coerce.number().positive("Price must be greater than 0"),
  compareAtPrice: z.coerce.number().positive().optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0),
  vehicleType: z.enum(["CAR", "BIKE", "UNIVERSAL"]),
  categoryId: z.string().min(1, "Select a category"),
  brandId: z.string().optional().or(z.literal("")),
  compatibility: z.string().trim().optional().or(z.literal("")),
  isFeatured: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  removedImageIds: z.string().optional(),
  imageOrder: z.string().optional(),
});

async function generateUniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function saveProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    sku: formData.get("sku"),
    description: formData.get("description"),
    shortDescription: formData.get("shortDescription"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    stock: formData.get("stock"),
    vehicleType: formData.get("vehicleType"),
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId") || undefined,
    compatibility: formData.get("compatibility"),
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
    removedImageIds: formData.get("removedImageIds") || undefined,
    imageOrder: formData.get("imageOrder") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors" };
  }

  const data = parsed.data;

  const skuOwner = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (skuOwner && skuOwner.id !== data.id) {
    return { error: "This SKU is already used by another product" };
  }

  const newImageFiles = formData
    .getAll("newImages")
    .filter((f): f is File => f instanceof File && f.size > 0);

  let productId = data.id;

  if (productId) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title,
        sku: data.sku,
        description: data.description,
        shortDescription: data.shortDescription || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        stock: data.stock,
        vehicleType: data.vehicleType,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        compatibility: data.compatibility || null,
        isFeatured: Boolean(data.isFeatured),
        isActive: Boolean(data.isActive),
      },
    });

    if (data.removedImageIds) {
      const ids: string[] = JSON.parse(data.removedImageIds);
      if (ids.length > 0) {
        const images = await prisma.productImage.findMany({ where: { id: { in: ids }, productId } });
        await prisma.productImage.deleteMany({ where: { id: { in: ids } } });
        await Promise.all(images.map((img) => deleteUploadedImage(img.url)));
      }
    }

    if (data.imageOrder) {
      const orderedIds: string[] = JSON.parse(data.imageOrder);
      await Promise.all(
        orderedIds.map((id, index) =>
          prisma.productImage.update({ where: { id }, data: { position: index } }).catch(() => null)
        )
      );
    }
  } else {
    const slug = await generateUniqueSlug(data.title);
    const created = await prisma.product.create({
      data: {
        title: data.title,
        slug,
        sku: data.sku,
        description: data.description,
        shortDescription: data.shortDescription || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        stock: data.stock,
        vehicleType: data.vehicleType,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        compatibility: data.compatibility || null,
        isFeatured: Boolean(data.isFeatured),
        isActive: Boolean(data.isActive),
      },
    });
    productId = created.id;
  }

  if (newImageFiles.length > 0) {
    const existingCount = await prisma.productImage.count({ where: { productId } });
    const urls = await Promise.all(newImageFiles.map((file) => saveUploadedImage(file, "products")));
    await prisma.productImage.createMany({
      data: urls.map((url, index) => ({
        productId: productId!,
        url,
        position: existingCount + index,
      })),
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const images = await prisma.productImage.findMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  await Promise.all(images.map((img) => deleteUploadedImage(img.url)));

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function toggleProductActiveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}
