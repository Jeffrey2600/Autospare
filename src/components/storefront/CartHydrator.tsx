"use client";

import { useCartHydrationSafetyNet } from "@/lib/cart-store";

export function CartHydrator() {
  useCartHydrationSafetyNet();
  return null;
}
