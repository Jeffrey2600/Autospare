import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";

export default async function AccountOrderDetailPage({
  params,
}: PageProps<"/account/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  const session = await getSession();
  if (!session) return null;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order || order.userId !== session.userId) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Order {order.orderNumber}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-slate-500">Placed on {formatDate(order.createdAt)}</p>

      <div className="mt-6 rounded-lg border border-slate-200 p-5">
        <ul className="space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span className="text-slate-600">
                {item.productTitle} × {item.quantity}
              </span>
              <span className="font-medium text-slate-800">{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4 text-sm">
          <h2 className="mb-2 font-semibold text-slate-900">Shipping Address</h2>
          <p className="text-slate-600">{order.customerName}</p>
          <p className="text-slate-600">{order.customerPhone}</p>
          <p className="text-slate-600">
            {order.shippingLine1}
            {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}, {order.shippingCity}, {order.shippingState}{" "}
            {order.shippingPostal}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 text-sm">
          <h2 className="mb-2 font-semibold text-slate-900">Payment</h2>
          <p className="text-slate-600">
            Method: {order.paymentMethod === "COD" ? "Cash on Delivery / Pay at Store" : "Bank Transfer"}
          </p>
          <p className="text-slate-600">Status: {order.paymentStatus}</p>
        </div>
      </div>
    </div>
  );
}
