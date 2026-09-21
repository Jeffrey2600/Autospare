import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Add Category" };

export default async function NewCategoryPage() {
  const parentOptions = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-bold text-ink-900">Add Category</h1>
      <CategoryForm parentOptions={parentOptions} />
    </div>
  );
}
