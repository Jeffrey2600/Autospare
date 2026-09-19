import Link from "next/link";
import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
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
      <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tap an order to see full details and message the customer on WhatsApp.
      </p>

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

      {orders.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">No orders found</p>
          <p className="mt-1 text-sm text-slate-500">
            {status || q
              ? "Try clearing the filter or search."
              : "New orders appear here and are sent to your WhatsApp automatically."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <ul className="mt-4 space-y-3 md:hidden">
            {orders.map((order) => (
              <li key={order.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                    <p className="text-sm text-slate-600">{order.customerName}</p>
                    <p className="text-xs text-slate-400">{order.customerPhone}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{formatPrice(order.total)}</p>
                    <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-brand-700 hover:underline"
                      >
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
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
