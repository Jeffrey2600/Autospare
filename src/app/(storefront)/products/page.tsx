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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">
        {filters.q ? `Search results for "${filters.q}"` : "All Products"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{result.total} products found</p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <div>
            <h3 className="mb-2 font-semibold text-slate-900">Vehicle Type</h3>
            <ul className="space-y-1 text-sm">
              {(["CAR", "BIKE", "UNIVERSAL"] as const).map((vt) => (
                <li key={vt}>
                  <Link
                    href={toQueryString({ ...baseParams, vehicleType: filters.vehicleType === vt ? undefined : vt })}
                    className={cn(
                      "block rounded px-2 py-1 hover:bg-slate-100",
                      filters.vehicleType === vt && "bg-brand-50 font-medium text-brand-700"
                    )}
                  >
                    {vt === "CAR" ? "Car" : vt === "BIKE" ? "Bike" : "Universal"}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-slate-900">Categories</h3>
            <ul className="space-y-1 text-sm">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={toQueryString({ ...baseParams, category: filters.category === cat.slug ? undefined : cat.slug })}
                    className={cn(
                      "block rounded px-2 py-1 hover:bg-slate-100",
                      filters.category === cat.slug && "bg-brand-50 font-medium text-brand-700"
                    )}
                  >
                    {cat.name}
                  </Link>
                  {cat.children.length > 0 ? (
                    <ul className="ml-3 space-y-1 border-l border-slate-200 pl-2">
                      {cat.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={toQueryString({ ...baseParams, category: filters.category === child.slug ? undefined : child.slug })}
                            className={cn(
                              "block rounded px-2 py-1 text-slate-600 hover:bg-slate-100",
                              filters.category === child.slug && "bg-brand-50 font-medium text-brand-700"
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
              <h3 className="mb-2 font-semibold text-slate-900">Brand</h3>
              <ul className="space-y-1 text-sm">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <Link
                      href={toQueryString({ ...baseParams, brand: filters.brand === brand.slug ? undefined : brand.slug })}
                      className={cn(
                        "block rounded px-2 py-1 hover:bg-slate-100",
                        filters.brand === brand.slug && "bg-brand-50 font-medium text-brand-700"
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
            <h3 className="mb-2 font-semibold text-slate-900">Price Range</h3>
            <form action="/products" method="GET" className="flex flex-col gap-2">
              {filters.category ? <input type="hidden" name="category" value={filters.category} /> : null}
              {filters.vehicleType ? <input type="hidden" name="vehicleType" value={filters.vehicleType} /> : null}
              {filters.brand ? <input type="hidden" name="brand" value={filters.brand} /> : null}
              {filters.q ? <input type="hidden" name="q" value={filters.q} /> : null}
              <div className="flex items-center gap-2">
                <Input type="number" name="minPrice" placeholder="Min" defaultValue={filters.minPrice ?? ""} className="w-full" />
                <span className="text-slate-400">–</span>
                <Input type="number" name="maxPrice" placeholder="Max" defaultValue={filters.maxPrice ?? ""} className="w-full" />
              </div>
              <button type="submit" className="rounded-md border border-slate-300 py-1.5 text-sm hover:bg-slate-50">
                Apply
              </button>
            </form>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Sort by:</span>
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
                  "rounded-full border px-3 py-1",
                  filters.sort === opt.key
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-300 hover:bg-slate-50"
                )}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          {result.items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 py-16 text-center text-slate-500">
              <SearchX className="h-8 w-8 text-slate-300" />
              No products match your filters.
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
