import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { BannerForm } from "@/components/admin/BannerForm";

export const metadata: Metadata = { title: "Edit Banner" };

export default async function EditBannerPage({
  params,
}: PageProps<"/admin/banners/[id]/edit">) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-bold text-slate-900">Edit Banner</h1>
      <BannerForm banner={banner} />
    </div>
  );
}
