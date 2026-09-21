"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCartStore, cartTotals } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const { subtotal } = cartTotals(items);

  if (!hasHydrated) {
    return <div className="mx-auto max-w-5xl px-4 py-20" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-ink-300 shadow-sm ring-1 ring-ink-200/60">
          <ShoppingCart className="h-9 w-9" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink-950">Your cart is empty</h1>
        <p className="mt-2.5 text-ink-500">Browse our catalog and add some parts to get started.</p>
        <Link href="/products">
          <Button size="lg" className="mt-7">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-ink-950">Shopping Cart</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl bg-white px-5 shadow-sm ring-1 ring-ink-200/60">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 py-5">
              <Link href={`/products/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-50 ring-1 ring-ink-200/60">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill className="object-contain p-2" />
                ) : null}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <Link href={`/products/${item.slug}`} className="font-semibold text-ink-900 transition-colors hover:text-brand-700">
                    {item.title}
                  </Link>
                  <button onClick={() => removeItem(item.productId)} aria-label="Remove item" className="shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center overflow-hidden rounded-xl border border-ink-200">
                    <button
                      className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-ink-100"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-ink-100 disabled:opacity-40"
                      disabled={item.quantity >= item.stock}
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-ink-950">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink-200/60 lg:sticky lg:top-40">
          <h2 className="text-lg font-bold tracking-tight text-ink-950">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm text-ink-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-ink-400">Shipping calculated at checkout</p>
          <Link href="/checkout">
            <Button className="mt-4 w-full" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
          <Link href="/products" className="mt-3.5 block text-center text-sm font-medium text-brand-700 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
