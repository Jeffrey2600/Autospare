"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Props = {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    stock: number;
  };
  image: string | null;
  quantity?: number;
  className?: string;
  fullWidth?: boolean;
};

export function AddToCartButton({ product, image, quantity = 1, className, fullWidth }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  return (
    <button
      type="button"
      disabled={outOfStock}
      className={cn(
        buttonClasses("primary", "md", className),
        fullWidth && "w-full"
      )}
      onClick={() => {
        addItem(
          {
            productId: product.id,
            title: product.title,
            slug: product.slug,
            price: product.price,
            image,
            stock: product.stock,
          },
          quantity
        );
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {outOfStock ? (
        "Out of stock"
      ) : added ? (
        <>
          <Check className="h-4 w-4" /> Added
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" /> Add to cart
        </>
      )}
    </button>
  );
}
