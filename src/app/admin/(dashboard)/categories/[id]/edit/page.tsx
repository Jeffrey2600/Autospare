import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Edit Category" };

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/categories/[id]/edit">) {
  const { id } = await params;

  const [category, parentOptions] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-bold text-slate-900">Edit Category</h1>
      <CategoryForm parentOptions={parentOptions} category={category} />
    </div>
  );
}
