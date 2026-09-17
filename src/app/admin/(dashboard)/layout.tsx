import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingBag,
  Star,
  MessageSquare,
  Users,
  Settings,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <span className="font-bold text-slate-900">AutoSpare Admin</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            <ExternalLink className="h-4 w-4" /> View Store
          </Link>
          <div className="mt-1 flex items-center justify-between rounded-md px-3 py-2">
            <span className="truncate text-sm text-slate-500">{session?.name}</span>
          </div>
          <AdminLogoutButton />
        </div>
      </aside>

      <div className="flex-1">
        <details className="border-b border-slate-200 bg-white md:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-bold text-slate-900">
            AutoSpare Admin
          </summary>
          <nav className="space-y-1 border-t border-slate-100 p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <AdminLogoutButton />
          </nav>
        </details>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
