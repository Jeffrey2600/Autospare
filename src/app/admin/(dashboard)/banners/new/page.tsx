import type { Metadata } from "next";
import { BannerForm } from "@/components/admin/BannerForm";

export const metadata: Metadata = { title: "Add Banner" };

export default function NewBannerPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-bold text-ink-900">Add Banner</h1>
      <BannerForm />
    </div>
  );
}
