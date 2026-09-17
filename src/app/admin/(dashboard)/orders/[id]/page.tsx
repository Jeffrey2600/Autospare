import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { AutoSubmitSelect } from "@/components/admin/AutoSubmitSelect";
import { updateOrderStatusAction, updatePaymentStatusAction } from "@/lib/actions/adminOrders";

export const metadata: Metadata = { title: "Order Detail" };

const selectClass =
  "rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500";

export default async function AdminOrderDetailPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Order {order.orderNumber}</h1>
        <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Order Status</p>
          <AutoSubmitSelect
            name="status"
            defaultValue={order.status}
            hiddenFields={{ orderId: order.id }}
            action={updateOrderStatusAction}
            className={selectClass}
            options={["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => ({
              value: s,
              label: s,
            }))}
          />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Payment Status</p>
          <AutoSubmitSelect
            name="paymentStatus"
            defaultValue={order.paymentStatus}
            hiddenFields={{ orderId: order.id }}
            action={updatePaymentStatusAction}
            className={selectClass}
            options={["PENDING", "PAID", "FAILED", "REFUNDED"].map((s) => ({ value: s, label: s }))}
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-slate-900">Items</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2">
              <span className="text-slate-600">
                {item.productTitle} × {item.quantity}
              </span>
              <span className="font-medium text-slate-800">{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>{formatPrice(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <h2 className="mb-2 font-semibold text-slate-900">Customer</h2>
          <p className="text-slate-600">{order.customerName}</p>
          <p className="text-slate-600">{order.customerPhone}</p>
          {order.customerEmail ? <p className="text-slate-600">{order.customerEmail}</p> : null}
          {order.user ? <p className="mt-1 text-xs text-slate-400">Registered account: {order.user.email}</p> : (
            <p className="mt-1 text-xs text-slate-400">Guest checkout</p>
          )}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <h2 className="mb-2 font-semibold text-slate-900">Shipping Address</h2>
          <p className="text-slate-600">
            {order.shippingLine1}
            {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
          </p>
          <p className="text-slate-600">
            {order.shippingCity}, {order.shippingState} {order.shippingPostal}
          </p>
          <p className="text-slate-600">{order.shippingCountry}</p>
        </div>
      </div>

      {order.notes ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <h2 className="mb-1 font-semibold text-slate-900">Notes</h2>
          <p className="text-slate-600">{order.notes}</p>
        </div>
      ) : null}
    </div>
  );
}
