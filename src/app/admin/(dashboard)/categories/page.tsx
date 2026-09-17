import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Pencil, Trash2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { deleteCategoryAction } from "@/lib/actions/categories";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { position: "asc" }],
    include: { _count: { select: { products: true, children: true } } },
  });

  const topLevel = categories.filter((c) => !c.parentId);
  const byParent = new Map<string, typeof categories>();
  for (const cat of categories) {
    if (cat.parentId) {
      byParent.set(cat.parentId, [...(byParent.get(cat.parentId) ?? []), cat]);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Categories</h1>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </Link>
      </div>

      <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {topLevel.map((cat) => (
          <div key={cat.id}>
            <CategoryRow category={cat} />
            {(byParent.get(cat.id) ?? []).map((child) => (
              <CategoryRow key={child.id} category={child} isChild />
            ))}
          </div>
        ))}
        {categories.length === 0 ? (
          <p className="px-4 py-10 text-center text-slate-400">No categories yet.</p>
        ) : null}
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  isChild,
}: {
  category: {
    id: string;
    name: string;
    vehicleType: string;
    isActive: boolean;
    _count: { products: number; children: number };
  };
  isChild?: boolean;
}) {
  const canDelete = category._count.products === 0 && category._count.children === 0;

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 ${isChild ? "pl-10" : ""}`}>
      <div>
        <p className="font-medium text-slate-800">{category.name}</p>
        <p className="text-xs text-slate-400">
          {category.vehicleType} · {category._count.products} products
          {!category.isActive ? " · Hidden" : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/admin/categories/${category.id}/edit`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
          <Pencil className="h-4 w-4" />
        </Link>
        {canDelete ? (
          <form action={deleteCategoryAction}>
            <input type="hidden" name="id" value={category.id} />
            <ConfirmSubmitButton
              message={`Delete "${category.name}"?`}
              className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </ConfirmSubmitButton>
          </form>
        ) : (
          <span className="p-2 text-slate-200" title="Move or remove products/subcategories first">
            <Trash2 className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}
