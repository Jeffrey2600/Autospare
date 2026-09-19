import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Truck, Headset, Undo2, Car, Bike, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { BannerCarousel } from "@/components/storefront/BannerCarousel";
import { buttonClasses } from "@/components/ui/Button";
import { getActiveBanners, getFeaturedProducts, getNavCategories, getNewArrivals } from "@/lib/queries";

export default async function HomePage() {
  const [banners, featured, newArrivals, categories] = await Promise.all([
    getActiveBanners(),
    getFeaturedProducts(8),
    getNewArrivals(8),
    getNavCategories(),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-slate-900 text-white">
        {banners.length > 0 ? (
          <BannerCarousel banners={banners} />
        ) : (
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-6 py-20 sm:py-28">
            <h1 className="max-w-xl text-3xl font-bold sm:text-5xl">
              Genuine Car &amp; Bike Spare Parts, Delivered Fast
            </h1>
            <p className="max-w-lg text-slate-300">
              Thousands of parts in stock — engine, brakes, electricals, body panels and more. Trusted by mechanics and riders alike.
            </p>
            <Link href="/products" className={buttonClasses("primary", "lg")}>
              Shop Now
            </Link>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          <Link
            href="/products?vehicleType=CAR"
            className="group relative flex h-40 flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-brand-900 p-6 shadow-sm transition-shadow hover:shadow-lg sm:h-56"
          >
            <Car className="h-10 w-10 text-brand-300 transition-transform group-hover:scale-110 sm:h-12 sm:w-12" />
            <span className="flex items-center gap-1 text-2xl font-bold text-white">
              Car Parts
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            href="/products?vehicleType=BIKE"
            className="group relative flex h-40 flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-sky-900 p-6 shadow-sm transition-shadow hover:shadow-lg sm:h-56"
          >
            <Bike className="h-10 w-10 text-sky-300 transition-transform group-hover:scale-110 sm:h-12 sm:w-12" />
            <span className="flex items-center gap-1 text-2xl font-bold text-white">
              Bike Parts
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-4 text-center hover:border-brand-400 hover:shadow-sm"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                  ) : null}
                </div>
                <span className="text-sm font-medium text-slate-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {featured.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Featured Products</h2>
            <Link href="/products" className="text-sm font-medium text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
          <TrustItem icon={<ShieldCheck className="h-6 w-6" />} title="Genuine Parts" desc="Sourced &amp; verified quality" />
          <TrustItem icon={<Truck className="h-6 w-6" />} title="Fast Delivery" desc="Quick local dispatch" />
          <TrustItem icon={<Undo2 className="h-6 w-6" />} title="Easy Returns" desc="Hassle-free exchanges" />
          <TrustItem icon={<Headset className="h-6 w-6" />} title="Expert Support" desc="We help you find the right fit" />
        </div>
      </section>

      {newArrivals.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">New Arrivals</h2>
            <Link href="/products?sort=newest" className="text-sm font-medium text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function TrustItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:text-left">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
