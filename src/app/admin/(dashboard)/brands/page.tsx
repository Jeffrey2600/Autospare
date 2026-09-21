import Image from "next/image";
import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { BrandForm } from "@/components/admin/BrandForm";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { deleteBrandAction } from "@/lib/actions/brands";

export const metadata: Metadata = { title: "Brands" };

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink-950">Brands</h1>
      <p className="mt-1 text-sm text-ink-500">
        Add the brands you stock so customers can filter by them.
      </p>
      <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-ink-200/60 p-5">
        <BrandForm />
      </div>

      <div className="mt-4 divide-y divide-ink-100 rounded-2xl bg-white shadow-sm ring-1 ring-ink-200/60">
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded bg-ink-100">
                {brand.logo ? <Image src={brand.logo} alt={brand.name} fill className="object-contain p-1" /> : null}
              </div>
              <div>
                <p className="font-medium text-ink-800">{brand.name}</p>
                <p className="text-xs text-ink-400">{brand._count.products} products</p>
              </div>
            </div>
            {brand._count.products === 0 ? (
              <form action={deleteBrandAction}>
                <input type="hidden" name="id" value={brand.id} />
                <ConfirmSubmitButton
                  message={`Delete brand "${brand.name}"?`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3.5 text-sm font-semibold text-ink-600 shadow-xs transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </ConfirmSubmitButton>
              </form>
            ) : (
              <span
                className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-xl border border-ink-200 px-3.5 text-sm font-semibold text-ink-300"
                title="Move or remove its products first"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </span>
            )}
          </div>
        ))}
        {brands.length === 0 ? <p className="px-4 py-10 text-center text-ink-400">No brands yet.</p> : null}
      </div>
    </div>
  );
}
