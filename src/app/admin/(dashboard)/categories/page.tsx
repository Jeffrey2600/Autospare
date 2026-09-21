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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-950">Categories</h1>
          <p className="mt-1 text-sm text-ink-500">
            Group your parts so customers can browse them easily.
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button size="lg">
            <Plus className="h-5 w-5" /> Add Category
          </Button>
        </Link>
      </div>

      <div className="mt-4 divide-y divide-ink-100 rounded-2xl bg-white shadow-sm ring-1 ring-ink-200/60">
        {topLevel.map((cat) => (
          <div key={cat.id}>
            <CategoryRow category={cat} />
            {(byParent.get(cat.id) ?? []).map((child) => (
              <CategoryRow key={child.id} category={child} isChild />
            ))}
          </div>
        ))}
        {categories.length === 0 ? (
          <p className="px-4 py-10 text-center text-ink-400">No categories yet.</p>
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
    <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${isChild ? "pl-10" : ""}`}>
      <div>
        <p className="font-medium text-ink-800">{category.name}</p>
        <p className="text-xs text-ink-400">
          {category.vehicleType} · {category._count.products} products
          {!category.isActive ? " · Hidden" : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/admin/categories/${category.id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </Link>
        {canDelete ? (
          <form action={deleteCategoryAction}>
            <input type="hidden" name="id" value={category.id} />
            <ConfirmSubmitButton
              message={`Delete "${category.name}"?`}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3.5 text-sm font-semibold text-ink-600 shadow-xs transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </ConfirmSubmitButton>
          </form>
        ) : (
          <span
            className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-xl border border-ink-200 px-3.5 text-sm font-semibold text-ink-300"
            title="Move or remove its products/subcategories first"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </span>
        )}
      </div>
    </div>
  );
}
