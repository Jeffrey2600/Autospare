import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export const metadata = { robots: { index: false, follow: false } };

export default async function OrderConfirmationPage({
  params,
}: PageProps<"/order-confirmation/[orderNumber]">) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
      <h1 className="mt-4 text-2xl font-bold text-ink-900">Order Placed Successfully!</h1>
      <p className="mt-2 text-ink-500">
        Thank you, {order.customerName}. Your order <span className="font-semibold text-ink-700">{order.orderNumber}</span> has been received.
      </p>

      <div className="mt-8 rounded-lg border border-ink-200 p-5 text-left">
        <h2 className="font-semibold text-ink-900">Order Summary</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span className="text-ink-600">
                {item.productTitle} × {item.quantity}
              </span>
              <span className="font-medium text-ink-800">{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-ink-200 pt-3 text-sm">
          <div className="flex justify-between text-ink-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink-600">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-ink-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-500">
          Payment method:{" "}
          <span className="font-medium text-ink-700">
            {order.paymentMethod === "COD" ? "Cash on Delivery / Pay at Store" : "Bank Transfer"}
          </span>
        </p>
        <p className="mt-1 text-sm text-ink-500">
          Delivering to: {order.shippingLine1}, {order.shippingCity}, {order.shippingState} {order.shippingPostal}
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
        <Link href="/account/orders">
          <Button>View My Orders</Button>
        </Link>
      </div>
    </div>
  );
}
