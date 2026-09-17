"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore, cartTotals } from "@/lib/cart-store";

export function CartIndicator() {
  const items = useCartStore((s) => s.items);
  const { totalItems } = cartTotals(items);

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 rounded-md p-2 text-slate-700 hover:bg-slate-100"
      aria-label="View cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      ) : null}
      <span className="hidden text-sm font-medium sm:inline">Cart</span>
    </Link>
  );
}
