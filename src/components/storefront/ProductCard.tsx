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
  const outOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-200/60 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lg hover:ring-ink-200">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-ink-50"
      >
        {image ? (
          <Image
            src={image}
            alt={product.images[0]?.altText ?? product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-300">
            No image
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {discount ? (
            <span className="rounded-lg bg-brand-600 px-2 py-1 text-[0.6875rem] font-bold tracking-wide text-white shadow-sm">
              {discount}% OFF
            </span>
          ) : (
            <span />
          )}
          {outOfStock ? (
            <span className="rounded-lg bg-ink-900/85 px-2 py-1 text-[0.6875rem] font-semibold text-white backdrop-blur-sm">
              Out of stock
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink-800 transition-colors group-hover:text-brand-700">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-ink-950">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <span className="text-sm text-ink-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </div>

        <AddToCartButton product={product} image={image} fullWidth />
      </div>
    </div>
  );
}
