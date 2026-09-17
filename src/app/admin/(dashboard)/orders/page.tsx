import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as (typeof STATUSES)[number] } : {}),
      ...(q
        ? { OR: [{ orderNumber: { contains: q } }, { customerName: { contains: q } }, { customerPhone: { contains: q } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Orders</h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href="/admin/orders"
          className={cn("rounded-full border px-3 py-1 text-sm", !status ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300")}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={cn("rounded-full border px-3 py-1 text-sm", status === s ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300")}
          >
            {s}
          </Link>
        ))}
      </div>

      <form action="/admin/orders" method="GET" className="mt-4 max-w-sm">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <Input name="q" placeholder="Search order #, name or phone..." defaultValue={q} />
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-brand-700 hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {order.customerName}
                  <br />
                  <span className="text-xs text-slate-400">{order.customerPhone}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3 text-slate-600">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  No orders found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
