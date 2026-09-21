"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore, cartTotals } from "@/lib/cart-store";

export function CartIndicator() {
  const items = useCartStore((s) => s.items);
  const { totalItems } = cartTotals(items);

  return (
    <Link
      href="/cart"
      className="relative flex h-10 items-center gap-2 rounded-xl px-3 text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
      aria-label="View cart"
    >
      <span className="relative">
        <ShoppingBag className="h-5 w-5" />
        {totalItems > 0 ? (
          <span className="absolute -right-2 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand-600 px-1 text-[0.625rem] font-bold text-white ring-2 ring-white">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        ) : null}
      </span>
      <span className="hidden text-sm font-medium sm:inline">Cart</span>
    </Link>
  );
}
