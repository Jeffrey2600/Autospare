"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { saveUploadedImage, deleteUploadedImage } from "@/lib/upload";

export type BrandFormState = { error: string | null };

const brandSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required"),
});

async function generateUniqueBrandSlug(name: string, excludeId?: string) {
  const base = slugify(name);
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function saveBrandAction(
  _prevState: BrandFormState,
  formData: FormData
): Promise<BrandFormState> {
  await requireAdmin();

  const parsed = brandSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const logoFile = formData.get("logo");
  let logoUrl: string | undefined;
  if (logoFile instanceof File && logoFile.size > 0) {
    logoUrl = await saveUploadedImage(logoFile, "brands");
  }

  if (parsed.data.id) {
    const current = await prisma.brand.findUnique({ where: { id: parsed.data.id } });
    if (logoUrl && current?.logo) await deleteUploadedImage(current.logo);
    await prisma.brand.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name, ...(logoUrl ? { logo: logoUrl } : {}) },
    });
  } else {
    const slug = await generateUniqueBrandSlug(parsed.data.name);
    await prisma.brand.create({ data: { name: parsed.data.name, slug, logo: logoUrl || null } });
  }

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

export async function deleteBrandAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const productCount = await prisma.product.count({ where: { brandId: id } });
  if (productCount > 0) {
    throw new Error("Cannot delete a brand that has products. Reassign them first.");
  }

  const brand = await prisma.brand.findUnique({ where: { id } });
  await prisma.brand.delete({ where: { id } });
  if (brand?.logo) await deleteUploadedImage(brand.logo);

  revalidatePath("/admin/brands");
}
