import Link from "next/link";
import { Search, User, Phone } from "lucide-react";
import { getNavCategories, getSiteSettings } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { CartIndicator } from "./CartIndicator";
import { MobileNav } from "./MobileNav";

export async function Navbar() {
  const [categories, settings, session] = await Promise.all([
    getNavCategories(),
    getSiteSettings(),
    getSession(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="hidden bg-slate-900 text-slate-200 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <span>{settings.tagline}</span>
          {settings.phone ? (
            <a href={`tel:${settings.phone}`} className="flex items-center gap-1 hover:text-white">
              <Phone className="h-3 w-3" /> {settings.phone}
            </a>
          ) : null}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <MobileNav categories={categories} />

        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            {settings.storeName}
          </span>
        </Link>

        <form action="/products" method="GET" className="mx-2 hidden flex-1 md:flex">
          <div className="relative w-full">
            <input
              type="text"
              name="q"
              placeholder="Search for parts, brands, SKU..."
              className="w-full rounded-md border border-slate-300 py-2 pl-3 pr-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-slate-500 hover:text-brand-600"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href={session ? "/account" : "/login"}
            className="hidden items-center gap-2 rounded-md p-2 text-slate-700 hover:bg-slate-100 sm:flex"
          >
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">
              {session ? session.name.split(" ")[0] : "Login"}
            </span>
          </Link>
          <CartIndicator />
        </div>
      </div>

      <form action="/products" method="GET" className="px-4 pb-3 md:hidden">
        <div className="relative">
          <input
            type="text"
            name="q"
            placeholder="Search for parts..."
            className="w-full rounded-md border border-slate-300 py-2 pl-3 pr-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-slate-500"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      <nav className="hidden border-t border-slate-100 md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2 text-sm font-medium text-slate-700">
          <Link href="/products" className="hover:text-brand-700">
            All Products
          </Link>
          {categories.map((cat) => (
            <div key={cat.id} className="group relative">
              <Link href={`/products?category=${cat.slug}`} className="hover:text-brand-700">
                {cat.name}
              </Link>
              {cat.children.length > 0 ? (
                <div className="invisible absolute left-0 top-full z-50 min-w-48 rounded-md border border-slate-200 bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/products?category=${child.slug}`}
                      className="block px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-brand-700"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <Link href="/about" className="hover:text-brand-700">
            About
          </Link>
          <Link href="/contact" className="ml-auto hover:text-brand-700">
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
}
