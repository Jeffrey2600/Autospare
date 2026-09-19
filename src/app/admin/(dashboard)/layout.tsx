import Link from "next/link";
import { ExternalLink, Menu, Wrench } from "lucide-react";
import { getSession } from "@/lib/auth";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminNavLinks } from "@/components/admin/AdminNavLinks";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Wrench className="h-4 w-4" />
          </span>
          <span className="font-bold text-slate-900">AutoSpare Admin</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <AdminNavLinks />
        </nav>
        <div className="border-t border-slate-200 p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <ExternalLink className="h-5 w-5" /> View Store
          </Link>
          <div className="mt-1 px-3 py-2">
            <p className="truncate text-sm font-medium text-slate-700">{session?.name}</p>
            <p className="truncate text-xs text-slate-400">Signed in as admin</p>
          </div>
          <AdminLogoutButton />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <details className="group border-b border-slate-200 bg-white md:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700">
              <Menu className="h-5 w-5" />
            </span>
            <span className="font-bold text-slate-900">AutoSpare Admin</span>
            <span className="ml-auto text-xs font-medium text-slate-400 group-open:hidden">
              Tap for menu
            </span>
          </summary>
          <nav className="space-y-1 border-t border-slate-100 p-3">
            <AdminNavLinks />
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <ExternalLink className="h-5 w-5" /> View Store
            </Link>
            <AdminLogoutButton />
          </nav>
        </details>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
