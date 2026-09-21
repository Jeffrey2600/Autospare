import Link from "next/link";
import { Search, User, Phone, Wrench } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-ink-200/70 glass">
      {/* Utility strip */}
      <div className="hidden bg-ink-950 text-ink-300 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs">
          <span className="tracking-wide">{settings.tagline}</span>
          {settings.phone ? (
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1.5 font-medium transition-colors hover:text-white"
            >
              <Phone className="h-3.5 w-3.5" /> {settings.phone}
            </a>
          ) : null}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <MobileNav categories={categories} />

        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Wrench className="h-[1.125rem] w-[1.125rem]" />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink-950">
            {settings.storeName}
          </span>
        </Link>

        <form action="/products" method="GET" className="mx-4 hidden flex-1 md:flex">
          <div className="group relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 transition-colors group-focus-within:text-brand-500" />
            <input
              type="text"
              name="q"
              placeholder="Search parts, brands or SKU…"
              className="w-full rounded-xl border border-ink-200 bg-ink-50/70 py-2.5 pl-10 pr-4 text-sm transition-[background-color,border-color,box-shadow] placeholder:text-ink-400 hover:bg-white focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/12"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href={session ? "/account" : "/login"}
            className="hidden h-10 items-center gap-2 rounded-xl px-3 text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 sm:flex"
          >
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">
              {session ? session.name.split(" ")[0] : "Login"}
            </span>
          </Link>
          <CartIndicator />
        </div>
      </div>

      {/* Mobile search */}
      <form action="/products" method="GET" className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            name="q"
            placeholder="Search parts…"
            className="w-full rounded-xl border border-ink-200 bg-ink-50/70 py-2.5 pl-10 pr-4 text-sm placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/12"
          />
        </div>
      </form>

      <nav className="hidden border-t border-ink-200/70 md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-6">
          <NavLink href="/products">All Products</NavLink>
          {categories.map((cat) => (
            <div key={cat.id} className="group relative">
              <NavLink href={`/products?category=${cat.slug}`}>{cat.name}</NavLink>
              {cat.children.length > 0 ? (
                <div className="invisible absolute left-0 top-full z-50 min-w-56 translate-y-1 rounded-2xl border border-ink-200/70 bg-white p-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/products?category=${child.slug}`}
                      className="block rounded-lg px-3 py-2 text-sm text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <NavLink href="/about">About</NavLink>
          <div className="ml-auto">
            <NavLink href="/contact">Contact</NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative block px-3 py-3 text-sm font-medium text-ink-600 transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:scale-x-0 after:rounded-full after:bg-brand-600 after:transition-transform after:duration-200 hover:text-brand-700 hover:after:scale-x-100"
    >
      {children}
    </Link>
  );
}
