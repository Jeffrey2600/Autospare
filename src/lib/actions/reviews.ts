"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export type ReviewFormState = {
  error: string | null;
  success?: boolean;
};

const reviewSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

export async function submitReviewAction(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const session = await getSession();
  if (!session) {
    return { error: "Please log in to leave a review." };
  }

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    productSlug: formData.get("productSlug"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review" };
  }

  const { productId, productSlug, rating, comment } = parsed.data;

  await prisma.review.create({
    data: {
      productId,
      userId: session.userId,
      rating,
      comment: comment || null,
    },
  });

  revalidatePath(`/products/${productSlug}`);
  return { error: null, success: true };
}
