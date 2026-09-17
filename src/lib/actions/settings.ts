"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { saveUploadedImage, deleteUploadedImage } from "@/lib/upload";

export type SettingsFormState = { error: string | null; success?: boolean };

const settingsSchema = z.object({
  storeName: z.string().trim().min(1, "Store name is required"),
  tagline: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  facebookUrl: z.string().trim().optional().or(z.literal("")),
  instagramUrl: z.string().trim().optional().or(z.literal("")),
  shippingFee: z.coerce.number().min(0).optional(),
  freeShippingThreshold: z.coerce.number().min(0).optional().or(z.literal("")),
});

export async function saveSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    storeName: formData.get("storeName"),
    tagline: formData.get("tagline"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    address: formData.get("address"),
    facebookUrl: formData.get("facebookUrl"),
    instagramUrl: formData.get("instagramUrl"),
    shippingFee: formData.get("shippingFee") || 0,
    freeShippingThreshold: formData.get("freeShippingThreshold") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const data = parsed.data;
  const logoFile = formData.get("logo");
  let logoUrl: string | undefined;
  if (logoFile instanceof File && logoFile.size > 0) {
    logoUrl = await saveUploadedImage(logoFile, "settings");
    const current = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (current?.logoUrl) await deleteUploadedImage(current.logoUrl);
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      storeName: data.storeName,
      tagline: data.tagline || null,
      phone: data.phone || "",
      whatsapp: data.whatsapp || null,
      email: data.email || "",
      address: data.address || "",
      facebookUrl: data.facebookUrl || null,
      instagramUrl: data.instagramUrl || null,
      shippingFee: data.shippingFee ?? 0,
      freeShippingThreshold: data.freeShippingThreshold || null,
      logoUrl: logoUrl || null,
    },
    update: {
      storeName: data.storeName,
      tagline: data.tagline || null,
      phone: data.phone || "",
      whatsapp: data.whatsapp || null,
      email: data.email || "",
      address: data.address || "",
      facebookUrl: data.facebookUrl || null,
      instagramUrl: data.instagramUrl || null,
      shippingFee: data.shippingFee ?? 0,
      freeShippingThreshold: data.freeShippingThreshold || null,
      ...(logoUrl ? { logoUrl } : {}),
    },
  });

  revalidatePath("/", "layout");
  return { error: null, success: true };
}
