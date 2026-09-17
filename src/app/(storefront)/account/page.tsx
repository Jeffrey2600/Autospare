import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function AccountOverviewPage() {
  const session = await getSession();
  if (!session) return null;

  const [orderCount, recentOrders] = await Promise.all([
    prisma.order.count({ where: { userId: session.userId } }),
    prisma.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
      <div className="mt-4 rounded-lg border border-slate-200 p-5">
        <p className="text-sm text-slate-500">Name</p>
        <p className="font-medium text-slate-800">{session.name}</p>
        <p className="mt-3 text-sm text-slate-500">Email</p>
        <p className="font-medium text-slate-800">{session.email}</p>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Orders ({orderCount})</h2>
          <Link href="/account/orders" className="text-sm text-brand-700 hover:underline">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-slate-500">You haven&apos;t placed any orders yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.orderNumber}`}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-800">{order.orderNumber}</span>
                  <span className="text-slate-500">{order.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
