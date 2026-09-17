import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";

type ProductCardData = {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  images: { url: string; altText: string | null }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0]?.url ?? null;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
      : null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-slate-50">
        {image ? (
          <Image
            src={image}
            alt={product.images[0]?.altText ?? product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-4 transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            No image
          </div>
        )}
        {discount ? (
          <span className="absolute left-2 top-2 rounded bg-brand-600 px-2 py-1 text-xs font-semibold text-white">
            -{discount}%
          </span>
        ) : null}
        {product.stock <= 0 ? (
          <span className="absolute right-2 top-2 rounded bg-slate-900/80 px-2 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-slate-800 hover:text-brand-700">
            {product.title}
          </h3>
        </Link>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-base font-semibold text-slate-900">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
        <AddToCartButton
          product={product}
          image={image}
          className="mt-1"
          fullWidth
        />
      </div>
    </div>
  );
}
