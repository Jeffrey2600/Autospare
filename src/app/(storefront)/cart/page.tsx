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
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <ShoppingCart className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Browse our catalog and add some parts to get started.</p>
        <Link href="/products">
          <Button className="mt-6">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-slate-200 border-y border-slate-200">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 py-4">
              <Link href={`/products/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill className="object-contain p-2" />
                ) : null}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <Link href={`/products/${item.slug}`} className="font-medium text-slate-800 hover:text-brand-700">
                    {item.title}
                  </Link>
                  <button onClick={() => removeItem(item.productId)} aria-label="Remove item" className="text-slate-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-slate-300">
                    <button
                      className="flex h-8 w-8 items-center justify-center hover:bg-slate-50"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      className="flex h-8 w-8 items-center justify-center hover:bg-slate-50 disabled:opacity-40"
                      disabled={item.quantity >= item.stock}
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-semibold text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-lg border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Shipping calculated at checkout</p>
          <Link href="/checkout">
            <Button className="mt-4 w-full" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
          <Link href="/products" className="mt-3 block text-center text-sm text-brand-700 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
