import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Plus, Pencil, Trash2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { deleteBannerAction } from "@/lib/actions/banners";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Banners" };

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: { position: "asc" } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Homepage Banners</h1>
          <p className="mt-1 text-sm text-slate-500">
            These rotate at the top of your homepage. Upload your own offer images here.
          </p>
        </div>
        <Link href="/admin/banners/new">
          <Button size="lg">
            <Plus className="h-5 w-5" /> Add Banner
          </Button>
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {banners.map((banner) => (
          <div key={banner.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="relative h-32 w-full bg-slate-100">
              <Image
                src={banner.image}
                alt={banner.title ?? "Banner"}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div>
                <p className="font-medium text-slate-800">{banner.title || "Untitled"}</p>
                <p className="text-xs text-slate-400">{banner.isActive ? "Active" : "Hidden"}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/banners/${banner.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                </Link>
                <form action={deleteBannerAction}>
                  <input type="hidden" name="id" value={banner.id} />
                  <ConfirmSubmitButton
                    message="Delete this banner?"
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 ? <p className="col-span-full py-10 text-center text-slate-400">No banners yet.</p> : null}
      </div>
    </div>
  );
}
