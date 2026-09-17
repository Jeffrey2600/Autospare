import Link from "next/link";
import { LogoutButton } from "@/components/storefront/LogoutButton";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <aside className="space-y-1">
          <Link href="/account" className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Overview
          </Link>
          <Link href="/account/orders" className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            My Orders
          </Link>
          <LogoutButton />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
