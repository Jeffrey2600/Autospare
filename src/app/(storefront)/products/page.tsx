import Link from "next/link";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Field";
import { getAllBrands, getNavCategories, getProducts, type ProductFilters } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop All Parts",
};

function toQueryString(params: Record<string, string | number | undefined>) {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `/products?${qs}` : "/products";
}

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const sp = await searchParams;
  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const filters: ProductFilters = {
    category: get("category"),
    vehicleType: get("vehicleType") as ProductFilters["vehicleType"],
    brand: get("brand"),
    q: get("q"),
    minPrice: get("minPrice") ? Number(get("minPrice")) : undefined,
    maxPrice: get("maxPrice") ? Number(get("maxPrice")) : undefined,
    sort: (get("sort") as ProductFilters["sort"]) ?? "newest",
    page: get("page") ? Number(get("page")) : 1,
  };

  const [result, categories, brands] = await Promise.all([
    getProducts(filters),
    getNavCategories(),
    getAllBrands(),
  ]);

  const baseParams = {
    category: filters.category,
    vehicleType: filters.vehicleType,
    brand: filters.brand,
    q: filters.q,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-ink-950">
        {filters.q ? `Search results for "${filters.q}"` : "All Products"}
      </h1>
      <p className="mt-1.5 text-sm text-ink-500">{result.total} products found</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="h-fit space-y-7 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-200/60 lg:sticky lg:top-40">
          <div>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-500">
              Vehicle Type
            </h3>
            <ul className="space-y-1 text-sm">
              {(["CAR", "BIKE", "UNIVERSAL"] as const).map((vt) => (
                <li key={vt}>
                  <Link
                    href={toQueryString({ ...baseParams, vehicleType: filters.vehicleType === vt ? undefined : vt })}
                    className={cn(
                      "block rounded-lg px-2.5 py-1.5 transition-colors hover:bg-ink-100",
                      filters.vehicleType === vt && "bg-brand-50 font-semibold text-brand-700"
                    )}
                  >
                    {vt === "CAR" ? "Car" : vt === "BIKE" ? "Bike" : "Universal"}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-500">Categories</h3>
            <ul className="space-y-1 text-sm">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={toQueryString({ ...baseParams, category: filters.category === cat.slug ? undefined : cat.slug })}
                    className={cn(
                      "block rounded-lg px-2.5 py-1.5 transition-colors hover:bg-ink-100",
                      filters.category === cat.slug && "bg-brand-50 font-semibold text-brand-700"
                    )}
                  >
                    {cat.name}
                  </Link>
                  {cat.children.length > 0 ? (
                    <ul className="ml-3 space-y-1 border-l border-ink-200 pl-2">
                      {cat.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={toQueryString({ ...baseParams, category: filters.category === child.slug ? undefined : child.slug })}
                            className={cn(
                              "block rounded-lg px-2.5 py-1.5 text-ink-600 transition-colors hover:bg-ink-100",
                              filters.category === child.slug && "bg-brand-50 font-semibold text-brand-700"
                            )}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {brands.length > 0 ? (
            <div>
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-500">Brand</h3>
              <ul className="space-y-1 text-sm">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <Link
                      href={toQueryString({ ...baseParams, brand: filters.brand === brand.slug ? undefined : brand.slug })}
                      className={cn(
                        "block rounded-lg px-2.5 py-1.5 transition-colors hover:bg-ink-100",
                        filters.brand === brand.slug && "bg-brand-50 font-semibold text-brand-700"
                      )}
                    >
                      {brand.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-500">Price Range</h3>
            <form action="/products" method="GET" className="flex flex-col gap-2">
              {filters.category ? <input type="hidden" name="category" value={filters.category} /> : null}
              {filters.vehicleType ? <input type="hidden" name="vehicleType" value={filters.vehicleType} /> : null}
              {filters.brand ? <input type="hidden" name="brand" value={filters.brand} /> : null}
              {filters.q ? <input type="hidden" name="q" value={filters.q} /> : null}
              <div className="flex items-center gap-2">
                <Input type="number" name="minPrice" placeholder="Min" defaultValue={filters.minPrice ?? ""} className="w-full" />
                <span className="text-ink-400">–</span>
                <Input type="number" name="maxPrice" placeholder="Max" defaultValue={filters.maxPrice ?? ""} className="w-full" />
              </div>
              <button type="submit" className="rounded-xl border border-ink-200 bg-white py-2 text-sm font-semibold shadow-xs transition-colors hover:border-ink-300 hover:bg-ink-50">
                Apply
              </button>
            </form>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-ink-500">Sort by:</span>
            {(
              [
                { key: "newest", label: "Newest" },
                { key: "price-asc", label: "Price: Low to High" },
                { key: "price-desc", label: "Price: High to Low" },
              ] as const
            ).map((opt) => (
              <Link
                key={opt.key}
                href={toQueryString({ ...baseParams, sort: opt.key })}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 font-medium transition-all",
                  filters.sort === opt.key
                    ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                    : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50"
                )}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          {result.items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-300 bg-white py-20 text-center text-ink-500">
              <SearchX className="h-9 w-9 text-ink-300" />
              <p className="font-medium text-ink-700">No products match your filters</p>
              <p className="text-sm">Try widening your search or clearing a filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            makeHref={(p) => toQueryString({ ...baseParams, page: p })}
          />
        </div>
      </div>
    </div>
  );
}
