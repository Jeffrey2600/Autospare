"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { saveUploadedImage, deleteUploadedImage } from "@/lib/upload";

export type CategoryFormState = { error: string | null };

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  description: z.string().trim().optional().or(z.literal("")),
  vehicleType: z.enum(["CAR", "BIKE", "UNIVERSAL"]),
  parentId: z.string().optional().or(z.literal("")),
  position: z.coerce.number().int().optional(),
  isActive: z.coerce.boolean().optional(),
});

async function generateUniqueCategorySlug(name: string, excludeId?: string) {
  const base = slugify(name);
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function saveCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    description: formData.get("description"),
    vehicleType: formData.get("vehicleType"),
    parentId: formData.get("parentId") || undefined,
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const data = parsed.data;

  if (data.parentId && data.parentId === data.id) {
    return { error: "A category cannot be its own parent" };
  }

  const imageFile = formData.get("image");
  let imageUrl: string | undefined;
  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrl = await saveUploadedImage(imageFile, "categories");
  }

  if (data.id) {
    const current = await prisma.category.findUnique({ where: { id: data.id } });
    if (imageUrl && current?.image) await deleteUploadedImage(current.image);

    await prisma.category.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description || null,
        vehicleType: data.vehicleType,
        parentId: data.parentId || null,
        position: data.position ?? 0,
        isActive: Boolean(data.isActive),
        ...(imageUrl ? { image: imageUrl } : {}),
      },
    });
  } else {
    const slug = await generateUniqueCategorySlug(data.name);
    await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        vehicleType: data.vehicleType,
        parentId: data.parentId || null,
        position: data.position ?? 0,
        isActive: Boolean(data.isActive),
        image: imageUrl || null,
      },
    });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const [productCount, childCount] = await Promise.all([
    prisma.product.count({ where: { categoryId: id } }),
    prisma.category.count({ where: { parentId: id } }),
  ]);

  if (productCount > 0 || childCount > 0) {
    throw new Error("Cannot delete a category that has products or subcategories. Move or remove them first.");
  }

  const category = await prisma.category.findUnique({ where: { id } });
  await prisma.category.delete({ where: { id } });
  if (category?.image) await deleteUploadedImage(category.image);

  revalidatePath("/admin/categories");
}
