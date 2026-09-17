"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/Button";

type Props = {
  product: { id: string; title: string; slug: string; price: number; stock: number };
  image: string | null;
};

export function ProductActions({ product, image }: Props) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex items-center rounded-md border border-slate-300">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={outOfStock}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-sm font-medium">{qty}</span>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
          disabled={outOfStock}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button
        variant="outline"
        size="lg"
        disabled={outOfStock}
        onClick={() => addItem({ productId: product.id, title: product.title, slug: product.slug, price: product.price, image, stock: product.stock }, qty)}
        className="flex-1"
      >
        Add to Cart
      </Button>
      <Button
        size="lg"
        disabled={outOfStock}
        onClick={() => {
          addItem({ productId: product.id, title: product.title, slug: product.slug, price: product.price, image, stock: product.stock }, qty);
          router.push("/checkout");
        }}
        className="flex-1"
      >
        {outOfStock ? "Out of Stock" : "Buy Now"}
      </Button>
    </div>
  );
}
