"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

type NavCategory = {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
};

export function MobileNav({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-ink-700 hover:bg-ink-100"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-72 flex-col overflow-y-auto bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 hover:bg-ink-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              <Link
                href="/products"
                className="rounded-md px-2 py-2 font-medium hover:bg-ink-100"
                onClick={() => setOpen(false)}
              >
                All Products
              </Link>
              {categories.map((cat) =>
                cat.children.length === 0 ? (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="rounded-md px-2 py-2 font-medium hover:bg-ink-100"
                    onClick={() => setOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ) : (
                  <div key={cat.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left font-medium hover:bg-ink-100"
                      onClick={() =>
                        setExpanded(expanded === cat.id ? null : cat.id)
                      }
                    >
                      {cat.name}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${expanded === cat.id ? "rotate-180" : ""}`}
                      />
                    </button>
                    {expanded === cat.id ? (
                      <div className="ml-3 flex flex-col border-l border-ink-200 pl-3">
                        <Link
                          href={`/products?category=${cat.slug}`}
                          className="rounded-md px-2 py-2 text-sm text-ink-600 hover:bg-ink-100"
                          onClick={() => setOpen(false)}
                        >
                          All {cat.name}
                        </Link>
                        {cat.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/products?category=${child.slug}`}
                            className="rounded-md px-2 py-2 text-sm text-ink-600 hover:bg-ink-100"
                            onClick={() => setOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              )}
              <Link
                href="/about"
                className="rounded-md px-2 py-2 hover:bg-ink-100"
                onClick={() => setOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="rounded-md px-2 py-2 hover:bg-ink-100"
                onClick={() => setOpen(false)}
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
