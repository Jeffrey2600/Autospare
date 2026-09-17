"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const statusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = statusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
}

const paymentStatusSchema = z.object({
  orderId: z.string().min(1),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
});

export async function updatePaymentStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = paymentStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    paymentStatus: formData.get("paymentStatus"),
  });
  if (!parsed.success) return;

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { paymentStatus: parsed.data.paymentStatus },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
}
