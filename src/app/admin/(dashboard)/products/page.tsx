import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
        <h1 className="text-xl font-bold text-slate-900">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <form action="/admin/products" method="GET" className="mt-4 max-w-sm">
        <Input name="q" placeholder="Search by title or SKU..." defaultValue={q} />
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="flex items-center gap-3 px-4 py-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-100">
                    {product.images[0] ? (
                      <Image src={product.images[0].url} alt={product.title} fill className="object-contain" />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{product.title}</p>
                    <p className="text-xs text-slate-400">{product.sku}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{product.category.name}</td>
                <td className="px-4 py-3 text-slate-600">{formatPrice(product.price)}</td>
                <td className="px-4 py-3">
                  <span className={product.stock <= 0 ? "font-medium text-red-600" : product.stock <= 5 ? "font-medium text-amber-600" : "text-slate-600"}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleProductActiveAction}>
                    <input type="hidden" name="id" value={product.id} />
                    <button
                      type="submit"
                      className={
                        product.isActive
                          ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"
                          : "rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600"
                      }
                    >
                      {product.isActive ? "Active" : "Hidden"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <ConfirmSubmitButton
                        message={`Delete "${product.title}"? This cannot be undone.`}
                        className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No products found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
