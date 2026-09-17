"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { saveUploadedImage, deleteUploadedImage } from "@/lib/upload";

export type BannerFormState = { error: string | null };

const bannerSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().optional().or(z.literal("")),
  subtitle: z.string().trim().optional().or(z.literal("")),
  linkUrl: z.string().trim().optional().or(z.literal("")),
  position: z.coerce.number().int().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function saveBannerAction(
  _prevState: BannerFormState,
  formData: FormData
): Promise<BannerFormState> {
  await requireAdmin();

  const parsed = bannerSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    linkUrl: formData.get("linkUrl"),
    position: formData.get("position") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const data = parsed.data;
  const imageFile = formData.get("image");
  let imageUrl: string | undefined;
  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrl = await saveUploadedImage(imageFile, "banners");
  }

  if (data.id) {
    const current = await prisma.banner.findUnique({ where: { id: data.id } });
    if (imageUrl && current?.image) await deleteUploadedImage(current.image);
    await prisma.banner.update({
      where: { id: data.id },
      data: {
        title: data.title || null,
        subtitle: data.subtitle || null,
        linkUrl: data.linkUrl || null,
        position: data.position ?? 0,
        isActive: Boolean(data.isActive),
        ...(imageUrl ? { image: imageUrl } : {}),
      },
    });
  } else {
    if (!imageUrl) {
      return { error: "Please upload a banner image" };
    }
    await prisma.banner.create({
      data: {
        title: data.title || null,
        subtitle: data.subtitle || null,
        linkUrl: data.linkUrl || null,
        position: data.position ?? 0,
        isActive: Boolean(data.isActive),
        image: imageUrl,
      },
    });
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
  redirect("/admin/banners");
}

export async function deleteBannerAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const banner = await prisma.banner.findUnique({ where: { id } });
  await prisma.banner.delete({ where: { id } });
  if (banner?.image) await deleteUploadedImage(banner.image);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
