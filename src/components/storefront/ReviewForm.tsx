"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReviewAction, type ReviewFormState } from "@/lib/actions/reviews";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const initialState: ReviewFormState = { error: null };

export function ReviewForm({ productId, productSlug }: { productId: string; productSlug: string }) {
  const [state, formAction, pending] = useActionState(submitReviewAction, initialState);
  const [rating, setRating] = useState(5);

  if (state.success) {
    return (
      <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
        Thanks! Your review has been submitted and will appear once approved.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-ink-200 p-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <input type="hidden" name="rating" value={rating} />
      <div>
        <p className="mb-1 text-sm font-medium text-ink-700">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" onClick={() => setRating(i)} aria-label={`Rate ${i} stars`}>
              <Star className={cn("h-6 w-6", i <= rating ? "fill-amber-400 text-amber-400" : "text-ink-300")} />
            </button>
          ))}
        </div>
      </div>
      <Textarea name="comment" placeholder="Share your experience with this product (optional)" rows={3} />
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
