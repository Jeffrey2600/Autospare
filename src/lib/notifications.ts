import "server-only";
import { formatPrice } from "@/lib/utils";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendSms } from "@/lib/sms";

export const DEFAULT_ADMIN_PHONE = "9894705498";

export function adminNotifyPhone() {
  return process.env.ADMIN_NOTIFY_PHONE?.trim() || DEFAULT_ADMIN_PHONE;
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export type OrderForNotification = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingLine1: string;
  shippingLine2?: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostal: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  items: { productTitle: string; quantity: number; subtotal: number }[];
};

function paymentLabel(method: string) {
  if (method === "COD") return "Cash on Delivery";
  if (method === "BANK_TRANSFER") return "Bank Transfer";
  return method;
}

function itemLines(order: OrderForNotification) {
  return order.items
    .map((item) => `• ${item.productTitle} x${item.quantity} — ${formatPrice(item.subtotal)}`)
    .join("\n");
}

function fullAddress(order: OrderForNotification) {
  return [
    order.shippingLine1,
    order.shippingLine2 || null,
    `${order.shippingCity}, ${order.shippingState} - ${order.shippingPostal}`,
  ]
    .filter(Boolean)
    .join(", ");
}

export function buildCustomerMessage(order: OrderForNotification) {
  return [
    `*Order Confirmed* ✅`,
    ``,
    `Hi ${order.customerName}, thanks for your order!`,
    ``,
    `*Order No:* ${order.orderNumber}`,
    itemLines(order),
    ``,
    `*Total:* ${formatPrice(order.total)}`,
    `*Payment:* ${paymentLabel(order.paymentMethod)}`,
    `*Delivery to:* ${fullAddress(order)}`,
    ``,
    `Track your order: ${siteUrl()}/order-confirmation/${order.orderNumber}`,
  ].join("\n");
}

export function buildAdminMessage(order: OrderForNotification) {
  return [
    `*NEW ORDER* 🛒`,
    ``,
    `*Order No:* ${order.orderNumber}`,
    `*Customer:* ${order.customerName}`,
    `*Phone:* ${order.customerPhone}`,
    order.customerEmail ? `*Email:* ${order.customerEmail}` : null,
    ``,
    itemLines(order),
    ``,
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Shipping: ${order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}`,
    `*Total:* ${formatPrice(order.total)}`,
    `*Payment:* ${paymentLabel(order.paymentMethod)}`,
    ``,
    `*Deliver to:* ${fullAddress(order)}`,
    ``,
    `Manage: ${siteUrl()}/admin/orders/${order.id}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/**
 * Fired after an order is successfully saved. Sends to the customer and the
 * shop owner over WhatsApp, and additionally over SMS when an SMS gateway is
 * configured. Never throws — a notification problem must not fail a paid order.
 */
export async function notifyOrderPlaced(order: OrderForNotification) {
  const customerBody = buildCustomerMessage(order);
  const adminBody = buildAdminMessage(order);
  const admin = adminNotifyPhone();

  const jobs: Promise<unknown>[] = [
    sendWhatsApp({ to: order.customerPhone, body: customerBody }),
    sendWhatsApp({ to: admin, body: adminBody }),
  ];

  if (process.env.SMS_PROVIDER) {
    jobs.push(
      sendSms({ to: order.customerPhone, body: customerBody }),
      sendSms({ to: admin, body: adminBody })
    );
  }

  await Promise.allSettled(jobs);
}
