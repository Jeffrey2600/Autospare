import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { deleteProductAction, toggleProductActiveAction } from "@/lib/actions/products";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const products = await prisma.product.findMany({
    where: q
      ? { OR: [{ title: { contains: q } }, { sku: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-950">Products</h1>
          <p className="mt-1 text-sm text-ink-500">
            {products.length} product{products.length === 1 ? "" : "s"} in your catalog. Tap Edit to
            change photos, price, stock or description.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button size="lg">
            <Plus className="h-5 w-5" /> Add Product
          </Button>
        </Link>
      </div>

      <form action="/admin/products" method="GET" className="mt-4 max-w-sm">
        <Input name="q" placeholder="Search by title or SKU..." defaultValue={q} />
      </form>

      {products.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 font-semibold text-ink-700">
            {q ? "No products match your search" : "No products yet"}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            {q ? "Try a different title or SKU." : "Add your first product to show it on the store."}
          </p>
          {!q ? (
            <Link href="/admin/products/new" className="mt-5 inline-block">
              <Button size="lg">
                <Plus className="h-5 w-5" /> Add Your First Product
              </Button>
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          {/* Mobile: card list (a table is unreadable on a phone) */}
          <ul className="mt-4 space-y-3 md:hidden">
            {products.map((product) => (
              <li key={product.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-ink-200/60 p-4">
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-1 ring-ink-200/60 bg-ink-50">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.title}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-800">{product.title}</p>
                    <p className="text-xs text-ink-400">{product.sku}</p>
                    <p className="mt-1 text-sm text-ink-600">
                      {formatPrice(product.price)} ·{" "}
                      <span
                        className={
                          product.stock <= 0
                            ? "font-semibold text-red-600"
                            : product.stock <= 5
                              ? "font-semibold text-amber-600"
                              : ""
                        }
                      >
                        {product.stock} in stock
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  <form action={toggleProductActiveAction}>
                    <input type="hidden" name="id" value={product.id} />
                    <button
                      type="submit"
                      className={
                        product.isActive
                          ? "rounded-xl bg-green-100 px-3 py-2.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-200"
                          : "rounded-xl bg-ink-200 px-3 py-2.5 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-300"
                      }
                    >
                      {product.isActive ? "Active" : "Hidden"}
                    </button>
                  </form>
                  <form action={deleteProductAction}>
                    <input type="hidden" name="id" value={product.id} />
                    <ConfirmSubmitButton
                      message={`Delete "${product.title}"? This cannot be undone.`}
                      className="rounded-xl border border-ink-200 p-2.5 text-ink-500 shadow-xs transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="mt-4 hidden overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-ink-200/60 md:block">
            <table className="w-full text-sm">
              <thead className="bg-ink-50/80 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-ink-200/60 bg-ink-50">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.title}
                              fill
                              sizes="56px"
                              className="object-contain p-1"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-ink-800">{product.title}</p>
                          <p className="text-xs text-ink-400">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{product.category.name}</td>
                    <td className="px-4 py-3 text-ink-600">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          product.stock <= 0
                            ? "font-medium text-red-600"
                            : product.stock <= 5
                              ? "font-medium text-amber-600"
                              : "text-ink-600"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <form action={toggleProductActiveAction}>
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          type="submit"
                          title="Click to show/hide this product on the store"
                          className={
                            product.isActive
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 transition-colors hover:bg-green-200"
                              : "rounded-full bg-ink-200 px-3 py-1 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-300"
                          }
                        >
                          {product.isActive ? "Active" : "Hidden"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" /> Edit
                          </Button>
                        </Link>
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <ConfirmSubmitButton
                            message={`Delete "${product.title}"? This cannot be undone.`}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3.5 text-sm font-semibold text-ink-600 shadow-xs transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
