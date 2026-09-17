"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function approveReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.review.update({ where: { id }, data: { isApproved: true } });
  revalidatePath("/admin/reviews");
}

export async function rejectReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.review.update({ where: { id }, data: { isApproved: false } });
  revalidatePath("/admin/reviews");
}

export async function deleteReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
}
