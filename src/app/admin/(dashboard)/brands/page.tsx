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
      <h1 className="text-xl font-bold text-slate-900">Brands</h1>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
        <BrandForm />
      </div>

      <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded bg-slate-100">
                {brand.logo ? <Image src={brand.logo} alt={brand.name} fill className="object-contain p-1" /> : null}
              </div>
              <div>
                <p className="font-medium text-slate-800">{brand.name}</p>
                <p className="text-xs text-slate-400">{brand._count.products} products</p>
              </div>
            </div>
            {brand._count.products === 0 ? (
              <form action={deleteBrandAction}>
                <input type="hidden" name="id" value={brand.id} />
                <ConfirmSubmitButton
                  message={`Delete brand "${brand.name}"?`}
                  className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </ConfirmSubmitButton>
              </form>
            ) : (
              <span className="p-2 text-slate-200">
                <Trash2 className="h-4 w-4" />
              </span>
            )}
          </div>
        ))}
        {brands.length === 0 ? <p className="px-4 py-10 text-center text-slate-400">No brands yet.</p> : null}
      </div>
    </div>
  );
}
