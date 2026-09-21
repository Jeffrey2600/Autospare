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

  // Top-level is just Car/Bike, which the tiles above already cover — the
  // subcategories are what customers actually browse by.
  const subCategories = categories.flatMap((cat) => cat.children).slice(0, 8);

  return (
    <div>
      <section className="relative overflow-hidden bg-ink-950 text-white">
        {banners.length > 0 ? (
          <BannerCarousel banners={banners} />
        ) : (
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 py-24 sm:py-32">
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.05] sm:text-6xl">
              Genuine car &amp; bike spare parts, delivered fast
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-ink-300">
              Thousands of parts in stock — engine, brakes, electricals, body panels and more.
            </p>
            <Link href="/products" className={buttonClasses("primary", "xl")}>
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Vehicle split */}
      <Section className="pt-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <VehicleTile
            href="/products?vehicleType=CAR"
            label="Car Parts"
            blurb="Engine, brakes, lighting & body"
            icon={<Car className="h-7 w-7" />}
            className="from-brand-600 via-brand-700 to-ink-950"
          />
          <VehicleTile
            href="/products?vehicleType=BIKE"
            label="Bike Parts"
            blurb="Transmission, wheels & accessories"
            icon={<Bike className="h-7 w-7" />}
            className="from-sky-600 via-sky-800 to-ink-950"
          />
        </div>
      </Section>

      {subCategories.length > 0 ? (
        <Section>
          <SectionHead title="Shop by category" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {subCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink-200/60 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-md hover:ring-brand-200"
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-ink-100">
                  {cat.image ? (
                    <Image src={cat.image} alt="" fill sizes="44px" className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink-900 transition-colors group-hover:text-brand-700">
                    {cat.name}
                  </span>
                  <span className="text-xs text-ink-400">
                    {cat.vehicleType === "CAR" ? "Car" : cat.vehicleType === "BIKE" ? "Bike" : "Universal"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      {featured.length > 0 ? (
        <Section>
          <SectionHead title="Featured products" href="/products" />
          <ProductGrid products={featured} />
        </Section>
      ) : null}

      {/* Trust strip */}
      <section className="mt-16 bg-white py-12 ring-1 ring-ink-200/60">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 lg:grid-cols-4">
          <TrustItem icon={<ShieldCheck className="h-5 w-5" />} title="Genuine Parts" desc="Sourced & verified quality" />
          <TrustItem icon={<Truck className="h-5 w-5" />} title="Fast Delivery" desc="Quick local dispatch" />
          <TrustItem icon={<Undo2 className="h-5 w-5" />} title="Easy Returns" desc="Hassle-free exchanges" />
          <TrustItem icon={<Headset className="h-5 w-5" />} title="Expert Support" desc="We help you find the right fit" />
        </div>
      </section>

      {newArrivals.length > 0 ? (
        <Section>
          <SectionHead title="New arrivals" href="/products?sort=newest" />
          <ProductGrid products={newArrivals} />
        </Section>
      ) : null}
    </div>
  );
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`mx-auto max-w-7xl px-4 py-10 sm:px-6 ${className}`}>{children}</section>
  );
}

function SectionHead({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-2xl font-bold tracking-tight text-ink-950 sm:text-[1.75rem]">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="group flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-600"
        >
          View all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

function ProductGrid({
  products,
}: {
  products: React.ComponentProps<typeof ProductCard>["product"][];
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function VehicleTile({
  href,
  label,
  blurb,
  icon,
  className,
}: {
  href: string;
  label: string;
  blurb: string;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex h-44 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl sm:h-56 ${className}`}
    >
      <span className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/8 transition-transform duration-500 group-hover:scale-125" />
      <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      <div className="relative">
        <p className="text-sm text-white/70">{blurb}</p>
        <span className="mt-1 flex items-center gap-1.5 text-2xl font-bold tracking-tight">
          {label}
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function TrustItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-ink-900">{title}</p>
        <p className="mt-0.5 text-sm text-ink-500">{desc}</p>
      </div>
    </div>
  );
}
