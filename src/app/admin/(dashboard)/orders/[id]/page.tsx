import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { AutoSubmitSelect } from "@/components/admin/AutoSubmitSelect";
import { updateOrderStatusAction, updatePaymentStatusAction } from "@/lib/actions/adminOrders";
import { waMeLink } from "@/lib/whatsapp";
import { buildAdminMessage, buildCustomerMessage, adminNotifyPhone } from "@/lib/notifications";

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

  const customerWaLink = waMeLink(order.customerPhone, buildCustomerMessage(order));
  const adminWaLink = waMeLink(adminNotifyPhone(), buildAdminMessage(order));

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Order {order.orderNumber}</h1>
        <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
      </div>

      <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-semibold text-green-900">Contact the customer</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={customerWaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp {order.customerName.split(" ")[0]}
          </a>
          <a
            href={`tel:${order.customerPhone}`}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Phone className="h-4 w-4" /> Call {order.customerPhone}
          </a>
          <a
            href={adminWaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <MessageCircle className="h-4 w-4" /> Send copy to my WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
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
        <div className="rounded-xl border border-slate-200 bg-white p-4">
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

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
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
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <h2 className="mb-2 font-semibold text-slate-900">Customer</h2>
          <p className="text-slate-600">{order.customerName}</p>
          <p className="text-slate-600">{order.customerPhone}</p>
          {order.customerEmail ? <p className="text-slate-600">{order.customerEmail}</p> : null}
          {order.user ? <p className="mt-1 text-xs text-slate-400">Registered account: {order.user.email}</p> : (
            <p className="mt-1 text-xs text-slate-400">Guest checkout</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
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
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <h2 className="mb-1 font-semibold text-slate-900">Notes</h2>
          <p className="text-slate-600">{order.notes}</p>
        </div>
      ) : null}
    </div>
  );
}
