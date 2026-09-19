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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        {" / "}
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-700">
          {product.category.name}
        </Link>
        {" / "}
        <span className="text-slate-700">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ImageGallery images={product.images} title={product.title} />

        <div>
          {product.brand ? (
            <p className="text-sm font-medium text-brand-700">{product.brand.name}</p>
          ) : null}
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{product.title}</h1>

          <div className="mt-2 flex items-center gap-3">
            {product.reviews.length > 0 ? (
              <>
                <StarRating rating={avgRating} />
                <span className="text-sm text-slate-500">({product.reviews.length} reviews)</span>
              </>
            ) : (
              <span className="text-sm text-slate-400">No reviews yet</span>
            )}
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <>
                <span className="text-lg text-slate-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                <span className="rounded bg-brand-100 px-2 py-0.5 text-sm font-semibold text-brand-700">
                  Save {discount}%
                </span>
              </>
            ) : null}
          </div>

          <p className="mt-1 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </p>

          {product.shortDescription ? (
            <p className="mt-4 text-slate-600">{product.shortDescription}</p>
          ) : null}

          <div className="mt-6">
            <ProductActions product={product} image={image} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Truck className="h-4 w-4 shrink-0" /> Fast local dispatch
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="h-4 w-4 shrink-0" /> Quality checked parts
            </div>
          </div>

          <dl className="mt-6 space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">SKU</dt>
              <dd className="font-medium text-slate-700">{product.sku}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Vehicle Type</dt>
              <dd className="font-medium text-slate-700">
                {product.vehicleType === "CAR" ? "Car" : product.vehicleType === "BIKE" ? "Bike" : "Universal"}
              </dd>
            </div>
            {product.compatibility ? (
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-slate-500">Compatible With</dt>
                <dd className="text-right font-medium text-slate-700">{product.compatibility}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      <div className="mt-12 border-t border-slate-200 pt-8">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Description</h2>
        <p className="whitespace-pre-line text-slate-600">{product.description}</p>
      </div>

      <div className="mt-12 border-t border-slate-200 pt-8">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Customer Reviews</h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {product.reviews.length === 0 ? (
              <p className="text-sm text-slate-500">Be the first to review this product.</p>
            ) : (
              product.reviews.map((review) => (
                <div key={review.id} className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{review.user.name}</span>
                    <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                  </div>
                  <StarRating rating={review.rating} className="my-1" />
                  {review.comment ? <p className="text-sm text-slate-600">{review.comment}</p> : null}
                </div>
              ))
            )}
          </div>
          <div>
            {session ? (
              <ReviewForm productId={product.id} productSlug={product.slug} />
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                <Link href="/login" className="font-medium text-brand-700 hover:underline">
                  Log in
                </Link>{" "}
                to leave a review.
              </p>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <div className="mt-12 border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Related Products</h2>
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
