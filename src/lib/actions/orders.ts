"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { notifyOrderPlaced } from "@/lib/notifications";

export type CheckoutFormState = {
  error: string | null;
  orderNumber?: string;
  values?: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    shippingLine1?: string;
    shippingLine2?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingPostal?: string;
    paymentMethod?: string;
    notes?: string;
  };
};

function valuesFromFormData(formData: FormData): NonNullable<CheckoutFormState["values"]> {
  const get = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : undefined;
  };
  return {
    customerName: get("customerName"),
    customerPhone: get("customerPhone"),
    customerEmail: get("customerEmail"),
    shippingLine1: get("shippingLine1"),
    shippingLine2: get("shippingLine2"),
    shippingCity: get("shippingCity"),
    shippingState: get("shippingState"),
    shippingPostal: get("shippingPostal"),
    paymentMethod: get("paymentMethod"),
    notes: get("notes"),
  };
}

const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const phonePattern = /^[6-9]\d{9}$/;
const postalPattern = /^\d{6}$/;

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name"),
  customerPhone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, "").replace(/^\+?91/, ""))
    .pipe(z.string().regex(phonePattern, "Enter a valid 10-digit mobile number")),
  customerEmail: z.string().trim().email("Enter a valid email address"),
  shippingLine1: z.string().trim().min(3, "Enter your address"),
  shippingLine2: z.string().trim().optional().or(z.literal("")),
  shippingCity: z.string().trim().min(2, "Enter your city"),
  shippingState: z.string().trim().min(2, "Enter your state"),
  shippingPostal: z.string().trim().regex(postalPattern, "Enter a valid 6-digit PIN code"),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "ONLINE"]),
  notes: z.string().trim().optional().or(z.literal("")),
  items: z.string().min(1),
});

export async function placeOrderAction(
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerEmail: formData.get("customerEmail"),
    shippingLine1: formData.get("shippingLine1"),
    shippingLine2: formData.get("shippingLine2"),
    shippingCity: formData.get("shippingCity"),
    shippingState: formData.get("shippingState"),
    shippingPostal: formData.get("shippingPostal"),
    paymentMethod: formData.get("paymentMethod"),
    notes: formData.get("notes"),
    items: formData.get("items"),
  });

  const values = valuesFromFormData(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors", values };
  }

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(parsed.data.items);
  } catch {
    return { error: "Your cart data is invalid. Please refresh and try again.", values };
  }

  const itemsParsed = z.array(cartItemSchema).safeParse(rawItems);
  if (!itemsParsed.success || itemsParsed.data.length === 0) {
    return { error: "Your cart is empty.", values };
  }

  const session = await getSession();

  const products = await prisma.product.findMany({
    where: { id: { in: itemsParsed.data.map((i) => i.productId) }, isActive: true },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of itemsParsed.data) {
    const product = productMap.get(item.productId);
    if (!product) {
      return { error: "One of the items in your cart is no longer available.", values };
    }
    if (product.stock < item.quantity) {
      return { error: `Only ${product.stock} left in stock for "${product.title}".`, values };
    }
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const shippingFee = settings?.shippingFee ?? 0;
  const freeShippingThreshold = settings?.freeShippingThreshold ?? null;

  const subtotal = itemsParsed.data.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  const finalShippingFee =
    freeShippingThreshold !== null && subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const total = subtotal + finalShippingFee;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session?.userId,
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        customerEmail: parsed.data.customerEmail || null,
        shippingLine1: parsed.data.shippingLine1,
        shippingLine2: parsed.data.shippingLine2 || null,
        shippingCity: parsed.data.shippingCity,
        shippingState: parsed.data.shippingState,
        shippingPostal: parsed.data.shippingPostal,
        subtotal,
        shippingFee: finalShippingFee,
        total,
        paymentMethod: parsed.data.paymentMethod,
        notes: parsed.data.notes || null,
        items: {
          create: itemsParsed.data.map((item) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: product.id,
              productTitle: product.title,
              productImage: product.images[0]?.url ?? null,
              unitPrice: product.price,
              quantity: item.quantity,
              subtotal: product.price * item.quantity,
            };
          }),
        },
      },
      include: { items: true },
    });

    for (const item of itemsParsed.data) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  await notifyOrderPlaced(order).catch((error) =>
    console.error("Order placed but notification failed:", error)
  );

  return { error: null, orderNumber: order.orderNumber };
}
