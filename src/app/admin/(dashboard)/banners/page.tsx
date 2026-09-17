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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Homepage Banners</h1>
        <Link href="/admin/banners/new">
          <Button>
            <Plus className="h-4 w-4" /> Add Banner
          </Button>
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {banners.map((banner) => (
          <div key={banner.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="relative h-32 w-full bg-slate-100">
              <Image src={banner.image} alt={banner.title ?? "Banner"} fill className="object-cover" />
            </div>
            <div className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium text-slate-800">{banner.title || "Untitled"}</p>
                <p className="text-xs text-slate-400">{banner.isActive ? "Active" : "Hidden"}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/banners/${banner.id}/edit`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
                  <Pencil className="h-4 w-4" />
                </Link>
                <form action={deleteBannerAction}>
                  <input type="hidden" name="id" value={banner.id} />
                  <ConfirmSubmitButton message="Delete this banner?" className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
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
