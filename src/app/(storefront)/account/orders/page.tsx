import Link from "next/link";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";

export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">My Orders</h1>
      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-ink-500">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-ink-200 rounded-lg border border-ink-200">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/account/orders/${order.orderNumber}`} className="flex flex-col gap-1 px-4 py-3 hover:bg-ink-50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-ink-800">{order.orderNumber}</p>
                  <p className="text-xs text-ink-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ink-700">{formatPrice(order.total)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
