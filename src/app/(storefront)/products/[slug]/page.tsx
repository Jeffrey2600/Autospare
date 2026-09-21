import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Truck, ShieldCheck } from "lucide-react";
import { ImageGallery } from "@/components/storefront/ImageGallery";
import { ProductActions } from "@/components/storefront/ProductActions";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ReviewForm } from "@/components/storefront/ReviewForm";
import { StarRating } from "@/components/ui/StarRating";
import { formatDate, formatPrice } from "@/lib/utils";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { getSession } from "@/lib/auth";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.shortDescription ?? product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const [product, session] = await Promise.all([getProductBySlug(slug), getSession()]);

  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, product.vehicleType);
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;
  const image = product.images[0]?.url ?? null;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
        <Link href="/" className="transition-colors hover:text-brand-700">Home</Link>
        <span className="text-ink-300">/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="transition-colors hover:text-brand-700"
        >
          {product.category.name}
        </Link>
        <span className="text-ink-300">/</span>
        <span className="font-medium text-ink-700">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
        <div className="lg:sticky lg:top-40 lg:self-start">
          <ImageGallery images={product.images} title={product.title} />
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink-200/60 sm:p-8">
          {product.brand ? (
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-600">
              {product.brand.name}
            </p>
          ) : null}
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-ink-950">
            {product.title}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            {product.reviews.length > 0 ? (
              <>
                <StarRating rating={avgRating} />
                <span className="text-sm text-ink-500">({product.reviews.length} reviews)</span>
              </>
            ) : (
              <span className="text-sm text-ink-400">No reviews yet</span>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-bold tracking-tight text-ink-950">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <>
                <span className="text-lg text-ink-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-700">
                  Save {discount}%
                </span>
              </>
            ) : null}
          </div>

          <p className="mt-3">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                In stock · {product.stock} available
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Out of stock
              </span>
            )}
          </p>

          {product.shortDescription ? (
            <p className="mt-5 leading-relaxed text-ink-600">{product.shortDescription}</p>
          ) : null}

          <div className="mt-7">
            <ProductActions product={product} image={image} />
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 rounded-2xl bg-ink-50 p-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2.5 text-ink-600">
              <Truck className="h-4 w-4 shrink-0 text-brand-600" /> Fast local dispatch
            </div>
            <div className="flex items-center gap-2.5 text-ink-600">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" /> Quality checked parts
            </div>
          </div>

          <dl className="mt-7 divide-y divide-ink-100 border-t border-ink-100 text-sm">
            <SpecRow label="SKU" value={product.sku} />
            <SpecRow
              label="Vehicle Type"
              value={
                product.vehicleType === "CAR"
                  ? "Car"
                  : product.vehicleType === "BIKE"
                    ? "Bike"
                    : "Universal"
              }
            />
            {product.compatibility ? (
              <SpecRow label="Compatible With" value={product.compatibility} />
            ) : null}
          </dl>
        </div>
      </div>

      <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink-200/60 sm:p-8">
        <h2 className="text-xl font-bold tracking-tight text-ink-950">Description</h2>
        <p className="mt-4 max-w-3xl whitespace-pre-line leading-relaxed text-ink-600">
          {product.description}
        </p>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink-200/60 sm:p-8">
        <h2 className="text-xl font-bold tracking-tight text-ink-950">Customer Reviews</h2>
        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            {product.reviews.length === 0 ? (
              <p className="text-sm text-ink-500">Be the first to review this product.</p>
            ) : (
              product.reviews.map((review) => (
                <div key={review.id} className="rounded-2xl bg-ink-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink-900">{review.user.name}</span>
                    <span className="text-xs text-ink-400">{formatDate(review.createdAt)}</span>
                  </div>
                  <StarRating rating={review.rating} className="my-1.5" />
                  {review.comment ? (
                    <p className="text-sm leading-relaxed text-ink-600">{review.comment}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
          <div>
            {session ? (
              <ReviewForm productId={product.id} productSlug={product.slug} />
            ) : (
              <p className="rounded-2xl border border-dashed border-ink-300 p-5 text-sm text-ink-500">
                <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                  Log in
                </Link>{" "}
                to leave a review.
              </p>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-ink-950">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 py-3">
      <dt className="shrink-0 text-ink-500">{label}</dt>
      <dd className="text-right font-medium text-ink-800">{value}</dd>
    </div>
  );
}
