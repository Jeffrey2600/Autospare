import type { Metadata } from "next";
import { Check, X, Trash2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { approveReviewAction, rejectReviewAction, deleteReviewAction } from "@/lib/actions/reviewsAdmin";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } }, product: { select: { title: true, slug: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink-950">Reviews</h1>
      <div className="mt-4 divide-y divide-ink-100 rounded-2xl bg-white shadow-sm ring-1 ring-ink-200/60">
        {reviews.map((review) => (
          <div key={review.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-ink-800">{review.user.name}</span>
                <span className="text-xs text-ink-400">on {review.product.title}</span>
                <span
                  className={
                    review.isApproved
                      ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700"
                      : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700"
                  }
                >
                  {review.isApproved ? "Approved" : "Pending"}
                </span>
              </div>
              <StarRating rating={review.rating} className="my-1" />
              {review.comment ? <p className="text-sm text-ink-600">{review.comment}</p> : null}
              <p className="text-xs text-ink-400">{formatDate(review.createdAt)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {!review.isApproved ? (
                <form action={approveReviewAction}>
                  <input type="hidden" name="id" value={review.id} />
                  <button type="submit" className="rounded-md p-2 text-green-600 hover:bg-green-50" aria-label="Approve">
                    <Check className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <form action={rejectReviewAction}>
                  <input type="hidden" name="id" value={review.id} />
                  <button type="submit" className="rounded-md p-2 text-amber-600 hover:bg-amber-50" aria-label="Unapprove">
                    <X className="h-4 w-4" />
                  </button>
                </form>
              )}
              <form action={deleteReviewAction}>
                <input type="hidden" name="id" value={review.id} />
                <ConfirmSubmitButton message="Delete this review?" className="rounded-md p-2 text-ink-500 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {reviews.length === 0 ? <p className="px-4 py-10 text-center text-ink-400">No reviews yet.</p> : null}
      </div>
    </div>
  );
}
