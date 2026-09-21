import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/queries";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-ink-900">Store Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
